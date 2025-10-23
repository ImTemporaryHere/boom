import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SpaceType {
  DESK = 'desk',
  MEETING_ROOM = 'meeting_room',
  OFFICE = 'office',
  COWORKING = 'coworking',
  EVENT_SPACE = 'event_space',
}

export enum SortBy {
  PRICE = 'price',
  DISTANCE = 'distance',
  RATING = 'rating',
  CAPACITY = 'capacity',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class LocationDto {
  @ApiProperty({
    example: 'New York',
    description: 'City name',
  })
  @IsString()
  city: string;

  @ApiPropertyOptional({
    example: 'NY',
    description: 'State or province code',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'Country code (ISO 3166-1 alpha-2)',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: '10001',
    description: 'Postal/ZIP code',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 40.7128,
    description: 'Latitude coordinate',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -74.006,
    description: 'Longitude coordinate',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Search radius in kilometers',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  radius?: number;
}

export class SearchSpacesDto {
  @ApiProperty({
    description: 'Location filter criteria',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({
    example: '2025-10-24T10:00:00Z',
    description: 'Start date and time for availability check (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-10-24T18:00:00Z',
    description: 'End date and time for availability check (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: [SpaceType.DESK, SpaceType.MEETING_ROOM],
    description: 'Filter by space types',
    enum: SpaceType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SpaceType, { each: true })
  spaceTypes?: SpaceType[];

  @ApiPropertyOptional({
    example: 5,
    description: 'Minimum capacity (number of people)',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  minCapacity?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum capacity (number of people)',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Minimum price per hour (in cents)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Maximum price per hour (in cents)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: ['wifi', 'projector', 'whiteboard'],
    description: 'Required amenities',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Filter for instantly bookable spaces only',
  })
  @IsOptional()
  @IsBoolean()
  instantBook?: boolean;

  @ApiPropertyOptional({
    example: SortBy.PRICE,
    description: 'Sort results by field',
    enum: SortBy,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({
    example: SortOrder.ASC,
    description: 'Sort order',
    enum: SortOrder,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of results per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
