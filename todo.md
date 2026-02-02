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


## Phase 11: Real Data Analysis Enhancement
- [x] Implement website crawler to extract real HTML content
- [x] Extract actual title tags, meta descriptions, H1-H6 headings
- [x] Detect and parse schema.org structured data (LocalBusiness, FAQ, Review, etc.)
- [x] Analyze page speed and mobile usability signals
- [x] Extract NAP (Name, Address, Phone) from website
- [x] Analyze internal linking structure
- [x] Detect CTA placement and contact methods
- [x] Scrape Google Business Profile data (reviews, ratings, photos, posts, Q&A)
- [x] Search for actual competitors in the area
- [x] Analyze competitor GBP listings and websites
- [x] Update all audit engines to use real data first, industry benchmarks as fallback
- [x] Add clear data source labels throughout reports ("Your Data" vs "Industry Benchmark")

## Phase 12: Professional PDF Export
- [x] Design PDF layout with eighty5labs branding
- [x] Include all report sections in PDF (executive summary, audit sections, recommendations)
- [x] Embed generated charts and infographics in PDF
- [x] Add table of contents and page numbers
- [x] Implement PDF generation using manus-md-to-pdf utility
- [x] Add download button to report page
- [x] Test PDF generation with sample reports (all tests passing)
- [x] Ensure PDF is print-friendly and professional


## CRITICAL FIXES (User Reported Issues)

### Data Accuracy Issues
- [x] Fix GBP scraping - added GBP URL field to extract real data
- [x] Fix website crawler - enhanced chat widget detection with 10+ platforms and script checking
- [ ] Add real search ranking data - show actual positions for key queries
- [ ] Remove "unknown" and "unclear" placeholders - only show real data or clearly marked industry benchmarks
- [x] Add debugging/logging to see why scraping is failing

### PDF Generation
- [x] Fix PDF download error - manus-md-to-pdf utility working
- [ ] Test PDF generation end-to-end with real audit data

### Visual Enhancements
- [x] Install matplotlib and fix chart generation
- [ ] Add heat maps showing local ranking by geographic area
- [ ] Add ranking comparison charts (your position vs competitors)
- [x] Add score visualization gauges for each audit section (implemented in generateVisuals.py)
- [ ] Add competitive landscape visual (who ranks where for key terms)
- [ ] Add funnel visualization showing lead capture drop-off points

### Testing
- [ ] Test with eighty5labs.com actual data
- [ ] Verify all scraped data matches reality
- [ ] Ensure no generic/placeholder content in final reports


## Phase 13: Ranking Tracker & Advanced Visualizations

### Ranking Tracker Integration
- [x] Research and select ranking API (using custom Google Search scraping)
- [x] Implement ranking tracker module to fetch real search positions
- [x] Track positions for key queries: "[service] near me", "[service] in [city]", "[business name]"
- [x] Extract local pack rankings and organic positions
- [x] Analyze ranking data and generate insights

### Visual Comparison Charts
- [x] Create competitor comparison bar chart (ratings, reviews, GBP completeness)
- [x] Create ranking position comparison chart (your position vs top 3 competitors)
- [x] Add charts to Python generateVisuals.py script
- [x] Test chart generation with sample data

### Geographic Heat Maps
- [x] Design heat map showing ranking coverage by area
- [x] Implement grid-based heat map visualization
- [x] Generate heat map visualization with matplotlib
- [x] Show strong areas (green), weak areas (red), no ranking (gray)
- [x] Test heat map generation

### Integration
- [x] Add ranking tracker to SEO audit engine
- [x] Generate comparison charts during audit
- [x] Generate heat maps during audit
- [ ] Display ranking data in report interface
- [ ] Display comparison charts in report interface
- [ ] Display heat map in report interface
- [ ] Update PDF generator to include new visualizations
- [ ] Test all visualizations with real data
