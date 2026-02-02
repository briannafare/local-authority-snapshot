import axios from "axios";
import * as cheerio from "cheerio";

export interface GBPData {
  businessName: string | null;
  rating: number | null;
  reviewCount: number | null;
  categories: string[];
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  photoCount: number | null;
  hasQA: boolean;
  recentReviews: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
  error: string | null;
}

/**
 * Search for a business on Google and attempt to extract GBP data
 * Note: This is a simplified approach. For production, consider using Google Places API
 */
export async function searchGBP(
  businessName: string,
  location: string
): Promise<GBPData> {
  const result: GBPData = {
    businessName: null,
    rating: null,
    reviewCount: null,
    categories: [],
    address: null,
    phone: null,
    website: null,
    hours: null,
    photoCount: null,
    hasQA: false,
    recentReviews: [],
    error: null,
  };

  try {
    // For MVP, we'll use a search-based approach
    // In production, integrate with Google Places API for accurate data
    const searchQuery = encodeURIComponent(`${businessName} ${location}`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract business name from knowledge panel
    const knowledgePanelName = $('[data-attrid="title"]').first().text().trim();
    if (knowledgePanelName) {
      result.businessName = knowledgePanelName;
    }

    // Extract rating and review count
    const ratingText = $('[data-attrid="kc:/local:star rating"]').text();
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
    if (ratingMatch) {
      result.rating = parseFloat(ratingMatch[1]);
    }

    const reviewText = $('[data-attrid="kc:/local:star rating"]').text();
    const reviewMatch = reviewText.match(/(\d+(?:,\d+)*)\s*reviews?/i);
    if (reviewMatch) {
      result.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ""));
    }

    // Extract address
    const address = $('[data-attrid="kc:/location/location:address"]').text().trim();
    if (address) {
      result.address = address;
    }

    // Extract phone
    const phone = $('[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]')
      .text()
      .trim();
    if (phone) {
      result.phone = phone;
    }

    // Extract website
    const websiteLink = $('a[data-ved][href*="http"]').first().attr("href");
    if (websiteLink) {
      result.website = websiteLink;
    }

    // Note: Due to Google's dynamic rendering, some data may not be accessible via simple scraping
    // For production, use Google Places API for reliable data

    return result;
  } catch (error: any) {
    result.error = error.message || "Failed to scrape GBP data";
    return result;
  }
}

/**
 * Analyze GBP data and generate insights
 */
export function analyzeGBPData(data: GBPData, businessName: string): {
  score: number;
  issues: string[];
  strengths: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  if (data.error) {
    issues.push("Unable to find Google Business Profile");
    recommendations.push("Claim and verify your Google Business Profile immediately");
    recommendations.push("Ensure business name matches exactly across all platforms");
    return { score: 0, issues, strengths, recommendations };
  }

  // Business name check
  if (data.businessName) {
    if (
      data.businessName.toLowerCase().includes(businessName.toLowerCase()) ||
      businessName.toLowerCase().includes(data.businessName.toLowerCase())
    ) {
      strengths.push("Google Business Profile found and claimed");
      score += 15;
    } else {
      issues.push("Business name mismatch between GBP and website");
      recommendations.push("Ensure consistent business name across all platforms");
    }
  } else {
    issues.push("Google Business Profile not found or not claimed");
    recommendations.push("Claim your Google Business Profile immediately");
    score += 0;
  }

  // Rating analysis
  if (data.rating !== null) {
    if (data.rating >= 4.5) {
      strengths.push(`Excellent rating: ${data.rating} stars`);
      score += 20;
    } else if (data.rating >= 4.0) {
      strengths.push(`Good rating: ${data.rating} stars`);
      score += 15;
      recommendations.push("Focus on getting more 5-star reviews to reach 4.5+");
    } else if (data.rating >= 3.5) {
      issues.push(`Average rating: ${data.rating} stars`);
      score += 10;
      recommendations.push("Implement review generation system to improve rating");
      recommendations.push("Address negative reviews professionally and promptly");
    } else {
      issues.push(`Low rating: ${data.rating} stars - major trust issue`);
      score += 5;
      recommendations.push("Urgent: Address negative reviews and improve service quality");
      recommendations.push("Implement systematic review request process");
    }
  } else {
    issues.push("No rating data found");
    recommendations.push("Encourage customers to leave Google reviews");
    score += 0;
  }

  // Review count analysis
  if (data.reviewCount !== null) {
    if (data.reviewCount >= 100) {
      strengths.push(`Strong review count: ${data.reviewCount} reviews`);
      score += 20;
    } else if (data.reviewCount >= 50) {
      strengths.push(`Good review count: ${data.reviewCount} reviews`);
      score += 15;
      recommendations.push("Continue building review velocity to reach 100+ reviews");
    } else if (data.reviewCount >= 20) {
      issues.push(`Limited reviews: ${data.reviewCount} reviews`);
      score += 10;
      recommendations.push("Implement automated review request system");
    } else if (data.reviewCount > 0) {
      issues.push(`Very few reviews: ${data.reviewCount} reviews`);
      score += 5;
      recommendations.push("Urgent: Start systematic review generation campaign");
    } else {
      issues.push("No reviews found");
      score += 0;
      recommendations.push("Critical: Begin asking every customer for a Google review");
    }
  }

  // NAP consistency
  if (data.address) {
    strengths.push("Address listed on GBP");
    score += 10;
  } else {
    issues.push("Address not found on GBP");
    recommendations.push("Add complete address to Google Business Profile");
  }

  if (data.phone) {
    strengths.push("Phone number listed on GBP");
    score += 10;
  } else {
    issues.push("Phone number not found on GBP");
    recommendations.push("Add phone number to Google Business Profile");
  }

  if (data.website) {
    strengths.push("Website link present on GBP");
    score += 10;
  } else {
    issues.push("Website link missing from GBP");
    recommendations.push("Add website URL to Google Business Profile");
  }

  // Categories
  if (data.categories.length > 0) {
    strengths.push(`${data.categories.length} categories selected`);
    score += 5;
  } else {
    issues.push("No categories found");
    recommendations.push("Select primary and secondary categories for your business");
  }

  // Additional recommendations
  if (score < 50) {
    recommendations.push("Complete all sections of your Google Business Profile");
    recommendations.push("Add high-quality photos of your work, team, and facility");
    recommendations.push("Post weekly Google Posts with offers, updates, and tips");
    recommendations.push("Enable Q&A and answer common customer questions");
  }

  return { score: Math.min(100, score), issues, strengths, recommendations };
}
