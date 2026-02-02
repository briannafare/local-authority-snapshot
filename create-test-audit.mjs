import { drizzle } from "drizzle-orm/mysql2";
import { audits } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Create a simple test audit with minimal data
const testAudit = {
  businessName: "eighty5labs Test",
  website: "https://eighty5labs.com",
  location: "Portland, OR",
  niche: "Professional Services",
  gbpUrl: null,
  leadSources: JSON.stringify(["Google Search"]),
  paidAds: "No",
  localListing: "Yes",
  socialMedia: "Yes",
  automation: "Yes",
  callAnswering: "Yes",
  businessGoals: "Test goals",
  painPoints: "Test pain points",
  status: "completed",
  gbpAuditResults: JSON.stringify({
    score: 75,
    issues: ["Test issue 1", "Test issue 2"],
    improvements: ["Test improvement 1", "Test improvement 2"]
  }),
  seoAuditResults: JSON.stringify({
    score: 80,
    issues: ["SEO issue 1"],
    improvements: ["SEO improvement 1"]
  }),
  competitiveResults: JSON.stringify({
    score: 70,
    gaps: ["Competitive gap 1"]
  }),
  aeoResults: JSON.stringify({
    score: 65,
    recommendations: ["AEO rec 1"]
  }),
  leadCaptureResults: JSON.stringify({
    score: 85,
    issues: ["Lead capture issue 1"]
  }),
  followUpResults: JSON.stringify({
    score: 60,
    recommendations: ["Follow-up rec 1"]
  }),
  keyFindings: JSON.stringify([
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ]),
  recommendations: JSON.stringify({
    immediate: ["Rec 1", "Rec 2"],
    shortTerm: ["Rec 3"],
    longTerm: ["Rec 4"]
  }),
  executiveSummary: JSON.stringify({
    overview: "Test executive summary",
    keyMetrics: {
      gbpScore: 75,
      seoScore: 80,
      competitiveScore: 70
    }
  }),
  recommendedPlan: JSON.stringify({
    planName: "Test Plan",
    pillars: [
      {
        pillarName: "Pillar 1",
        tactics: ["Tactic 1", "Tactic 2"]
      }
    ],
    roadmap: [
      {
        phaseName: "Phase 1",
        timeline: "Month 1-2",
        focusAreas: ["Focus 1"],
        expectedOutcomes: ["Outcome 1"]
      }
    ],
    pricingPackages: [
      {
        packageName: "Starter",
        bestFor: "Small businesses",
        included: ["Feature 1", "Feature 2"],
        investment: "$2,000-$5,000"
      }
    ]
  })
};

const [result] = await db.insert(audits).values(testAudit);
console.log("✅ Test audit created with ID:", result.insertId);
console.log(`View at: https://3000-i56btpkavbrw86vrtuxzx-4b8a7978.us2.manus.computer/report/${result.insertId}`);
