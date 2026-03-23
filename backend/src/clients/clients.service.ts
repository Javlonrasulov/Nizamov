import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private mapClient(row: { visitDays: string; [k: string]: unknown }) {
    return { ...row, visitDays: this.parseVisitDays(row.visitDays) };
  }
  private parseVisitDays(s: string | null | undefined): string[] {
    if (!s) return [];
    try {
      const a = JSON.parse(s);
      return Array.isArray(a) ? a : [];
    } catch {
      return s.split(',').map((x: string) => x.trim()).filter(Boolean);
    }
  }

  async create(dto: CreateClientDto) {
    const row = await this.prisma.client.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        agentId: dto.agentId,
        visitDays: JSON.stringify(dto.visitDays ?? []),
      },
    });
    return this.mapClient(row);
  }

  async findAll(agentId?: string) {
    const rows = await this.prisma.client.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapClient(r));
  }

  async findOne(id: string) {
    const row = await this.prisma.client.findUniqueOrThrow({ where: { id } });
    return this.mapClient(row);
  }

  async update(id: string, dto: UpdateClientDto) {
    const row = await this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.agentId !== undefined && { agentId: dto.agentId }),
        ...(dto.visitDays !== undefined && { visitDays: JSON.stringify(dto.visitDays) }),
      },
    });
    return this.mapClient(row);
  }

  async remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}
