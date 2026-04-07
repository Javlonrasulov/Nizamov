import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

export type CollectorHandoverSummaryRow = {
  collectedBy: { id: string; name: string; phone: string; role: string } | null;
  collectedByUserId: string;
  paymentsCount: number;
  clientsCount: number;
  cashTotal: number;
  debtTotal: number;
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private readonly countDirectlyMethods = ['terminal', 'transfer'];

  private buildDateWhere(dateFrom?: string, dateTo?: string) {
    if (!dateFrom && !dateTo) return undefined;
    return {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  private buildCountedPaymentsWhere() {
    return {
      OR: [
        { method: { in: this.countDirectlyMethods } },
        { receivedBySkladAt: { not: null } },
      ],
    };
  }

  private paymentInclude = {
    client: { select: { id: true, name: true, phone: true, address: true } },
    order: { select: { id: true, orderNumber: true, date: true, clientName: true } },
    collectedBy: { select: { id: true, name: true, phone: true, role: true } },
    receivedBySklad: { select: { id: true, name: true, phone: true, role: true } },
    receivedByAdmin: { select: { id: true, name: true, phone: true, role: true } },
  } as const;

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
      include: this.paymentInclude,
    });
  }

  async findAll(clientId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    const dateWhere = this.buildDateWhere(dateFrom, dateTo);
    if (dateWhere) where.date = dateWhere;
    return this.prisma.payment.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: this.paymentInclude,
    });
  }

  async getSkladHandoverQueue(dateFrom?: string, dateTo?: string) {
    return this.prisma.payment.findMany({
      where: {
        receivedBySkladAt: null,
        ...(this.buildDateWhere(dateFrom, dateTo) ? { date: this.buildDateWhere(dateFrom, dateTo) } : {}),
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      include: this.paymentInclude,
    });
  }

  async getAdminHandoverQueue(dateFrom?: string, dateTo?: string) {
    return this.prisma.payment.findMany({
      where: {
        receivedBySkladAt: { not: null },
        receivedByAdminAt: null,
        ...(this.buildDateWhere(dateFrom, dateTo) ? { date: this.buildDateWhere(dateFrom, dateTo) } : {}),
      },
      orderBy: [{ receivedBySkladAt: 'asc' }, { date: 'asc' }, { createdAt: 'asc' }],
      include: this.paymentInclude,
    });
  }

  async getCollectorHandoverSummary(mode: 'sklad' | 'admin', dateFrom?: string, dateTo?: string): Promise<CollectorHandoverSummaryRow[]> {
    const dateWhere = this.buildDateWhere(dateFrom, dateTo);
    const where =
      mode === 'sklad'
        ? {
            receivedBySkladAt: null,
            ...(dateWhere ? { date: dateWhere } : {}),
          }
        : {
            receivedBySkladAt: { not: null },
            receivedByAdminAt: null,
            ...(dateWhere ? { date: dateWhere } : {}),
          };

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        id: true,
        clientId: true,
        amount: true,
        method: true,
        collectedByUserId: true,
        collectedBy: { select: { id: true, name: true, phone: true, role: true } },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    const groups = new Map<
      string,
      {
        collectedByUserId: string;
        collectedBy: { id: string; name: string; phone: string; role: string } | null;
        paymentsCount: number;
        cashTotal: number;
        cashMethodTotal: number;
        terminalTotal: number;
        transferTotal: number;
        clientIds: Set<string>;
      }
    >();

    for (const p of payments) {
      const g = groups.get(p.collectedByUserId) || {
        collectedByUserId: p.collectedByUserId,
        collectedBy: p.collectedBy ?? null,
        paymentsCount: 0,
        cashTotal: 0,
        cashMethodTotal: 0,
        terminalTotal: 0,
        transferTotal: 0,
        clientIds: new Set<string>(),
      };
      g.paymentsCount += 1;
      g.cashTotal += p.amount || 0;
      if (p.method === 'cash') g.cashMethodTotal += p.amount || 0;
      if (p.method === 'terminal') g.terminalTotal += p.amount || 0;
      if (p.method === 'transfer') g.transferTotal += p.amount || 0;
      g.clientIds.add(p.clientId);
      if (!g.collectedBy && p.collectedBy) g.collectedBy = p.collectedBy;
      groups.set(p.collectedByUserId, g);
    }

    const rows = Array.from(groups.values());
    const debtTotals = await Promise.all(
      rows.map(async (r) => {
        const balances = await Promise.all(
          Array.from(r.clientIds).map((clientId) => this.getClientBalance(clientId)),
        );
        return balances.reduce((sum, b) => sum + (b.debt || 0), 0);
      }),
    );

    return rows
      .map((r, idx) => ({
        collectedBy: r.collectedBy,
        collectedByUserId: r.collectedByUserId,
        paymentsCount: r.paymentsCount,
        clientsCount: r.clientIds.size,
        cashTotal: r.cashTotal,
        cashMethodTotal: r.cashMethodTotal,
        terminalTotal: r.terminalTotal,
        transferTotal: r.transferTotal,
        debtTotal: debtTotals[idx] ?? 0,
      }))
      .sort((a, b) => b.cashTotal - a.cashTotal);
  }

  async getCashboxSummary() {
    const [pendingSklad, skladCash, adminCash] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { receivedBySkladAt: null },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          receivedBySkladAt: { not: null },
          receivedByAdminAt: null,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          receivedByAdminAt: { not: null },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      pendingSkladTotal: pendingSklad._sum.amount ?? 0,
      skladCashTotal: skladCash._sum.amount ?? 0,
      adminCashTotal: adminCash._sum.amount ?? 0,
    };
  }

  async acceptBySklad(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.receivedBySkladAt) {
      throw new BadRequestException('Payment already accepted by sklad');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        receivedBySkladUserId: userId,
        receivedBySkladAt: new Date(),
      },
      include: this.paymentInclude,
    });
  }

  async acceptManyBySklad(ids: string[], userId: string) {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    if (uniqueIds.length === 0) {
      throw new BadRequestException('No payments selected');
    }

    const payments = await this.prisma.payment.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, receivedBySkladAt: true },
    });
    if (payments.length !== uniqueIds.length) {
      throw new NotFoundException('Some payments were not found');
    }
    if (payments.some(payment => payment.receivedBySkladAt)) {
      throw new BadRequestException('Some payments were already accepted by sklad');
    }

    await this.prisma.$transaction([
      this.prisma.payment.updateMany({
        where: { id: { in: uniqueIds } },
        data: {
          receivedBySkladUserId: userId,
          receivedBySkladAt: new Date(),
        },
      }),
    ]);

    return { count: uniqueIds.length };
  }

  async acceptByAdmin(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.receivedBySkladAt) {
      throw new BadRequestException('Payment must be accepted by sklad first');
    }
    if (payment.receivedByAdminAt) {
      throw new BadRequestException('Payment already accepted by admin');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        receivedByAdminUserId: userId,
        receivedByAdminAt: new Date(),
      },
      include: this.paymentInclude,
    });
  }

  async acceptManyByAdmin(ids: string[], userId: string) {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    if (uniqueIds.length === 0) {
      throw new BadRequestException('No payments selected');
    }

    const payments = await this.prisma.payment.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, receivedBySkladAt: true, receivedByAdminAt: true },
    });
    if (payments.length !== uniqueIds.length) {
      throw new NotFoundException('Some payments were not found');
    }
    if (payments.some(payment => !payment.receivedBySkladAt)) {
      throw new BadRequestException('Some payments must be accepted by sklad first');
    }
    if (payments.some(payment => payment.receivedByAdminAt)) {
      throw new BadRequestException('Some payments were already accepted by admin');
    }

    await this.prisma.$transaction([
      this.prisma.payment.updateMany({
        where: { id: { in: uniqueIds } },
        data: {
          receivedByAdminUserId: userId,
          receivedByAdminAt: new Date(),
        },
      }),
    ]);

    return { count: uniqueIds.length };
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
        select: {
          id: true,
          orderNumber: true,
          date: true,
          total: true,
          createdAt: true,
          deliveryId: true,
          deliveryName: true,
          items: {
            select: { productId: true, quantity: true, price: true, promoPrice: true },
          },
        },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.payment.findMany({
        where: {
          clientId,
          ...this.buildCountedPaymentsWhere(),
        },
        select: { id: true, orderId: true, amount: true, method: true, date: true, createdAt: true, collectedByUserId: true, comment: true },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    // Delivered order umumiy summasi `order.total` bo'yicha hisoblanadi,
    // lekin haydovchi (delivery) qisman `vozvrat` kiritganda mijorga qaytariladigan qismi bo'ladi.
    // Shu sabab deliveredTotal/perOrder total'ni returns bo'yicha kamaytiramiz.
    const deliveredOrderIds = deliveredOrders.map(o => o.id);
    const returns = deliveredOrderIds.length
      ? await this.prisma.return.findMany({
        where: {
          orderId: { in: deliveredOrderIds },
          status: 'accepted',
        },
        select: {
          orderId: true,
          items: { select: { productId: true, quantity: true } },
        },
      })
      : [];

    const returnedQtyByOrder = new Map<string, Map<string, number>>();
    for (const r of returns) {
      const byProduct = returnedQtyByOrder.get(r.orderId) || new Map<string, number>();
      for (const it of r.items || []) {
        byProduct.set(it.productId, (byProduct.get(it.productId) || 0) + (it.quantity || 0));
      }
      returnedQtyByOrder.set(r.orderId, byProduct);
    }

    const byOrder = new Map<
      string,
      {
        total: number;
        paid: number;
        date: string;
        orderNumber: number | null;
        deliveryId?: string | null;
        deliveryName?: string | null;
      }
    >();
    for (const o of deliveredOrders) {
      const items = o.items || [];
      const adjustedTotal = items.reduce((sum, it) => {
        const returnedQty = returnedQtyByOrder.get(o.id)?.get(it.productId) || 0;
        const cancelledQty = Math.min(it.quantity || 0, returnedQty || 0);
        const deliveredQty = Math.max(0, (it.quantity || 0) - cancelledQty);
        const unit = it.promoPrice != null ? it.promoPrice : (it.price || 0);
        return sum + deliveredQty * unit;
      }, 0);
      byOrder.set(o.id, {
        total: adjustedTotal,
        paid: 0,
        date: o.date,
        orderNumber: o.orderNumber ?? null,
        deliveryId: o.deliveryId,
        deliveryName: o.deliveryName,
      });
    }

    const deliveredTotal = Array.from(byOrder.values()).reduce((s, r) => s + (r.total || 0), 0);
    const paidTotal = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const debt = Math.max(0, deliveredTotal - paidTotal);

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
      where: {
        clientId,
        ...this.buildCountedPaymentsWhere(),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: this.paymentInclude,
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

