import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.vehicles.update(id, body?.name ?? '');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicles.remove(id);
  }
}
