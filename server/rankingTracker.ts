import axios from "axios";
import * as cheerio from "cheerio";

export interface RankingData {
  query: string;
  position: number | null; // null means not in top 100
  url: string | null;
  competitors: Array<{
    position: number;
    businessName: string;
    url: string;
    snippet: string;
  }>;
  localPack: Array<{
    position: number;
    businessName: string;
    rating: number | null;
    reviewCount: number | null;
  }>;
}

export interface RankingResult {
  queries: RankingData[];
  averagePosition: number | null;
  inLocalPack: boolean;
  topCompetitors: string[];
}

/**
 * Search Google and extract ranking positions
 * This is a simplified implementation - for production, use SerpAPI or DataForSEO
 */
async function searchGoogle(query: string, location: string): Promise<any> {
  try {
    // Construct Google search URL with location
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}`;
    
    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`[Ranking Tracker] Failed to search for "${query}":`, error);
    return null;
  }
}

/**
 * Extract ranking data from Google search results HTML
 */
function extractRankings(html: string, targetDomain: string, businessName: string): {
  position: number | null;
  url: string | null;
  competitors: Array<{ position: number; businessName: string; url: string; snippet: string }>;
  localPack: Array<{ position: number; businessName: string; rating: number | null; reviewCount: number | null }>;
} {
  const $ = cheerio.load(html);
  const competitors: Array<{ position: number; businessName: string; url: string; snippet: string }> = [];
  const localPack: Array<{ position: number; businessName: string; rating: number | null; reviewCount: number | null }> = [];
  let position: number | null = null;
  let url: string | null = null;

  // Extract local pack results (Google Maps results)
  $('[jscontroller][data-async-context*="local_pack"]').each((idx, el) => {
    const name = $(el).find('[role="heading"]').first().text().trim();
    const ratingText = $(el).find('[role="img"][aria-label*="stars"]').attr("aria-label") || "";
    const ratingMatch = ratingText.match(/([\d.]+)\s*stars?/i);
    const reviewText = $(el).text();
    const reviewMatch = reviewText.match(/([\d,]+)\s*reviews?/i);

    if (name) {
      localPack.push({
        position: idx + 1,
        businessName: name,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
        reviewCount: reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, "")) : null,
      });

      // Check if this is the target business
      if (name.toLowerCase().includes(businessName.toLowerCase()) && position === null) {
        position = idx + 1;
      }
    }
  });

  // Extract organic search results
  let organicPosition = localPack.length > 0 ? localPack.length + 1 : 1;
  
  $("div.g, div[data-sokoban-container]").each((_, el) => {
    const link = $(el).find("a[href]").first();
    const href = link.attr("href");
    const title = link.find("h3").text().trim();
    const snippet = $(el).find('[data-sncf="1"], .VwiC3b').text().trim();

    if (href && href.startsWith("http") && title) {
      try {
        const resultDomain = new URL(href).hostname.replace("www.", "");
        const targetDomainClean = targetDomain.replace("www.", "");

        competitors.push({
          position: organicPosition,
          businessName: title,
          url: href,
          snippet: snippet || "",
        });

        // Check if this is the target business
        if (resultDomain === targetDomainClean && position === null) {
          position = organicPosition;
          url = href;
        }

        organicPosition++;
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });

  return { position, url, competitors: competitors.slice(0, 10), localPack: localPack.slice(0, 3) };
}

/**
 * Track rankings for a business across multiple queries
 */
export async function trackRankings(
  businessName: string,
  websiteUrl: string,
  location: string,
  niche: string
): Promise<RankingResult> {
  const domain = new URL(websiteUrl).hostname;

  // Generate relevant search queries
  const queries = [
    `${niche} near me`,
    `${niche} in ${location}`,
    `${niche} ${location}`,
    `best ${niche} ${location}`,
    businessName,
  ];

  const rankingData: RankingData[] = [];
  const topCompetitorsSet = new Set<string>();
  let inLocalPack = false;
  let totalPosition = 0;
  let rankedQueries = 0;

  for (const query of queries) {
    console.log(`[Ranking Tracker] Checking rankings for: "${query}"`);
    
    const html = await searchGoogle(query, location);
    
    if (!html) {
      // If search fails, add placeholder data
      rankingData.push({
        query,
        position: null,
        url: null,
        competitors: [],
        localPack: [],
      });
      continue;
    }

    const { position, url, competitors, localPack } = extractRankings(html, domain, businessName);

    rankingData.push({
      query,
      position,
      url,
      competitors,
      localPack,
    });

    // Track if in local pack
    if (localPack.some((p) => p.businessName.toLowerCase().includes(businessName.toLowerCase()))) {
      inLocalPack = true;
    }

    // Collect top competitors
    competitors.slice(0, 5).forEach((c) => {
      if (!c.businessName.toLowerCase().includes(businessName.toLowerCase())) {
        topCompetitorsSet.add(c.businessName);
      }
    });

    // Calculate average position
    if (position !== null) {
      totalPosition += position;
      rankedQueries++;
    }

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const averagePosition = rankedQueries > 0 ? Math.round(totalPosition / rankedQueries) : null;
  const topCompetitors = Array.from(topCompetitorsSet).slice(0, 5);

  return {
    queries: rankingData,
    averagePosition,
    inLocalPack,
    topCompetitors,
  };
}

/**
 * Analyze ranking data and generate insights
 */
export function analyzeRankings(rankingResult: RankingResult, niche: string): {
  score: number;
  issues: string[];
  strengths: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  let score = 50; // Base score

  // Check average position
  if (rankingResult.averagePosition !== null) {
    if (rankingResult.averagePosition <= 3) {
      score += 30;
      strengths.push(`Excellent average ranking: Position ${rankingResult.averagePosition}`);
    } else if (rankingResult.averagePosition <= 10) {
      score += 20;
      strengths.push(`Good average ranking: Position ${rankingResult.averagePosition}`);
    } else if (rankingResult.averagePosition <= 20) {
      score += 10;
      issues.push(`Average ranking needs improvement: Position ${rankingResult.averagePosition}`);
      recommendations.push("Focus on improving on-page SEO and building local citations");
    } else {
      issues.push(`Poor average ranking: Position ${rankingResult.averagePosition}`);
      recommendations.push("Urgent: Implement comprehensive local SEO strategy");
    }
  } else {
    issues.push("Not ranking in top 100 for key search terms");
    recommendations.push("Critical: Your business is not visible in search results. Start with basic SEO fundamentals.");
  }

  // Check local pack presence
  if (rankingResult.inLocalPack) {
    score += 20;
    strengths.push("Appearing in Google Local Pack (Map results)");
  } else {
    issues.push("Not appearing in Google Local Pack");
    recommendations.push("Optimize Google Business Profile to appear in local map results");
  }

  // Check query coverage
  const rankedQueries = rankingResult.queries.filter((q) => q.position !== null).length;
  const totalQueries = rankingResult.queries.length;
  const coverage = (rankedQueries / totalQueries) * 100;

  if (coverage >= 80) {
    strengths.push(`Strong query coverage: Ranking for ${rankedQueries}/${totalQueries} key terms`);
  } else if (coverage >= 50) {
    issues.push(`Moderate query coverage: Only ranking for ${rankedQueries}/${totalQueries} key terms`);
    recommendations.push("Expand content to target more relevant search queries");
  } else {
    issues.push(`Weak query coverage: Only ranking for ${rankedQueries}/${totalQueries} key terms`);
    recommendations.push("Create targeted landing pages for each service and location");
  }

  // Competitor analysis
  if (rankingResult.topCompetitors.length > 0) {
    issues.push(`Top competitors: ${rankingResult.topCompetitors.slice(0, 3).join(", ")}`);
    recommendations.push("Analyze top competitors' content and backlink profiles to identify gaps");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, issues, strengths, recommendations };
}
