import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async create(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Vehicle name is required');
    const existing = await this.prisma.vehicle.findFirst({ where: { name: trimmed } });
    if (existing) return existing;
    return this.prisma.vehicle.create({
      data: { name: trimmed },
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async update(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Vehicle name is required');

    const current = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Vehicle not found');

    const duplicate = await this.prisma.vehicle.findFirst({
      where: { name: trimmed, NOT: { id } },
    });
    if (duplicate) {
      return duplicate;
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { name: trimmed },
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async remove(id: string) {
    const current = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Vehicle not found');

    await this.prisma.vehicle.delete({ where: { id } });
    return { id };
  }
}
