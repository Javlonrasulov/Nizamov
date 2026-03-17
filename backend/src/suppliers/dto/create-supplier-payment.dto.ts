import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierPaymentDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsInt()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsIn(['cash', 'card', 'bank'])
  type: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

