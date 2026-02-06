import axios from "axios";
import * as cheerio from "cheerio";
import { searchBusiness } from "./googlePlacesAPI";

export interface GBPUrlData {
  placeId: string | null;
  businessName: string | null;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  categories: string[];
  hours: string | null;
  photoCount: number | null;
  error: string | null;
}

/**
 * Extract Place ID from various GBP URL formats
 */
export function extractPlaceId(gbpUrl: string): string | null {
  try {
    // Format 1: https://maps.google.com/?cid=12345678901234567890
    const cidMatch = gbpUrl.match(/[?&]cid=(\d+)/);
    if (cidMatch) {
      return cidMatch[1];
    }

    // Format 2: https://g.page/business-name
    // Format 3: https://maps.app.goo.gl/xxxxx
    // Format 4: https://www.google.com/maps/place/Business+Name/@lat,lng,zoom/data=...
    
    // For these formats, we need to fetch the URL and extract from the page
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch GBP data from the provided URL
 */
export async function fetchGBPFromUrl(gbpUrl: string): Promise<GBPUrlData> {
  const result: GBPUrlData = {
    placeId: null,
    businessName: null,
    rating: null,
    reviewCount: null,
    address: null,
    phone: null,
    website: null,
    categories: [],
    hours: null,
    photoCount: null,
    error: null,
  };

  try {
    // Try to extract CID (Place ID) from URL
    const placeId = extractPlaceId(gbpUrl);
    if (placeId) {
      result.placeId = placeId;
    }

    // Fetch the page
    const response = await axios.get(gbpUrl, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract business name
    const businessName =
      $('h1[class*="fontHeadline"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      null;
    if (businessName) result.businessName = businessName;

    // Extract rating
    const ratingText = $('[role="img"][aria-label*="stars"]').attr("aria-label") || "";
    const ratingMatch = ratingText.match(/([\d.]+)\s*stars?/i);
    if (ratingMatch) {
      result.rating = parseFloat(ratingMatch[1]);
    }

    // Extract review count
    const reviewText = $('[aria-label*="reviews"]').text() || $('button:contains("reviews")').text();
    const reviewMatch = reviewText.match(/([\d,]+)\s*reviews?/i);
    if (reviewMatch) {
      result.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ""));
    }

    // Extract address
    const address =
      $('[data-item-id="address"]').text().trim() ||
      $('button[data-item-id="address"]').attr("aria-label") ||
      $('[data-tooltip="Copy address"]').closest('button').attr("aria-label") ||
      null;
    if (address) result.address = address;

    // Extract phone
    const phone =
      $('[data-item-id*="phone"]').text().trim() ||
      $('button[data-item-id*="phone"]').attr("aria-label") ||
      $('[data-tooltip="Copy phone number"]').closest('button').attr("aria-label") ||
      null;
    if (phone) result.phone = phone;

    // Extract website
    const website =
      $('[data-item-id="authority"]').attr("href") ||
      $('a[data-item-id="authority"]').attr("href") ||
      null;
    if (website) result.website = website;

    // Extract categories
    const categoryButtons = $('button[jsaction*="category"]');
    categoryButtons.each((_, el) => {
      const category = $(el).text().trim();
      if (category && !result.categories.includes(category)) {
        result.categories.push(category);
      }
    });

    // Extract photo count
    const photoButton = $('button:contains("photos")').first().text();
    const photoMatch = photoButton.match(/([\d,]+)\s*photos?/i);
    if (photoMatch) {
      result.photoCount = parseInt(photoMatch[1].replace(/,/g, ""));
    }

    // If we didn't get basic data, mark as error
    if (!result.businessName && !result.rating) {
      result.error = "Unable to extract GBP data from URL. The page may require authentication or the URL format is not supported.";
    }

    return result;
  } catch (error: any) {
    result.error = error.message || "Failed to fetch GBP data from URL";
    return result;
  }
}

/**
 * Analyze GBP data from URL and generate insights
 */
export function analyzeGBPFromUrl(data: GBPUrlData): {
  score: number;
  issues: string[];
  strengths: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  let score = 50; // Base score

  if (data.error) {
    return {
      score: 0,
      issues: [data.error],
      strengths: [],
      recommendations: ["Verify your Google Business Profile URL is correct and publicly accessible"],
    };
  }

  // Business name
  if (data.businessName) {
    score += 5;
    strengths.push("Business name is set");
  } else {
    issues.push("Business name not found");
    recommendations.push("Set your business name in Google Business Profile");
  }

  // Rating analysis
  if (data.rating !== null) {
    if (data.rating >= 4.5) {
      score += 15;
      strengths.push(`Excellent rating: ${data.rating} stars`);
    } else if (data.rating >= 4.0) {
      score += 10;
      strengths.push(`Good rating: ${data.rating} stars`);
    } else if (data.rating >= 3.5) {
      score += 5;
      issues.push(`Below-average rating: ${data.rating} stars`);
      recommendations.push("Focus on improving service quality and addressing negative reviews");
    } else {
      issues.push(`Low rating: ${data.rating} stars - critical issue`);
      recommendations.push("Urgent: Address service quality issues and negative reviews immediately");
    }
  } else {
    issues.push("No rating data found");
    recommendations.push("Encourage customers to leave Google reviews");
  }

  // Review count
  if (data.reviewCount !== null) {
    if (data.reviewCount >= 100) {
      score += 15;
      strengths.push(`Strong review volume: ${data.reviewCount} reviews`);
    } else if (data.reviewCount >= 50) {
      score += 10;
      strengths.push(`Good review volume: ${data.reviewCount} reviews`);
    } else if (data.reviewCount >= 20) {
      score += 5;
      issues.push(`Low review count: ${data.reviewCount} reviews`);
      recommendations.push("Implement systematic review request process after every job");
    } else {
      issues.push(`Very low review count: ${data.reviewCount} reviews`);
      recommendations.push("Urgent: Start requesting reviews from every satisfied customer");
    }
  } else {
    issues.push("No reviews found");
    recommendations.push("Start collecting Google reviews immediately");
  }

  // Address
  if (data.address) {
    score += 5;
    strengths.push("Address is complete");
  } else {
    issues.push("Address missing from GBP");
    recommendations.push("Add complete address to your Google Business Profile");
  }

  // Phone
  if (data.phone) {
    score += 5;
    strengths.push("Phone number is listed");
  } else {
    issues.push("Phone number missing from GBP");
    recommendations.push("Add phone number to your Google Business Profile");
  }

  // Website
  if (data.website) {
    score += 5;
    strengths.push("Website link is present");
  } else {
    issues.push("Website link missing from GBP");
    recommendations.push("Add website URL to your Google Business Profile");
  }

  // Categories
  if (data.categories.length > 0) {
    score += 5;
    strengths.push(`${data.categories.length} categories selected`);
    if (data.categories.length < 2) {
      recommendations.push("Add secondary categories to improve discoverability");
    }
  } else {
    issues.push("No categories found");
    recommendations.push("Select primary and secondary categories for your business");
  }

  // Photos
  if (data.photoCount !== null) {
    if (data.photoCount >= 50) {
      score += 10;
      strengths.push(`Excellent photo count: ${data.photoCount} photos`);
    } else if (data.photoCount >= 20) {
      score += 5;
      strengths.push(`Good photo count: ${data.photoCount} photos`);
    } else {
      issues.push(`Low photo count: ${data.photoCount} photos`);
      recommendations.push("Add more photos monthly (before/after, team, equipment)");
    }
  } else {
    issues.push("Photo count not found");
    recommendations.push("Add high-quality photos of your work, team, and facility");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, issues, strengths, recommendations };
}
