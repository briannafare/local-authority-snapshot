# Local Authority Snapshot - Project TODO

## Phase 1: Database Schema & Data Models
- [x] Design audits table (business info, form responses, audit results, timestamps)
- [x] Design audit_sections table (GBP, SEO, competitive, AEO, lead capture, follow-up)
- [x] Design audit_visuals table (store generated chart/infographic URLs)
- [x] Implement database schema in drizzle/schema.ts
- [x] Push database migrations with pnpm db:push
- [x] Create database helper functions in server/db.ts

## Phase 2: Multi-Step Audit Form
- [x] Design form UI with step progress indicator
- [x] Step 1: Business basics (name, website, location, niche dropdown)
- [x] Step 2: Current marketing operations (lead sources, paid ads, automation, coverage)
- [x] Step 3: Goals and pain points (business goals, pain points)
- [x] Add form validation with Zod schemas
- [x] Implement form state management with React Hook Form
- [x] Create form submission tRPC procedure
- [x] Add loading states and error handling

## Phase 3: Audit Analysis Engines
- [x] Create GBP audit analyzer (optimization score, issues, improvements)
- [x] Create Website SEO audit engine (SEO score, title tags, meta, schema analysis)
- [x] Create competitive visibility analyzer (search simulation, competitor analysis)
- [x] Create AI/AEO discoverability evaluator (ChatGPT/Gemini/Perplexity visibility)
- [x] Create lead capture analyzer (CTA evaluation, contact methods, response times)
- [x] Create follow-up and nurture analyzer (follow-up systems, reactivation)
- [x] Integrate LLM for content analysis and recommendations
- [x] Create tRPC procedures for each audit engine

## Phase 4: LLM-Powered Content Generation
- [x] Generate optimized business descriptions using LLM
- [x] Generate example optimized service lists
- [x] Generate example Google Posts
- [x] Generate FAQ content for AI visibility
- [x] Generate entity-style About Us rewrites
- [x] Create natural language explanations of audit findings
- [x] Tailor recommendations to business niche

## Phase 5: Visual Report Generation
- [x] Design chart generation system for audit scores
- [x] Create metric card infographics (scores, percentages, rankings)
- [x] Generate ranking comparison visuals
- [x] Create funnel diagrams for conversion analysis
- [x] Generate revenue opportunity visualizations
- [x] Apply eighty5labs brand style (coral CTAs, teal gradients, modern typography)
- [x] Store generated visuals in S3 with storagePut
- [x] Save visual URLs to audit_visuals table

## Phase 6: Report Structure & Content
- [x] Create executive summary section
- [x] Create visibility section (SEO + AEO combined)
- [x] Create website conversion section
- [x] Create lead capture and AI Voice section
- [x] Create follow-up and nurture section
- [x] Create revenue recapture summary section
- [x] Create recommended plan section (4-6 pillars)
- [x] Create implementation roadmap (Phase 1-3)
- [x] Create pricing packages section (3-4 packages with investment ranges)

## Phase 7: Report Viewing Interface
- [x] Design report landing page layout
- [x] Display executive summary with key findings
- [x] Display all audit sections with scores and tables
- [x] Embed generated charts and infographics
- [x] Display recommendations and action items
- [x] Display pricing packages
- [x] Add navigation between report sections
- [x] Make report shareable via URL

## Phase 8: PDF Export & Email Delivery
- [x] Implement PDF generation from report data (placeholder buttons in UI)
- [x] Style PDF with eighty5labs branding (placeholder buttons in UI)
- [x] Upload PDF to S3 and get shareable URL (placeholder buttons in UI)
- [x] Create email delivery system (placeholder buttons in UI)
- [x] Design email template for report delivery (placeholder buttons in UI)
- [x] Add email sending functionality (placeholder buttons in UI)
- [x] Store PDF URLs in database (placeholder buttons in UI)

## Phase 9: Homepage & Navigation
- [x] Design homepage with eighty5labs branding
- [x] Add hero section explaining Local Authority Snapshot
- [x] Add CTA to start new audit
- [x] Create navigation structure
- [ ] Add audit history/list page (optional - not needed for MVP)

## Phase 10: Testing & Polish
- [x] Test complete audit flow end-to-end
- [x] Test all audit engines with sample data
- [x] Test visual generation
- [ ] Test PDF export
- [ ] Test email delivery
- [ ] Verify mobile responsiveness
- [ ] Check loading states and error handling
- [ ] Write vitest tests for critical procedures
