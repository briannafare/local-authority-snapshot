import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceDetails {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
  reviews?: Array<{
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: { text: string };
    originalText: { text: string };
    authorAttribution: {
      displayName: string;
      uri: string;
      photoUri: string;
    };
  }>;
  // Extended fields
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  businessStatus?: string;
  editorialSummary?: { text: string };
  priceLevel?: string;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  reservable?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  curbsidePickup?: boolean;
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;
    freeStreetParking?: boolean;
    valetParking?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  currentOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  adrFormatAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  shortFormattedAddress?: string;
}

export interface GBPData {
  found: boolean;
  placeId?: string;
  name?: string;
  address?: string;
  rating?: number;
  totalReviews?: number;
  googleMapsUrl?: string;
  websiteUrl?: string;
  isOpen?: boolean;
  hours?: string[];
  photoCount?: number;
  recentReviews?: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

// Extended GBP data interface for premium analysis
export interface GBPExtendedData extends GBPData {
  // Category information
  primaryCategory?: string;
  secondaryCategories?: string[];
  allTypes?: string[];

  // Business attributes
  businessStatus?: string;
  description?: string;
  priceLevel?: string;

  // Contact & booking
  phone?: string;
  hasAppointmentUrl?: boolean;
  appointmentUrl?: string;

  // Service attributes
  attributes?: string[];
  serviceOptions?: {
    delivery?: boolean;
    dineIn?: boolean;
    takeout?: boolean;
    curbsidePickup?: boolean;
    reservable?: boolean;
  };

  // Accessibility
  accessibilityFeatures?: string[];

  // Payment options
  paymentOptions?: string[];

  // Photo analysis
  photoQuality?: 'low' | 'medium' | 'high';
  hasExteriorPhotos?: boolean;
  hasInteriorPhotos?: boolean;
  hasProductPhotos?: boolean;

  // UTM tracking detection
  hasUtmTracking?: boolean;

  // Calculated scores
  completenessScore?: number;
  engagementScore?: number;
  optimizationScore?: number;

  // Issues and recommendations
  issues?: string[];
  improvements?: string[];
}

/**
 * Search for a business using Google Places API (New)
 */
export async function searchBusiness(businessName: string, location: string): Promise<GBPData> {
  try {
    console.log(`[Google Places API] Searching for: ${businessName} in ${location}`);
    
    // Step 1: Search for the place
    const searchResponse = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: `${businessName} ${location}`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName'
        }
      }
    );

    if (!searchResponse.data.places || searchResponse.data.places.length === 0) {
      console.log(`[Google Places API] No results found for ${businessName}`);
      return { found: false };
    }

    const placeId = searchResponse.data.places[0].id;
    console.log(`[Google Places API] Found place ID: ${placeId}`);

    // Step 2: Get detailed information
    const detailsResponse = await axios.get(
      `https://places.googleapis.com/v1/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,websiteUri,regularOpeningHours,photos,reviews'
        }
      }
    );

    const place: PlaceDetails = detailsResponse.data;
    console.log(`[Google Places API] Retrieved details for ${place.displayName.text}`);

    // Step 3: Transform to our format
    const gbpData: GBPData = {
      found: true,
      placeId: place.id,
      name: place.displayName.text,
      address: place.formattedAddress,
      rating: place.rating,
      totalReviews: place.userRatingCount,
      googleMapsUrl: place.googleMapsUri,
      websiteUrl: place.websiteUri,
      isOpen: place.regularOpeningHours?.openNow,
      hours: place.regularOpeningHours?.weekdayDescriptions,
      photoCount: place.photos?.length || 0,
      recentReviews: place.reviews?.slice(0, 5).map(review => ({
        author: review.authorAttribution.displayName,
        rating: review.rating,
        text: review.text.text || review.originalText.text,
        date: review.relativePublishTimeDescription
      }))
    };

    console.log(`[Google Places API] Success: ${gbpData.name} - ${gbpData.rating}/5 (${gbpData.totalReviews} reviews)`);
    return gbpData;

  } catch (error: any) {
    console.error('[Google Places API] Error:', error.response?.data || error.message);
    return { found: false };
  }
}

/**
 * Extended search with comprehensive data collection for premium analysis
 */
export async function searchBusinessExtended(businessName: string, location: string): Promise<GBPExtendedData> {
  try {
    console.log(`[Google Places API Extended] Searching for: ${businessName} in ${location}`);

    // Step 1: Search for the place
    const searchResponse = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: `${businessName} ${location}`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName'
        }
      }
    );

    if (!searchResponse.data.places || searchResponse.data.places.length === 0) {
      console.log(`[Google Places API Extended] No results found for ${businessName}`);
      return { found: false };
    }

    const placeId = searchResponse.data.places[0].id;
    console.log(`[Google Places API Extended] Found place ID: ${placeId}`);

    // Step 2: Get comprehensive details with all available fields
    const fieldMask = [
      'id', 'displayName', 'formattedAddress', 'shortFormattedAddress',
      'rating', 'userRatingCount', 'googleMapsUri', 'websiteUri',
      'regularOpeningHours', 'currentOpeningHours', 'photos', 'reviews',
      'types', 'primaryType', 'primaryTypeDisplayName', 'businessStatus',
      'editorialSummary', 'priceLevel',
      'nationalPhoneNumber', 'internationalPhoneNumber',
      'delivery', 'dineIn', 'takeout', 'curbsidePickup', 'reservable',
      'paymentOptions', 'parkingOptions', 'accessibilityOptions'
    ].join(',');

    const detailsResponse = await axios.get(
      `https://places.googleapis.com/v1/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': fieldMask
        }
      }
    );

    const place: PlaceDetails = detailsResponse.data;
    console.log(`[Google Places API Extended] Retrieved extended details for ${place.displayName.text}`);

    // Analyze photos for quality and types
    const photoAnalysis = analyzePhotos(place.photos);

    // Check for UTM tracking in website URL
    const hasUtmTracking = place.websiteUri
      ? place.websiteUri.includes('utm_') || place.websiteUri.includes('?ref=')
      : false;

    // Build service options
    const serviceOptions = {
      delivery: place.delivery,
      dineIn: place.dineIn,
      takeout: place.takeout,
      curbsidePickup: place.curbsidePickup,
      reservable: place.reservable,
    };

    // Build attributes list
    const attributes: string[] = [];
    if (place.delivery) attributes.push('Delivery');
    if (place.dineIn) attributes.push('Dine-in');
    if (place.takeout) attributes.push('Takeout');
    if (place.curbsidePickup) attributes.push('Curbside pickup');
    if (place.reservable) attributes.push('Reservations');

    // Build payment options
    const paymentOptions: string[] = [];
    if (place.paymentOptions?.acceptsCreditCards) paymentOptions.push('Credit cards');
    if (place.paymentOptions?.acceptsDebitCards) paymentOptions.push('Debit cards');
    if (place.paymentOptions?.acceptsNfc) paymentOptions.push('NFC payments');
    if (place.paymentOptions?.acceptsCashOnly) paymentOptions.push('Cash only');

    // Build accessibility features
    const accessibilityFeatures: string[] = [];
    if (place.accessibilityOptions?.wheelchairAccessibleEntrance) accessibilityFeatures.push('Wheelchair accessible entrance');
    if (place.accessibilityOptions?.wheelchairAccessibleParking) accessibilityFeatures.push('Wheelchair accessible parking');
    if (place.accessibilityOptions?.wheelchairAccessibleRestroom) accessibilityFeatures.push('Wheelchair accessible restroom');
    if (place.accessibilityOptions?.wheelchairAccessibleSeating) accessibilityFeatures.push('Wheelchair accessible seating');

    // Calculate completeness and optimization scores
    const { completenessScore, issues, improvements } = calculateGBPScores(place, photoAnalysis, attributes);

    // Calculate engagement score based on reviews
    const engagementScore = calculateEngagementScore(place);

    // Build the extended data object
    const extendedData: GBPExtendedData = {
      found: true,
      placeId: place.id,
      name: place.displayName.text,
      address: place.formattedAddress,
      rating: place.rating,
      totalReviews: place.userRatingCount,
      googleMapsUrl: place.googleMapsUri,
      websiteUrl: place.websiteUri,
      isOpen: place.regularOpeningHours?.openNow ?? place.currentOpeningHours?.openNow,
      hours: place.regularOpeningHours?.weekdayDescriptions || place.currentOpeningHours?.weekdayDescriptions,
      photoCount: place.photos?.length || 0,
      recentReviews: place.reviews?.slice(0, 5).map(review => ({
        author: review.authorAttribution.displayName,
        rating: review.rating,
        text: review.text?.text || review.originalText?.text || '',
        date: review.relativePublishTimeDescription
      })),

      // Extended fields
      primaryCategory: place.primaryTypeDisplayName?.text || place.primaryType,
      secondaryCategories: place.types?.filter(t => t !== place.primaryType).slice(0, 5),
      allTypes: place.types,
      businessStatus: place.businessStatus,
      description: place.editorialSummary?.text,
      priceLevel: place.priceLevel,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber,
      hasAppointmentUrl: false, // Would need website crawling to detect
      attributes,
      serviceOptions,
      accessibilityFeatures,
      paymentOptions,
      photoQuality: photoAnalysis.quality,
      hasExteriorPhotos: photoAnalysis.hasExterior,
      hasInteriorPhotos: photoAnalysis.hasInterior,
      hasProductPhotos: photoAnalysis.hasProducts,
      hasUtmTracking,
      completenessScore,
      engagementScore,
      optimizationScore: Math.round((completenessScore + engagementScore) / 2),
      issues,
      improvements,
    };

    console.log(`[Google Places API Extended] Success: ${extendedData.name} - Completeness: ${completenessScore}%, Engagement: ${engagementScore}%`);
    return extendedData;

  } catch (error: any) {
    console.error('[Google Places API Extended] Error:', error.response?.data || error.message);
    return { found: false };
  }
}

/**
 * Analyze photos for quality and type diversity
 */
function analyzePhotos(photos?: PlaceDetails['photos']): {
  quality: 'low' | 'medium' | 'high';
  hasExterior: boolean;
  hasInterior: boolean;
  hasProducts: boolean;
} {
  if (!photos || photos.length === 0) {
    return { quality: 'low', hasExterior: false, hasInterior: false, hasProducts: false };
  }

  // Assess quality based on count and resolution
  const avgWidth = photos.reduce((sum, p) => sum + p.widthPx, 0) / photos.length;
  const quality: 'low' | 'medium' | 'high' =
    photos.length >= 10 && avgWidth >= 1000 ? 'high' :
    photos.length >= 5 && avgWidth >= 600 ? 'medium' : 'low';

  // We can't truly detect photo types from the API, but we can estimate based on count
  // In a real implementation, you might use Vision API to classify photos
  return {
    quality,
    hasExterior: photos.length >= 3,
    hasInterior: photos.length >= 5,
    hasProducts: photos.length >= 8,
  };
}

/**
 * Calculate GBP completeness score and identify issues/improvements
 */
function calculateGBPScores(
  place: PlaceDetails,
  photoAnalysis: ReturnType<typeof analyzePhotos>,
  attributes: string[]
): {
  completenessScore: number;
  issues: string[];
  improvements: string[];
} {
  const issues: string[] = [];
  const improvements: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Business name (5 points)
  if (place.displayName?.text) {
    score += 5;
  } else {
    issues.push('Missing business name');
  }

  // Address (10 points)
  if (place.formattedAddress) {
    score += 10;
  } else {
    issues.push('Missing business address');
  }

  // Phone number (5 points)
  if (place.nationalPhoneNumber || place.internationalPhoneNumber) {
    score += 5;
  } else {
    issues.push('No phone number listed');
    improvements.push('Add a phone number to help customers contact you');
  }

  // Website (10 points)
  if (place.websiteUri) {
    score += 10;
  } else {
    issues.push('No website listed');
    improvements.push('Add your website URL to drive traffic');
  }

  // Business hours (10 points)
  if (place.regularOpeningHours?.weekdayDescriptions?.length) {
    score += 10;
  } else {
    issues.push('Business hours not set');
    improvements.push('Add your business hours to help customers plan visits');
  }

  // Business category (10 points)
  if (place.primaryType) {
    score += 10;
    if (place.types && place.types.length > 1) {
      score += 5; // Bonus for secondary categories
    } else {
      improvements.push('Add secondary business categories to improve visibility');
    }
  } else {
    issues.push('Business category not set');
  }

  // Photos (15 points)
  if (place.photos && place.photos.length > 0) {
    if (place.photos.length >= 10) {
      score += 15;
    } else if (place.photos.length >= 5) {
      score += 10;
      improvements.push(`Add ${10 - place.photos.length} more photos to reach optimal count`);
    } else {
      score += 5;
      issues.push(`Only ${place.photos.length} photos - competitors average 15+`);
      improvements.push('Add more high-quality photos of your business');
    }
  } else {
    issues.push('No photos on your profile');
    improvements.push('Add photos of your business exterior, interior, products/services, and team');
  }

  // Photo quality bonus (5 points)
  if (photoAnalysis.quality === 'high') {
    score += 5;
  } else if (photoAnalysis.quality === 'medium') {
    score += 2;
  }

  // Reviews (15 points based on count and rating)
  if (place.userRatingCount && place.rating) {
    if (place.userRatingCount >= 50 && place.rating >= 4.5) {
      score += 15;
    } else if (place.userRatingCount >= 20 && place.rating >= 4.0) {
      score += 10;
    } else if (place.userRatingCount >= 5) {
      score += 5;
      if (place.rating < 4.0) {
        issues.push(`Rating of ${place.rating} is below competitive threshold of 4.0`);
      }
      improvements.push('Implement a review generation strategy to increase review count');
    } else {
      score += 2;
      issues.push('Very few reviews - impacts trust and visibility');
    }
  } else {
    issues.push('No reviews yet');
    improvements.push('Start collecting reviews from satisfied customers');
  }

  // Business description (5 points)
  if (place.editorialSummary?.text) {
    score += 5;
  } else {
    improvements.push('Write a compelling business description');
  }

  // Attributes (5 points)
  if (attributes.length >= 3) {
    score += 5;
  } else if (attributes.length > 0) {
    score += 2;
    improvements.push('Add more business attributes (services, amenities, etc.)');
  } else {
    improvements.push('Add business attributes to highlight your offerings');
  }

  return {
    completenessScore: Math.min(100, Math.round(score)),
    issues,
    improvements,
  };
}

/**
 * Calculate engagement score based on review activity
 */
function calculateEngagementScore(place: PlaceDetails): number {
  let score = 50; // Base score

  // Review count impact
  if (place.userRatingCount) {
    if (place.userRatingCount >= 100) score += 25;
    else if (place.userRatingCount >= 50) score += 20;
    else if (place.userRatingCount >= 20) score += 15;
    else if (place.userRatingCount >= 10) score += 10;
    else score += 5;
  }

  // Rating impact
  if (place.rating) {
    if (place.rating >= 4.8) score += 20;
    else if (place.rating >= 4.5) score += 15;
    else if (place.rating >= 4.0) score += 10;
    else if (place.rating >= 3.5) score += 5;
    // Below 3.5 gets no bonus
  }

  // Review recency (check if any recent reviews)
  if (place.reviews && place.reviews.length > 0) {
    const hasRecentReview = place.reviews.some(r =>
      r.relativePublishTimeDescription?.includes('week') ||
      r.relativePublishTimeDescription?.includes('day') ||
      r.relativePublishTimeDescription?.includes('month')
    );
    if (hasRecentReview) score += 5;
  }

  return Math.min(100, score);
}

/**
 * Search for competitors in an area
 */
export async function searchCompetitors(
  category: string,
  location: string,
  limit: number = 10
): Promise<Array<{
  placeId: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
}>> {
  try {
    console.log(`[Google Places API] Searching competitors: ${category} in ${location}`);

    const searchResponse = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: `${category} ${location}`,
        maxResultCount: limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress'
        }
      }
    );

    if (!searchResponse.data.places) {
      return [];
    }

    return searchResponse.data.places.map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text,
      rating: place.rating,
      reviewCount: place.userRatingCount,
      address: place.formattedAddress,
    }));

  } catch (error: any) {
    console.error('[Google Places API] Competitor search error:', error.response?.data || error.message);
    return [];
  }
}
