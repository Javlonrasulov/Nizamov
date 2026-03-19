import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, phone: true, role: true, vehicleName: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true, role: true, vehicleName: true, createdAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    const cleanPhone = (dto.phone || '').replace(/\D/g, '');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        phone: cleanPhone,
        password: hashed,
        role: dto.role,
        vehicleName: dto.vehicleName ?? undefined,
      },
      select: { id: true, name: true, phone: true, role: true, vehicleName: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = (dto.phone || '').replace(/\D/g, '');
    if (dto.password !== undefined) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.vehicleName !== undefined) data.vehicleName = dto.vehicleName;
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, phone: true, role: true, vehicleName: true, createdAt: true },
      });
    } catch (e: any) {
      // Prisma throws when record is not found (P2025). Convert to 404.
      if (e?.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
