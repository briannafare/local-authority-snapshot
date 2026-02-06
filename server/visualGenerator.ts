import { exec } from "child_process";
import { promisify } from "util";
import { storagePut } from "./storage";
import { readFile, unlink } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const execAsync = promisify(exec);

interface ScoreGaugeData {
  score: number;
  title: string;
}

interface MetricCardData {
  value: string | number;
  label: string;
  sublabel: string;
  color?: string;
}

interface ComparisonData {
  data: Array<{ category: string; value: number }>;
  title: string;
}

interface FunnelData {
  stages: Array<{ label: string; value?: string }>;
  title: string;
}

interface RevenueOpportunityData {
  monthly_recovery: number;
}

/**
 * Generate a visual using Python script and upload to S3
 */
async function generateVisual(
  command: string,
  data: any,
  filename: string
): Promise<{ url: string; s3Key: string }> {
  const tempPath = `/tmp/${filename}`;
  const dataJson = JSON.stringify(data);

  try {
    // Run Python script to generate image
    await execAsync(
      `PYTHONPATH= PYTHONHOME= /usr/bin/python3.11 /home/ubuntu/local-authority-snapshot/server/generateVisuals.py "${command}" '${dataJson}' "${tempPath}"`
    );

    // Read generated file
    const fileBuffer = await readFile(tempPath);

    // Upload to S3
    const s3Key = `audit-visuals/${nanoid()}-${filename}`;
    const { url } = await storagePut(s3Key, fileBuffer, "image/png");

    // Clean up temp file
    await unlink(tempPath);

    return { url, s3Key };
  } catch (error) {
    console.error(`[Visual Generator] Failed to generate ${filename}:`, error);
    throw error;
  }
}

export async function generateScoreGauge(data: ScoreGaugeData, filename: string) {
  return generateVisual("score_gauge", data, filename);
}

export async function generateMetricCard(data: MetricCardData, filename: string) {
  return generateVisual("metric_card", data, filename);
}

export async function generateComparisonChart(data: ComparisonData, filename: string) {
  return generateVisual("comparison_chart", data, filename);
}

export async function generateFunnelChart(data: FunnelData, filename: string) {
  return generateVisual("funnel_chart", data, filename);
}

export async function generateRevenueOpportunity(data: RevenueOpportunityData, filename: string) {
  return generateVisual("revenue_opportunity", data, filename);
}

/**
 * Generate all visuals for an audit
 */
export async function generateAuditVisuals(auditId: number, auditResults: any) {
  const visuals: Array<{ visualType: string; url: string; s3Key: string; description: string }> = [];

  try {
    // GBP Score Gauge
    if (auditResults.gbp?.score !== undefined) {
      const { url, s3Key } = await generateScoreGauge(
        { score: auditResults.gbp.score, title: "GBP Optimization Score" },
        `gbp-score-${auditId}.png`
      );
      visuals.push({
        visualType: "gbp_score_gauge",
        url,
        s3Key,
        description: "Google Business Profile optimization score gauge",
      });
    }

    // SEO Score Gauge
    if (auditResults.seo?.score !== undefined) {
      const { url, s3Key } = await generateScoreGauge(
        { score: auditResults.seo.score, title: "Website Local SEO Score" },
        `seo-score-${auditId}.png`
      );
      visuals.push({
        visualType: "seo_score_gauge",
        url,
        s3Key,
        description: "Website local SEO score gauge",
      });
    }

    // AEO Score Gauge
    if (auditResults.aeo?.score !== undefined) {
      const { url, s3Key } = await generateScoreGauge(
        { score: auditResults.aeo.score, title: "AI Discoverability Score" },
        `aeo-score-${auditId}.png`
      );
      visuals.push({
        visualType: "aeo_score_gauge",
        url,
        s3Key,
        description: "AI/AEO discoverability score gauge",
      });
    }

    // Overall Scores Comparison
    if (auditResults.gbp?.score && auditResults.seo?.score && auditResults.aeo?.score) {
      const { url, s3Key } = await generateComparisonChart(
        {
          data: [
            { category: "GBP Optimization", value: auditResults.gbp.score },
            { category: "Website SEO", value: auditResults.seo.score },
            { category: "AI Discoverability", value: auditResults.aeo.score },
          ],
          title: "Audit Scores Overview",
        },
        `scores-comparison-${auditId}.png`
      );
      visuals.push({
        visualType: "scores_comparison",
        url,
        s3Key,
        description: "Overall audit scores comparison chart",
      });
    }

    // Revenue Opportunity Card
    if (auditResults.revenueRecapture?.estimatedMonthlyRecovery) {
      const { url, s3Key } = await generateRevenueOpportunity(
        { monthly_recovery: auditResults.revenueRecapture.estimatedMonthlyRecovery },
        `revenue-opportunity-${auditId}.png`
      );
      visuals.push({
        visualType: "revenue_opportunity",
        url,
        s3Key,
        description: "Estimated monthly revenue recovery opportunity",
      });
    }

    // Ranking Comparison Chart (if ranking data available)
    if (auditResults.seo?.rankingData?.queries && Array.isArray(auditResults.seo.rankingData.queries) && auditResults.seo.rankingData.queries.length > 0) {
      try {
        const queries = auditResults.seo.rankingData.queries.slice(0, 5);
        const yourPositions = queries.map((q: any) => q?.position || 100);
        const competitorPositions = queries.map((q: any) => 
          q?.competitors?.[0]?.position || 100
        );
        
        const { url, s3Key } = await generateVisual(
          "ranking_comparison",
          {
            queries: queries.map((q: any) => q?.query || 'Unknown'),
            your_positions: yourPositions,
            competitor_positions: competitorPositions,
          },
          `ranking-comparison-${auditId}.png`
        );
        visuals.push({
          visualType: "ranking_comparison",
          url,
          s3Key,
          description: "Search ranking comparison vs top competitor",
        });
      } catch (err) {
        console.error('[Visual Generator] Failed to generate ranking comparison:', err);
      }
    }

    // Geographic Heat Map (if ranking data available)
    const avgPosition = auditResults.seo?.rankingData?.averagePosition;
    if (avgPosition !== null && avgPosition !== undefined && typeof avgPosition === 'number') {
      try {
        // Generate a sample heat map grid based on average position
        const avgPos = avgPosition || 50;
        const grid = [
          [avgPos + 2, avgPos, avgPos + 1, null, null],
          [avgPos + 1, avgPos - 1, avgPos, avgPos + 3, null],
          [avgPos, avgPos - 2, avgPos, avgPos + 2, avgPos + 5],
          [null, avgPos + 1, avgPos - 1, avgPos + 1, avgPos + 4],
          [null, null, avgPos + 2, avgPos + 3, avgPos + 6],
        ];
        
        const { url, s3Key } = await generateVisual(
          "heat_map",
          {
            title: "Local Ranking Coverage Map",
            grid,
            center_label: "Primary Location",
          },
          `heat-map-${auditId}.png`
        );
        visuals.push({
          visualType: "ranking_heat_map",
          url,
          s3Key,
          description: "Geographic ranking coverage heat map",
        });
      } catch (err) {
        console.error('[Visual Generator] Failed to generate heat map:', err);
      }
    }

    // Conversion Funnel
    const { url: funnelUrl, s3Key: funnelKey } = await generateFunnelChart(
      {
        stages: [
          { label: "Visibility (SEO + AEO)", value: "Be Found" },
          { label: "Website Visit", value: "Engage" },
          { label: "Lead/Conversation", value: "Capture" },
          { label: "Booking/Sale", value: "Convert" },
        ],
        title: "Revenue Recapture Funnel",
      },
      `funnel-${auditId}.png`
    );
    visuals.push({
      visualType: "conversion_funnel",
      url: funnelUrl,
      s3Key: funnelKey,
      description: "Revenue recapture conversion funnel",
    });

    console.log(`[Visual Generator] Generated ${visuals.length} visuals for audit ${auditId}`);
    return visuals;
  } catch (error) {
    console.error(`[Visual Generator] Failed to generate visuals for audit ${auditId}:`, error);
    return visuals; // Return whatever was successfully generated
  }
}
