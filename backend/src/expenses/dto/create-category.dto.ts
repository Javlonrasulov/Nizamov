import { IsString } from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsString()
  label: string;

  @IsString()
  iconName: string;

  @IsString()
  color: string;
}
