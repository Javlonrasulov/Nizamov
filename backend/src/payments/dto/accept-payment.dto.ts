import { IsString } from 'class-validator';

export class AcceptPaymentDto {
  @IsString()
  userId!: string;
}
