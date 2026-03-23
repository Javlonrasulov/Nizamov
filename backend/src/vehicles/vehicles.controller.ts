import { Body, Controller, Get, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehicles: VehiclesService) {}

  @Get()
  findAll() {
    return this.vehicles.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.vehicles.create(body?.name ?? '');
  }
}
