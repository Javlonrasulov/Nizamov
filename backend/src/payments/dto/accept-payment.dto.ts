import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AcceptPaymentDto {
  @IsString()
  userId!: string;
}

export class AcceptManyPaymentsDto extends AcceptPaymentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];
}
