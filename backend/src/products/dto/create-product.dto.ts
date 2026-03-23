import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  cost: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;
}
