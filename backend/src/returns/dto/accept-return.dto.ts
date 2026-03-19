import { IsOptional, IsString } from 'class-validator';

export class AcceptReturnDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  acceptedByUserId?: string;
}
