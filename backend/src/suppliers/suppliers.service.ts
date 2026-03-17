import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { CreateSupplierStockInDto } from './dto/create-supplier-stockin.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async deleteSupplier(id: string) {
    // Cascades: stockIns/payments/items are removed by onDelete: Cascade
    return this.prisma.supplier.delete({ where: { id } });
  }

  async listSuppliers() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const [receivedBySupplier, paidBySupplier, lastStockInBySupplier, lastPaymentBySupplier] =
      await this.prisma.$transaction([
        this.prisma.supplierStockIn.groupBy({
          by: ['supplierId'],
          orderBy: { supplierId: 'asc' },
          _sum: { total: true },
        }),
        this.prisma.supplierPayment.groupBy({
          by: ['supplierId'],
          orderBy: { supplierId: 'asc' },
          _sum: { amount: true },
        }),
        this.prisma.supplierStockIn.groupBy({
          by: ['supplierId'],
          orderBy: { supplierId: 'asc' },
          _max: { createdAt: true },
        }),
        this.prisma.supplierPayment.groupBy({
          by: ['supplierId'],
          orderBy: { supplierId: 'asc' },
          _max: { createdAt: true },
        }),
      ]);

    const receivedMap = new Map(receivedBySupplier.map(r => [r.supplierId, r._sum?.total ?? 0]));
    const paidMap = new Map(paidBySupplier.map(r => [r.supplierId, r._sum?.amount ?? 0]));
    const lastStockInMap = new Map(lastStockInBySupplier.map(r => [r.supplierId, r._max?.createdAt ?? null]));
    const lastPaymentMap = new Map(lastPaymentBySupplier.map(r => [r.supplierId, r._max?.createdAt ?? null]));

    return suppliers.map(s => {
      const totalReceived = receivedMap.get(s.id) ?? 0;
      const totalPaid = paidMap.get(s.id) ?? 0;
      return {
        ...s,
        totalReceived,
        totalPaid,
        remainingDebt: totalReceived - totalPaid,
        lastDeliveryAt: lastStockInMap.get(s.id) ?? null,
        lastPaymentAt: lastPaymentMap.get(s.id) ?? null,
      };
    });
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        stockIns: {
          orderBy: { createdAt: 'desc' },
          include: { items: { orderBy: { productName: 'asc' } } },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier topilmadi');

    const totalReceived = supplier.stockIns.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalPaid = supplier.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      ...supplier,
      totals: {
        totalReceived,
        totalPaid,
        remainingDebt: totalReceived - totalPaid,
      },
    };
  }

  async addPayment(supplierId: string, dto: CreateSupplierPaymentDto) {
    await this.prisma.supplier.findUniqueOrThrow({ where: { id: supplierId } });
    return this.prisma.supplierPayment.create({
      data: {
        supplierId,
        date: dto.date,
        amount: dto.amount,
        type: dto.type,
        comment: dto.comment,
      },
    });
  }

  async addStockIn(supplierId: string, dto: CreateSupplierStockInDto) {
    if (!dto.items?.length) throw new BadRequestException('Mahsulotlar kiritilmadi');

    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier topilmadi');

    const productIds = Array.from(new Set(dto.items.map(i => i.productId)));
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const it of dto.items) {
      if (!productMap.has(it.productId)) {
        throw new BadRequestException(`Mahsulot topilmadi: ${it.productId}`);
      }
    }

    const items = dto.items.map(it => {
      const p = productMap.get(it.productId)!;
      const total = it.costPrice * it.quantity;
      return {
        productId: it.productId,
        productName: p.name,
        quantity: it.quantity,
        costPrice: it.costPrice,
        salePrice: it.salePrice ?? null,
        total,
      };
    });

    const totalSum = items.reduce((sum, i) => sum + i.total, 0);

    return this.prisma.$transaction(async tx => {
      // Update product stock (+) and optionally update prices
      for (const it of dto.items) {
        const data: any = { stock: { increment: it.quantity } };
        data.cost = it.costPrice;
        if (typeof it.salePrice === 'number') data.price = it.salePrice;
        await tx.product.update({ where: { id: it.productId }, data });
      }

      return tx.supplierStockIn.create({
        data: {
          supplierId,
          date: dto.date,
          total: totalSum,
          comment: dto.comment,
          items: { create: items },
        },
        include: { items: true },
      });
    });
  }
}

