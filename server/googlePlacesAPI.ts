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
