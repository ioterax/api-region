import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CountryDto {
  @IsNotEmpty()
  @IsNumber()
  code: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  mcc: number;

  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 3)
  initials: string;
}
