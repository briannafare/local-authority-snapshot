import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Audits table - stores business information and audit metadata
 */
export const audits = mysqlTable("audits", {
  id: int("id").autoincrement().primaryKey(),
  // Business basics
  businessName: varchar("businessName", { length: 255 }).notNull(),
  websiteUrl: varchar("websiteUrl", { length: 512 }).notNull(),
  gbpUrl: varchar("gbpUrl", { length: 512 }),
  primaryLocation: varchar("primaryLocation", { length: 255 }).notNull(),
  primaryNiche: varchar("primaryNiche", { length: 100 }).notNull(),
  nicheDescription: text("nicheDescription"),
  
  // Current marketing operations (stored as JSON)
  leadSources: text("leadSources"), // JSON array
  runsPaidAds: varchar("runsPaidAds", { length: 20 }),
  hasLocalListing: varchar("hasLocalListing", { length: 20 }),
  activeOnSocial: varchar("activeOnSocial", { length: 20 }),
  usesAutomation: varchar("usesAutomation", { length: 20 }),
  hasCallCoverage: varchar("hasCallCoverage", { length: 20 }),
  monthlyVisitors: int("monthlyVisitors"),
  monthlyLeads: int("monthlyLeads"),
  avgRevenuePerClient: int("avgRevenuePerClient"),
  
  // Goals and pain points
  businessGoals: text("businessGoals"), // JSON array
  painPoints: text("painPoints"), // JSON array
  
  // Audit results (stored as JSON for flexibility)
  gbpAuditResults: text("gbpAuditResults"), // JSON object
  seoAuditResults: text("seoAuditResults"), // JSON object
  competitiveResults: text("competitiveResults"), // JSON object
  aeoResults: text("aeoResults"), // JSON object
  leadCaptureResults: text("leadCaptureResults"), // JSON object
  followUpResults: text("followUpResults"), // JSON object
  
  // Generated content
  executiveSummary: text("executiveSummary"),
  keyFindings: text("keyFindings"), // JSON array
  recommendations: text("recommendations"), // JSON object
  
  // Status and metadata
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  emailSent: varchar("emailSent", { length: 255 }),

  // Overall scores for teaser/full report system
  overallGrade: mysqlEnum("overallGrade", ["A", "B", "C", "D", "F"]),
  overallScore: int("overallScore"),
  fullReportUnlocked: int("fullReportUnlocked").default(0), // 0 = teaser only, 1 = full unlocked

  // GeoGrid data (stored as JSON)
  geoGridData: text("geoGridData"),

  // Deep competitor analysis (stored as JSON)
  deepCompetitorAnalysis: text("deepCompetitorAnalysis"),

  // Go High Level integration
  ghlContactId: varchar("ghlContactId", { length: 100 }),
  ghlWorkflowTriggered: int("ghlWorkflowTriggered").default(0),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = typeof audits.$inferInsert;

/**
 * Audit visuals table - stores generated charts and infographics
 */
export const auditVisuals = mysqlTable("auditVisuals", {
  id: int("id").autoincrement().primaryKey(),
  auditId: int("auditId").notNull(),
  visualType: varchar("visualType", { length: 100 }).notNull(), // e.g., "gbp_score_chart", "seo_metrics_card"
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditVisual = typeof auditVisuals.$inferSelect;
export type InsertAuditVisual = typeof auditVisuals.$inferInsert;