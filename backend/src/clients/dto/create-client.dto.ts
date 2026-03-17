import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';

const WEEK_DAYS = ['du', 'se', 'ch', 'pa', 'ju', 'sh'];

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsString()
  agentId: string;

  @IsOptional()
  @IsArray()
  @IsIn(WEEK_DAYS, { each: true })
  visitDays?: string[];
}
