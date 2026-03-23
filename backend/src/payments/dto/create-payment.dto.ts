import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

const METHODS = ['cash', 'terminal', 'transfer'] as const;

export class CreatePaymentDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsIn(METHODS as unknown as string[])
  method!: (typeof METHODS)[number];

  @IsString()
  date!: string; // YYYY-MM-DD

  @IsString()
  collectedByUserId!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

