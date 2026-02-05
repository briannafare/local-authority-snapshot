import { invokeLLM } from "./_core/llm";
import { searchGBP, analyzeGBPData } from "./gbpScraper";
import { searchBusiness } from "./googlePlacesAPI";
import { fetchGBPFromUrl, analyzeGBPFromUrl } from "./gbpUrlParser";
import { crawlWebsite, analyzeWebsiteData } from "./websiteCrawler";
import { searchCompetitors, analyzeCompetitiveData, generateCompetitiveRecommendations } from "./competitiveAnalysis";
import { trackRankings, analyzeRankings } from "./rankingTracker";
import { trackMultipleQueries } from "./serpstackAPI";

export interface AuditInput {
  businessName: string;
  websiteUrl: string;
  gbpUrl?: string;
  primaryLocation: string;
  primaryNiche: string;
  nicheDescription?: string;
  leadSources: string[];
  runsPaidAds: string;
  hasLocalListing: string;
  activeOnSocial: string;
  usesAutomation: string;
  hasCallCoverage: string;
  monthlyVisitors?: number;
  monthlyLeads?: number;
  avgRevenuePerClient?: number;
  businessGoals: string[];
  painPoints: string[];
}

export interface GBPAuditResult {
  score: number;
  issues: string[];
  improvements: string[];
  optimizedDescription: string;
  optimizedServices: string[];
  examplePost: string;
}

export interface SEOAuditResult {
  score: number;
  weaknesses: string[];
  improvements: string[];
  optimizedTitleTag: string;
  optimizedHeadings: string[];
  recommendedSchemas: string[];
  queries: Array<{
    query: string;
    organicPresence: string;
    mapPackPresence: string;
    competitorsAbove: string;
    dataType: string;
  }>;
  rankingData?: {
    averagePosition: number | null;
    inLocalPack: boolean;
    topCompetitors: string[];
    queries: Array<{
      query: string;
      position: number | null;
      competitors: Array<{
        position: number;
        businessName: string;
      }>;
    }>;
  };
}

export interface CompetitiveAnalysisResult {
  reasonsCompetitorsRank: string[];
  trustGaps: string[];
  competitorAdvantages: string[];
}

export interface AEOResult {
  score: number;
  whyAIWouldRecommend: string;
  whyAIWouldNot: string;
  fixes: string[];
  exampleFAQ: string;
  optimizedAboutUs: string;
  prompts: Array<{
    prompt: string;
    likelyRecommended: string;
    evidence: string;
    dataType: string;
  }>;
}

export interface LeadCaptureResult {
  channels: Array<{
    channel: string;
    visibility: string;
    responseExpectation: string;
    afterHoursCoverage: string;
    riskLevel: string;
    dataType: string;
  }>;
  aiVoiceOpportunities: string[];
  conversationAIOpportunities: string[];
}

export interface FollowUpResult {
  currentState: string;
  opportunityState: string;
  automationOpportunities: string[];
  reactivationPotential: string;
}

export interface RevenueRecaptureSummary {
  opportunities: Array<{
    area: string;
    keyIssue: string;
    impactLevel: string;
    dataType: string;
    revenueUpside: string;
  }>;
  estimatedMonthlyRecovery?: number;
}

export interface RecommendedPlan {
  planName: string;
  pillars: Array<{
    title: string;
    description: string;
    outcomes: string[];
  }>;
  roadmap: {
    phase1: { title: string; description: string; items: string[] };
    phase2: { title: string; description: string; items: string[] };
    phase3: { title: string; description: string; items: string[] };
  };
  pricingPackages: Array<{
    name: string;
    focus: string;
    includes: string[];
    idealFor: string;
    investmentRange: string;
  }>;
}

/**
 * Analyze Google Business Profile with REAL scraped data
 */
export async function analyzeGBP(input: AuditInput): Promise<GBPAuditResult> {
  // Step 1: Get real GBP data (from URL if provided, otherwise search)
  let gbpAnalysis: any;
  let dataContext: string;

  if (input.gbpUrl) {
    // Use provided GBP URL
    const gbpUrlData = await fetchGBPFromUrl(input.gbpUrl);
    gbpAnalysis = analyzeGBPFromUrl(gbpUrlData);
    
    dataContext = gbpUrlData.error
      ? `⚠️ REAL DATA: Unable to fetch from provided GBP URL. Error: ${gbpUrlData.error}`
      : `✅ REAL DATA FROM YOUR GBP URL:
- Business Name: ${gbpUrlData.businessName || "Not found"}
- Rating: ${gbpUrlData.rating !== null ? `${gbpUrlData.rating} stars` : "No rating"}
- Review Count: ${gbpUrlData.reviewCount !== null ? `${gbpUrlData.reviewCount} reviews` : "No reviews"}
- Address: ${gbpUrlData.address || "Not found"}
- Phone: ${gbpUrlData.phone || "Not found"}
- Website: ${gbpUrlData.website || "Not found"}
- Categories: ${gbpUrlData.categories.length > 0 ? gbpUrlData.categories.join(", ") : "None"}
- Photos: ${gbpUrlData.photoCount !== null ? `${gbpUrlData.photoCount} photos` : "Not found"}

ANALYSIS BASED ON REAL DATA:
- Score: ${gbpAnalysis.score}/100
- Issues: ${gbpAnalysis.issues.join(", ")}
- Strengths: ${gbpAnalysis.strengths.join(", ")}`;
  } else {
    // Use Google Places API for real data
    const placesData = await searchBusiness(input.businessName, input.primaryLocation);
    
    if (!placesData.found) {
      dataContext = `⚠️ REAL DATA: Google Business Profile not found via Google Places API. This business may not have claimed their GBP or doesn't exist in Google's database.`;
      gbpAnalysis = { score: 0, issues: ['GBP not found or not claimed'], strengths: [] };
    } else {
      // Calculate score based on real data
      let score = 0;
      const issues: string[] = [];
      const strengths: string[] = [];
      
      // Rating and reviews (40 points)
      if (placesData.rating && placesData.rating >= 4.5) {
        score += 20;
        strengths.push(`Excellent rating: ${placesData.rating}/5`);
      } else if (placesData.rating && placesData.rating >= 4.0) {
        score += 15;
        strengths.push(`Good rating: ${placesData.rating}/5`);
      } else if (placesData.rating) {
        score += 10;
        issues.push(`Low rating: ${placesData.rating}/5 - needs improvement`);
      } else {
        issues.push('No rating found');
      }
      
      if (placesData.totalReviews && placesData.totalReviews >= 50) {
        score += 20;
        strengths.push(`Strong review count: ${placesData.totalReviews} reviews`);
      } else if (placesData.totalReviews && placesData.totalReviews >= 10) {
        score += 15;
        strengths.push(`${placesData.totalReviews} reviews`);
      } else if (placesData.totalReviews) {
        score += 5;
        issues.push(`Only ${placesData.totalReviews} reviews - need more`);
      } else {
        issues.push('No reviews found');
      }
      
      // Photos (20 points)
      if (placesData.photoCount && placesData.photoCount >= 20) {
        score += 20;
        strengths.push(`${placesData.photoCount} photos uploaded`);
      } else if (placesData.photoCount && placesData.photoCount >= 5) {
        score += 10;
        issues.push(`Only ${placesData.photoCount} photos - add more`);
      } else {
        issues.push('Very few or no photos');
      }
      
      // Basic info (40 points)
      if (placesData.address) {
        score += 10;
        strengths.push('Address verified');
      } else {
        issues.push('Address missing');
      }
      
      if (placesData.websiteUrl) {
        score += 10;
        strengths.push('Website linked');
      } else {
        issues.push('No website URL');
      }
      
      if (placesData.hours && placesData.hours.length > 0) {
        score += 10;
        strengths.push('Business hours set');
      } else {
        issues.push('Business hours not set');
      }
      
      if (placesData.isOpen !== undefined) {
        score += 10;
      }
      
      gbpAnalysis = { score, issues, strengths };
      
      dataContext = `✅ REAL DATA FROM GOOGLE PLACES API:
- Business Name: ${placesData.name}
- Rating: ${placesData.rating}/5
- Review Count: ${placesData.totalReviews} reviews
- Address: ${placesData.address}
- Website: ${placesData.websiteUrl || 'Not linked'}
- Photos: ${placesData.photoCount} photos
- Hours: ${placesData.hours ? 'Set' : 'Not set'}
- Currently Open: ${placesData.isOpen ? 'Yes' : 'No'}
- Google Maps URL: ${placesData.googleMapsUrl}

ANALYSIS BASED ON REAL DATA:
- Score: ${gbpAnalysis.score}/100
- Issues: ${gbpAnalysis.issues.join(", ")}
- Strengths: ${gbpAnalysis.strengths.join(", ")}`;
    }
  }

  // Step 2: Use LLM to generate optimized content based on real data
  const prompt = `You are a local SEO expert. You have REAL scraped data from Google for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

${dataContext}

Based on this REAL data, provide:

1. Use the calculated score: ${gbpAnalysis.score}
2. Top 10 issues (combine real issues with additional insights)
3. Top 10 improvements (combine real recommendations with additional insights)
4. Example optimized business description (150-200 words, keyword-rich, location-specific, tailored to ${input.primaryNiche})
5. Example optimized service list (5-7 services with descriptions for ${input.primaryNiche})
6. Example Google Post (engaging, with CTA, relevant to ${input.primaryNiche})

Return ONLY valid JSON in this exact format:
{
  "score": ${gbpAnalysis.score},
  "issues": ["issue 1", "issue 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "optimizedDescription": "full description text",
  "optimizedServices": ["Service 1: description", "Service 2: description", ...],
  "examplePost": "post text with CTA"
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  let result;
  try {
    result = JSON.parse(content);
  } catch (error) {
    console.error('[GBP Audit] JSON parse error:', error);
    result = {
      score: gbpAnalysis.score,
      issues: [],
      improvements: [],
      optimizedDescription: '',
      optimizedServices: [],
      examplePost: ''
    };
  }
  
  // VALIDATION: Ensure LLM output is grounded in reality
  if (result.optimizedDescription) {
    const desc = result.optimizedDescription.toLowerCase();
    // Validate description mentions the business name and location
    if (!desc.includes(input.businessName.toLowerCase().split(' ')[0]) || 
        !desc.includes(input.primaryLocation.toLowerCase().split(',')[0])) {
      console.warn('[GBP Audit] LLM description missing business name or location, regenerating');
      result.optimizedDescription = `${input.businessName} is a trusted ${input.primaryNiche} serving ${input.primaryLocation}. We provide professional services to help local businesses succeed. Contact us today for expert solutions tailored to your needs.`;
    }
  }
  
  // Ensure score from real data is used
  result.score = gbpAnalysis.score;
  
  // Prepend real data issues and improvements
  result.issues = [...gbpAnalysis.issues, ...result.issues].slice(0, 10);
  result.improvements = [...gbpAnalysis.recommendations, ...result.improvements].slice(0, 10);
  
  // Add data provenance flag
  result.dataSource = gbpAnalysis.score === 0 ? 'unavailable' : (input.gbpUrl ? 'gbp_url' : 'gbp_search');
  
  return result;
}

/**
 * Analyze Website Local SEO with REAL crawled data
 */
export async function analyzeSEO(input: AuditInput): Promise<SEOAuditResult> {
  // Step 1: Crawl real website data
  const websiteData = await crawlWebsite(input.websiteUrl);
  const websiteAnalysis = analyzeWebsiteData(websiteData);

  // Calculate score based on real data
  let score = 50; // Base score
  if (!websiteData.error) {
    if (websiteData.title && websiteData.title.length >= 30 && websiteData.title.length <= 60) score += 10;
    if (websiteData.metaDescription && websiteData.metaDescription.length >= 120) score += 10;
    if (websiteData.h1Tags.length === 1) score += 10;
    if (websiteData.schemaTypes.length > 0) score += 10;
    if (websiteData.napData.phone) score += 5;
    if (websiteData.hasMobileViewport) score += 5;
  } else {
    score = 20; // Very low score if website is inaccessible
  }

  // Step 2: Build context from real data
  const dataContext = websiteData.error
    ? `⚠️ REAL DATA: Website is inaccessible or failed to load. Error: ${websiteData.error}`
    : `✅ REAL WEBSITE DATA CRAWLED:

CURRENT STATE:
- Title Tag: "${websiteData.title || "MISSING"}"
- Meta Description: "${websiteData.metaDescription || "MISSING"}"
- H1 Tags: ${websiteData.h1Tags.length > 0 ? websiteData.h1Tags.map(h => `"${h}"`).join(", ") : "NONE FOUND"}
- H2 Tags: ${websiteData.h2Tags.length} found
- H3 Tags: ${websiteData.h3Tags.length} found
- Schema Types: ${websiteData.schemaTypes.length > 0 ? websiteData.schemaTypes.join(", ") : "NONE"}
- NAP Data: ${websiteData.napData.phone ? `Phone: ${websiteData.napData.phone}` : "Phone not found"}, ${websiteData.napData.address ? `Address found` : "Address not found"}
- CTAs: ${websiteData.ctaElements.buttons} buttons, ${websiteData.ctaElements.forms} forms, ${websiteData.ctaElements.phoneLinks} phone links
- Mobile Viewport: ${websiteData.hasMobileViewport ? "Yes" : "NO - CRITICAL ISSUE"}
- Chat Widget: ${websiteData.hasChat ? "Yes" : "No"}
- Images: ${websiteData.images}
- Internal Links: ${websiteData.internalLinks}

ANALYSIS BASED ON REAL DATA:
- Issues: ${websiteAnalysis.issues.join(", ")}
- Strengths: ${websiteAnalysis.strengths.join(", ")}
- Calculated Score: ${score}/100`;

  const prompt = `You are a local SEO expert. You have REAL crawled data from ${input.websiteUrl} for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

${dataContext}

Based on this REAL data, provide:

1. Use calculated score: ${score}
2. Top 10 SEO weaknesses (use real issues found)
3. Top 10 SEO improvements (use real recommendations)
4. Example optimized homepage title tag (improve their current: "${websiteData.title || "Add title"}")
5. Example optimized H1 and 3 subheadings (H2/H3) - improve their current headings
6. 3-5 recommended schema types (they currently have: ${websiteData.schemaTypes.join(", ") || "none"})
7. Query-level table for 5 key search terms

For queries, mark data type as:
- "Real Data" if you can infer from actual website content
- "Industry Benchmark" if making assumptions

Return ONLY valid JSON in this exact format:
{
  "score": ${score},
  "weaknesses": ["weakness 1", ...],
  "improvements": ["improvement 1", ...],
  "optimizedTitleTag": "title tag text",
  "optimizedHeadings": ["H1: heading", "H2: heading", "H3: heading"],
  "recommendedSchemas": ["LocalBusiness", "FAQPage", ...],
  "queries": [
    {
      "query": "query text",
      "organicPresence": "Top 3 | Positions 4-10 | Page 2+",
      "mapPackPresence": "Yes | No | Unclear",
      "competitorsAbove": "Competitor names or Unknown",
      "dataType": "Real Data | Industry Benchmark"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  let result;
  try {
    result = JSON.parse(content);
  } catch (error) {
    console.error('[SEO Audit] JSON parse error:', error);
    result = {
      score,
      weaknesses: [],
      improvements: [],
      optimizedTitleTag: '',
      optimizedHeadings: [],
      recommendedSchemas: [],
      queries: []
    };
  }
  
  // VALIDATION: Ensure LLM output matches scraped data
  if (!websiteData.error) {
    // Validate title tag references the actual title
    if (result.optimizedTitleTag && websiteData.title) {
      const actualTitle = websiteData.title.toLowerCase();
      const optimizedTitle = result.optimizedTitleTag.toLowerCase();
      // If LLM completely ignores the actual title, flag it
      if (!optimizedTitle.includes(input.businessName.toLowerCase().split(' ')[0])) {
        console.warn('[SEO Audit] LLM generated title without business name, using fallback');
        result.optimizedTitleTag = `${input.businessName} | ${input.primaryNiche} in ${input.primaryLocation}`;
      }
    }
    
    // Validate weaknesses mention actual issues found
    const hasRealIssues = result.weaknesses.some((w: string) => 
      w.toLowerCase().includes('title') || 
      w.toLowerCase().includes('meta') || 
      w.toLowerCase().includes('h1') ||
      w.toLowerCase().includes('schema')
    );
    
    if (!hasRealIssues && websiteAnalysis.issues.length > 0) {
      console.warn('[SEO Audit] LLM weaknesses dont match real issues, prepending real data');
    }
  }
  
  // Ensure score from real data is used
  result.score = score;
  
  // Prepend real data issues and improvements
  result.weaknesses = [...websiteAnalysis.issues, ...result.weaknesses].slice(0, 10);
  result.improvements = [...websiteAnalysis.recommendations, ...result.improvements].slice(0, 10);
  
  // Add data provenance flag
  result.dataSource = websiteData.error ? 'unavailable' : 'crawl';
  
  // Step 3: Track real search rankings with SerpStack API
  try {
    console.log(`[SEO Audit] Tracking rankings for ${input.businessName} via SerpStack...`);
    
    // Generate search queries
    const queries = [
      `${input.primaryNiche} ${input.primaryLocation}`,
      `${input.primaryNiche} near me`,
      `best ${input.primaryNiche} ${input.primaryLocation}`,
      input.businessName
    ];
    
    // Track rankings via SerpStack
    const rankingResults = await trackMultipleQueries(queries, input.websiteUrl);
    
    // Calculate average position (only for queries where business was found)
    const foundPositions = rankingResults
      .filter(r => r.yourPosition !== null)
      .map(r => r.yourPosition!);
    const averagePosition = foundPositions.length > 0
      ? Math.round(foundPositions.reduce((a, b) => a + b, 0) / foundPositions.length)
      : null;
    
    // Check if in local pack
    const inLocalPack = rankingResults.some(r => r.localPackResults.some(lr => 
      lr.link.includes(input.websiteUrl.replace(/^https?:\/\//, '').replace('www.', ''))
    ));
    
    // Get top competitors
    const allCompetitors = new Set<string>();
    rankingResults.forEach(r => {
      r.topResults.slice(0, 5).forEach(result => {
        if (result && result.link && result.title && !result.link.includes(input.websiteUrl.replace(/^https?:\/\//, '').replace('www.', ''))) {
          allCompetitors.add(result.title);
        }
      });
    });
    const topCompetitors = Array.from(allCompetitors).slice(0, 5);
    
    // Add ranking data to result
    result.rankingData = {
      averagePosition,
      inLocalPack,
      topCompetitors,
      queries: rankingResults.map(r => ({
        query: r.query,
        position: r.yourPosition,
        competitors: r.topResults.slice(0, 3).map((c, idx) => ({
          position: idx + 1,
          businessName: c.title,
        })),
      })),
    };
    
    // Adjust score based on rankings
    if (averagePosition && averagePosition <= 10) {
      result.score = Math.min(100, result.score + 20);
    } else if (averagePosition && averagePosition <= 20) {
      result.score = Math.min(100, result.score + 10);
    }
    
    if (inLocalPack) {
      result.score = Math.min(100, result.score + 15);
    }
    
    // Add ranking insights
    if (!averagePosition) {
      result.weaknesses.push('Not ranking in top 20 for key search terms');
      result.improvements.push('Implement local SEO strategy to improve search visibility');
    } else if (averagePosition > 10) {
      result.weaknesses.push(`Average ranking position is ${averagePosition} - needs improvement`);
      result.improvements.push('Optimize content and build local citations to improve rankings');
    }
    
    if (!inLocalPack) {
      result.weaknesses.push('Not appearing in Google Local Pack');
      result.improvements.push('Optimize GBP and build local relevance signals');
    }
    
    console.log(`[SEO Audit] Ranking tracking complete. Average position: ${averagePosition || 'Not found'}, Local Pack: ${inLocalPack}`);
  } catch (error) {
    console.error(`[SEO Audit] Failed to track rankings:`, error);
    // Continue without ranking data
  }
  
  return result;
}

/**
 * Analyze Competitive Visibility with REAL search data
 */
export async function analyzeCompetitive(input: AuditInput): Promise<CompetitiveAnalysisResult> {
  // Step 1: Search for real competitors
  const competitorData = await searchCompetitors(
    input.primaryNiche,
    input.primaryLocation,
    input.businessName
  );

  // Get GBP data for comparison
  const yourGBP = await searchGBP(input.businessName, input.primaryLocation);

  // Analyze competitive data
  const analysis = analyzeCompetitiveData(
    competitorData,
    yourGBP.rating,
    yourGBP.reviewCount
  );

  const recommendations = generateCompetitiveRecommendations(
    analysis.insights,
    analysis.gaps,
    analysis.advantages
  );

  // Build context from real data
  const dataContext = competitorData.error
    ? `⚠️ REAL DATA: Unable to search competitors. Using industry assumptions.`
    : `✅ REAL COMPETITOR DATA FOUND:

Search Query: "${competitorData.searchQuery}"
Total Competitors Found: ${competitorData.totalResults}
Your Position: ${competitorData.yourPosition !== null ? `#${competitorData.yourPosition}` : "Not found in top 10"}

TOP COMPETITORS:
${competitorData.competitors.slice(0, 5).map((c, i) => 
  `${i + 1}. ${c.name}${c.rating ? ` - ${c.rating}⭐ (${c.reviewCount} reviews)` : ""}`
).join("\n")}

YOUR DATA:
- Rating: ${yourGBP.rating || "No rating"}
- Reviews: ${yourGBP.reviewCount || "No reviews"}

ANALYSIS:
- Insights: ${analysis.insights.join(", ")}
- Gaps: ${analysis.gaps.join(", ")}
- Advantages: ${analysis.advantages.join(", ")}`;

  const prompt = `You are a local SEO expert. You have REAL competitor search data for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

${dataContext}

Based on this REAL data, provide:

1. 5 reasons competitors likely rank higher (use real insights)
2. 5 gaps in authority/trust signals (use real gaps)
3. 5 content or profile advantages competitors likely have (use real advantages)

Return ONLY valid JSON in this exact format:
{
  "reasonsCompetitorsRank": ["reason 1", "reason 2", ...],
  "trustGaps": ["gap 1", "gap 2", ...],
  "competitorAdvantages": ["advantage 1", "advantage 2", ...]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  const result = JSON.parse(content);
  
  // Prepend real data insights
  result.reasonsCompetitorsRank = [...analysis.insights.slice(0, 3), ...result.reasonsCompetitorsRank].slice(0, 5);
  result.trustGaps = [...analysis.gaps.slice(0, 3), ...result.trustGaps].slice(0, 5);
  result.competitorAdvantages = [...analysis.advantages.slice(0, 2), ...result.competitorAdvantages].slice(0, 5);
  
  return result;
}

/**
 * Analyze AI/AEO Discoverability
 */
export async function analyzeAEO(input: AuditInput): Promise<AEOResult> {
  const prompt = `You are an AI search expert analyzing how visible ${input.businessName} (${input.primaryNiche} in ${input.primaryLocation}) would be to ChatGPT, Gemini, and Perplexity.

Evaluate based on:
- Entity clarity
- Structured data
- Reviews and citations
- Content depth
- About page quality

Provide:
1. AI Discoverability Score (0-100)
2. Why AI would recommend them (2-3 sentences)
3. Why AI would NOT recommend them (2-3 sentences)
4. 10 specific fixes to improve AI visibility
5. Example FAQ content AI could quote (3 Q&A pairs)
6. Example entity-style "About Us" rewrite (100-150 words)
7. Prompt/question table for 4 high-intent AI queries

For each prompt:
- Prompt/question text
- Brand likely recommended? (Yes/No/Maybe)
- Evidence/description
- Data type (Observed/Assumption)

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "whyAIWouldRecommend": "explanation text",
  "whyAIWouldNot": "explanation text",
  "fixes": ["fix 1", "fix 2", ...],
  "exampleFAQ": "Q: question\\nA: answer\\n\\nQ: question\\nA: answer\\n\\nQ: question\\nA: answer",
  "optimizedAboutUs": "about us text",
  "prompts": [
    {
      "prompt": "prompt text",
      "likelyRecommended": "Yes | No | Maybe",
      "evidence": "evidence text",
      "dataType": "Observed | Assumption"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Parse Error] Failed to parse LLM response:', error);
    console.error('[JSON Parse Error] Content:', content);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('[JSON Parse Error] Failed to parse extracted JSON:', e);
      }
    }
    
    // Return empty object as fallback
    return { score: 0, whyAIWouldRecommend: '', whyAIWouldNot: '', fixes: [], exampleFAQ: '', optimizedAboutUs: '', prompts: [] };
  }
}

/**
 * Analyze Lead Capture & Response
 */
export async function analyzeLeadCapture(input: AuditInput): Promise<LeadCaptureResult> {
  const hasCallCoverage = input.hasCallCoverage;
  const usesAutomation = input.usesAutomation;

  const prompt = `You are a conversion optimization expert analyzing lead capture for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Current state:
- Call coverage: ${hasCallCoverage}
- Uses automation: ${usesAutomation}

Analyze all visible lead capture methods (phone, web forms, chat, booking) and provide:

1. Channel analysis table with 4-5 channels:
   - Channel name
   - Visibility & ease of use
   - Response expectation communicated?
   - After-hours coverage?
   - Risk level (Low/Medium/High)
   - Data type (Observed/Assumption)

2. 5-7 specific opportunities where AI Voice Agents could help (answer calls 24/7, qualify leads, book appointments, capture info)

3. 5-7 specific opportunities where Conversation AI widgets could help (chat, SMS, automated responses)

Return ONLY valid JSON in this exact format:
{
  "channels": [
    {
      "channel": "Phone",
      "visibility": "description",
      "responseExpectation": "Yes | No | Unclear",
      "afterHoursCoverage": "Yes | No | Unknown",
      "riskLevel": "Low | Medium | High",
      "dataType": "Observed | Assumption"
    }
  ],
  "aiVoiceOpportunities": ["opportunity 1", ...],
  "conversationAIOpportunities": ["opportunity 1", ...]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Parse Error] Failed to parse LLM response:', error);
    console.error('[JSON Parse Error] Content:', content);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('[JSON Parse Error] Failed to parse extracted JSON:', e);
      }
    }
    
    // Return empty object as fallback
    return { channels: [], aiVoiceOpportunities: [], conversationAIOpportunities: [] };
  }
}

/**
 * Analyze Follow-Up & Nurture
 */
export async function analyzeFollowUp(input: AuditInput): Promise<FollowUpResult> {
  const usesAutomation = input.usesAutomation;
  const monthlyLeads = input.monthlyLeads || 0;
  const avgRevenue = input.avgRevenuePerClient || 0;

  const prompt = `You are a marketing automation expert analyzing follow-up systems for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Current state:
- Uses automation: ${usesAutomation}
- Monthly leads: ${monthlyLeads}
- Avg revenue per client: $${avgRevenue}

Provide:
1. Current state description (how quickly leads are contacted, follow-up approach, reactivation efforts)
2. Opportunity state description (what improved follow-up and reactivation could look like)
3. 5-7 automation opportunities (AI-driven follow-up, nurture sequences, reactivation campaigns)
4. Reactivation potential description (value of re-engaging past leads and customers)

Return ONLY valid JSON in this exact format:
{
  "currentState": "description of current follow-up approach",
  "opportunityState": "description of opportunity with better systems",
  "automationOpportunities": ["opportunity 1", "opportunity 2", ...],
  "reactivationPotential": "description of reactivation value"
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Parse Error] Failed to parse LLM response:', error);
    console.error('[JSON Parse Error] Content:', content);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('[JSON Parse Error] Failed to parse extracted JSON:', e);
      }
    }
    
    // Return empty object as fallback
    return { currentState: '', opportunityState: '', automationOpportunities: [], reactivationPotential: '' };
  }
}

/**
 * Generate Revenue Recapture Summary
 */
export async function generateRevenueRecapture(
  input: AuditInput,
  gbp: GBPAuditResult,
  seo: SEOAuditResult,
  aeo: AEOResult
): Promise<RevenueRecaptureSummary> {
  const monthlyLeads = input.monthlyLeads || 50;
  const avgRevenue = input.avgRevenuePerClient || 5000;
  const missRate = 0.25; // Conservative 25% miss rate

  const estimatedMonthlyRecovery = Math.round(monthlyLeads * missRate * avgRevenue * 0.3); // 30% recovery of missed opportunities

  const prompt = `You are a business analyst synthesizing audit findings for ${input.businessName}.

Audit scores:
- GBP: ${gbp.score}/100
- SEO: ${seo.score}/100
- AEO: ${aeo.score}/100

Create a revenue recapture summary table with 5-6 key areas:
- SEO + AEO Visibility
- Website & Offer Conversion
- Lead Capture & Response
- AI Voice & Conversation Use
- Follow-Up & Reactivation
- (optional) Reputation Management

For each area provide:
- Key issue (specific, concrete)
- Impact level (High/Medium/Low)
- Data type (Observed/Mixed/Assumption)
- Revenue upside explanation (clear business impact)

Return ONLY valid JSON in this exact format:
{
  "opportunities": [
    {
      "area": "area name",
      "keyIssue": "specific issue description",
      "impactLevel": "High | Medium | Low",
      "dataType": "Observed | Mixed | Assumption",
      "revenueUpside": "business impact explanation"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  const result = JSON.parse(content);

  return {
    ...result,
    estimatedMonthlyRecovery: input.monthlyLeads && input.avgRevenuePerClient ? estimatedMonthlyRecovery : undefined,
  };
}

/**
 * Generate Recommended Plan with Pricing
 */
export async function generateRecommendedPlan(input: AuditInput): Promise<RecommendedPlan> {
  const prompt = `You are a strategic consultant creating a revenue recapture plan for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Business goals: ${input.businessGoals.join(", ")}
Pain points: ${input.painPoints.join(", ")}

Create a comprehensive plan with:

1. Business-specific plan name (e.g., "Portland HVAC Revenue Recapture Blueprint")

2. 4-6 strategic pillars addressing their goals and pain points:
   - Be Found More Often (SEO + AEO)
   - Turn Visitors into Conversations and Bookings
   - Capture Every Lead with AI Voice & Conversation
   - Follow Up and Nurture Automatically
   - Retain and Grow Customer Value
   - (optional) Build Trust and Authority

For each pillar:
- Title
- Description (what will be put in place)
- 3-4 specific outcomes

3. Phased roadmap:
   - Phase 1: Quick Wins (First Few Weeks) - 4-5 items
   - Phase 2: Systems and Automation (Next Several Weeks) - 4-5 items
   - Phase 3: Scale and Continuous Improvement - 3-4 items

4. 3 pricing packages tailored to ${input.primaryNiche} businesses:
   - Visibility Boost & Authority Foundations
   - AI Conversation & Lead Capture Upgrade
   - Full Funnel Revenue Recapture System

For each package:
- Name
- Focus area
- 5-7 includes
- Ideal for (who this fits)
- Investment range (monthly or project-based, realistic for niche)

Return ONLY valid JSON in this exact format:
{
  "planName": "plan name",
  "pillars": [
    {
      "title": "pillar title",
      "description": "what will be implemented",
      "outcomes": ["outcome 1", "outcome 2", ...]
    }
  ],
  "roadmap": {
    "phase1": {
      "title": "Quick Wins (First Few Weeks)",
      "description": "phase description",
      "items": ["item 1", "item 2", ...]
    },
    "phase2": {
      "title": "Systems and Automation (Next Several Weeks)",
      "description": "phase description",
      "items": ["item 1", "item 2", ...]
    },
    "phase3": {
      "title": "Scale and Continuous Improvement",
      "description": "phase description",
      "items": ["item 1", "item 2", ...]
    }
  },
  "pricingPackages": [
    {
      "name": "package name",
      "focus": "focus area",
      "includes": ["include 1", ...],
      "idealFor": "who this fits",
      "investmentRange": "price range"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Parse Error] Failed to parse LLM response:', error);
    console.error('[JSON Parse Error] Content:', content);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('[JSON Parse Error] Failed to parse extracted JSON:', e);
      }
    }
    
    // Return empty object as fallback
    return { planName: 'Local Authority Growth Plan', pillars: [], roadmap: { phase1: { title: '', description: '', items: [] }, phase2: { title: '', description: '', items: [] }, phase3: { title: '', description: '', items: [] } }, pricingPackages: [] };
  }
}

/**
 * Generate Executive Summary and Key Findings
 */
export async function generateExecutiveSummary(
  input: AuditInput,
  gbp: GBPAuditResult,
  seo: SEOAuditResult,
  aeo: AEOResult
): Promise<{ summary: string; keyFindings: string[] }> {
  const prompt = `You are a business consultant writing an executive summary for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Audit scores:
- GBP Optimization: ${gbp.score}/100
- Website Local SEO: ${seo.score}/100
- AI Discoverability: ${aeo.score}/100

Business goals: ${input.businessGoals.join(", ")}
Pain points: ${input.painPoints.join(", ")}

Write:
1. Executive summary paragraph (3-4 sentences covering niche, location, overall visibility state, lead capture state, and opportunity)
2. 5-7 key findings bullets (each must be concrete and specific, not generic - include actual data points, competitor mentions, or specific gaps)

Return ONLY valid JSON in this exact format:
{
  "summary": "executive summary paragraph",
  "keyFindings": ["finding 1", "finding 2", ...]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : "{}";
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Parse Error] Failed to parse LLM response:', error);
    console.error('[JSON Parse Error] Content:', content);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('[JSON Parse Error] Failed to parse extracted JSON:', e);
      }
    }
    
    // Return empty object as fallback
    return { summary: '', keyFindings: [] };
  }
}

/**
 * Run complete audit analysis
 */
export async function runCompleteAudit(input: AuditInput) {
  console.log(`[Audit Engine] Starting audit for ${input.businessName}`);

  // Run all analyses in parallel for speed
  const [gbp, seo, competitive, aeo, leadCapture, followUp] = await Promise.all([
    analyzeGBP(input),
    analyzeSEO(input),
    analyzeCompetitive(input),
    analyzeAEO(input),
    analyzeLeadCapture(input),
    analyzeFollowUp(input),
  ]);

  console.log(`[Audit Engine] Core analyses complete, generating summary and plan`);

  // Generate summary and plan based on results
  const [executiveSummary, revenueRecapture, recommendedPlan] = await Promise.all([
    generateExecutiveSummary(input, gbp, seo, aeo),
    generateRevenueRecapture(input, gbp, seo, aeo),
    generateRecommendedPlan(input),
  ]);

  console.log(`[Audit Engine] Audit complete for ${input.businessName}`);

  return {
    gbp,
    seo,
    competitive,
    aeo,
    leadCapture,
    followUp,
    executiveSummary,
    revenueRecapture,
    recommendedPlan,
  };
}
