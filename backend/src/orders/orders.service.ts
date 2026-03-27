import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApplyOrderPromoDto } from './dto/apply-order-promo.dto';

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
              promoPrice: (i as { promoPrice?: number | null }).promoPrice ?? null,
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

      const nextStatus = dto.status ?? prev.status;

      if (dto.items !== undefined) {
        const prevQtyByProduct = new Map<string, number>();
        for (const item of prev.items) {
          prevQtyByProduct.set(item.productId, (prevQtyByProduct.get(item.productId) || 0) + (item.quantity || 0));
        }

        // Avval eski band qilingan qoldiqni qaytaramiz, keyin yangi tarkibni tekshirib qayta band qilamiz.
        if (prev.status !== 'cancelled') {
          for (const [productId, qty] of prevQtyByProduct.entries()) {
            await tx.product.update({
              where: { id: productId },
              data: { stock: { increment: qty } },
            });
          }
        }

        const nextQtyByProduct = new Map<string, number>();
        for (const item of dto.items) {
          nextQtyByProduct.set(item.productId, (nextQtyByProduct.get(item.productId) || 0) + (item.quantity || 0));
        }

        if (nextStatus !== 'cancelled' && nextQtyByProduct.size > 0) {
          const products = await tx.product.findMany({
            where: { id: { in: [...nextQtyByProduct.keys()] } },
            select: { id: true, stock: true, name: true },
          });
          const byId = new Map(products.map((p) => [p.id, p]));
          for (const [productId, needQty] of nextQtyByProduct.entries()) {
            const product = byId.get(productId);
            if (!product) throw new BadRequestException('Mahsulot topilmadi');
            if ((product.stock || 0) < needQty) {
              throw new BadRequestException(`Omborda yetarli emas: ${product.name} (bor: ${product.stock}, kerak: ${needQty})`);
            }
          }
          for (const [productId, needQty] of nextQtyByProduct.entries()) {
            await tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: needQty } },
            });
          }
        }

        await tx.orderItem.deleteMany({ where: { orderId: id } });
        if (dto.items.length > 0) {
          data.items = {
            create: dto.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              price: i.price,
              promoPrice: (i as { promoPrice?: number | null }).promoPrice ?? null,
            })),
          };
        }
      }

      // Yetkazilmadi (cancelled) bo'lsa — mahsulotlarni omborga qaytarish
      // Double qaytarmaslik uchun faqat oldingi status cancelled bo'lmagan holatda.
      if (dto.status === 'cancelled' && prev.status !== 'cancelled' && dto.items === undefined) {
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

  async applyPromoPrices(orderId: string, dto: ApplyOrderPromoDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });
      if (!['tayyorlanmagan', 'sent'].includes(order.status)) {
        throw new BadRequestException('Aksiya faqat tayyorlanmagan zakazda');
      }

      const validIds = new Set(order.items.map((i) => i.id));
      if (dto.items.length !== validIds.size) {
        throw new BadRequestException('Barcha mahsulot qatorlari yuborilishi kerak');
      }
      const seen = new Set<string>();
      for (const line of dto.items) {
        if (seen.has(line.id)) throw new BadRequestException('Takroriy qator');
        seen.add(line.id);
        if (!validIds.has(line.id)) {
          throw new BadRequestException('Noto‘g‘ri mahsulot qatori');
        }
      }

      for (const line of dto.items) {
        await tx.orderItem.update({
          where: { id: line.id },
          data: { promoPrice: line.promoPrice == null ? null : line.promoPrice },
        });
      }

      const next = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });
      const total = next.items.reduce((sum, it) => {
        const unit = it.promoPrice != null ? it.promoPrice : it.price;
        return sum + (it.quantity || 0) * (unit || 0);
      }, 0);

      return tx.order.update({
        where: { id: orderId },
        data: { total },
        include: { items: true },
      });
    });
  }
}
