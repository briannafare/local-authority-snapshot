import { invokeLLM } from "./_core/llm";

export interface AuditInput {
  businessName: string;
  websiteUrl: string;
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
 * Analyze Google Business Profile
 */
export async function analyzeGBP(input: AuditInput): Promise<GBPAuditResult> {
  const prompt = `You are a local SEO expert analyzing a Google Business Profile for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Based on industry best practices, provide a comprehensive GBP audit with:

1. GBP Optimization Score (0-100)
2. Top 10 issues hurting Maps ranking
3. Top 10 improvements that would increase visibility
4. Example optimized business description (150-200 words, keyword-rich, location-specific)
5. Example optimized service list (5-7 services with descriptions)
6. Example Google Post (engaging, with CTA)

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
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
  return JSON.parse(content);
}

/**
 * Analyze Website Local SEO
 */
export async function analyzeSEO(input: AuditInput): Promise<SEOAuditResult> {
  const prompt = `You are a local SEO expert analyzing the website for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Website: ${input.websiteUrl}

Based on local SEO best practices, provide:

1. Website Local SEO Score (0-100)
2. Top 10 SEO weaknesses
3. Top 10 SEO improvements
4. Example optimized homepage title tag
5. Example optimized H1 and 3 subheadings (H2/H3)
6. 3-5 recommended schema types they should add
7. Query-level table for 5 key search terms (e.g., "[service] in [city]", "[service] near me", brand name)

For each query provide:
- Organic presence estimate (Top 3, Positions 4-10, Page 2+)
- Map pack presence (Yes/No/Unclear)
- Notable competitors above (estimate 1-2 competitor names or "Unknown")
- Data type (Observed/Assumption)

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
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
  return JSON.parse(content);
}

/**
 * Analyze Competitive Visibility
 */
export async function analyzeCompetitive(input: AuditInput): Promise<CompetitiveAnalysisResult> {
  const prompt = `You are a local SEO expert analyzing competitive visibility for ${input.businessName}, a ${input.primaryNiche} business in ${input.primaryLocation}.

Simulate what Google would likely show for searches like:
- "${input.primaryNiche} near me"
- "${input.primaryNiche} in ${input.primaryLocation}"

Provide:
1. 5 reasons competitors likely rank higher
2. 5 gaps in authority/trust signals
3. 5 content or profile advantages competitors likely have

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
  return JSON.parse(content);
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
  return JSON.parse(content);
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
  return JSON.parse(content);
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
  return JSON.parse(content);
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
  return JSON.parse(content);
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
  return JSON.parse(content);
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
