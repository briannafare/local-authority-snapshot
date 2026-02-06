import axios from "axios";
import * as cheerio from "cheerio";
import { searchCompetitors as searchCompetitorsPlaces, searchBusinessExtended } from "./googlePlacesAPI";

export interface CompetitorData {
  name: string;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  snippet: string | null;
}

export interface CompetitiveAnalysisResult {
  searchQuery: string;
  competitors: CompetitorData[];
  yourPosition: number | null;
  totalResults: number;
  error: string | null;
}

// 10-Signal Competitor Analysis Types
export interface CompetitorSignals {
  name: string;
  placeId?: string;
  reviewCount: number;
  reviewRating: number;
  reviewVelocity: number; // estimated reviews per month
  photoCount: number;
  gbpCompleteness: number;
  websiteSpeed: number | null; // ms response time, null if unavailable
  yearsInBusiness: number | null;
  responseRate: number; // estimated based on review responses
  postFrequency: number; // estimated posts per month
  categoryMatchStrength: number; // 0-100 how well categories match the search
}

export interface DeepCompetitorAnalysis {
  business: CompetitorSignals;
  competitors: CompetitorSignals[];
  radarChartData: {
    metric: string;
    business: number;
    avgCompetitor: number;
    topCompetitor: number;
    fullMark: number;
  }[];
  gaps: {
    metric: string;
    gap: number;
    recommendation: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
  overallScore: number;
  competitivePosition: 'leader' | 'competitive' | 'lagging' | 'critical';
  summary: string;
}

/**
 * Search for competitors using Google Places API (primary) with web scraping fallback
 */
export async function searchCompetitors(
  service: string,
  location: string,
  yourBusinessName: string
): Promise<CompetitiveAnalysisResult> {
  const result: CompetitiveAnalysisResult = {
    searchQuery: `${service} in ${location}`,
    competitors: [],
    yourPosition: null,
    totalResults: 0,
    error: null,
  };

  try {
    // PRIMARY: Use Google Places API for reliable competitor data
    console.log('[Competitive Analysis] Using Google Places API for competitor search');
    const placesCompetitors = await searchCompetitorsPlaces(service, location, 10);
    
    if (placesCompetitors && placesCompetitors.length > 0) {
      let position = 1;
      for (const comp of placesCompetitors) {
        // Check if this is the user's business
        if (comp.name && comp.name.toLowerCase().includes(yourBusinessName.toLowerCase())) {
          result.yourPosition = position;
        } else {
          result.competitors.push({
            name: comp.name || 'Unknown',
            website: null, // Not available from Places text search
            rating: comp.rating || null,
            reviewCount: comp.reviewCount || null,
            snippet: comp.address || null,
          });
        }
        position++;
      }
      
      result.totalResults = result.competitors.length;
      console.log('[Competitive Analysis] Found ' + result.competitors.length + ' competitors via Google Places API');
      return result;
    }
    
    // FALLBACK: Web scraping if Places API returns no results
    console.log('[Competitive Analysis] Places API returned no results, falling back to web scraping');
    const searchQuery = encodeURIComponent(service + ' in ' + location);
    const searchUrl = 'https://www.google.com/search?q=' + searchQuery;

    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract local pack results (Map results)
    let position = 1;
    $('[data-attrid="kc:/local:one line"]').each((_, el) => {
      const name = $(el).find('[data-attrid="title"]').text().trim();
      const rating = parseFloat($(el).find('[data-attrid="kc:/local:star rating"]').text()) || null;
      const reviewText = $(el).find('[data-attrid="kc:/local:star rating"]').text();
      const reviewMatch = reviewText.match(/(\d+(?:,\d+)*)/);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, "")) : null;

      if (name) {
        if (name.toLowerCase().includes(yourBusinessName.toLowerCase())) {
          result.yourPosition = position;
        }

        result.competitors.push({
          name,
          website: null,
          rating,
          reviewCount,
          snippet: null,
        });

        position++;
      }
    });

    // Extract organic results
    $(".g").each((_, el) => {
      const name = $(el).find("h3").first().text().trim();
      const link = $(el).find("a").first().attr("href");
      const snippet = $(el).find(".VwiC3b").text().trim();

      if (name && link) {
        // Check if this is the user's business
        if (
          name.toLowerCase().includes(yourBusinessName.toLowerCase()) &&
          result.yourPosition === null
        ) {
          result.yourPosition = position;
        }

        result.competitors.push({
          name,
          website: link.startsWith("http") ? link : null,
          rating: null,
          reviewCount: null,
          snippet: snippet || null,
        });

        position++;

        // Limit to top 10 competitors
        if (result.competitors.length >= 10) {
          return false; // Break the loop
        }
      }
    });

    result.totalResults = result.competitors.length;

    return result;
  } catch (error: any) {
    result.error = error.message || "Failed to search competitors";
    return result;
  }
}

/**
 * Analyze competitive landscape and generate insights
 */
export function analyzeCompetitiveData(
  data: CompetitiveAnalysisResult,
  yourRating: number | null,
  yourReviewCount: number | null
): {
  insights: string[];
  gaps: string[];
  advantages: string[];
} {
  const insights: string[] = [];
  const gaps: string[] = [];
  const advantages: string[] = [];

  if (data.error || data.competitors.length === 0) {
    insights.push("Unable to analyze competitive landscape due to data unavailability");
    gaps.push("Limited competitive intelligence available");
    return { insights, gaps, advantages };
  }

  // Position analysis
  if (data.yourPosition !== null) {
    if (data.yourPosition <= 3) {
      advantages.push(`You rank #${data.yourPosition} in local search - strong visibility`);
    } else if (data.yourPosition <= 10) {
      insights.push(`You rank #${data.yourPosition} in local search - room for improvement`);
      gaps.push("Not in top 3 local pack positions");
    } else {
      insights.push(`You rank #${data.yourPosition} or lower - significant visibility gap`);
      gaps.push("Not appearing in top 10 local search results");
    }
  } else {
    insights.push("Your business was not found in top search results");
    gaps.push("Critical: Not ranking for primary service + location keywords");
  }

  // Review analysis
  const competitorRatings = data.competitors
    .filter((c) => c.rating !== null)
    .map((c) => c.rating as number);

  const competitorReviewCounts = data.competitors
    .filter((c) => c.reviewCount !== null)
    .map((c) => c.reviewCount as number);

  if (competitorRatings.length > 0) {
    const avgCompetitorRating =
      competitorRatings.reduce((a, b) => a + b, 0) / competitorRatings.length;
    const maxCompetitorRating = Math.max(...competitorRatings);

    if (yourRating !== null) {
      if (yourRating >= maxCompetitorRating) {
        advantages.push(`Your rating (${yourRating}) matches or exceeds top competitors`);
      } else if (yourRating >= avgCompetitorRating) {
        insights.push(
          `Your rating (${yourRating}) is above average but below top competitor (${maxCompetitorRating})`
        );
        gaps.push("Rating gap vs. highest-rated competitor");
      } else {
        insights.push(
          `Your rating (${yourRating}) is below competitor average (${avgCompetitorRating.toFixed(1)})`
        );
        gaps.push("Below-average rating compared to local competitors");
      }
    } else {
      gaps.push("No rating data available while competitors have strong ratings");
    }
  }

  if (competitorReviewCounts.length > 0) {
    const avgCompetitorReviews =
      competitorReviewCounts.reduce((a, b) => a + b, 0) / competitorReviewCounts.length;
    const maxCompetitorReviews = Math.max(...competitorReviewCounts);

    if (yourReviewCount !== null) {
      if (yourReviewCount >= maxCompetitorReviews) {
        advantages.push(`Your review count (${yourReviewCount}) leads the market`);
      } else if (yourReviewCount >= avgCompetitorReviews) {
        insights.push(
          `Your review count (${yourReviewCount}) is above average but below leader (${maxCompetitorReviews})`
        );
        gaps.push("Review volume gap vs. market leader");
      } else {
        insights.push(
          `Your review count (${yourReviewCount}) is below competitor average (${Math.round(avgCompetitorReviews)})`
        );
        gaps.push("Insufficient review volume compared to competitors");
      }
    } else {
      gaps.push(
        `Competitors average ${Math.round(avgCompetitorReviews)} reviews while you have none`
      );
    }
  }

  // Competitor strength analysis
  const strongCompetitors = data.competitors.filter(
    (c) => c.rating && c.rating >= 4.5 && c.reviewCount && c.reviewCount >= 50
  );

  if (strongCompetitors.length > 0) {
    insights.push(
      `${strongCompetitors.length} strong competitors with 4.5+ rating and 50+ reviews`
    );
    gaps.push("Competing against established, well-reviewed businesses");
  }

  // Top 3 analysis
  const top3 = data.competitors.slice(0, 3);
  const top3Names = top3.map((c) => c.name).join(", ");
  insights.push(`Top 3 competitors: ${top3Names}`);

  return { insights, gaps, advantages };
}

/**
 * Generate competitive recommendations
 */
export function generateCompetitiveRecommendations(
  insights: string[],
  gaps: string[],
  advantages: string[]
): string[] {
  const recommendations: string[] = [];

  // Based on gaps
  if (gaps.some((g) => g.includes("Not ranking") || g.includes("Not appearing"))) {
    recommendations.push(
      "Optimize Google Business Profile with complete information, photos, and posts"
    );
    recommendations.push("Build local citations on Yelp, Facebook, and industry directories");
    recommendations.push("Create location-specific content on your website");
  }

  if (gaps.some((g) => g.includes("rating") || g.includes("Rating"))) {
    recommendations.push("Implement automated review request system after every job");
    recommendations.push("Address negative reviews professionally within 24 hours");
    recommendations.push("Showcase 5-star reviews on your website and social media");
  }

  if (gaps.some((g) => g.includes("review") && g.includes("volume"))) {
    recommendations.push("Send review requests via SMS and email immediately after service");
    recommendations.push("Offer incentive (discount on next service) for leaving a review");
    recommendations.push("Train team to verbally ask for reviews at end of every job");
  }

  if (gaps.some((g) => g.includes("top 3") || g.includes("local pack"))) {
    recommendations.push("Increase Google Post frequency to 2-3x per week");
    recommendations.push("Add more photos monthly (before/after, team, equipment)");
    recommendations.push("Respond to all reviews (positive and negative) within 48 hours");
    recommendations.push("Ensure NAP consistency across all online directories");
  }

  // If no specific gaps, provide general recommendations
  if (recommendations.length === 0) {
    recommendations.push("Maintain review velocity to stay ahead of competitors");
    recommendations.push("Continue optimizing for local search keywords");
    recommendations.push("Monitor competitor activity and adjust strategy accordingly");
  }

  return recommendations;
}

/**
 * Deep 10-Signal Competitor Analysis
 * Analyzes business against top 5 competitors on 10 key signals
 */
export async function analyzeCompetitorsDeeply(
  businessName: string,
  category: string,
  location: string
): Promise<DeepCompetitorAnalysis> {
  console.log(`[Deep Competitor Analysis] Starting analysis for ${businessName} in ${category}, ${location}`);

  // Get business data
  const businessData = await searchBusinessExtended(businessName, location);

  // Get top competitors from Google Places
  const competitorResults = await searchCompetitorsPlaces(category, location, 6);

  // Filter out the business itself from competitors
  const competitorPlaces = competitorResults.filter(
    c => !c.name?.toLowerCase().includes(businessName.toLowerCase())
  ).slice(0, 5);

  // Build business signals
  const businessSignals = buildSignalsFromGBP(businessData, businessName);

  // Build competitor signals (simplified - in production would fetch each competitor's full data)
  const competitorSignals: CompetitorSignals[] = competitorPlaces.map(comp => ({
    name: comp.name || 'Unknown',
    placeId: comp.placeId,
    reviewCount: comp.reviewCount || 0,
    reviewRating: comp.rating || 0,
    reviewVelocity: estimateReviewVelocity(comp.reviewCount || 0),
    photoCount: 5, // Default estimate
    gbpCompleteness: comp.rating && comp.reviewCount ? 70 : 50, // Estimate
    websiteSpeed: null,
    yearsInBusiness: null,
    responseRate: 50, // Default estimate
    postFrequency: 2, // Default estimate
    categoryMatchStrength: 80, // High match since they appeared in search
  }));

  // Calculate averages and top values
  const avgCompetitor = calculateAverageSignals(competitorSignals);
  const topCompetitor = calculateTopSignals(competitorSignals);

  // Build radar chart data
  const radarChartData = buildRadarChartData(businessSignals, avgCompetitor, topCompetitor);

  // Identify gaps and recommendations
  const gaps = identifyGaps(businessSignals, avgCompetitor, topCompetitor);

  // Calculate overall score and position
  const { overallScore, competitivePosition } = calculateCompetitivePosition(businessSignals, avgCompetitor, topCompetitor);

  // Generate summary
  const summary = generateCompetitiveSummary(businessName, competitivePosition, gaps);

  return {
    business: businessSignals,
    competitors: competitorSignals,
    radarChartData,
    gaps,
    overallScore,
    competitivePosition,
    summary,
  };
}

/**
 * Build signals from GBP extended data
 */
function buildSignalsFromGBP(data: any, businessName: string): CompetitorSignals {
  return {
    name: data.name || businessName,
    placeId: data.placeId,
    reviewCount: data.totalReviews || 0,
    reviewRating: data.rating || 0,
    reviewVelocity: estimateReviewVelocity(data.totalReviews || 0),
    photoCount: data.photoCount || 0,
    gbpCompleteness: data.completenessScore || 50,
    websiteSpeed: null, // Would need separate website speed test
    yearsInBusiness: null, // Not available from Places API
    responseRate: estimateResponseRate(data.recentReviews),
    postFrequency: 0, // Not available from Places API
    categoryMatchStrength: 100, // It's the target business
  };
}

/**
 * Estimate review velocity based on total reviews
 * Assumes average business age of 3 years
 */
function estimateReviewVelocity(totalReviews: number): number {
  const estimatedMonths = 36; // 3 years
  return Math.round((totalReviews / estimatedMonths) * 10) / 10;
}

/**
 * Estimate response rate from recent reviews
 */
function estimateResponseRate(reviews?: any[]): number {
  if (!reviews || reviews.length === 0) return 0;
  // In a real implementation, we'd check for owner responses
  // For now, estimate based on rating
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  return avgRating >= 4.5 ? 80 : avgRating >= 4.0 ? 60 : avgRating >= 3.5 ? 40 : 20;
}

/**
 * Calculate average signals across competitors
 */
function calculateAverageSignals(competitors: CompetitorSignals[]): CompetitorSignals {
  if (competitors.length === 0) {
    return createEmptySignals('Average Competitor');
  }

  return {
    name: 'Average Competitor',
    reviewCount: Math.round(avg(competitors.map(c => c.reviewCount))),
    reviewRating: Math.round(avg(competitors.map(c => c.reviewRating)) * 10) / 10,
    reviewVelocity: Math.round(avg(competitors.map(c => c.reviewVelocity)) * 10) / 10,
    photoCount: Math.round(avg(competitors.map(c => c.photoCount))),
    gbpCompleteness: Math.round(avg(competitors.map(c => c.gbpCompleteness))),
    websiteSpeed: null,
    yearsInBusiness: null,
    responseRate: Math.round(avg(competitors.map(c => c.responseRate))),
    postFrequency: Math.round(avg(competitors.map(c => c.postFrequency)) * 10) / 10,
    categoryMatchStrength: Math.round(avg(competitors.map(c => c.categoryMatchStrength))),
  };
}

/**
 * Calculate top (best) signals across competitors
 */
function calculateTopSignals(competitors: CompetitorSignals[]): CompetitorSignals {
  if (competitors.length === 0) {
    return createEmptySignals('Top Competitor');
  }

  return {
    name: 'Top Competitor',
    reviewCount: Math.max(...competitors.map(c => c.reviewCount)),
    reviewRating: Math.max(...competitors.map(c => c.reviewRating)),
    reviewVelocity: Math.max(...competitors.map(c => c.reviewVelocity)),
    photoCount: Math.max(...competitors.map(c => c.photoCount)),
    gbpCompleteness: Math.max(...competitors.map(c => c.gbpCompleteness)),
    websiteSpeed: null,
    yearsInBusiness: null,
    responseRate: Math.max(...competitors.map(c => c.responseRate)),
    postFrequency: Math.max(...competitors.map(c => c.postFrequency)),
    categoryMatchStrength: Math.max(...competitors.map(c => c.categoryMatchStrength)),
  };
}

function createEmptySignals(name: string): CompetitorSignals {
  return {
    name,
    reviewCount: 0,
    reviewRating: 0,
    reviewVelocity: 0,
    photoCount: 0,
    gbpCompleteness: 0,
    websiteSpeed: null,
    yearsInBusiness: null,
    responseRate: 0,
    postFrequency: 0,
    categoryMatchStrength: 0,
  };
}

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Build radar chart data for visualization
 */
function buildRadarChartData(
  business: CompetitorSignals,
  avgComp: CompetitorSignals,
  topComp: CompetitorSignals
): DeepCompetitorAnalysis['radarChartData'] {
  const metrics = [
    { key: 'reviewCount', label: 'Review Count', max: 200 },
    { key: 'reviewRating', label: 'Rating', max: 5 },
    { key: 'reviewVelocity', label: 'Review Velocity', max: 10 },
    { key: 'photoCount', label: 'Photo Count', max: 30 },
    { key: 'gbpCompleteness', label: 'GBP Completeness', max: 100 },
    { key: 'responseRate', label: 'Response Rate', max: 100 },
    { key: 'postFrequency', label: 'Post Frequency', max: 10 },
  ];

  return metrics.map(m => {
    const key = m.key as keyof CompetitorSignals;
    const bizValue = (business[key] as number) || 0;
    const avgValue = (avgComp[key] as number) || 0;
    const topValue = (topComp[key] as number) || 0;

    // Normalize to 0-100 scale for consistent radar chart
    const normalize = (val: number) => Math.min(100, (val / m.max) * 100);

    return {
      metric: m.label,
      business: Math.round(normalize(bizValue)),
      avgCompetitor: Math.round(normalize(avgValue)),
      topCompetitor: Math.round(normalize(topValue)),
      fullMark: 100,
    };
  });
}

/**
 * Identify gaps and generate recommendations
 */
function identifyGaps(
  business: CompetitorSignals,
  avgComp: CompetitorSignals,
  topComp: CompetitorSignals
): DeepCompetitorAnalysis['gaps'] {
  const gaps: DeepCompetitorAnalysis['gaps'] = [];

  // Review count gap
  if (business.reviewCount < avgComp.reviewCount) {
    const gap = avgComp.reviewCount - business.reviewCount;
    gaps.push({
      metric: 'Review Count',
      gap: Math.round((gap / avgComp.reviewCount) * 100),
      recommendation: `You need ${gap} more reviews to match competitors. Implement automated review requests after every service.`,
      priority: gap > 50 ? 'critical' : gap > 20 ? 'high' : 'medium',
    });
  }

  // Rating gap
  if (business.reviewRating < avgComp.reviewRating && business.reviewRating > 0) {
    const gap = avgComp.reviewRating - business.reviewRating;
    gaps.push({
      metric: 'Review Rating',
      gap: Math.round(gap * 20), // Convert to percentage (0.5 = 10%)
      recommendation: `Your rating is ${gap.toFixed(1)} stars below average. Focus on service quality and responding to negative reviews promptly.`,
      priority: gap > 0.5 ? 'critical' : gap > 0.3 ? 'high' : 'medium',
    });
  }

  // Photo count gap
  if (business.photoCount < avgComp.photoCount) {
    const gap = avgComp.photoCount - business.photoCount;
    gaps.push({
      metric: 'Photo Count',
      gap: Math.round((gap / Math.max(1, avgComp.photoCount)) * 100),
      recommendation: `Add ${gap} more photos. Include exterior, interior, team, and before/after shots.`,
      priority: gap > 10 ? 'high' : 'medium',
    });
  }

  // GBP Completeness gap
  if (business.gbpCompleteness < 80) {
    gaps.push({
      metric: 'GBP Completeness',
      gap: 80 - business.gbpCompleteness,
      recommendation: 'Complete all GBP sections: business description, services, attributes, and Q&A.',
      priority: business.gbpCompleteness < 60 ? 'critical' : 'high',
    });
  }

  // Review velocity gap
  if (business.reviewVelocity < avgComp.reviewVelocity) {
    gaps.push({
      metric: 'Review Velocity',
      gap: Math.round(((avgComp.reviewVelocity - business.reviewVelocity) / Math.max(0.1, avgComp.reviewVelocity)) * 100),
      recommendation: 'Increase review generation rate with automated follow-up emails and SMS after each job.',
      priority: 'medium',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return gaps;
}

/**
 * Calculate overall competitive position
 */
function calculateCompetitivePosition(
  business: CompetitorSignals,
  avgComp: CompetitorSignals,
  topComp: CompetitorSignals
): { overallScore: number; competitivePosition: DeepCompetitorAnalysis['competitivePosition'] } {
  // Calculate score components
  const reviewScore = Math.min(100, (business.reviewCount / Math.max(1, topComp.reviewCount)) * 100);
  const ratingScore = Math.min(100, (business.reviewRating / 5) * 100);
  const photoScore = Math.min(100, (business.photoCount / Math.max(1, topComp.photoCount)) * 100);
  const completenessScore = business.gbpCompleteness;
  const velocityScore = Math.min(100, (business.reviewVelocity / Math.max(0.1, topComp.reviewVelocity)) * 100);

  // Weighted average
  const overallScore = Math.round(
    reviewScore * 0.25 +
    ratingScore * 0.30 +
    photoScore * 0.10 +
    completenessScore * 0.20 +
    velocityScore * 0.15
  );

  // Determine position
  let competitivePosition: DeepCompetitorAnalysis['competitivePosition'];
  if (overallScore >= 80) {
    competitivePosition = 'leader';
  } else if (overallScore >= 60) {
    competitivePosition = 'competitive';
  } else if (overallScore >= 40) {
    competitivePosition = 'lagging';
  } else {
    competitivePosition = 'critical';
  }

  return { overallScore, competitivePosition };
}

/**
 * Generate competitive summary text
 */
function generateCompetitiveSummary(
  businessName: string,
  position: DeepCompetitorAnalysis['competitivePosition'],
  gaps: DeepCompetitorAnalysis['gaps']
): string {
  const criticalGaps = gaps.filter(g => g.priority === 'critical');
  const highGaps = gaps.filter(g => g.priority === 'high');

  switch (position) {
    case 'leader':
      return `${businessName} is a market leader in local search visibility. Maintain momentum by continuing to generate reviews and keeping your GBP profile updated.`;

    case 'competitive':
      if (criticalGaps.length > 0) {
        return `${businessName} is competitive but has ${criticalGaps.length} critical gap(s) to address: ${criticalGaps.map(g => g.metric).join(', ')}. Fixing these will significantly improve visibility.`;
      }
      return `${businessName} is competitive in the local market. Focus on ${highGaps.length > 0 ? highGaps[0].metric : 'consistent review generation'} to move into a leadership position.`;

    case 'lagging':
      return `${businessName} is falling behind competitors in ${criticalGaps.length + highGaps.length} key areas. Priority action needed on: ${[...criticalGaps, ...highGaps].slice(0, 3).map(g => g.metric).join(', ')}.`;

    case 'critical':
      return `${businessName} has critical visibility gaps that are significantly impacting lead generation. Immediate action required across all competitive signals, starting with ${criticalGaps[0]?.metric || 'GBP optimization'}.`;

    default:
      return `Analysis complete for ${businessName}. Review the gaps identified to improve competitive position.`;
  }
}
