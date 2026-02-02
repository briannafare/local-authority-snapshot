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
      // Extract filename from URL to preserve visual type information
      const urlParts = url.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const localPath = join(tempDir, originalFilename);
      
      try {
        // Download image
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
          localVisualUrls.push(url); // Fallback to remote URL
        }
      } catch (error) {
        console.error(`[PDF Generator] Error downloading image ${url}:`, error);
        localVisualUrls.push(url); // Fallback to remote URL
      }
    }
    console.log(`[PDF Generator] Downloaded ${localVisualUrls.length} images, ${localVisualUrls.filter(u => u.startsWith('/')).length} local`);

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

/**
 * Generate markdown content for the PDF report
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
  } = input;

  return `---
title: Local Authority Snapshot
subtitle: Revenue Recapture Audit for ${businessName}
author: eighty5labs
date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
---

<div style="text-align: center; margin-top: 100px;">
  <h1 style="color: #FF6B35; font-size: 48px; margin-bottom: 20px;">Local Authority Snapshot</h1>
  <h2 style="color: #00A896; font-size: 32px; margin-bottom: 40px;">Revenue Recapture Audit</h2>
  <h3 style="font-size: 28px; margin-bottom: 20px;">${businessName}</h3>
  <p style="font-size: 18px; color: #666;">${primaryLocation}</p>
  <p style="font-size: 16px; color: #999; margin-top: 60px;">Prepared by eighty5labs</p>
  <p style="font-size: 14px; color: #999;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
</div>

<div style="page-break-after: always;"></div>

---

## Executive Summary

**Business:** ${businessName}  
**Industry:** ${primaryNiche}  
**Location:** ${primaryLocation}

### Visibility Scores

${visualUrls.filter(url => url.includes('-score-')).map(url => `
![Score Gauge](${url})
`).join('') || ''}

${visualUrls.filter(url => url.includes('scores-comparison')).map(url => `
![Scores Comparison](${url})
`).join('') || ''}

### Key Findings

${executiveSummary.keyFindings?.map((f: string) => `- ${f}`).join("\n") || ""}

### Overall Assessment

${executiveSummary.overallAssessment || ""}

### Priority Actions

${executiveSummary.priorityActions?.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n") || ""}

---

## 1. Google Business Profile Audit

**Optimization Score:** ${gbpAudit.score}/100

### Current Issues

${gbpAudit.issues?.map((issue: string) => `- ${issue}`).join("\n") || ""}

### Recommended Improvements

${gbpAudit.improvements?.map((imp: string) => `- ${imp}`).join("\n") || ""}

### Optimized Business Description

${gbpAudit.optimizedDescription || ""}

### Recommended Services

${gbpAudit.optimizedServices?.map((service: string) => `- ${service}`).join("\n") || ""}

### Example Google Post

> ${gbpAudit.examplePost || ""}

---

## 2. Website Local SEO Audit

**SEO Score:** ${seoAudit.score}/100

### Current Weaknesses

${seoAudit.weaknesses?.map((w: string) => `- ${w}`).join("\n") || ""}

### Recommended Improvements

${seoAudit.improvements?.map((imp: string) => `- ${imp}`).join("\n") || ""}

### Optimized Title Tag

\`\`\`
${seoAudit.optimizedTitleTag || ""}
\`\`\`

### Optimized Headings

${seoAudit.optimizedHeadings?.map((h: string) => `- ${h}`).join("\n") || ""}

### Recommended Schema Types

${seoAudit.recommendedSchemas?.map((s: string) => `- ${s}`).join("\n") || ""}

### Search Visibility Analysis

${seoAudit.queries?.map((q: any) => `
**Query:** "${q.query}"  
- Organic Presence: ${q.organicPresence}  
- Map Pack: ${q.mapPackPresence}  
- Competitors Above: ${q.competitorsAbove}  
- Data Type: ${q.dataType}
`).join("\n") || ""}

${seoAudit.rankingData ? `
### Real Search Ranking Data 🎯

**Average Position:** ${seoAudit.rankingData.averagePosition !== null ? `#${seoAudit.rankingData.averagePosition.toFixed(1)}` : 'Not ranking'}  
**Local Pack Presence:** ${seoAudit.rankingData.inLocalPack ? '✓ Yes' : '✗ No'}  
**Top Competitors:** ${seoAudit.rankingData.topCompetitors.length} identified

#### Position by Query

${seoAudit.rankingData.queries?.map((q: any) => `
**"${q.query}"**  
- Your Position: ${q.position ? `#${q.position}` : 'Not ranking'}  
${q.competitors && q.competitors.length > 0 ? `- Top Competitors: ${q.competitors.map((c: any) => `#${c.position}: ${c.businessName}`).join(', ')}` : ''}
`).join("\n") || ""}

### Visual Analytics

${visualUrls.filter(url => url.includes('ranking-comparison') || url.includes('heat-map')).map(url => `
![Ranking Analysis](${url})
`).join('\n') || ''}
` : ''}

---

## 3. Competitive Analysis

### Why Competitors Rank Higher

${competitiveAnalysis.reasonsCompetitorsRank?.map((r: string) => `- ${r}`).join("\n") || ""}

### Trust & Authority Gaps

${competitiveAnalysis.trustGaps?.map((g: string) => `- ${g}`).join("\n") || ""}

### Competitor Advantages

${competitiveAnalysis.competitorAdvantages?.map((a: string) => `- ${a}`).join("\n") || ""}

---

## 4. AI Discoverability (AEO) Analysis

**AI Discoverability Score:** ${aeoAnalysis.score}/100

### Why AI Would Recommend You

${aeoAnalysis.whyAIWouldRecommend || ""}

### Why AI Might Not Recommend You

${aeoAnalysis.whyAIWouldNot || ""}

### Fixes to Improve AI Visibility

${aeoAnalysis.fixes?.map((f: string) => `- ${f}`).join("\n") || ""}

### Example FAQ Content

${aeoAnalysis.exampleFAQ || ""}

### Optimized About Us

${aeoAnalysis.optimizedAboutUs || ""}

---

## 5. Lead Capture & Response Analysis

### Current Lead Channels

${leadCaptureAnalysis.channels?.map((ch: any) => `
**${ch.channel}**  
- Visibility: ${ch.visibility}  
- Response Expectation: ${ch.responseExpectation}  
- After-Hours Coverage: ${ch.afterHoursCoverage}  
- Risk Level: ${ch.riskLevel}  
- Data Type: ${ch.dataType}
`).join("\n") || ""}

### AI Voice Opportunities

${leadCaptureAnalysis.aiVoiceOpportunities?.map((o: string) => `- ${o}`).join("\n") || ""}

### Conversation AI Opportunities

${leadCaptureAnalysis.conversationAIOpportunities?.map((o: string) => `- ${o}`).join("\n") || ""}

---

## 6. Follow-Up & Nurture Systems

### Current State

${followUpAnalysis.currentState || ""}

### Opportunity State

${followUpAnalysis.opportunityState || ""}

### Automation Opportunities

${followUpAnalysis.automationOpportunities?.map((o: string) => `- ${o}`).join("\n") || ""}

### Reactivation Potential

${followUpAnalysis.reactivationPotential || ""}

---

## 7. Revenue Recapture Summary

${revenueRecapture.estimatedMonthlyRecovery ? `**Estimated Monthly Revenue Recovery:** $${revenueRecapture.estimatedMonthlyRecovery.toLocaleString()}` : ""}

### Revenue Opportunity Visualization

${visualUrls.filter(url => url.includes('revenue-opportunity') || url.includes('funnel')).map(url => `
![Revenue Analysis](${url})
`).join('\n') || ''}

### Opportunities

${revenueRecapture.opportunities?.map((opp: any) => `
**${opp.area}**  
- Key Issue: ${opp.keyIssue}  
- Impact Level: ${opp.impactLevel}  
- Data Type: ${opp.dataType}  
- Revenue Upside: ${opp.revenueUpside}
`).join("\n") || ""}

---

## 8. Recommended Plan: ${recommendedPlan.planName || ""}

### Implementation Pillars

${recommendedPlan.pillars?.map((p: any) => `
#### ${p.pillarName}

${p.tactics?.map((t: string) => `- ${t}`).join("\n") || ""}
`).join("\n") || ""}

### Implementation Roadmap

${Array.isArray(recommendedPlan.roadmap) ? recommendedPlan.roadmap.map((phase: any) => `
#### ${phase.phaseName} (${phase.timeline})

**Focus Areas:**
${phase.focusAreas?.map((f: string) => `- ${f}`).join("\n") || ""}

**Expected Outcomes:**
${phase.expectedOutcomes?.map((o: string) => `- ${o}`).join("\n") || ""}
`).join("\n") : ""}

### Investment Packages

${recommendedPlan.pricingPackages?.map((pkg: any) => `
#### ${pkg.packageName}

**Best For:** ${pkg.bestFor}

**What's Included:**
${pkg.includes?.map((i: string) => `- ${i}`).join("\n") || ""}

**Investment Range:** ${pkg.investmentRange}
`).join("\n") || ""}

---

## Next Steps

Ready to recapture lost revenue and dominate your local market?

**Schedule your strategy call:** [Contact eighty5labs](https://eighty5labs.com)

---

<div style="text-align: center; margin-top: 60px; padding: 40px; background-color: #f5f5f5; border-top: 4px solid #FF6B35;">
  <p style="font-size: 18px; font-weight: bold; color: #FF6B35;">eighty5labs</p>
  <p style="font-size: 14px; color: #666;">Stop losing revenue to faster systems.</p>
  <p style="font-size: 12px; color: #999; margin-top: 20px;">This report was generated by Local Authority Snapshot, a product of eighty5labs.</p>
</div>
`;
}
