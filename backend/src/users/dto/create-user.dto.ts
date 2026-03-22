import { IsString, IsIn, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(1)
  password: string;

  @IsString()
  @IsIn(['agent', 'delivery', 'admin', 'sklad'])
  role: string;

  @IsOptional()
  @IsString()
  vehicleName?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
