import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  date: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  categoryId: string;

  @IsString()
  comment: string;
}
