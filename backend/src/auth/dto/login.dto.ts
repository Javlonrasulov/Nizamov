import { IsString, IsIn } from 'class-validator';

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsIn(['agent', 'delivery', 'admin'])
  role: string;
}
