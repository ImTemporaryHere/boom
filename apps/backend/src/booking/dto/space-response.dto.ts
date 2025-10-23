import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceType } from './search-spaces.dto';

export class SpaceLocationDto {
  @ApiProperty({
    example: 'New York',
    description: 'City name',
  })
  city: string;

  @ApiPropertyOptional({
    example: 'NY',
    description: 'State or province',
  })
  state?: string;

  @ApiProperty({
    example: 'US',
    description: 'Country code',
  })
  country: string;

  @ApiProperty({
    example: '10001',
    description: 'Postal/ZIP code',
  })
  postalCode: string;

  @ApiProperty({
    example: '123 Main St, Suite 100',
    description: 'Street address',
  })
  address: string;

  @ApiProperty({
    example: 40.7128,
    description: 'Latitude coordinate',
  })
  latitude: number;

  @ApiProperty({
    example: -74.006,
    description: 'Longitude coordinate',
  })
  longitude: number;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Distance from search location in kilometers',
  })
  distance?: number;
}

export class SpaceAmenityDto {
  @ApiProperty({
    example: 'wifi',
    description: 'Amenity identifier',
  })
  id: string;

  @ApiProperty({
    example: 'High-Speed WiFi',
    description: 'Amenity display name',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Free high-speed internet access',
    description: 'Amenity description',
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether amenity is included in base price',
  })
  included: boolean;

  @ApiPropertyOptional({
    example: 500,
    description: 'Additional cost in cents if not included',
  })
  additionalCost?: number;
}

export class SpacePricingDto {
  @ApiProperty({
    example: 2500,
    description: 'Hourly rate in cents',
  })
  hourly: number;

  @ApiPropertyOptional({
    example: 15000,
    description: 'Daily rate in cents',
  })
  daily?: number;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Weekly rate in cents',
  })
  weekly?: number;

  @ApiPropertyOptional({
    example: 180000,
    description: 'Monthly rate in cents',
  })
  monthly?: number;

  @ApiProperty({
    example: 'USD',
    description: 'Currency code (ISO 4217)',
  })
  currency: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Discount percentage for this search (if applicable)',
  })
  discountPercentage?: number;
}

export class SpaceAvailabilityDto {
  @ApiProperty({
    example: true,
    description: 'Whether space is available for requested time slot',
  })
  available: boolean;

  @ApiPropertyOptional({
    example: '2025-10-24T10:00:00Z',
    description: 'Next available date/time if not currently available',
  })
  nextAvailable?: string;

  @ApiPropertyOptional({
    example: ['2025-10-24T10:00:00Z', '2025-10-24T14:00:00Z'],
    description: 'Available time slots for the requested date',
    isArray: true,
  })
  timeSlots?: string[];
}

export class SpaceProviderDto {
  @ApiProperty({
    example: 'provider-123',
    description: 'Provider unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Premium Coworking Spaces',
    description: 'Provider name',
  })
  name: string;

  @ApiPropertyOptional({
    example: 4.8,
    description: 'Provider average rating',
  })
  rating?: number;

  @ApiPropertyOptional({
    example: 156,
    description: 'Number of reviews for provider',
  })
  reviewCount?: number;

  @ApiProperty({
    example: true,
    description: 'Whether provider is verified',
  })
  verified: boolean;
}

export class SpaceImageDto {
  @ApiProperty({
    example: 'https://example.com/images/space-1.jpg',
    description: 'Image URL',
  })
  url: string;

  @ApiPropertyOptional({
    example: 'Main conference room',
    description: 'Image caption/alt text',
  })
  caption?: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is the primary image',
  })
  isPrimary: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order',
  })
  order?: number;
}

export class SpaceDto {
  @ApiProperty({
    example: 'space-abc123',
    description: 'Unique space identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Modern Conference Room',
    description: 'Space name/title',
  })
  name: string;

  @ApiProperty({
    example: 'A bright, modern conference room with state-of-the-art AV equipment',
    description: 'Space description',
  })
  description: string;

  @ApiProperty({
    example: SpaceType.MEETING_ROOM,
    description: 'Type of space',
    enum: SpaceType,
  })
  type: SpaceType;

  @ApiProperty({
    description: 'Space location details',
    type: SpaceLocationDto,
  })
  location: SpaceLocationDto;

  @ApiProperty({
    example: 12,
    description: 'Maximum capacity (number of people)',
  })
  capacity: number;

  @ApiProperty({
    example: 450,
    description: 'Space area in square feet',
  })
  areaSquareFeet: number;

  @ApiProperty({
    description: 'Pricing information',
    type: SpacePricingDto,
  })
  pricing: SpacePricingDto;

  @ApiProperty({
    description: 'Available amenities',
    type: [SpaceAmenityDto],
  })
  amenities: SpaceAmenityDto[];

  @ApiProperty({
    description: 'Space images',
    type: [SpaceImageDto],
  })
  images: SpaceImageDto[];

  @ApiProperty({
    description: 'Provider information',
    type: SpaceProviderDto,
  })
  provider: SpaceProviderDto;

  @ApiPropertyOptional({
    description: 'Availability information for requested time period',
    type: SpaceAvailabilityDto,
  })
  availability?: SpaceAvailabilityDto;

  @ApiProperty({
    example: 4.5,
    description: 'Average rating (0-5)',
  })
  rating: number;

  @ApiProperty({
    example: 42,
    description: 'Number of reviews',
  })
  reviewCount: number;

  @ApiProperty({
    example: true,
    description: 'Whether space can be booked instantly',
  })
  instantBookable: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: 'Minimum booking duration in hours',
  })
  minBookingHours?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Maximum booking duration in hours (per session)',
  })
  maxBookingHours?: number;

  @ApiProperty({
    example: '2025-10-15T08:30:00Z',
    description: 'When space was created',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-10-20T14:20:00Z',
    description: 'When space was last updated',
  })
  updatedAt: string;
}

export class SearchSpacesResponseDto {
  @ApiProperty({
    description: 'List of available spaces',
    type: [SpaceDto],
  })
  spaces: SpaceDto[];

  @ApiProperty({
    example: 156,
    description: 'Total number of spaces matching search criteria',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Results per page',
  })
  limit: number;

  @ApiProperty({
    example: 8,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({
    example: true,
    description: 'Whether there is a next page',
  })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPrevPage: boolean;
}
