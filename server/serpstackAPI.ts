import axios from 'axios';

const SERPSTACK_API_KEY = process.env.SERPSTACK_API_KEY;

export interface SearchResult {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet?: string;
}

export interface RankingData {
  query: string;
  yourPosition: number | null;
  yourUrl: string | null;
  topResults: SearchResult[];
  localPackResults: SearchResult[];
}

/**
 * Search Google via SerpStack API and find business ranking
 */
export async function searchRankings(
  query: string,
  targetDomain: string
): Promise<RankingData> {
  try {
    console.log(`[SerpStack] Searching for: "${query}"`);
    
    const response = await axios.get('http://api.serpstack.com/search', {
      params: {
        access_key: SERPSTACK_API_KEY,
        query,
        num: 20, // Get top 20 results
        gl: 'us', // United States
        hl: 'en' // English
      }
    });

    if (!response.data || !response.data.organic_results) {
      console.error('[SerpStack] No organic results returned');
      return {
        query,
        yourPosition: null,
        yourUrl: null,
        topResults: [],
        localPackResults: []
      };
    }

    // Extract organic results
    const organicResults: SearchResult[] = response.data.organic_results.map((result: any, index: number) => ({
      position: result.position || index + 1,
      title: result.title,
      link: result.link,
      domain: result.domain || extractDomain(result.link),
      snippet: result.snippet
    }));

    // Find target business position
    const normalizedTarget = normalizeDomain(targetDomain);
    const targetResult = organicResults.find(r => {
      const normalizedDomain = normalizeDomain(r.domain);
      const normalizedLink = normalizeDomain(r.link);
      return (normalizedDomain && normalizedTarget && normalizedDomain === normalizedTarget) || 
             (normalizedLink && normalizedTarget && normalizedLink.includes(normalizedTarget));
    });

    // Extract local pack results if available
    const localPackResults: SearchResult[] = [];
    if (response.data.local_results && response.data.local_results.places) {
      response.data.local_results.places.forEach((place: any, index: number) => {
        localPackResults.push({
          position: index + 1,
          title: place.title,
          link: place.link || place.website || '',
          domain: place.website ? extractDomain(place.website) : '',
          snippet: place.address
        });
      });
    }

    console.log(`[SerpStack] Found ${organicResults.length} organic results, ${localPackResults.length} local pack results`);
    if (targetResult) {
      console.log(`[SerpStack] Target found at position ${targetResult.position}`);
    } else {
      console.log(`[SerpStack] Target not found in top 20 results`);
    }

    return {
      query,
      yourPosition: targetResult ? targetResult.position : null,
      yourUrl: targetResult ? targetResult.link : null,
      topResults: organicResults.slice(0, 10), // Top 10
      localPackResults
    };

  } catch (error: any) {
    console.error('[SerpStack] Error:', error.response?.data || error.message);
    return {
      query,
      yourPosition: null,
      yourUrl: null,
      topResults: [],
      localPackResults: []
    };
  }
}

/**
 * Track rankings for multiple queries
 */
export async function trackMultipleQueries(
  queries: string[],
  targetDomain: string
): Promise<RankingData[]> {
  const results: RankingData[] = [];
  
  for (const query of queries) {
    const rankingData = await searchRankings(query, targetDomain);
    results.push(rankingData);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Helper functions
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function normalizeDomain(domain: string | undefined): string {
  if (!domain) return '';
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0];
}
