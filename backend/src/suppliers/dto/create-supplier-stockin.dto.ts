import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateSupplierStockInItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  costPrice: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salePrice?: number;
}

export class CreateSupplierStockInDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierStockInItemDto)
  items: CreateSupplierStockInItemDto[];
}

