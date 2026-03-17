import { IsString, IsOptional, IsInt, IsArray, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

const STATUSES = ['new', 'accepted', 'delivering', 'delivered', 'cancelled', 'sent'];

export class CreateOrderDto {
  @IsString()
  clientId: string;

  @IsString()
  agentId: string;

  @IsOptional()
  @IsString()
  deliveryId?: string;

  @IsString()
  @IsIn(STATUSES)
  status: string;

  @IsString()
  date: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  total: number;

  @IsString()
  clientName: string;

  @IsString()
  clientPhone: string;

  @IsString()
  clientAddress: string;

  @IsString()
  agentName: string;

  @IsOptional()
  @IsString()
  deliveryName?: string;

  @IsArray()
  items: CreateOrderItemDto[];
}
