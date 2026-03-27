import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async createExpense(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        ...dto,
        date: dto.date.trim(),
        comment: dto.comment.trim(),
      },
    });
  }

  async findAllExpenses(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    return this.prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async removeExpense(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.expenseCategory.findMany({ orderBy: { label: 'asc' } });
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: {
        label: dto.label.trim(),
        iconName: dto.iconName.trim(),
        color: dto.color.trim(),
      },
    });
  }

  async updateCategory(id: string, dto: Partial<CreateExpenseCategoryDto>) {
    return this.prisma.expenseCategory.update({
      where: { id },
      data: {
        ...(dto.label != null ? { label: dto.label.trim() } : {}),
        ...(dto.iconName != null ? { iconName: dto.iconName.trim() } : {}),
        ...(dto.color != null ? { color: dto.color.trim() } : {}),
      },
    });
  }

  async deleteCategory(id: string) {
    if (id === 'other') {
      throw new BadRequestException(`'Boshqa' kategoriyasini o'chirib bo'lmaydi`);
    }

    const fallback = await this.prisma.expenseCategory.findUnique({ where: { id: 'other' } });
    if (!fallback) {
      throw new BadRequestException(`'Boshqa' kategoriyasi topilmadi`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.expense.updateMany({
        where: { categoryId: id },
        data: { categoryId: 'other' },
      });

      return tx.expenseCategory.delete({ where: { id } });
    });
  }
}
