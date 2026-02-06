import { fetchGBPFromUrl, GBPUrlData, analyzeGBPFromUrl } from "./gbpUrlParser";
import { searchBusiness } from "./googlePlacesAPI";

export interface GBPDataResult {
  data: GBPUrlData;
  analysis: {
    score: number;
    issues: string[];
    strengths: string[];
    recommendations: string[];
  };
  dataSource: 'gbp_url' | 'places_api' | 'unavailable';
  dataContext: string;
}

/**
 * Get GBP data with automatic fallback to Google Places API
 */
export async function getGBPDataWithFallback(
  gbpUrl: string | undefined,
  businessName: string,
  location: string
): Promise<GBPDataResult> {
  // Try GBP URL first if provided
  if (gbpUrl) {
    console.log('[GBP Helper] Attempting to fetch from GBP URL');
    const gbpUrlData = await fetchGBPFromUrl(gbpUrl);
    
    // Check if URL parsing succeeded
    if (!gbpUrlData.error && (gbpUrlData.rating || gbpUrlData.reviewCount)) {
      console.log('[GBP Helper] Successfully extracted data from GBP URL');
      const analysis = analyzeGBPFromUrl(gbpUrlData);
      return {
        data: gbpUrlData,
        analysis,
        dataSource: 'gbp_url',
        dataContext: buildDataContext(gbpUrlData, analysis, 'gbp_url'),
      };
    }
    
    console.log('[GBP Helper] GBP URL parsing failed or incomplete, falling back to Google Places API');
  }
  
  // Fallback to Google Places API
  console.log('[GBP Helper] Using Google Places API for GBP data');
  const placesData = await searchBusiness(businessName, location);
  
  if (placesData.found) {
    // Convert Places API data to GBPUrlData format
    const gbpData: GBPUrlData = {
      placeId: placesData.placeId || null,
      businessName: placesData.name || businessName,
      rating: placesData.rating || null,
      reviewCount: placesData.totalReviews || null,
      address: placesData.address || null,
      phone: null,
      website: placesData.websiteUrl || null,
      categories: [],
      hours: placesData.hours ? 'Available' : null,
      photoCount: placesData.photoCount || null,
      error: null,
    };
    
    // Calculate score based on Places API data
    const analysis = calculatePlacesAnalysis(placesData);
    
    console.log('[GBP Helper] Successfully retrieved data from Google Places API');
    return {
      data: gbpData,
      analysis,
      dataSource: 'places_api',
      dataContext: buildDataContext(gbpData, analysis, 'places_api'),
    };
  }
  
  // Neither source worked
  console.log('[GBP Helper] Unable to retrieve GBP data from any source');
  const emptyData: GBPUrlData = {
    placeId: null,
    businessName: businessName,
    rating: null,
    reviewCount: null,
    address: null,
    phone: null,
    website: null,
    categories: [],
    hours: null,
    photoCount: null,
    error: 'Unable to find business in Google Places API',
  };
  
  return {
    data: emptyData,
    analysis: {
      score: 0,
      issues: ['GBP not found or not claimed'],
      strengths: [],
      recommendations: ['Claim and verify your Google Business Profile'],
    },
    dataSource: 'unavailable',
    dataContext: '[WARNING] Unable to retrieve GBP data. The business may not have a claimed Google Business Profile.',
  };
}

/**
 * Calculate analysis from Places API data
 */
function calculatePlacesAnalysis(placesData: any): {
  score: number;
  issues: string[];
  strengths: string[];
  recommendations: string[];
} {
  let score = 0;
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  
  // Rating (20 points)
  if (placesData.rating && placesData.rating >= 4.5) {
    score += 20;
    strengths.push('Excellent rating: ' + placesData.rating + '/5');
  } else if (placesData.rating && placesData.rating >= 4.0) {
    score += 15;
    strengths.push('Good rating: ' + placesData.rating + '/5');
  } else if (placesData.rating) {
    score += 10;
    issues.push('Low rating: ' + placesData.rating + '/5 - needs improvement');
    recommendations.push('Focus on improving service quality and addressing negative reviews');
  } else {
    issues.push('No rating found');
    recommendations.push('Encourage customers to leave Google reviews');
  }
  
  // Reviews (20 points)
  if (placesData.totalReviews && placesData.totalReviews >= 100) {
    score += 20;
    strengths.push('Strong review volume: ' + placesData.totalReviews + ' reviews');
  } else if (placesData.totalReviews && placesData.totalReviews >= 50) {
    score += 15;
    strengths.push('Good review volume: ' + placesData.totalReviews + ' reviews');
  } else if (placesData.totalReviews && placesData.totalReviews >= 10) {
    score += 10;
    issues.push('Low review count: ' + placesData.totalReviews + ' reviews');
    recommendations.push('Implement systematic review request process after every job');
  } else {
    issues.push('Very few or no reviews');
    recommendations.push('Start collecting Google reviews immediately');
  }
  
  // Photos (20 points)
  if (placesData.photoCount && placesData.photoCount >= 50) {
    score += 20;
    strengths.push('Excellent photo count: ' + placesData.photoCount + ' photos');
  } else if (placesData.photoCount && placesData.photoCount >= 20) {
    score += 15;
    strengths.push('Good photo count: ' + placesData.photoCount + ' photos');
  } else if (placesData.photoCount && placesData.photoCount >= 5) {
    score += 10;
    issues.push('Low photo count: ' + placesData.photoCount + ' photos');
    recommendations.push('Add more photos monthly (before/after, team, equipment)');
  } else {
    issues.push('Very few or no photos');
    recommendations.push('Add high-quality photos of your work, team, and facility');
  }
  
  // Address (10 points)
  if (placesData.address) {
    score += 10;
    strengths.push('Address is complete');
  } else {
    issues.push('Address missing from GBP');
    recommendations.push('Add complete address to your Google Business Profile');
  }
  
  // Website (10 points)
  if (placesData.websiteUrl) {
    score += 10;
    strengths.push('Website link is present');
  } else {
    issues.push('Website link missing from GBP');
    recommendations.push('Add website URL to your Google Business Profile');
  }
  
  // Hours (10 points)
  if (placesData.hours && placesData.hours.length > 0) {
    score += 10;
    strengths.push('Business hours are set');
  } else {
    issues.push('Business hours not set');
    recommendations.push('Add business hours to your Google Business Profile');
  }
  
  // Cap at 100
  score = Math.min(score, 100);
  
  return { score, issues, strengths, recommendations };
}

/**
 * Build data context string for LLM prompts
 */
function buildDataContext(
  data: GBPUrlData,
  analysis: { score: number; issues: string[]; strengths: string[] },
  source: 'gbp_url' | 'places_api' | 'unavailable'
): string {
  if (source === 'unavailable') {
    return '[WARNING] Unable to retrieve GBP data. The business may not have a claimed Google Business Profile.';
  }
  
  const sourceLabel = source === 'gbp_url' ? 'YOUR GBP URL' : 'GOOGLE PLACES API';
  
  return '[OK] REAL DATA FROM ' + sourceLabel + ':\n' +
    '- Business Name: ' + (data.businessName || 'Not found') + '\n' +
    '- Rating: ' + (data.rating !== null ? data.rating + ' stars' : 'No rating') + '\n' +
    '- Review Count: ' + (data.reviewCount !== null ? data.reviewCount + ' reviews' : 'No reviews') + '\n' +
    '- Address: ' + (data.address || 'Not found') + '\n' +
    '- Phone: ' + (data.phone || 'Not found') + '\n' +
    '- Website: ' + (data.website || 'Not found') + '\n' +
    '- Photos: ' + (data.photoCount !== null ? data.photoCount + ' photos' : 'Not found') + '\n\n' +
    'ANALYSIS BASED ON REAL DATA:\n' +
    '- Score: ' + analysis.score + '/100\n' +
    '- Issues: ' + analysis.issues.join(', ') + '\n' +
    '- Strengths: ' + analysis.strengths.join(', ');
}
