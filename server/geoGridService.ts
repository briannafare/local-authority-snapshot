import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  competitors: { name: string; rank: number }[];
  distance: string; // from business location
}

export interface GeoGridData {
  businessName: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
  gridSize: 5 | 7;
  radius: number; // miles
  points: GeoGridPoint[][];
  averageRank: number;
  visibility: number; // percentage of grid where rank <= 3
}

/**
 * Generate a grid of geographic points around a center location
 */
function generateGridPoints(
  centerLat: number,
  centerLng: number,
  gridSize: 5 | 7,
  radius: number
): { lat: number; lng: number }[][] {
  const points: { lat: number; lng: number }[][] = [];
  
  // Calculate degrees per mile (approximate)
  const milesPerDegreeLat = 69.0;
  const milesPerDegreeLng = 69.0 * Math.cos(centerLat * Math.PI / 180);
  
  const latStep = radius / milesPerDegreeLat;
  const lngStep = radius / milesPerDegreeLng;
  
  const halfSize = Math.floor(gridSize / 2);
  
  for (let i = 0; i < gridSize; i++) {
    const row: { lat: number; lng: number }[] = [];
    for (let j = 0; j < gridSize; j++) {
      const lat = centerLat + (i - halfSize) * latStep;
      const lng = centerLng + (j - halfSize) * lngStep;
      row.push({ lat, lng });
    }
    points.push(row);
  }
  
  return points;
}

/**
 * Calculate distance between two lat/lng points in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for business ranking at a specific location
 */
async function searchRankAtLocation(
  businessName: string,
  keyword: string,
  lat: number,
  lng: number
): Promise<{
  rank: number | null;
  competitors: { name: string; rank: number }[];
}> {
  try {
    // Search using the keyword + location bias
    const searchResponse = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: keyword,
        locationBias: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: 500 // 500 meters search radius
          }
        },
        maxResultCount: 20 // Get top 20 to find ranking
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount'
        }
      }
    );

    if (!searchResponse.data.places || searchResponse.data.places.length === 0) {
      return { rank: null, competitors: [] };
    }

    const places = searchResponse.data.places;
    
    // Find the target business rank
    const targetBusinessIndex = places.findIndex((place: any) =>
      place.displayName?.text?.toLowerCase().includes(businessName.toLowerCase())
    );

    const rank = targetBusinessIndex >= 0 ? targetBusinessIndex + 1 : null;

    // Get top 3 competitors
    const competitors = places
      .slice(0, 3)
      .map((place: any, index: number) => ({
        name: place.displayName?.text || 'Unknown',
        rank: index + 1
      }));

    return { rank, competitors };

  } catch (error: any) {
    console.error(`[GeoGrid] Error searching at (${lat}, ${lng}):`, error.response?.data || error.message);
    return { rank: null, competitors: [] };
  }
}

/**
 * Generate complete GeoGrid data for a business
 */
export async function generateGeoGridData(
  businessName: string,
  keyword: string,
  centerLat: number,
  centerLng: number,
  gridSize: 5 | 7 = 5,
  radius: number = 2 // miles between grid points
): Promise<GeoGridData> {
  console.log(`[GeoGrid] Generating ${gridSize}x${gridSize} grid for "${businessName}" with keyword "${keyword}"`);
  console.log(`[GeoGrid] Center: (${centerLat}, ${centerLng}), Radius: ${radius} miles`);

  // Generate grid points
  const gridPoints = generateGridPoints(centerLat, centerLng, gridSize, radius);

  // Search each grid point for rankings
  const points: GeoGridPoint[][] = [];
  let totalRank = 0;
  let rankedPoints = 0;
  let topRankPoints = 0; // Count of points where rank <= 3

  for (let i = 0; i < gridPoints.length; i++) {
    const row: GeoGridPoint[] = [];
    
    for (let j = 0; j < gridPoints[i].length; j++) {
      const point = gridPoints[i][j];
      
      // Calculate distance from center
      const distance = calculateDistance(centerLat, centerLng, point.lat, point.lng);
      const distanceStr = distance < 1 
        ? `${Math.round(distance * 5280)} ft`
        : `${distance.toFixed(1)} mi`;

      // Search for ranking at this point
      const { rank, competitors } = await searchRankAtLocation(
        businessName,
        keyword,
        point.lat,
        point.lng
      );

      row.push({
        lat: point.lat,
        lng: point.lng,
        rank,
        competitors,
        distance: distanceStr
      });

      // Update statistics
      if (rank !== null) {
        totalRank += rank;
        rankedPoints++;
        if (rank <= 3) {
          topRankPoints++;
        }
      }

      // Add delay to avoid rate limiting (100ms between requests)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    points.push(row);
  }

  const averageRank = rankedPoints > 0 ? Math.round(totalRank / rankedPoints) : 0;
  const visibility = rankedPoints > 0 ? Math.round((topRankPoints / rankedPoints) * 100) : 0;

  console.log(`[GeoGrid] Complete: Average rank ${averageRank}, Visibility ${visibility}%`);

  return {
    businessName,
    keyword,
    centerLat,
    centerLng,
    gridSize,
    radius,
    points,
    averageRank,
    visibility
  };
}

/**
 * Generate mock GeoGrid data for testing/demo purposes
 */
export function generateMockGeoGridData(
  businessName: string,
  keyword: string,
  centerLat: number,
  centerLng: number,
  gridSize: 5 | 7 = 5
): GeoGridData {
  const radius = 2;
  const gridPoints = generateGridPoints(centerLat, centerLng, gridSize, radius);
  
  const points: GeoGridPoint[][] = [];
  let totalRank = 0;
  let rankedPoints = 0;
  let topRankPoints = 0;

  for (let i = 0; i < gridPoints.length; i++) {
    const row: GeoGridPoint[] = [];
    
    for (let j = 0; j < gridPoints[i].length; j++) {
      const point = gridPoints[i][j];
      const distance = calculateDistance(centerLat, centerLng, point.lat, point.lng);
      const distanceStr = distance < 1 
        ? `${Math.round(distance * 5280)} ft`
        : `${distance.toFixed(1)} mi`;

      // Generate mock rank (better near center)
      const distanceFromCenter = Math.abs(i - Math.floor(gridSize / 2)) + Math.abs(j - Math.floor(gridSize / 2));
      const rank = distanceFromCenter === 0 ? 1 :
                   distanceFromCenter === 1 ? Math.floor(Math.random() * 3) + 1 :
                   distanceFromCenter === 2 ? Math.floor(Math.random() * 8) + 2 :
                   Math.random() > 0.3 ? Math.floor(Math.random() * 15) + 4 : null;

      const competitors = [
        { name: 'Competitor A', rank: 1 },
        { name: 'Competitor B', rank: 2 },
        { name: 'Competitor C', rank: 3 }
      ];

      row.push({
        lat: point.lat,
        lng: point.lng,
        rank,
        competitors,
        distance: distanceStr
      });

      if (rank !== null) {
        totalRank += rank;
        rankedPoints++;
        if (rank <= 3) {
          topRankPoints++;
        }
      }
    }
    
    points.push(row);
  }

  const averageRank = rankedPoints > 0 ? Math.round(totalRank / rankedPoints) : 0;
  const visibility = rankedPoints > 0 ? Math.round((topRankPoints / rankedPoints) * 100) : 0;

  return {
    businessName,
    keyword,
    centerLat,
    centerLng,
    gridSize,
    radius,
    points,
    averageRank,
    visibility
  };
}
