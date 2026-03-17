import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(phone: string, password: string, role: string) {
    const raw = (phone || '').replace(/\D/g, '');
    const candidates: string[] = [];
    if (raw) {
      candidates.push(raw);
      // Agar foydalanuvchi 9 ta raqam kiritsa (90xxxxxxx), 998 ni qo'shamiz
      if (raw.length === 9) candidates.push(`998${raw}`);
    }

    const user = await this.prisma.user.findFirst({
      where: {
        role,
        phone: { in: candidates.length ? candidates : ['__nope__'] },
      },
    });
    if (!user) throw new UnauthorizedException('Telefon yoki parol noto\'g\'ri');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Telefon yoki parol noto\'g\'ri');
    const { password: _, ...rest } = user;
    return rest;
  }
}
