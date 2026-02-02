import axios from "axios";
import * as cheerio from "cheerio";

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

/**
 * Search Google for competitors in the local area
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
    const searchQuery = encodeURIComponent(`${service} in ${location}`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

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
