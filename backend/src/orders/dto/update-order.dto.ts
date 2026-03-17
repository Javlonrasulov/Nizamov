import { IsString, IsOptional, IsIn, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

const STATUSES = ['new', 'tayyorlanmagan', 'yuborilgan', 'accepted', 'delivering', 'delivered', 'cancelled', 'sent'];

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  deliveryId?: string;

  @IsOptional()
  @IsString()
  deliveryName?: string;

  @IsOptional()
  @IsString()
  vehicleName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  total?: number;

  @IsOptional()
  @IsArray()
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
