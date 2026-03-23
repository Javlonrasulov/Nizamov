import { Injectable } from '@nestjs/common';
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
    const existing = await this.prisma.vehicle.findFirst({ where: { name: trimmed } });
    if (existing) return existing;
    return this.prisma.vehicle.create({
      data: { name: trimmed },
      select: { id: true, name: true, sortOrder: true },
    });
  }
}
