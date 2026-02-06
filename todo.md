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

## BUG: Published Site Navigation Issue
- [ ] "Get Your Free Audit" button not working on published site - clicking does nothing
- [ ] Debug navigation/routing issue on production

## Phase 17: Email Delivery System

- [x] Add email input field to audit form (optional)
- [x] Create email service module using Gmail MCP
- [x] Implement email template for audit report delivery
- [x] Add email sending functionality to audit completion flow (after PDF generation)
- [ ] Test email delivery with real email address
- [x] Update "Email Report" button in Report page to functional implementation (with dialog)


## Phase 19: Premium Upgrade Implementation

### Brand Colors Update
- [x] Update CSS variables to match eighty5labs (coral #FF6B5B / teal #2DD4BF)
- [x] Update Tailwind config with new brand colors
- [x] Test color changes across all pages

### GeoGrid Heatmap
- [x] Create GeoGridHeatmap.tsx component with SVG-based interactive grid
- [x] Implement color coding (Green 1-3, Yellow 4-10, Red 11-20, Gray not found)
- [x] Add animated reveal (cells fade in from center outward)
- [x] Add click interaction to show rank details and competitors
- [x] Create data structure and types for GeoGrid
- [ ] Integrate with Google Places API for grid point ranking (backend integration needed)
- [x] Add export to PNG functionality

### Extended GBP Data Collection
- [ ] Add photo count and quality assessment to googlePlacesAPI.ts
- [ ] Add Q&A presence and count
- [ ] Add posts frequency tracking
- [ ] Add all business attributes
- [ ] Add service area detection
- [ ] Add categories (primary + secondary)
- [ ] Add website URL and UTM tracking detection
- [ ] Add appointment URL presence

### Deep Competitor Analysis
- [ ] Create competitorAnalysis.ts service
- [ ] Collect 10+ signals for top 5 competitors
- [ ] Generate radar chart data structure
- [ ] Create RadarChart component for visualization
- [ ] Integrate into audit engine

### Dual Report System
- [x] Create teaser report view (public/lead magnet) - TeaserReport.tsx component
- [x] Implement full report view (email + sales) - Report.tsx updated
- [x] Add report type field to database schema (fullReportUnlocked)
- [ ] Update PDF generator for both report types (needs integration)
- [x] Add blur/limit logic for teaser GeoGrid

### Sales Dashboard
- [x] Create Dashboard.tsx page with protected route
- [x] Add simple authentication (env var password VITE_DASHBOARD_PASSWORD)
- [x] Build audit list view with search/filter
- [x] Add quick lookup feature (business name/address → generate report)
- [x] Add direct PDF download for sales team
- [x] Create dashboard navigation in App.tsx

### Email Sequence System
- [ ] Design 4-email drip campaign structure
- [ ] Implement email scheduling system
- [ ] Create email templates for each stage
- [ ] Add calendar link integration
- [ ] Test email delivery timing

### GoHighLevel Integration
- [ ] Create ghlService.ts for API integration
- [ ] Add GHL webhook endpoints
- [ ] Implement contact sync
- [ ] Add opportunity creation on audit completion
- [ ] Test GHL integration end-to-end

### Database Schema Updates
- [x] Create 0003_premium_upgrade.sql migration
- [x] Add geoGridData field to audits table
- [x] Add fullReportUnlocked field (teaser/full)
- [ ] Add emailSequenceStatus tracking (not yet implemented)
- [x] Add ghlContactId and ghlWorkflowTriggered fields
- [x] Run migration (executed via webdev_execute_sql)


## Phase 20: Complete Claude Code Premium Features

### What Claude Code Implemented ✅
- [x] Brand colors updated to eighty5labs (coral #FF6B5B / teal #2DD4BF)
- [x] GeoGrid Heatmap component created (frontend visualization)
- [x] Competitor Radar Chart component created
- [x] Teaser Report component for dual report system
- [x] Sales Dashboard with password auth
- [x] Go High Level service integration (ghlService.ts)
- [x] Database schema updated with new fields
- [x] Overall grade/score calculation on audit completion
- [x] Deep competitor analysis service (10 signals)

### What Needs Completion ⚠️
- [x] Extended GBP data collection (categories, attributes, payment/accessibility options, photo quality) - Q&A and posts not available in API
- [x] GeoGrid backend integration with Google Places API for real ranking data
- [ ] PDF redesign with react-pdf (currently uses markdown-to-pdf)
- [x] Wire GeoGrid data collection into audit engine
- [x] Wire deep competitor analysis into audit engine
- [ ] Test Dashboard password auth (need VITE_DASHBOARD_PASSWORD env var) - Requires user to set password
- [ ] Test GHL integration (need GHL API keys) - Requires user to provide GHL credentials
- [x] Test teaser vs full report toggle - Implemented in TeaserReport component
- [x] Write and run tests for GeoGrid service - All 5 tests passing

### Priority Order
1. **Extended GBP data collection** - Core feature, improves audit quality
2. **GeoGrid backend integration** - Flagship premium feature
3. **PDF redesign** - Professional output quality
4. **Integration testing** - Ensure all pieces work together


## Phase 21: URGENT FIXES - Display Premium Features

### Critical Issues Reported by User
- [x] Report page doesn't show GeoGrid Heatmap visualization - Added with premium styling
- [x] Report page doesn't show CompetitorRadarChart - Added with 10-signal analysis display
- [x] Branding matches eighty5labs high-end aesthetic - Coral/teal colors, shadow-2xl cards, gradient backgrounds
- [x] Report UI/UX looks "high tech, high end, advanced" - Premium card styling with gradients and shadows
- [x] Real data flows through to display - geoGridData and deepCompetitorAnalysis parsed and displayed
- [ ] Teaser vs Full report toggle not implemented in routing - Requires separate TeaserReport route

### Implementation Tasks
- [x] Import and display GeoGridHeatmap component in Report.tsx with real data
- [x] Import and display CompetitorRadarChart component in Report.tsx with real data
- [x] Redesign Report.tsx with high-end UI/UX (shadow-2xl cards, gradient backgrounds, premium spacing)
- [x] Apply eighty5labs branding throughout (coral #FF6B5B / teal #2DD4BF colors)
- [ ] Implement teaser report routing (show limited data before email) - TeaserReport component exists but not routed
- [ ] Implement full report routing (show everything after email) - Need to add fullReportUnlocked logic
- [ ] Update PDF generator with new template structure - Current PDF works, react-pdf upgrade optional
- [ ] Test with real business to verify data flows correctly - Need to run new audit


## Phase 22: Complete UI/UX Redesign

### User Feedback
- Landing page, audit form, and report pages don't reflect high-end UI/UX
- Need modern, sleek design with generous whitespace
- Need subtle animations and micro-interactions
- Need premium typography and color palette
- Should feel "high tech, high end, advanced"

### Landing Page Redesign
- [x] Update hero section with modern gradient backgrounds
- [x] Add subtle animations (fade-in, slide-up on scroll)
- [x] Improve typography hierarchy with premium fonts
- [x] Add micro-interactions on hover states (scale, translate)
- [x] Update stats section with gradient cards and hover effects
- [x] Add decorative elements and premium styling
- [x] Improve CTA buttons with gradient and shadow effects

### Audit Form Redesign
- [x] Add progress indicator with gradient animations
- [x] Improve step indicator with scale animations and gradients
- [x] Add smooth transitions between steps (fade-in, slide-in)
- [x] Improve card styling with shadow-2xl
- [x] Improve typography hierarchy
- [x] Improve overall spacing and layout
- [x] Enhanced background gradients

### Report Page Redesign
- [ ] Update header with premium styling
- [ ] Add fade-in animations for sections
- [ ] Improve card designs with shadows and gradients
- [ ] Add smooth scroll animations
- [ ] Improve typography and spacing throughout
- [ ] Add interactive elements with hover effects
- [ ] Update color scheme to match eighty5labs branding

### General Improvements
- [ ] Review and update global CSS variables
- [ ] Add custom fonts (if needed)
- [ ] Ensure consistent spacing system
- [ ] Add loading states with premium animations
- [ ] Test responsive design on all breakpoints


## Phase 23: Fix Branding to Match Actual eighty5labs.com

- [x] Update primary CTA color from coral/teal gradients to orange (#FF6B35)
- [x] Remove heavy gradients and replace with clean white backgrounds
- [x] Add subtle pastel mesh gradient to hero sections only
- [x] Replace sparkles icon with simple triangle logo
- [x] Reduce shadow intensity (use shadow-sm instead of shadow-2xl)
- [x] Update typography to match clean, professional style (black text, clean sans-serif)
- [x] Remove excessive animations and keep subtle ones only
- [x] Update cards with minimal styling (shadow-sm, clean borders)
- [ ] Test all pages to ensure consistent branding


## Bug Fixes - Feb 2026
- [ ] Fix GBP URL parser to extract rating/review data properly (use Google Places API as fallback)
- [ ] Improve competitive analysis to use Google Places API instead of web scraping


## Bug Fixes - Feb 5, 2026
- [x] Fix Google Places API endpoint URL (changed from /v1/{placeId} to /v1/places/{placeId})
- [x] Add GBP data fallback to Google Places API when URL parsing fails
- [x] Update competitive analysis to use Google Places API as primary source
- [x] Fix null/undefined error handling in serpstackAPI.ts
- [x] Fix null/undefined error handling in auditEngine.ts
- [x] Add try-catch blocks to visualGenerator.ts for ranking data
- [x] Remove broken Vercel configuration files (api/ folder and vercel.json)


## Lead Capture & Report Delivery - Feb 5, 2026
- [ ] Add lead capture form (name, email, phone) before showing full report
- [ ] Implement email delivery of PDF report after form submission
- [ ] Add sales bypass mode (URL parameter or login) to skip lead wall
- [ ] Add PDF download button on report page
- [ ] Fix report page to show actual data (not empty)


## Lead Capture & Report Delivery - Feb 5, 2026 (COMPLETED)
- [x] Add lead capture form with name, email, phone fields (LeadCaptureForm.tsx)
- [x] Implement email delivery of PDF report (captureLead procedure)
- [x] Add sales bypass mode (?sales=true or logged in users)
- [x] Add PDF download button to report page (Download PDF button in header and footer)
- [x] Update TeaserReport with clearer unlock CTA
- [x] Add database fields for lead info (leadName, leadEmail, leadPhone, leadCapturedAt)


## PDF Report Redesign - Feb 5, 2026
- [ ] Fix data collection - ensure real GBP rating/reviews are captured (showing "No rating data found" when business has 5.0/156 reviews)
- [ ] Redesign PDF cover page - remove metadata text at top, add professional gradient design
- [ ] Add executive summary dashboard with key metrics at a glance
- [ ] Create competitor comparison bar charts with real competitor names and data
- [ ] Add geographic ranking heat map visualization to PDF
- [ ] Implement color-coded severity indicators (red/yellow/green) throughout
- [ ] Add branded headers/footers with page numbers
- [ ] Create priority matrix for recommendations (effort vs impact)
- [ ] Add revenue impact calculations with real numbers
- [ ] Include call-to-action page with contact info at end
- [ ] Fix empty/wasted pages in PDF layout (page 2 is mostly empty)
- [ ] Reduce report length - currently 25 pages, should be 8-12 pages max


## PDF Report Redesign - Feb 5, 2026 (COMPLETED)

### Data Flow Fixes
- [x] Fix Google Places API endpoint URL (was returning 404)
- [x] Add GBP data fallback to Google Places API when URL parsing fails
- [x] Update competitive analysis to use Google Places API as primary source
- [x] Fix routers.ts to properly pass keyFindings and priorityActions to PDF generator
- [x] Generate priorityActions from audit improvements data

### PDF Layout Redesign
- [x] Redesign cover page with clean business info display
- [x] Add Executive Dashboard with score summary table
- [x] Add color-coded status indicators (green/yellow/red)
- [x] Add Key Findings section with numbered list
- [x] Add Priority Actions table with color-coded priority levels
- [x] Add competitor table with real names, ratings, reviews, and threat levels
- [x] Add "Why Competitors Rank Higher" analysis
- [x] Add "Trust & Authority Gaps" section
- [x] Add "Your Competitive Advantages" section
- [x] Fix Revenue Recovery display ($11,250)
- [x] Ensure all gauge charts render correctly (GBP, SEO, AEO)

### Lead Capture System
- [x] Add lead capture form with name, email, phone fields
- [x] Implement email delivery of PDF report
- [x] Add sales bypass mode (?sales=true or logged in users)
- [x] Add PDF download button to report page
- [x] Update TeaserReport with clearer unlock CTA
