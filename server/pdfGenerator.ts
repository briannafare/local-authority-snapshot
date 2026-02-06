import { storagePut } from "./storage";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

export interface PDFGenerationInput {
  auditId: number;
  businessName: string;
  primaryLocation: string;
  primaryNiche: string;
  executiveSummary: any;
  gbpAudit: any;
  seoAudit: any;
  competitiveAnalysis: any;
  aeoAnalysis: any;
  leadCaptureAnalysis: any;
  followUpAnalysis: any;
  revenueRecapture: any;
  recommendedPlan: any;
  visualUrls: string[];
  overallGrade?: string;
  overallScore?: number;
  competitors?: Array<{
    name: string;
    rating: number | null;
    reviewCount: number | null;
    address?: string;
  }>;
}

/**
 * Generate a professional PDF report with eighty5labs branding
 */
export async function generatePDF(input: PDFGenerationInput): Promise<string> {
  const timestamp = Date.now();
  const tempDir = `/tmp/audit-${input.auditId}-${timestamp}`;
  const tempMdPath = join(tempDir, "report.md");
  const tempPdfPath = join(tempDir, "report.pdf");
  const tempImagePaths: string[] = [];

  try {
    // Create temp directory
    const { mkdir } = await import("fs/promises");
    await mkdir(tempDir, { recursive: true });

    // Download all visual images to local temp files
    console.log(`[PDF Generator] Downloading ${input.visualUrls.length} images to ${tempDir}`);
    const localVisualUrls: string[] = [];
    for (let i = 0; i < input.visualUrls.length; i++) {
      const url = input.visualUrls[i];
      const urlParts = url.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const localPath = join(tempDir, originalFilename);
      
      try {
        console.log(`[PDF Generator] Downloading image ${i}: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          await writeFile(localPath, buffer);
          console.log(`[PDF Generator] Saved image to: ${localPath} (${buffer.length} bytes)`);
          localVisualUrls.push(localPath);
          tempImagePaths.push(localPath);
        } else {
          console.error(`[PDF Generator] Failed to download image (${response.status}): ${url}`);
          localVisualUrls.push(url);
        }
      } catch (error) {
        console.error(`[PDF Generator] Error downloading image ${url}:`, error);
        localVisualUrls.push(url);
      }
    }
    console.log(`[PDF Generator] Downloaded ${localVisualUrls.length} images`);

    // Create markdown content with local image paths
    const markdown = generateReportMarkdown({ ...input, visualUrls: localVisualUrls });
    console.log(`[PDF Generator] Generated markdown with ${localVisualUrls.length} image references`);

    // Write markdown to temporary file
    await writeFile(tempMdPath, markdown, "utf-8");
    console.log(`[PDF Generator] Wrote markdown to: ${tempMdPath}`);

    // Convert markdown to PDF using manus-md-to-pdf utility
    console.log(`[PDF Generator] Converting to PDF: ${tempMdPath} -> ${tempPdfPath}`);
    const { stdout, stderr } = await execAsync(`manus-md-to-pdf ${tempMdPath} ${tempPdfPath}`);
    if (stdout) console.log(`[PDF Generator] stdout:`, stdout);
    if (stderr) console.log(`[PDF Generator] stderr:`, stderr);

    // Read the generated PDF
    const { readFile } = await import("fs/promises");
    const pdfBuffer = await readFile(tempPdfPath);
    console.log(`[PDF Generator] Read PDF: ${pdfBuffer.length} bytes`);

    // Upload to S3
    const fileKey = `audits/${input.auditId}/report-${Date.now()}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

    // Clean up temporary files
    const { rm } = await import("fs/promises");
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});

    return url;
  } catch (error) {
    // Clean up on error
    const { rm } = await import("fs/promises");
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

// Helper functions for formatting
function getScoreEmoji(score: number): string {
  if (score >= 80) return '🟢';
  if (score >= 60) return '🟡';
  if (score >= 40) return '🟠';
  return '🔴';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  if (score >= 20) return 'Poor';
  return 'Critical';
}

/**
 * Generate markdown content for the PDF report - Pure Markdown Version
 */
function generateReportMarkdown(input: PDFGenerationInput): string {
  const {
    businessName,
    primaryLocation,
    primaryNiche,
    executiveSummary,
    gbpAudit,
    seoAudit,
    competitiveAnalysis,
    aeoAnalysis,
    leadCaptureAnalysis,
    followUpAnalysis,
    revenueRecapture,
    recommendedPlan,
    visualUrls,
    competitors,
  } = input;

  const grade = input.overallGrade || 'C';
  const score = input.overallScore || 50;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Find specific chart images
  const gbpScoreChart = visualUrls.find(url => url.includes('gbp') && url.includes('score'));
  const seoScoreChart = visualUrls.find(url => url.includes('seo') && url.includes('score'));
  const aeoScoreChart = visualUrls.find(url => url.includes('aeo') && url.includes('score'));
  const rankingChart = visualUrls.find(url => url.includes('ranking'));
  const heatMapChart = visualUrls.find(url => url.includes('heat'));
  const competitorChart = visualUrls.find(url => url.includes('competitor'));

  return `# LOCAL AUTHORITY SNAPSHOT
## Revenue Recapture Audit Report

---

**Prepared for:** ${businessName}

**Industry:** ${primaryNiche}

**Location:** ${primaryLocation}

**Report Date:** ${today}

**Prepared by:** eighty5labs

---

# Overall Grade: ${grade} (${score}/100)

${getScoreEmoji(score)} ${getScoreLabel(score)}

---

# Executive Dashboard

## Score Summary

| Category | Score | Status |
|----------|-------|--------|
| **GBP Optimization** | ${gbpAudit?.score || 0}/100 | ${getScoreEmoji(gbpAudit?.score || 0)} ${getScoreLabel(gbpAudit?.score || 0)} |
| **Website SEO** | ${seoAudit?.score || 0}/100 | ${getScoreEmoji(seoAudit?.score || 0)} ${getScoreLabel(seoAudit?.score || 0)} |
| **AI Discoverability (AEO)** | ${aeoAnalysis?.score || 0}/100 | ${getScoreEmoji(aeoAnalysis?.score || 0)} ${getScoreLabel(aeoAnalysis?.score || 0)} |

${revenueRecapture?.estimatedMonthlyRecovery ? `
## 💰 Estimated Monthly Revenue Recovery: $${revenueRecapture.estimatedMonthlyRecovery.toLocaleString()}
` : ''}

## Key Findings

${executiveSummary?.keyFindings?.slice(0, 5).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n\n') || '*Analysis in progress*'}

## Priority Actions

| Priority | Action | Impact |
|----------|--------|--------|
${executiveSummary?.priorityActions?.slice(0, 5).map((a: string, i: number) => `| ${i < 2 ? '🔴 HIGH' : i < 4 ? '🟡 MEDIUM' : '🟢 LOW'} | ${a} | ${i < 2 ? 'Critical' : i < 4 ? 'Important' : 'Recommended'} |`).join('\n') || '| - | *Analysis in progress* | - |'}

---

# Google Business Profile Analysis

## GBP Score: ${gbpAudit?.score || 0}/100 ${getScoreEmoji(gbpAudit?.score || 0)}

${gbpScoreChart ? `![GBP Score](${gbpScoreChart})` : ''}

### Current Issues

${gbpAudit?.issues?.slice(0, 6).map((issue: string) => `- ❌ ${issue}`).join('\n') || '- *No issues identified*'}

### Recommended Improvements

${gbpAudit?.improvements?.slice(0, 6).map((imp: string) => `- ✅ ${imp}`).join('\n') || '- *No improvements needed*'}

### Optimized Business Description

> ${gbpAudit?.optimizedDescription || '*No optimized description available*'}

### Recommended Services to Add

${gbpAudit?.optimizedServices?.slice(0, 6).map((service: string) => `- ${service}`).join('\n') || '- *No services recommended*'}

---

# Website SEO Analysis

## SEO Score: ${seoAudit?.score || 0}/100 ${getScoreEmoji(seoAudit?.score || 0)}

${seoScoreChart ? `![SEO Score](${seoScoreChart})` : ''}

### Search Ranking Performance

${seoAudit?.rankingData ? `
| Metric | Value |
|--------|-------|
| **Average Position** | ${seoAudit.rankingData.averagePosition ? `#${seoAudit.rankingData.averagePosition.toFixed(1)}` : 'Not ranking'} |
| **Local Pack Presence** | ${seoAudit.rankingData.inLocalPack ? '✅ Yes' : '❌ No'} |
| **Top Competitors** | ${seoAudit.rankingData.topCompetitors?.length || 0} identified |
` : '*Ranking data not available*'}

${rankingChart ? `![Ranking Analysis](${rankingChart})` : ''}

### Query Performance

| Search Query | Your Position | Status |
|--------------|---------------|--------|
${seoAudit?.rankingData?.queries?.slice(0, 5).map((q: any) => `| "${q.query}" | ${q.position ? `#${q.position}` : 'Not ranking'} | ${q.position && q.position <= 3 ? '🟢 Strong' : q.position && q.position <= 10 ? '🟡 Visible' : '🔴 Needs Work'} |`).join('\n') || '| *No queries tracked* | - | - |'}

### SEO Weaknesses

${seoAudit?.weaknesses?.slice(0, 5).map((w: string) => `- ${w}`).join('\n') || '- *No weaknesses identified*'}

### Recommended Improvements

${seoAudit?.improvements?.slice(0, 5).map((imp: string) => `- ${imp}`).join('\n') || '- *No improvements needed*'}

### Optimized Title Tag

\`\`\`
${seoAudit?.optimizedTitleTag || 'No optimized title available'}
\`\`\`

---

# Competitive Analysis

${competitorChart ? `![Competitor Analysis](${competitorChart})` : ''}

## Your Top Competitors

| Business | Rating | Reviews | Threat Level |
|----------|--------|---------|--------------|
${competitors?.slice(0, 8).map((c: any) => `| ${c.name} | ${c.rating ? `⭐ ${c.rating}` : 'N/A'} | ${c.reviewCount || 0} | ${c.rating && c.rating >= 4.5 && c.reviewCount >= 100 ? '🔴 High' : c.rating && c.rating >= 4.0 ? '🟡 Medium' : '🟢 Low'} |`).join('\n') || '| *No competitors found* | - | - | - |'}

### Why Competitors Rank Higher

${competitiveAnalysis?.reasonsCompetitorsRank?.slice(0, 5).map((r: string) => `- ${r}`).join('\n') || '- *Analysis not available*'}

### Trust & Authority Gaps

${competitiveAnalysis?.trustGaps?.slice(0, 5).map((g: string) => `- ${g}`).join('\n') || '- *No gaps identified*'}

### Your Competitive Advantages

${competitiveAnalysis?.competitorAdvantages?.slice(0, 5).map((a: string) => `- ✅ ${a}`).join('\n') || '- *No advantages identified*'}

${heatMapChart ? `
### Geographic Ranking Coverage

![Geographic Heat Map](${heatMapChart})
` : ''}

---

# AI Discoverability (AEO) Analysis

## AEO Score: ${aeoAnalysis?.score || 0}/100 ${getScoreEmoji(aeoAnalysis?.score || 0)}

${aeoScoreChart ? `![AEO Score](${aeoScoreChart})` : ''}

### Why AI Would Recommend You

${aeoAnalysis?.whyAIWouldRecommend || '*Analysis not available*'}

### Why AI Might NOT Recommend You

${aeoAnalysis?.whyAIWouldNot || '*Analysis not available*'}

### Fixes to Improve AI Visibility

| Priority | Fix | Impact |
|----------|-----|--------|
${aeoAnalysis?.fixes?.slice(0, 6).map((f: string, i: number) => `| ${i < 2 ? '🔴 HIGH' : i < 4 ? '🟡 MEDIUM' : '🟢 LOW'} | ${f} | ${i < 2 ? 'Critical' : i < 4 ? 'Important' : 'Helpful'} |`).join('\n') || '| - | *No fixes needed* | - |'}

---

# Lead Capture & Response Analysis

## Current Lead Channels

| Channel | Visibility | Response Time | After-Hours | Risk |
|---------|------------|---------------|-------------|------|
${leadCaptureAnalysis?.channels?.slice(0, 5).map((ch: any) => `| ${ch.channel} | ${ch.visibility} | ${ch.responseExpectation} | ${ch.afterHoursCoverage} | ${ch.riskLevel === 'High' ? '🔴' : ch.riskLevel === 'Medium' ? '🟡' : '🟢'} ${ch.riskLevel} |`).join('\n') || '| *No channels analyzed* | - | - | - | - |'}

### AI Voice Opportunities

${leadCaptureAnalysis?.aiVoiceOpportunities?.slice(0, 4).map((o: string) => `- 🤖 ${o}`).join('\n') || '- *No opportunities identified*'}

### Conversation AI Opportunities

${leadCaptureAnalysis?.conversationAIOpportunities?.slice(0, 4).map((o: string) => `- 💬 ${o}`).join('\n') || '- *No opportunities identified*'}

---

# Revenue Recapture Summary

${revenueRecapture?.estimatedMonthlyRecovery ? `
## 💰 Estimated Monthly Revenue Recovery: $${revenueRecapture.estimatedMonthlyRecovery.toLocaleString()}

*Based on your current gaps and industry benchmarks*
` : ''}

## Revenue Opportunity Breakdown

| Area | Key Issue | Impact | Revenue Upside |
|------|-----------|--------|----------------|
${revenueRecapture?.opportunities?.slice(0, 5).map((opp: any) => `| ${opp.area} | ${opp.keyIssue} | ${opp.impactLevel === 'High' ? '🔴' : opp.impactLevel === 'Medium' ? '🟡' : '🟢'} ${opp.impactLevel} | ${opp.revenueUpside} |`).join('\n') || '| *No opportunities identified* | - | - | - |'}

---

# Recommended Implementation Plan

${recommendedPlan?.planName ? `## ${recommendedPlan.planName}` : ''}

## Implementation Pillars

${recommendedPlan?.pillars?.slice(0, 4).map((p: any) => `
### ${p.pillarName || p.title || 'Pillar'}

${p.tactics?.map((t: string) => `- ${t}`).join('\n') || p.description || '*No tactics defined*'}
`).join('\n') || '*No pillars defined*'}

## Implementation Roadmap

${Array.isArray(recommendedPlan?.roadmap) ? recommendedPlan.roadmap.slice(0, 3).map((phase: any) => `
### ${phase.phaseName || phase.title || 'Phase'} ${phase.timeline ? `(${phase.timeline})` : ''}

**Focus Areas:**
${phase.focusAreas?.map((f: string) => `- ${f}`).join('\n') || phase.items?.map((i: string) => `- ${i}`).join('\n') || '- *Not specified*'}

**Expected Outcomes:**
${phase.expectedOutcomes?.map((o: string) => `- ${o}`).join('\n') || '- *To be determined*'}
`).join('\n') : '*No roadmap defined*'}

---

# Next Steps

## Ready to Dominate Your Local Market?

Let's turn these insights into revenue for **${businessName}**

### Your Action Plan

1. **This Week:** Review your key findings and identify the highest-impact opportunity
2. **Next Week:** Schedule a strategy call to build your custom implementation plan
3. **Month 1:** Begin implementing GBP optimizations and review generation
4. **Month 2-3:** Launch content strategy and competitive positioning
5. **Month 4-6:** Scale what's working, optimize for maximum ROI

---

## Schedule Your Strategy Call

Get a custom implementation plan tailored to your business

**📞 eighty5labs.com/schedule**

---

*This report was generated on ${today} by eighty5labs Local Authority Snapshot*

**eighty5labs** | Agentic Marketing Infrastructure

*Your marketing runs itself. Your revenue doesn't sleep.*

© ${new Date().getFullYear()} eighty5labs. All rights reserved.
`;
}
