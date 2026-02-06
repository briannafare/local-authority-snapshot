import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test business data - The Lindley Team
const testAuditInput = {
  businessName: "The Lindley Team",
  websiteUrl: "https://thelindleyteam.com",
  gbpUrl: "https://www.google.com/maps/place/The+Lindley+Team,+Mortgage+Lenders/@45.5152,-122.6784,17z",
  primaryLocation: "Portland, Oregon",
  primaryNiche: "Mortgage Lender",
  nicheDescription: "Home loans and mortgage services",
  leadSources: ["Website", "Google", "Referrals"],
  runsPaidAds: "no",
  hasLocalListing: "yes",
  activeOnSocial: "yes",
  usesAutomation: "no",
  hasCallCoverage: "yes",
  monthlyVisitors: 500,
  monthlyLeads: 20,
  avgRevenuePerClient: 3000,
  businessGoals: ["More leads", "Better rankings"],
  painPoints: ["Competition", "Visibility"]
};

async function runFullAuditTest() {
  console.log('='.repeat(60));
  console.log('FULL AUDIT TEST - The Lindley Team');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Create the audit via tRPC
    console.log('\n📝 Step 1: Creating audit...');
    const createResponse = await axios.post(`${BASE_URL}/api/trpc/audits.create`, {
      json: testAuditInput
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const auditId = createResponse.data?.result?.data?.json?.auditId || createResponse.data?.result?.data?.json?.id;
    console.log('✅ Audit created with ID:', auditId);
    
    if (!auditId) {
      console.error('❌ Failed to create audit - no ID returned');
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
      return;
    }
    
    // Step 2: Wait for audit to complete (poll status)
    console.log('\n⏳ Step 2: Waiting for audit to complete...');
    let audit = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      const statusResponse = await axios.get(`${BASE_URL}/api/trpc/audits.getById?input=${encodeURIComponent(JSON.stringify({ json: { id: auditId } }))}`);
      
      audit = statusResponse.data?.result?.data?.json;
      
      if (audit?.status === 'completed') {
        console.log('✅ Audit completed!');
        break;
      } else if (audit?.status === 'failed') {
        console.error('❌ Audit failed!');
        break;
      }
      
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      attempts++;
    }
    
    if (!audit || audit.status !== 'completed') {
      console.error('\n❌ Audit did not complete in time');
      return;
    }
    
    // Step 3: Analyze results
    console.log('\n📊 Step 3: Analyzing results...');
    console.log('-'.repeat(40));
    
    // Parse JSON fields
    const gbp = audit.gbpAuditResults ? JSON.parse(audit.gbpAuditResults) : null;
    const seo = audit.seoAuditResults ? JSON.parse(audit.seoAuditResults) : null;
    const competitive = audit.competitiveResults ? JSON.parse(audit.competitiveResults) : null;
    const aeo = audit.aeoResults ? JSON.parse(audit.aeoResults) : null;
    
    console.log('\n📈 SCORES:');
    console.log(`  Overall Grade: ${audit.overallGrade} (${audit.overallScore}/100)`);
    console.log(`  GBP Score: ${gbp?.score || 'N/A'}/100`);
    console.log(`  SEO Score: ${seo?.score || 'N/A'}/100`);
    console.log(`  AEO Score: ${aeo?.score || 'N/A'}/100`);
    
    console.log('\n🏢 GBP DATA:');
    if (gbp) {
      console.log(`  Data Source: ${gbp.dataSource || 'Unknown'}`);
      console.log(`  Issues Found: ${gbp.issues?.length || 0}`);
      console.log(`  Improvements: ${gbp.improvements?.length || 0}`);
      if (gbp.issues?.length > 0) {
        console.log('  Top Issues:');
        gbp.issues.slice(0, 3).forEach((issue, i) => console.log(`    ${i+1}. ${issue}`));
      }
    } else {
      console.log('  ❌ No GBP data');
    }
    
    console.log('\n🔍 SEO DATA:');
    if (seo) {
      console.log(`  Data Source: ${seo.dataSource || 'Unknown'}`);
      console.log(`  Weaknesses: ${seo.weaknesses?.length || 0}`);
      if (seo.rankingData) {
        console.log(`  Average Position: ${seo.rankingData.averagePosition || 'Not ranking'}`);
        console.log(`  In Local Pack: ${seo.rankingData.inLocalPack ? 'Yes' : 'No'}`);
        console.log(`  Top Competitors: ${seo.rankingData.topCompetitors?.length || 0}`);
      }
    } else {
      console.log('  ❌ No SEO data');
    }
    
    console.log('\n🏆 COMPETITIVE DATA:');
    if (competitive) {
      console.log(`  Reasons Competitors Rank: ${competitive.reasonsCompetitorsRank?.length || 0}`);
      console.log(`  Trust Gaps: ${competitive.trustGaps?.length || 0}`);
      console.log(`  Competitor Advantages: ${competitive.competitorAdvantages?.length || 0}`);
      if (competitive.reasonsCompetitorsRank?.length > 0) {
        console.log('  Top Reasons:');
        competitive.reasonsCompetitorsRank.slice(0, 3).forEach((r, i) => console.log(`    ${i+1}. ${r}`));
      }
    } else {
      console.log('  ❌ No competitive data');
    }
    
    console.log('\n🤖 AEO DATA:');
    if (aeo) {
      console.log(`  AI Discoverability Score: ${aeo.score}/100`);
      console.log(`  Fixes Recommended: ${aeo.fixes?.length || 0}`);
    } else {
      console.log('  ❌ No AEO data');
    }
    
    // Check visuals
    console.log('\n🖼️ VISUALS:');
    const visuals = audit.visuals || [];
    console.log(`  Total Visuals Generated: ${visuals.length}`);
    if (visuals.length > 0) {
      visuals.forEach(v => console.log(`    - ${v.visualType}: ${v.imageUrl ? '✅' : '❌'}`));
    }
    
    // Step 4: Test PDF generation
    console.log('\n📄 Step 4: Testing PDF generation...');
    try {
      const pdfResponse = await axios.post(`${BASE_URL}/api/trpc/audits.generatePDF`, {
        json: { auditId }
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000 // 2 minute timeout for PDF
      });
      
      const pdfUrl = pdfResponse.data?.result?.data?.json?.pdfUrl;
      if (pdfUrl) {
        console.log('✅ PDF generated successfully!');
        console.log(`  URL: ${pdfUrl}`);
      } else {
        console.log('❌ PDF generation returned no URL');
      }
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nView full report at: ${BASE_URL}/report/${auditId}?full=true`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

runFullAuditTest();
