import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

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
}

