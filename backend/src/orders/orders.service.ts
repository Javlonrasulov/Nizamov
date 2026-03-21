import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    // Bir mahsulot bir necha marta tushsa ham to'g'ri hisoblash uchun yig'amiz
    const qtyByProduct = new Map<string, number>();
    for (const i of dto.items || []) {
      qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) || 0) + (i.quantity || 0));
    }

    return this.prisma.$transaction(async (tx) => {
      const last = await tx.order.findFirst({
        where: { orderNumber: { not: null } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = ((last?.orderNumber as number) ?? 0) + 1;

      // Stock tekshirish
      const productIds = [...qtyByProduct.keys()];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      for (const [productId, needQty] of qtyByProduct.entries()) {
        const p = byId.get(productId);
        if (!p) throw new BadRequestException('Mahsulot topilmadi');
        if ((p.stock || 0) < needQty) {
          throw new BadRequestException(`Omborda yetarli emas: ${p.name} (bor: ${p.stock}, kerak: ${needQty})`);
        }
      }

      // Stock kamaytirish
      for (const [productId, needQty] of qtyByProduct.entries()) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: needQty } },
        });
      }

      // Zakaz yaratish
      return tx.order.create({
        data: {
          orderNumber: orderNumber,
          clientId: dto.clientId,
          agentId: dto.agentId,
          deliveryId: dto.deliveryId,
          status: dto.status,
          date: dto.date,
          total: dto.total,
          clientName: dto.clientName,
          clientPhone: dto.clientPhone,
          clientAddress: dto.clientAddress,
          agentName: dto.agentName,
          deliveryName: dto.deliveryName,
          comment: dto.comment?.trim() || null,
          items: {
            create: dto.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
        include: { items: true },
      });
    });
  }

  async findAll(agentId?: string, deliveryId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (deliveryId) where.deliveryId = deliveryId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    return this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const prev = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });

      const data: Parameters<typeof tx.order.update>[0]['data'] = {};
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.deliveryId !== undefined) data.deliveryId = dto.deliveryId;
      if (dto.deliveryName !== undefined) data.deliveryName = dto.deliveryName;
      if (dto.vehicleName !== undefined) data.vehicleName = dto.vehicleName;
      if (dto.comment !== undefined) data.comment = dto.comment?.trim() || null;
      if (dto.total !== undefined) data.total = dto.total;

      if (dto.items !== undefined) {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        if (dto.items.length > 0) {
          data.items = {
            create: dto.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              price: i.price,
            })),
          };
        }
      }

      const nextStatus = dto.status ?? prev.status;

      // Yetkazilmadi (cancelled) bo'lsa — mahsulotlarni omborga qaytarish
      // Double qaytarmaslik uchun faqat oldingi status cancelled bo'lmagan holatda.
      if (dto.status === 'cancelled' && prev.status !== 'cancelled') {
        const qtyByProduct = new Map<string, number>();
        for (const item of prev.items) {
          qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + (item.quantity || 0));
        }
        for (const [productId, qty] of qtyByProduct.entries()) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: { increment: qty } },
          });
        }
      }

      // Status o'zgarmagan bo'lsa ham data bo'sh bo'lishi mumkin; update ishlashi uchun.
      return tx.order.update({
        where: { id },
        data: { ...data, status: nextStatus },
        include: { items: true },
      });
    });
  }
}
