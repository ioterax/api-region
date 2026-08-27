import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdministrativeDivisionType, GeographicPlaceType } from '@ioterax/foundation-lib-central';
import { REGION_SEARCH_KINDS, type RegionSearchKind } from '@/domain/region-query';

const REGION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._-]{0,127}$/;
const LANGUAGE_TAG_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

function integer(value: unknown): unknown {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return value;
  return Number(value);
}

function upper(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class RegionIdParamModel {
  @ApiProperty({ example: 'ES-CT', maxLength: 128 })
  @IsString()
  @Matches(REGION_ID_PATTERN)
  id!: string;
}

export class RegionPageQueryModel {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 1000 })
  @Transform(({ value }) => integer(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  page = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @Transform(({ value }) => integer(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 25;
}

export class CountryListQueryModel extends RegionPageQueryModel {
  @ApiPropertyOptional({ example: 'ES', pattern: '^[A-Z]{2}$' })
  @Transform(({ value }) => upper(value))
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  isoAlpha2?: string;

  @ApiPropertyOptional({ example: 'es-ES', maxLength: 35 })
  @IsOptional()
  @Matches(LANGUAGE_TAG_PATTERN)
  languageTag?: string;
}

export class AdministrativeDivisionListQueryModel extends RegionPageQueryModel {
  @ApiProperty({ example: 'ES', pattern: '^[A-Z]{2}$' })
  @Transform(({ value }) => upper(value))
  @Matches(/^[A-Z]{2}$/)
  countryCode!: string;

  @ApiPropertyOptional({ example: 'ES-CT', maxLength: 128 })
  @IsOptional()
  @Matches(REGION_ID_PATTERN)
  parentId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 20 })
  @Transform(({ value }) => integer(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  level?: number;

  @ApiPropertyOptional({ enum: AdministrativeDivisionType })
  @IsOptional()
  @IsEnum(AdministrativeDivisionType)
  type?: AdministrativeDivisionType;
}

export class GeographicPlaceListQueryModel extends RegionPageQueryModel {
  @ApiProperty({ example: 'ES', pattern: '^[A-Z]{2}$' })
  @Transform(({ value }) => upper(value))
  @Matches(/^[A-Z]{2}$/)
  countryCode!: string;

  @ApiPropertyOptional({ example: 'ES-CT-B', maxLength: 128 })
  @IsOptional()
  @Matches(REGION_ID_PATTERN)
  parentDivisionId?: string;

  @ApiPropertyOptional({ enum: GeographicPlaceType })
  @IsOptional()
  @IsEnum(GeographicPlaceType)
  type?: GeographicPlaceType;
}

export class RegionSearchQueryModel extends RegionPageQueryModel {
  @ApiProperty({ example: 'Barcelona', minLength: 2, maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => trimmedString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  query!: string;

  @ApiPropertyOptional({ example: 'ES', pattern: '^[A-Z]{2}$' })
  @Transform(({ value }) => upper(value))
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;

  @ApiPropertyOptional({
    enum: REGION_SEARCH_KINDS,
    isArray: true,
    default: REGION_SEARCH_KINDS,
    description: 'Comma-separated resource kinds or a repeated query parameter.',
  })
  @Transform(({ value }: { value: unknown }) => searchKinds(value))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REGION_SEARCH_KINDS.length)
  @IsIn(REGION_SEARCH_KINDS, { each: true })
  kinds: RegionSearchKind[] = [...REGION_SEARCH_KINDS];
}

function searchKinds(value: unknown): string[] {
  if (value === undefined) return [...REGION_SEARCH_KINDS];
  const values: unknown[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return values
    .filter((entry): entry is string => typeof entry === 'string')
    .map(entry => entry.trim())
    .filter(Boolean);
}

function trimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
