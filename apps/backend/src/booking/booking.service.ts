import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SearchSpacesDto } from './dto/search-spaces.dto';
import { SearchSpacesResponseDto } from './dto/space-response.dto';

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private readonly apiClient: AxiosInstance;
  private tokenCache: TokenCache | null = null;

  // Boom API configuration
  private readonly BOOM_API_BASE_URL: string;
  private readonly BOOM_CLIENT_ID: string;
  private readonly BOOM_CLIENT_SECRET: string;
  private readonly BOOM_OAUTH_URL: string;

  constructor() {
    // Load configuration from environment variables
    this.BOOM_API_BASE_URL =
      process.env.BOOM_API_BASE_URL || 'https://app.boomnow.com/open_api/v1';
    this.BOOM_CLIENT_ID = process.env.BOOM_CLIENT_ID || '';
    this.BOOM_CLIENT_SECRET = process.env.BOOM_CLIENT_SECRET || '';
    this.BOOM_OAUTH_URL =
      process.env.BOOM_OAUTH_URL ||
      `${this.BOOM_API_BASE_URL}/auth/token`;

    if (!this.BOOM_CLIENT_ID || !this.BOOM_CLIENT_SECRET) {
      this.logger.warn(
        'Boom API credentials not configured. Please set BOOM_CLIENT_ID and BOOM_CLIENT_SECRET environment variables.'
      );
    }

    // Initialize axios instance
    this.apiClient = axios.create({
      baseURL: this.BOOM_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include authentication token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear cache and retry once
          this.logger.warn('Access token expired, refreshing...');
          this.tokenCache = null;

          if (!error.config._retry) {
            error.config._retry = true;
            const token = await this.getAccessToken();
            error.config.headers.Authorization = `Bearer ${token}`;
            return this.apiClient.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get OAuth access token using client credentials grant
   * Implements token caching to avoid unnecessary token requests
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.accessToken;
    }

    try {
      this.logger.log('Requesting new OAuth access token...');

      // Request new token using client credentials
      const response = await axios.post<OAuthTokenResponse>(
        this.BOOM_OAUTH_URL,
        {
          client_id: this.BOOM_CLIENT_ID,
          client_secret: this.BOOM_CLIENT_SECRET,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      const { access_token, expires_in } = response.data;

      // Cache token with 5-minute buffer before expiration
      this.tokenCache = {
        accessToken: access_token,
        expiresAt: Date.now() + (expires_in - 300) * 1000,
      };

      this.logger.log('OAuth access token obtained successfully');
      return access_token;
    } catch (error) {
      this.logger.error('Failed to obtain OAuth access token', error);
      throw new HttpException(
        'Authentication with Boom API failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Search for available spaces with location filtering
   */
  async searchSpaces(
    searchDto: SearchSpacesDto
  ): Promise<SearchSpacesResponseDto> {
    try {
      this.logger.log(
        `Searching spaces with location: ${JSON.stringify(searchDto.location)}`
      );

      // Build query parameters
      const params: any = {
        // Location parameters
        city: searchDto.location.city,
        ...(searchDto.location.state && { state: searchDto.location.state }),
        ...(searchDto.location.country && {
          country: searchDto.location.country,
        }),
        ...(searchDto.location.postalCode && {
          postal_code: searchDto.location.postalCode,
        }),
        ...(searchDto.location.latitude && {
          latitude: searchDto.location.latitude,
        }),
        ...(searchDto.location.longitude && {
          longitude: searchDto.location.longitude,
        }),
        ...(searchDto.location.radius && { radius: searchDto.location.radius }),

        // Date/time parameters
        ...(searchDto.startDate && { start_date: searchDto.startDate }),
        ...(searchDto.endDate && { end_date: searchDto.endDate }),

        // Filter parameters
        ...(searchDto.spaceTypes && {
          space_types: searchDto.spaceTypes.join(','),
        }),
        ...(searchDto.minCapacity && { min_capacity: searchDto.minCapacity }),
        ...(searchDto.maxCapacity && { max_capacity: searchDto.maxCapacity }),
        ...(searchDto.minPrice && { min_price: searchDto.minPrice }),
        ...(searchDto.maxPrice && { max_price: searchDto.maxPrice }),
        ...(searchDto.amenities && {
          amenities: searchDto.amenities.join(','),
        }),
        ...(searchDto.instantBook !== undefined && {
          instant_book: searchDto.instantBook,
        }),

        // Sorting and pagination
        ...(searchDto.sortBy && { sort_by: searchDto.sortBy }),
        ...(searchDto.sortOrder && { sort_order: searchDto.sortOrder }),
        page: searchDto.page || 1,
        limit: searchDto.limit || 20,
      };

      // Make API request
      const response = await this.apiClient.get<any>(
        '/listings',
        { params }
      );

      // Transform Boom API response to our expected format
      const boomData = response.data;
      const listings = boomData.listings || [];
      const pagiInfo = boomData.pagi_info || {};

      const total = pagiInfo.count !== undefined ? pagiInfo.count : listings.length;
      const page = pagiInfo.page || 1;
      const perPage = pagiInfo.per_page || 20;
      const totalPages = Math.ceil(total / perPage);

      const transformedResponse: SearchSpacesResponseDto = {
        spaces: listings.map((listing: any) => this.transformListing(listing)),
        total,
        page,
        limit: perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

      this.logger.log(
        `Found ${transformedResponse.total} spaces matching search criteria`
      );
      return transformedResponse;
    } catch (error) {
      this.logger.error('Error searching spaces', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          error.response?.data?.message ||
          'Failed to search spaces from Boom API';
        throw new HttpException(message, status);
      }

      throw new HttpException(
        'Unexpected error while searching spaces',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get a specific space by ID
   */
  async getSpaceById(spaceId: string) {
    try {
      this.logger.log(`Fetching space details for ID: ${spaceId}`);

      const response = await this.apiClient.get(`/listings/${spaceId}`);
      const listing = response.data.listing || response.data;
      return this.transformListing(listing);
    } catch (error) {
      this.logger.error(`Error fetching space ${spaceId}`, error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          error.response?.data?.message || 'Failed to fetch space details';
        throw new HttpException(message, status);
      }

      throw new HttpException(
        'Unexpected error while fetching space details',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Transform Boom API listing to our SpaceDto format
   */
  private transformListing(listing: any): any {
    return {
      id: String(listing.id || listing.listing_id || ''),
      name: listing.title || listing.name || 'Untitled Space',
      description: listing.description || '',
      type: this.mapSpaceType(listing.type),
      location: {
        city: listing.city || '',
        state: listing.state || '',
        country: listing.country || 'US',
        postalCode: listing.postal_code || listing.zip || '',
        address: listing.address || '',
        latitude: listing.latitude || 0,
        longitude: listing.longitude || 0,
      },
      capacity: listing.capacity || listing.max_guests || 1,
      areaSquareFeet: listing.area_sq_ft || listing.size || 0,
      pricing: {
        hourly: listing.price_per_hour || listing.hourly_rate || 0,
        daily: listing.price_per_day || listing.daily_rate,
        weekly: listing.price_per_week || listing.weekly_rate,
        monthly: listing.price_per_month || listing.monthly_rate,
        currency: listing.currency || 'USD',
      },
      amenities: this.transformAmenities(listing.amenities),
      images: this.transformImages(listing.pictures || listing.images),
      provider: {
        id: String(listing.provider_id || listing.host_id || ''),
        name: listing.provider_name || listing.host_name || 'Unknown Provider',
        verified: listing.verified || false,
      },
      rating: listing.rating || listing.average_rating || 0,
      reviewCount: listing.review_count || listing.reviews_count || 0,
      instantBookable: listing.instant_book || listing.instant_bookable || false,
      minBookingHours: listing.min_booking_hours,
      maxBookingHours: listing.max_booking_hours,
      createdAt: listing.created_at || new Date().toISOString(),
      updatedAt: listing.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Map Boom API space type to our SpaceType enum
   */
  private mapSpaceType(type: string): string {
    const typeMap: Record<string, string> = {
      desk: 'desk',
      meeting_room: 'meeting_room',
      office: 'office',
      coworking: 'coworking',
      event_space: 'event_space',
    };
    return typeMap[type?.toLowerCase()] || 'coworking';
  }

  /**
   * Transform amenities array
   */
  private transformAmenities(amenities: any[]): any[] {
    if (!amenities || !Array.isArray(amenities)) return [];
    return amenities.map((amenity, index) => ({
      id: amenity.id || String(index),
      name: typeof amenity === 'string' ? amenity : amenity.name || 'Unknown',
      description: amenity.description,
      included: amenity.included !== false,
      additionalCost: amenity.cost || amenity.additional_cost,
    }));
  }

  /**
   * Transform images/pictures array
   */
  private transformImages(images: any[]): any[] {
    if (!images || !Array.isArray(images)) return [];
    return images.map((image, index) => ({
      url: image.original || image.url || image,
      caption: image.caption || image.description,
      isPrimary: index === 0 || image.is_primary || image.sort === 1,
      order: image.sort || image.order || index + 1,
    }));
  }

  /**
   * Get available locations from Boom API listings
   */
  async getAvailableLocations(): Promise<any[]> {
    try {
      this.logger.log('Fetching available locations from Boom API');

      const response = await this.apiClient.get<any>('/listings');
      const listings = response.data.listings || [];

      // Extract unique cities from listings
      const cityMap = new Map<string, any>();

      listings.forEach((listing: any) => {
        const cityName = listing.city_name || listing.city;
        if (cityName && !cityMap.has(cityName)) {
          cityMap.set(cityName, {
            city: cityName,
            state: listing.state || 'FL', // Most listings are in Florida
            country: listing.country || listing.extra_info?.country || 'United States',
            countryCode: 'US',
          });
        }
      });

      const locations = Array.from(cityMap.values())
        .filter((loc) => loc.city) // Remove empty city names
        .sort((a, b) => a.city.localeCompare(b.city));

      this.logger.log(`Found ${locations.length} unique locations`);
      return locations;
    } catch (error) {
      this.logger.error('Error fetching available locations', error);
      throw new HttpException(
        'Failed to fetch available locations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Health check to verify API connectivity and authentication
   */
  async healthCheck(): Promise<{ status: string; authenticated: boolean }> {
    try {
      await this.getAccessToken();
      return {
        status: 'ok',
        authenticated: true,
      };
    } catch (error) {
      return {
        status: 'error',
        authenticated: false,
      };
    }
  }
}
