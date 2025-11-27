import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * @description Represents a country with basic metadata such as MCC, ISO initials, and language.
 * @module Country
 * @category Domain
 *
 * This model is documented using Compodoc and is also used in Swagger documentation.
 */
export class Country {
  /**
   * @description Numeric country code.
   * @example 34
   */
  @ApiProperty({
    description: 'Numeric country code.',
    example: 34,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  code: number;

  /**
   * @description Official country name.
   * @example "Spain"
   */
  @ApiProperty({
    description: 'Official country name.',
    example: 'Spain',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * @description Mobile Country Code used in telecommunications.
   * @example 214
   */
  @ApiProperty({
    description: 'Mobile Country Code (MCC) used in telecommunications.',
    example: 214,
  })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  mcc: number;

  /**
   * @description Default language for the country.
   * @example "es"
   */
  @ApiProperty({
    description: 'Default language for the country.',
    example: 'es',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  language: string;

  /**
   * @description ISO alpha-2 or alpha-3 code of the country.
   * @example "ES"
   */
  @ApiProperty({
    description: 'ISO alpha-2 or alpha-3 initials of the country.',
    minLength: 2,
    maxLength: 3,
    example: 'ES',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Length(2, 3)
  initials: string;
}
