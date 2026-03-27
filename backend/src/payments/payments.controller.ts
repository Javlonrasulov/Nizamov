import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AcceptPaymentDto } from './dto/accept-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto);
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.payments.findAll(clientId, dateFrom, dateTo);
  }

  @Get('handover/sklad')
  getSkladHandoverQueue(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.payments.getSkladHandoverQueue(dateFrom, dateTo);
  }

  @Get('handover/admin')
  getAdminHandoverQueue(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.payments.getAdminHandoverQueue(dateFrom, dateTo);
  }

  @Get('handover/collector-summary')
  getCollectorHandoverSummary(
    @Query('mode') mode?: 'sklad' | 'admin',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.payments.getCollectorHandoverSummary(mode === 'admin' ? 'admin' : 'sklad', dateFrom, dateTo);
  }

  @Get('cashbox-summary')
  getCashboxSummary() {
    return this.payments.getCashboxSummary();
  }

  @Post(':id/accept-sklad')
  acceptBySklad(@Param('id') id: string, @Body() dto: AcceptPaymentDto) {
    return this.payments.acceptBySklad(id, dto.userId);
  }

  @Post(':id/accept-admin')
  acceptByAdmin(@Param('id') id: string, @Body() dto: AcceptPaymentDto) {
    return this.payments.acceptByAdmin(id, dto.userId);
  }
}

