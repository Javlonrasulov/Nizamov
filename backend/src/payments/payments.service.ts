import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type OrderBalanceRow = {
  orderId: string;
  orderNumber: number | null;
  date: string;
  total: number;
  paid: number;
  debt: number;
  deliveryId?: string | null;
  deliveryName?: string | null;
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        clientId: dto.clientId,
        orderId: dto.orderId,
        amount: dto.amount,
        method: dto.method,
        date: dto.date,
        collectedByUserId: dto.collectedByUserId,
        comment: dto.comment,
      },
    });
  }

  async findAll(clientId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    return this.prisma.payment.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        collectedBy: { select: { id: true, name: true, phone: true, role: true } },
      },
    });
  }

  /**
   * Computes client balance and per-order paid/debt.
   *
   * Rules:
   * - Delivered orders contribute to total.
   * - Payments with orderId are applied to that order first.
   * - Unlinked payments are applied FIFO to oldest delivered orders for reporting.
   */
  async getClientBalance(clientId: string) {
    const [deliveredOrders, payments] = await Promise.all([
      this.prisma.order.findMany({
        where: { clientId, status: 'delivered' },
        select: { id: true, orderNumber: true, date: true, total: true, createdAt: true, deliveryId: true, deliveryName: true },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.payment.findMany({
        where: { clientId },
        select: { id: true, orderId: true, amount: true, method: true, date: true, createdAt: true, collectedByUserId: true, comment: true },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    const deliveredTotal = deliveredOrders.reduce((s, o) => s + (o.total || 0), 0);
    const paidTotal = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const debt = Math.max(0, deliveredTotal - paidTotal);

    const byOrder = new Map<string, { total: number; paid: number; date: string; orderNumber: number | null; deliveryId?: string | null; deliveryName?: string | null }>();
    for (const o of deliveredOrders) {
      byOrder.set(o.id, { total: o.total || 0, paid: 0, date: o.date, orderNumber: o.orderNumber ?? null, deliveryId: o.deliveryId, deliveryName: o.deliveryName });
    }

    // 1) Apply linked payments
    const unlinked: Array<{ id: string; amount: number }> = [];
    for (const p of payments) {
      if (p.orderId && byOrder.has(p.orderId)) {
        const row = byOrder.get(p.orderId)!;
        row.paid += p.amount || 0;
      } else {
        unlinked.push({ id: p.id, amount: p.amount || 0 });
      }
    }

    // Clamp linked overpayments and carry to FIFO pool
    let fifoPool = 0;
    for (const [, row] of byOrder.entries()) {
      if (row.paid > row.total) {
        fifoPool += row.paid - row.total;
        row.paid = row.total;
      }
    }

    // 2) Apply unlinked + carryover FIFO to oldest orders
    const fifoAmount = unlinked.reduce((s, p) => s + p.amount, 0) + fifoPool;
    let remaining = fifoAmount;
    for (const o of deliveredOrders) {
      if (remaining <= 0) break;
      const row = byOrder.get(o.id)!;
      const canTake = Math.max(0, row.total - row.paid);
      const take = Math.min(canTake, remaining);
      row.paid += take;
      remaining -= take;
    }

    const perOrder: OrderBalanceRow[] = deliveredOrders.map(o => {
      const row = byOrder.get(o.id)!;
      const paid = Math.min(row.total, row.paid);
      const d = Math.max(0, row.total - paid);
      return {
        orderId: o.id,
        orderNumber: row.orderNumber,
        date: row.date,
        total: row.total,
        paid,
        debt: d,
        deliveryId: row.deliveryId ?? null,
        deliveryName: row.deliveryName ?? null,
      };
    });

    // Include payments with collector info for admin/client history
    const paymentsWithCollector = await this.prisma.payment.findMany({
      where: { clientId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        collectedBy: { select: { id: true, name: true, phone: true, role: true } },
      },
    });

    return {
      clientId,
      deliveredTotal,
      paidTotal,
      debt,
      perOrder,
      payments: paymentsWithCollector,
    };
  }
}

