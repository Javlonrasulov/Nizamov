import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-category.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private expenses: ExpensesService) {}

  @Post()
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.expenses.createExpense(dto);
  }

  @Get()
  findAllExpenses(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.expenses.findAllExpenses(dateFrom, dateTo);
  }

  @Delete(':id')
  removeExpense(@Param('id') id: string) {
    return this.expenses.removeExpense(id);
  }

  @Get('categories')
  getCategories() {
    return this.expenses.getCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.expenses.createCategory(dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: Partial<CreateExpenseCategoryDto>) {
    return this.expenses.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.expenses.deleteCategory(id);
  }
}
