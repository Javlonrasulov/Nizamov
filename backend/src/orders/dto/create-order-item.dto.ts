import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;
}
