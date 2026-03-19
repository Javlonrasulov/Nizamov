import { Body, Controller, Get, Patch, Post, Query, Param } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { AcceptReturnDto } from './dto/accept-return.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private returns: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returns.create(dto);
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ) {
    return this.returns.findAll(clientId, orderId, status);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Body() dto: AcceptReturnDto) {
    return this.returns.accept(id, dto);
  }
}

