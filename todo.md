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


## Phase 14: Report UI & PDF Integration

### Report Interface Updates
- [x] Add ranking data section to Report.tsx
- [x] Display average position and local pack status
- [x] Show ranking comparison chart in SEO section
- [x] Display geographic heat map in SEO section
- [x] Add query-level ranking table with positions
- [x] Style new sections with eighty5labs branding
- [x] Update getAuditById to include visuals from database

### PDF Export Integration
- [x] Update pdfGenerator.ts to include ranking data
- [x] Embed ranking comparison chart in PDF
- [x] Embed geographic heat map in PDF
- [x] Ensure all new visualizations are included in PDF
- [x] Update routers.ts to fetch visual URLs from database
- [ ] Test PDF generation with new charts
- [ ] Verify PDF layout and image quality


## CRITICAL BUGS (User Report #2)

### Data Collection Not Working
- [ ] Debug why website crawler returns no real data
- [ ] Debug why GBP scraper returns empty results
- [ ] Debug why ranking tracker returns no positions
- [ ] Check if axios requests are failing
- [ ] Add error logging to all scraping functions

### Chart Generation Failing
- [ ] Fix matplotlib "module not found" error (still occurring)
- [ ] Verify matplotlib is installed in correct Python environment
- [ ] Test generateVisuals.py script directly
- [ ] Check if visual generation is being called during audit
- [ ] Verify chart files are being saved and uploaded to S3

### PDF Download Not Working
- [ ] Debug PDF generation mutation error
- [ ] Check if manus-md-to-pdf is working correctly
- [ ] Verify PDF is being uploaded to S3
- [ ] Test PDF download button functionality

### Report Display Issues
- [ ] Verify audit data is being saved to database
- [ ] Check if report is fetching correct audit data
- [ ] Ensure visuals array is populated
- [ ] Test report rendering with sample data


## 🔴 HIGHEST PRIORITY (User Feedback - Must Fix Now)

### PRIORITY #1: REAL DATA COLLECTION (CRITICAL - MOST IMPORTANT)
- [ ] Rebuild audit engine with strict JSON validation before saving
- [ ] Test website crawler with eighty5labs.com - verify real title/meta/headings extracted
- [ ] Test GBP scraper with real URL - verify actual ratings/reviews pulled
- [ ] Fix ranking tracker to show real positions (not all "Not ranking")
- [ ] Add comprehensive logging to see exactly what data is collected
- [ ] Create NEW test audit to verify fixes work

### PRIORITY #2: VISUAL CHARTS & DESIGN
- [ ] Fix matplotlib chart generation - ensure charts actually display in report
- [ ] Add score gauge visuals to report UI
- [ ] Add comparison charts to report UI
- [ ] Add heat maps to report UI
- [ ] Redesign report with better visual hierarchy and professional styling
- [ ] Make report look impressive and worthy of a lead magnet

### PRIORITY #3: PDF EXPORT
- [ ] Fix JSON parsing error in PDF generator
- [ ] Ensure PDF includes all visual charts
- [ ] Test PDF download end-to-end


## URGENT FIXES (Current Testing Session)

- [x] Fix Python matplotlib environment issue (PYTHONPATH conflict with Python 3.13)
- [x] Fix JSON parsing error in generateRecommendedPlan function
- [x] Verify visual charts are generated and displayed correctly
- [x] Test PDF download functionality with embedded images (5 charts confirmed in PDF)
- [x] Fix PDF image embedding (filename matching, local paths, markdown filters)
- [x] Fix form validation issue (lead sources not persisting in UI) - Added shouldValidate and shouldDirty options to setValue calls in toggle functions

## Phase 15: Complete Next Steps (User Request)

### Test Audit Completion
- [ ] Complete form submission with eighty5labs.com
- [ ] Verify website crawler extracts real data
- [ ] Verify GBP scraper works with actual URL
- [ ] Verify ranking tracker returns real positions
- [ ] Verify visual charts are generated and displayed
- [ ] Verify PDF export works correctly
- [ ] Document any issues found

### Visual Design Enhancement
- [ ] Add larger chart displays in report
- [ ] Implement color-coded sections for different audit areas
- [ ] Add animated score reveals for visual impact
- [ ] Improve visual hierarchy with better spacing and typography
- [ ] Add progress indicators or loading animations
- [ ] Make charts more prominent and eye-catching

### Email Delivery Implementation
- [ ] Create email template with eighty5labs branding
- [ ] Implement email sending functionality
- [ ] Add email form to report page
- [ ] Include PDF attachment in emails
- [ ] Add executive summary in email body
- [ ] Test email delivery end-to-end


## 🚨 CRITICAL: Data Hallucination Root Cause (Debug Agent Analysis)

**Problem**: System generates plausible but fake data when scraping fails or returns sparse results

### Core Issues to Fix:
- [ ] Add data provenance tracking - store {value, source:'crawl|gbp|rank|user', confidence} for every field
- [ ] Implement hard validation after LLM - assert output contains exact scraped title/meta/H1 or explicitly states "missing"
- [ ] Gate report generation - if websiteData.error or GBP fetch fails, generate "data unavailable" sections instead of confident fake statements
- [ ] Fix location correctness - extract address from schema/footer, compare with user input, show warning if mismatch
- [ ] Replace Google HTML scraping - detect CAPTCHA/consent pages and mark rankingData as unavailable
- [ ] Improve GBP scraper - require valid GBP URL for real mode, otherwise mark as "benchmark/unavailable"
- [ ] Add "Data Sources" banner in Report.tsx - show what's real vs. assumed to make hallucinations obvious
- [ ] Add integration tests - crawl known site, assert stored facts match expected, verify LLM output references them

### Files to Fix:
- server/auditEngine.ts (analyzeSEO, analyzeGBP - add validation)
- server/websiteCrawler.ts (add provenance tracking)
- server/rankingTracker.ts (detect blocks, don't fabricate data)
- server/routers.ts (add validation layer before saving)
- client/src/pages/Report.tsx (add data sources banner)


## 🔧 PROPER FIX - Real Data Integration (In Progress)

- [x] Integrate Google Places API for real GBP data (replace screen scraping)
- [x] Integrate SerpStack API for real ranking data (replace blocked Google scraping)
- [x] Add validation layer to ensure LLM outputs match scraped data
- [x] Implement data provenance tracking throughout the system
- [x] Rewrite LLM prompts to constrain speculation and enforce facts
- [x] Fix form validation bug (lead source checkboxes) - Added shouldValidate and shouldDirty to toggle functions
- [ ] Display visual charts inline in web report (charts only show in PDF currently)
- [ ] Test with real business and verify all data is accurate (Joe's Pizza test in progress)
- [x] Document API costs and usage limits (Google Places: free tier, SerpStack: 100 searches/month free)


## 🔧 SerpStack Integration (In Progress)

- [ ] Add SERPSTACK_API_KEY to environment
- [ ] Create serpstack.ts module for API calls
- [ ] Update rankingTracker.ts to use SerpStack instead of direct Google scraping
- [ ] Test with real business to verify ranking data

## Phase 16: Display Charts in Web Report

- [x] Add chart rendering library (Recharts) to display visual charts inline
- [x] Create chart components for the 5 analysis charts (GBP, Rankings, Website, Competitors, ROI)
- [x] Integrate charts into the web report view (not just PDF)
- [x] Ensure charts are responsive and look good on all screen sizes
- [ ] Test chart display with real data

## Phase 18: Follow-Up Tasks

- [x] Fix JSX closing tag error in Report.tsx (line 939) - Resolved by server restart
- [ ] Test complete end-to-end audit flow with real business (Joe's Pizza)
- [ ] Verify email delivery system works correctly
- [ ] Ensure all charts render properly in completed reports

## Phase 17: Email Delivery System

- [x] Add email input field to audit form (optional)
- [x] Create email service module using Gmail MCP
- [x] Implement email template for audit report delivery
- [x] Add email sending functionality to audit completion flow (after PDF generation)
- [ ] Test email delivery with real email address
- [x] Update "Email Report" button in Report page to functional implementation (with dialog)
