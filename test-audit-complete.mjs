import { getDb } from "./server/db.js";
import { runCompleteAudit } from "./server/auditEngine.js";

const testInput = {
  businessName: "Test Business",
  websiteUrl: "https://eighty5labs.com",
  gbpUrl: "",
  primaryLocation: "Portland, OR",
  primaryNiche: "Professional Services",
  nicheDescription: "Digital marketing agency",
  leadSources: ["Google Search", "Referrals"],
  runsPaidAds: "Yes",
  hasLocalListing: "Yes",
  activeOnSocial: "Yes",
  usesAutomation: "Yes",
  hasCallCoverage: "Yes",
  monthlyVisitors: 1000,
  monthlyLeads: 50,
  avgRevenuePerClient: 5000,
  businessGoals: ["Increase leads", "Improve online visibility"],
  painPoints: ["Not ranking well", "Missing calls"]
};

console.log("Starting audit test...");
console.log("Input:", JSON.stringify(testInput, null, 2));

try {
  console.log("\n=== Running Complete Audit ===");
  const results = await runCompleteAudit(testInput);
  
  console.log("\n=== Audit Results ===");
  console.log("GBP Score:", results.gbp.score);
  console.log("SEO Score:", results.seo.score);
  console.log("AEO Score:", results.aeo.score);
  console.log("Executive Summary:", results.executiveSummary.summary.substring(0, 200) + "...");
  
  console.log("\n=== Validating JSON Structure ===");
  
  // Test JSON stringification
  const gbpJson = JSON.stringify(results.gbp);
  const seoJson = JSON.stringify(results.seo);
  const aeoJson = JSON.stringify(results.aeo);
  
  console.log("✅ GBP JSON valid:", gbpJson.length, "bytes");
  console.log("✅ SEO JSON valid:", seoJson.length, "bytes");
  console.log("✅ AEO JSON valid:", aeoJson.length, "bytes");
  
  // Test JSON parsing
  JSON.parse(gbpJson);
  JSON.parse(seoJson);
  JSON.parse(aeoJson);
  
  console.log("✅ All JSON can be parsed successfully");
  
  console.log("\n=== Test Complete ===");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Test Failed:", error);
  process.exit(1);
}
