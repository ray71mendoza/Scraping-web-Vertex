// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Google Places API (New) Service
// ═══════════════════════════════════════════════════════════
// Integrates with Google Places API (New) using Text Search
// with FieldMasks for cost optimization and Redis caching.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import IORedis from 'ioredis';
import type { GooglePlaceResult } from '@vertex/shared';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

/** FieldMask to minimize API charges — only request fields we need */
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.businessStatus',
  'places.types',
  'places.location',
].join(',');

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private redis: IORedis | null = null;
  private apiKey: string;
  private cacheTtl: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY', '');
    this.cacheTtl = this.configService.get<number>(
      'GOOGLE_PLACES_CACHE_TTL_SECONDS',
      2592000, // 30 days
    );

    // Initialize Redis for caching
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redis = new IORedis(redisUrl);
      } catch (err) {
        this.logger.warn('Redis connection failed for Places cache, operating without cache');
      }
    }
  }

  /**
   * Performs a Text Search using Google Places API (New).
   * Returns an array of GooglePlaceResult with only the fields we need.
   */
  async textSearch(
    query: string,
    radiusMeters = 10000,
    maxResults = 20,
  ): Promise<GooglePlaceResult[]> {
    // Check cache first
    const cacheKey = `places:${query}:${radiusMeters}`;
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for "${query}"`);
        return JSON.parse(cached);
      }
    }

    // If no API key, return mock data for development
    if (!this.apiKey || this.apiKey === 'your_google_places_api_key_here') {
      this.logger.warn('No Google Places API key configured, returning mock data');
      return this.getMockData(query);
    }

    try {
      const response = await axios.post(
        PLACES_API_URL,
        {
          textQuery: query,
          maxResultCount: Math.min(maxResults, 20),
          languageCode: 'es',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': FIELD_MASK,
          },
          timeout: 10000,
        },
      );

      const places: GooglePlaceResult[] = (response.data.places || []).map(
        (place: any) => ({
          placeId: place.id,
          displayName: place.displayName?.text || 'Sin nombre',
          formattedAddress: place.formattedAddress || '',
          nationalPhoneNumber: place.nationalPhoneNumber || null,
          internationalPhoneNumber: place.internationalPhoneNumber || null,
          websiteUri: place.websiteUri || null,
          rating: place.rating || null,
          userRatingCount: place.userRatingCount || null,
          googleMapsUri: place.googleMapsUri || null,
          businessStatus: place.businessStatus || null,
          types: place.types || [],
          location: place.location || null,
        }),
      );

      // Cache results
      if (this.redis && places.length > 0) {
        await this.redis.setex(cacheKey, this.cacheTtl, JSON.stringify(places));
      }

      this.logger.log(`Found ${places.length} places for "${query}"`);
      return places;
    } catch (err) {
      this.logger.error(
        `Google Places API error: ${err instanceof Error ? err.message : err}`,
      );
      throw err;
    }
  }

  /**
   * Returns mock data for development when no API key is configured.
   */
  private getMockData(query: string): GooglePlaceResult[] {
    return [
      {
        placeId: 'ChIJmock_001',
        displayName: `${query} - Negocio Demo 1`,
        formattedAddress: 'Cra 15 #85-10, Bogotá, Colombia',
        nationalPhoneNumber: '(601) 300 1234',
        internationalPhoneNumber: '+5713001234',
        websiteUri: null,
        rating: 4.2,
        userRatingCount: 45,
        googleMapsUri: 'https://maps.google.com/?cid=12345',
        businessStatus: 'OPERATIONAL',
        types: ['establishment'],
        location: { latitude: 4.669, longitude: -74.058 },
      },
      {
        placeId: 'ChIJmock_002',
        displayName: `${query} - Negocio Demo 2`,
        formattedAddress: 'Cl 100 #20-30, Bogotá, Colombia',
        nationalPhoneNumber: '(601) 300 5678',
        internationalPhoneNumber: '+5713005678',
        websiteUri: 'https://ejemplo-negocio.wixsite.com/demo',
        rating: 3.8,
        userRatingCount: 12,
        googleMapsUri: 'https://maps.google.com/?cid=12346',
        businessStatus: 'OPERATIONAL',
        types: ['establishment'],
        location: { latitude: 4.684, longitude: -74.051 },
      },
      {
        placeId: 'ChIJmock_003',
        displayName: `${query} - Negocio Premium Demo`,
        formattedAddress: 'Av 68 #45-12, Bogotá, Colombia',
        nationalPhoneNumber: '(601) 300 9012',
        internationalPhoneNumber: '+5713009012',
        websiteUri: 'https://www.negociopremium.com',
        rating: 4.7,
        userRatingCount: 128,
        googleMapsUri: 'https://maps.google.com/?cid=12347',
        businessStatus: 'OPERATIONAL',
        types: ['establishment'],
        location: { latitude: 4.651, longitude: -74.096 },
      },
    ];
  }
}
