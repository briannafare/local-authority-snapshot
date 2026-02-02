import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generatePDF } from "./pdfGenerator";
import { z } from "zod";
import { getDb, getAuditById } from "./db";
import { audits } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  audits: router({
    generatePDF: publicProcedure
      .input(z.object({ auditId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get audit data
        const audit = await getAuditById(input.auditId);
        if (!audit) throw new Error("Audit not found");

        // Safe JSON parsing helper
        const safeJsonParse = (str: string | null, fallback: any = {}) => {
          if (!str) return fallback;
          try {
            return JSON.parse(str);
          } catch (error) {
            console.error('JSON parse error:', error);
            return fallback;
          }
        };

        // Parse JSON fields safely
        const gbpAudit = safeJsonParse(audit.gbpAuditResults);
        const seoAudit = safeJsonParse(audit.seoAuditResults);
        const competitiveAnalysis = safeJsonParse(audit.competitiveResults);
        const aeoAnalysis = safeJsonParse(audit.aeoResults);
        const leadCaptureAnalysis = safeJsonParse(audit.leadCaptureResults);
        const followUpAnalysis = safeJsonParse(audit.followUpResults);
        const executiveSummary = safeJsonParse(audit.executiveSummary);
        const recommendations = safeJsonParse(audit.recommendations);
        
        // Get visual URLs from audit_visuals table
        const visualUrls = (audit as any).visuals?.map((v: any) => v.imageUrl) || [];

        // Generate PDF
        const pdfUrl = await generatePDF({
          auditId: audit.id,
          businessName: audit.businessName,
          primaryLocation: audit.primaryLocation,
          primaryNiche: audit.primaryNiche,
          executiveSummary,
          gbpAudit,
          seoAudit,
          competitiveAnalysis,
          aeoAnalysis,
          leadCaptureAnalysis,
          followUpAnalysis,
          revenueRecapture: recommendations.revenueRecapture || {},
          recommendedPlan: recommendations.recommendedPlan || {},
          visualUrls,
        });

        // Update audit with PDF URL
        await db
          .update(audits)
          .set({ pdfUrl })
          .where(eq(audits.id, input.auditId));

        // Send email if user provided email address
        if (audit.emailSent) {
          const { sendAuditReportEmail } = await import("./emailService");
          const emailSent = await sendAuditReportEmail(
            audit.emailSent,
            audit.businessName,
            pdfUrl
          );
          
          if (emailSent) {
            console.log(`[Email] Audit report sent to ${audit.emailSent}`);
          } else {
            console.error(`[Email] Failed to send audit report to ${audit.emailSent}`);
          }
        }

        return { pdfUrl };
      }),

    create: publicProcedure
      .input(
        z.object({
          businessName: z.string(),
          websiteUrl: z.string(),
          gbpUrl: z.string().optional(),
          primaryLocation: z.string(),
          primaryNiche: z.string(),
          nicheDescription: z.string().optional(),
          leadSources: z.array(z.string()),
          runsPaidAds: z.string(),
          hasLocalListing: z.string(),
          activeOnSocial: z.string(),
          usesAutomation: z.string(),
          hasCallCoverage: z.string(),
          monthlyVisitors: z.number().optional(),
          monthlyLeads: z.number().optional(),
          avgRevenuePerClient: z.number().optional(),
          businessGoals: z.array(z.string()),
          painPoints: z.array(z.string()),
          email: z.string().email().optional().or(z.literal("")),
        })
      )
      .mutation(async ({ input }) => {
        const { createAudit, updateAudit } = await import("./db");
        const { runCompleteAudit } = await import("./auditEngine");
        
        const auditId = await createAudit({
          businessName: input.businessName,
          websiteUrl: input.websiteUrl,
          primaryLocation: input.primaryLocation,
          primaryNiche: input.primaryNiche,
          nicheDescription: input.nicheDescription || null,
          leadSources: JSON.stringify(input.leadSources),
          runsPaidAds: input.runsPaidAds,
          hasLocalListing: input.hasLocalListing,
          activeOnSocial: input.activeOnSocial,
          usesAutomation: input.usesAutomation,
          hasCallCoverage: input.hasCallCoverage,
          monthlyVisitors: input.monthlyVisitors || null,
          monthlyLeads: input.monthlyLeads || null,
          avgRevenuePerClient: input.avgRevenuePerClient || null,
          businessGoals: JSON.stringify(input.businessGoals),
          painPoints: JSON.stringify(input.painPoints),
          emailSent: input.email || null,
          status: "processing",
        });

        // Run audit analysis asynchronously (don't wait for completion)
        runCompleteAudit(input)
          .then(async (results) => {
            // Generate visuals
            const { generateAuditVisuals } = await import("./visualGenerator");
            const { createAuditVisual } = await import("./db");
            
            const visuals = await generateAuditVisuals(auditId, results);
            
            // Save visuals to database
            for (const visual of visuals) {
              await createAuditVisual({
                auditId,
                visualType: visual.visualType,
                imageUrl: visual.url,
                s3Key: visual.s3Key,
                description: visual.description,
              });
            }
            
            // Update audit with results
            await updateAudit(auditId, {
              gbpAuditResults: JSON.stringify(results.gbp),
              seoAuditResults: JSON.stringify(results.seo),
              competitiveResults: JSON.stringify(results.competitive),
              aeoResults: JSON.stringify(results.aeo),
              leadCaptureResults: JSON.stringify(results.leadCapture),
              followUpResults: JSON.stringify(results.followUp),
              executiveSummary: results.executiveSummary.summary,
              keyFindings: JSON.stringify(results.executiveSummary.keyFindings),
              recommendations: JSON.stringify({
                revenueRecapture: results.revenueRecapture,
                recommendedPlan: results.recommendedPlan,
              }),
              status: "completed",
            });
          })
          .catch(async (error) => {
            console.error("[Audit] Failed to complete audit:", error);
            await updateAudit(auditId, { status: "failed" });
          });

        return { auditId };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getAuditById } = await import("./db");
        return await getAuditById(input.id);
      }),
    
    sendEmail: publicProcedure
      .input(
        z.object({
          auditId: z.number(),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        const { getAuditById } = await import("./db");
        const { sendAuditReportEmail } = await import("./emailService");
        
        const audit = await getAuditById(input.auditId);
        
        if (!audit) {
          throw new Error("Audit not found");
        }
        
        if (!audit.pdfUrl) {
          throw new Error("PDF not yet generated");
        }
        
        const success = await sendAuditReportEmail(
          input.email,
          audit.businessName,
          audit.pdfUrl
        );
        
        if (!success) {
          throw new Error("Failed to send email");
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
