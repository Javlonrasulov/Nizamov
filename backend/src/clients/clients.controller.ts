import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaymentsService } from '../payments/payments.service';

@Controller('clients')
export class ClientsController {
  constructor(private clients: ClientsService, private payments: PaymentsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Get()
  findAll(@Query('agentId') agentId?: string) {
    return this.clients.findAll(agentId);
  }

  @Get(':id/balance')
  balance(@Param('id') id: string) {
    return this.payments.getClientBalance(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clients.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clients.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clients.remove(id);
  }
}
