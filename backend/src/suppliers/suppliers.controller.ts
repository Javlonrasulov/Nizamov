import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { CreateSupplierStockInDto } from './dto/create-supplier-stockin.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliers: SuppliersService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliers.createSupplier(dto);
  }

  @Get()
  list() {
    return this.suppliers.listSuppliers();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.suppliers.getSupplier(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliers.updateSupplier(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliers.deleteSupplier(id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() dto: CreateSupplierPaymentDto) {
    return this.suppliers.addPayment(id, dto);
  }

  @Post(':id/stock-ins')
  addStockIn(@Param('id') id: string, @Body() dto: CreateSupplierStockInDto) {
    return this.suppliers.addStockIn(id, dto);
  }
}

