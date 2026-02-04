/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// GeoGrid Heatmap Types
export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  competitors: { name: string; rank: number }[];
  distance: string;
}

export interface GeoGridData {
  businessName: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
  gridSize: 5 | 7;
  radius: number;
  points: GeoGridPoint[][];
  averageRank: number;
  visibility: number;
}

// Extended GBP Data Types
export interface GBPExtendedData {
  // Basic info (existing)
  found: boolean;
  name?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
  websiteUrl?: string;
  openNow?: boolean;
  hours?: string[];

  // Extended data (new)
  photoCount?: number;
  photoQuality?: 'low' | 'medium' | 'high';
  qnaCount?: number;
  qnaPresence?: boolean;
  postFrequency?: number; // posts in last 30 days
  attributes?: string[];
  serviceArea?: string[];
  primaryCategory?: string;
  secondaryCategories?: string[];
  hasAppointmentUrl?: boolean;
  appointmentUrl?: string;
  hasUtmTracking?: boolean;
  yearsInBusiness?: number;

  // Calculated scores
  completenessScore?: number;
  engagementScore?: number;
}

// Deep Competitor Analysis Types
export interface CompetitorSignals {
  name: string;
  reviewCount: number;
  reviewRating: number;
  reviewVelocity: number; // reviews per month
  photoCount: number;
  gbpCompleteness: number;
  websiteSpeed?: number;
  yearsInBusiness?: number;
  responseRate: number;
  postFrequency: number;
  categoryMatchStrength: number;
}

export interface CompetitorAnalysisResult {
  business: CompetitorSignals;
  competitors: CompetitorSignals[];
  radarChartData: {
    metric: string;
    business: number;
    avgCompetitor: number;
    topCompetitor: number;
  }[];
  gaps: {
    metric: string;
    gap: number;
    recommendation: string;
  }[];
  overallScore: number;
  competitivePosition: 'leader' | 'competitive' | 'lagging' | 'critical';
}

// Report Types
export type ReportType = 'teaser' | 'full';

export interface TeaserReport {
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore: number;
  keyFindings: string[];
  geoGridPreview: GeoGridData; // blurred in UI
  competitorCount: number;
  businessName: string;
}

export interface FullReport extends TeaserReport {
  geoGridFull: GeoGridData;
  gbpAnalysis: GBPExtendedData;
  competitorBreakdown: CompetitorAnalysisResult;
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
  }[];
  roiProjection: {
    currentLeads: number;
    projectedLeads: number;
    currentRevenue: number;
    projectedRevenue: number;
    investmentRequired: number;
    paybackPeriod: string;
  };
  implementationRoadmap: {
    phase: number;
    title: string;
    duration: string;
    tasks: string[];
  }[];
}

// Go High Level Integration Types
export interface GHLContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessName: string;
  customFields?: Record<string, string>;
  tags?: string[];
}

export interface GHLWebhookPayload {
  contactId: string;
  auditId: number;
  reportUrl: string;
  overallGrade: string;
  overallScore: number;
  businessName: string;
  keyFindings: string[];
  timestamp: string;
}
