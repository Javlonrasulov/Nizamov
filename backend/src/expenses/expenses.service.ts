import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async createExpense(dto: CreateExpenseDto) {
    return this.prisma.expense.create({ data: dto });
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
    return this.prisma.expenseCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: Partial<CreateExpenseCategoryDto>) {
    return this.prisma.expenseCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    return this.prisma.expenseCategory.delete({ where: { id } });
  }
}
