import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReturnDto) {
    if (!dto.items?.length) throw new BadRequestException('Qaytariladigan mahsulot tanlanmagan');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: dto.orderId },
        include: { items: true },
      });
      if (!order) throw new BadRequestException('Zakaz topilmadi');
      if (order.clientId !== dto.clientId) throw new BadRequestException('Klient mos kelmadi');

      // Mobile'dan delivery "vozvrat"ni qayta-qayta bosishi mumkin.
      // Shunda admin ro'yxatida pending qaytariqlar ko'payib ketmasligi uchun,
      // bir xil order/client uchun mavjud pending return'ni topib, uni replace qilamiz.
      const pendingReturns = await tx.return.findMany({
        where: {
          orderId: dto.orderId,
          clientId: dto.clientId,
          status: 'pending',
        },
        include: { items: true },
        orderBy: { createdAt: 'asc' },
      });

      const targetPendingReturn = pendingReturns[0] || null;
      const otherPendingReturnIds = pendingReturns.slice(1).map(r => r.id);

      const orderedQty = new Map<string, { qty: number; name: string }>();
      for (const it of order.items) {
        orderedQty.set(it.productId, {
          qty: (orderedQty.get(it.productId)?.qty || 0) + (it.quantity || 0),
          name: it.productName,
        });
      }

      const returnedAgg = await tx.returnItem.groupBy({
        by: ['productId'],
        where: { return: { orderId: dto.orderId } },
        _sum: { quantity: true },
      });
      const returnedQty = new Map<string, number>(
        returnedAgg.map((r) => [r.productId, Number(r._sum.quantity || 0)]),
      );

      // Agar mavjud pending return bo'lsa, limitni hisoblashda uni o'z ichidagi
      // miqdor bilan "qo'shib" yubormaslik kerak (biz uni replace qilmoqdamiz).
      if (pendingReturns?.length) {
        // pending return'larni replace qilmoqdamiz: ularning eskisi limit hisobiga kiritilmasligi kerak.
        for (const pr of pendingReturns) {
          for (const it of pr.items || []) {
            const prev = returnedQty.get(it.productId) || 0;
            const next = Math.max(0, prev - (it.quantity || 0));
            returnedQty.set(it.productId, next);
          }
        }
      }

      // Validate requested items do not exceed remaining
      const reqQtyByProduct = new Map<string, { qty: number; name?: string }>();
      for (const it of dto.items) {
        reqQtyByProduct.set(it.productId, {
          qty: (reqQtyByProduct.get(it.productId)?.qty || 0) + (it.quantity || 0),
          name: it.productName,
        });
      }

      for (const [productId, req] of reqQtyByProduct.entries()) {
        const ord = orderedQty.get(productId);
        if (!ord) throw new BadRequestException('Zakazda bunday mahsulot yo‘q');
        const already = returnedQty.get(productId) || 0;
        const remaining = Math.max(0, ord.qty - already);
        if (req.qty > remaining) {
          throw new BadRequestException(`Qaytarish limiti oshdi: ${ord.name} (qolgan: ${remaining})`);
        }
      }

      const status = dto.status === 'accepted' ? 'accepted' : 'pending';

      // Replace: pending return mavjud bo'lsa, yangi return yaratmaymiz.
      // (admin ro'yxatida "qayta qayta" ko'rinib ketishini oldini oladi)
      let ret;
      if (targetPendingReturn) {
        if (otherPendingReturnIds.length) {
          await tx.return.deleteMany({ where: { id: { in: otherPendingReturnIds } } });
        }

        ret = await tx.return.update({
          where: { id: targetPendingReturn.id },
          data: {
            clientId: dto.clientId,
            orderId: dto.orderId,
            date: dto.date,
            status,
            createdByUserId: dto.createdByUserId,
            items: {
              deleteMany: {},
              create: dto.items.map(it => ({
                productId: it.productId,
                productName: it.productName || orderedQty.get(it.productId)?.name || '',
                quantity: it.quantity,
              })),
            },
          },
          include: { items: true },
        });
      } else {
        ret = await tx.return.create({
          data: {
            clientId: dto.clientId,
            orderId: dto.orderId,
            date: dto.date,
            status,
            createdByUserId: dto.createdByUserId,
            items: {
              create: dto.items.map(it => ({
                productId: it.productId,
                productName: it.productName || orderedQty.get(it.productId)?.name || '',
                quantity: it.quantity,
              })),
            },
          },
          include: { items: true },
        });
      }

      if (status === 'accepted') {
        for (const it of ret.items) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { increment: it.quantity } },
          });
        }

        // Delivery "vozvrat" (qabul qilingan) qilganda buyurtma statusini "Yetkazildi"ga o'tkazamiz.
        // Shunda admin/delivery ro'yxatlarida qaytarilgan buyurtmalar "Yuborilgan Faol"da qolib ketmaydi.
        // To'liq/qisman qaytarilganlik esa returns bo'yicha hisoblanadigan badge/label orqali ko'rsatiladi.
        if (order.status !== 'delivered') {
          await tx.order.update({
            where: { id: dto.orderId },
            data: { status: 'delivered' },
          });
        }
      }

      return ret;
    });
  }

  async findAll(clientId?: string, orderId?: string, status?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    return this.prisma.return.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        items: true,
        order: { select: { id: true, orderNumber: true, date: true, clientName: true, clientPhone: true, agentName: true } },
        createdBy: { select: { id: true, name: true, phone: true, role: true } },
        acceptedBy: { select: { id: true, name: true, phone: true, role: true } },
      },
    });
  }

  async accept(id: string, dto: { comment?: string; acceptedByUserId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const ret = await tx.return.findUnique({
        where: { id },
        include: {
          items: true,
          order: {
            include: {
              items: true,
            },
          },
        },
      });
      if (!ret) throw new BadRequestException('Vozvrat topilmadi');
      if (ret.status === 'accepted') throw new BadRequestException('Allaqachon qabul qilingan');
      for (const it of ret.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { increment: it.quantity } },
        });
      }
      const acceptedReturn = await tx.return.update({
        where: { id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedByUserId: dto.acceptedByUserId || null,
          comment: dto.comment?.trim() || null,
        },
        include: {
          items: true,
          createdBy: { select: { id: true, name: true, phone: true, role: true } },
          acceptedBy: { select: { id: true, name: true, phone: true, role: true } },
        },
      });

      const acceptedAgg = await tx.returnItem.groupBy({
        by: ['productId'],
        where: {
          return: {
            orderId: ret.orderId,
            status: 'accepted',
          },
        },
        _sum: { quantity: true },
      });

      const acceptedQtyByProduct = new Map<string, number>(
        acceptedAgg.map((row) => [row.productId, Number(row._sum.quantity || 0)]),
      );

      const isFullyReturned = (ret.order?.items || []).length > 0 && (ret.order?.items || []).every((item) => {
        const orderedQty = Number(item.quantity || 0);
        const acceptedQty = acceptedQtyByProduct.get(item.productId) || 0;
        return acceptedQty >= orderedQty;
      });

      if (isFullyReturned) {
        if (ret.order?.status !== 'cancelled') {
          await tx.order.update({
            where: { id: ret.orderId },
            data: { status: 'cancelled' },
          });
        }
      } else if (ret.order?.status !== 'delivered') {
        await tx.order.update({
          where: { id: ret.orderId },
          data: { status: 'delivered' },
        });
      }

      return acceptedReturn;
    });
  }
}

