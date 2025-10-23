import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { SearchSpacesDto } from './dto/search-spaces.dto';
import { SearchSpacesResponseDto, SpaceDto } from './dto/space-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('spaces/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for available spaces (Public)',
    description:
      'Search for available booking spaces with location-based filtering and various criteria such as capacity, price range, amenities, and availability dates. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Spaces found successfully',
    type: SearchSpacesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid search parameters',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error or Boom API authentication failed',
  })
  async searchSpaces(
    @Body() searchDto: SearchSpacesDto
  ): Promise<SearchSpacesResponseDto> {
    return this.bookingService.searchSpaces(searchDto);
  }

  @Get('spaces/:id')
  @ApiOperation({
    summary: 'Get space details by ID (Public)',
    description: 'Retrieve detailed information about a specific space. This endpoint is public and does not require authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Space unique identifier',
    example: 'space-abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Space details retrieved successfully',
    type: SpaceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found',
  })
  async getSpace(@Param('id') id: string): Promise<SpaceDto> {
    return this.bookingService.getSpaceById(id);
  }

  @Get('locations')
  @ApiOperation({
    summary: 'Get available locations (Public)',
    description:
      'Retrieve list of available cities/locations from Boom API where spaces are available. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available locations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            example: 'Fort Lauderdale',
          },
          state: {
            type: 'string',
            example: 'FL',
          },
          country: {
            type: 'string',
            example: 'United States',
          },
          countryCode: {
            type: 'string',
            example: 'US',
          },
        },
      },
    },
  })
  async getLocations(): Promise<any[]> {
    return this.bookingService.getAvailableLocations();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check Boom API connectivity (Public)',
    description:
      'Verify connection and authentication with Boom Booking API. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Overall health status',
        },
        authenticated: {
          type: 'boolean',
          example: true,
          description: 'Whether authentication with Boom API is successful',
        },
      },
    },
  })
  async healthCheck(): Promise<{ status: string; authenticated: boolean }> {
    return this.bookingService.healthCheck();
  }
}
