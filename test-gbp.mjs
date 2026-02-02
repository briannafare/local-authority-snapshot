import { searchGBP, analyzeGBPData } from "./server/gbpScraper.ts";

async function test() {
  console.log("Testing GBP scraping for eighty5labs...\n");
  
  const data = await searchGBP("eighty5labs", "United States");
  console.log("Raw GBP Data:");
  console.log(JSON.stringify(data, null, 2));
  
  console.log("\n\nAnalysis:");
  const analysis = analyzeGBPData(data, "eighty5labs");
  console.log(JSON.stringify(analysis, null, 2));
}

test().catch(console.error);
