import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateIf, ValidateNested } from 'class-validator';

export class ApplyOrderPromoItemDto {
  @IsString()
  id!: string;

  /** null — aksiyasiz (asosiy narx); son — aksiya narxi */
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(0)
  @Type(() => Number)
  promoPrice?: number | null;
}

export class ApplyOrderPromoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyOrderPromoItemDto)
  items!: ApplyOrderPromoItemDto[];
}
