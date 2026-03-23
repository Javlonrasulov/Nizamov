import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateReturnItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class CreateReturnDto {
  @IsString()
  clientId!: string;

  @IsString()
  orderId!: string;

  @IsString()
  date!: string; // YYYY-MM-DD

  @IsString()
  createdByUserId!: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'accepted'])
  status?: 'pending' | 'accepted';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items!: CreateReturnItemDto[];
}

