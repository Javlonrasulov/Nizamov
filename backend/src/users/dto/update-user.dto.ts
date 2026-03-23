import { IsString, IsIn, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn(['agent', 'delivery', 'admin', 'sklad'])
  role?: string;

  @IsOptional()
  @IsString()
  vehicleName?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
