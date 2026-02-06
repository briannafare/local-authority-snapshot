// Test script to run a full audit and generate PDF
// Using native fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';

async function testPDFGeneration() {
  console.log('=== Testing PDF Generation with Redesigned Template ===\n');
  
  // Step 1: Create a new audit
  console.log('Step 1: Creating new audit for The Lindley Team...');
  
  const auditInput = {
    businessName: "The Lindley Team",
    websiteUrl: "https://thelindleyteam.com",
    gbpUrl: "https://www.google.com/maps/place/The+Lindley+Team,+Mortgage+Lenders/@45.5231,-122.6765",
    primaryLocation: "Portland, Oregon",
    primaryNiche: "Mortgage Lender",
    nicheDescription: "Home loans and mortgage services",
    leadSources: ["Google", "Referrals", "Website"],
    runsPaidAds: "yes",
    hasLocalListing: "yes",
    activeOnSocial: "yes",
    usesAutomation: "no",
    hasCallCoverage: "yes",
    monthlyVisitors: 2000,
    monthlyLeads: 50,
    avgRevenuePerClient: 3000,
    businessGoals: ["Increase leads", "Improve online visibility"],
    painPoints: ["Competition", "Lead quality"],
    email: ""
  };

  try {
    const createResponse = await fetch(`${BASE_URL}/api/trpc/audits.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: auditInput })
    });
    
    const createResult = await createResponse.json();
    console.log('Create response:', JSON.stringify(createResult, null, 2));
    
    if (!createResult.result?.data?.json?.auditId) {
      console.error('Failed to create audit');
      return;
    }
    
    const auditId = createResult.result.data.json.auditId;
    console.log(`\nAudit created with ID: ${auditId}`);
    
    // Step 2: Wait for audit to complete (it runs in background)
    console.log('\nStep 2: Waiting for audit to complete (this may take 2-3 minutes)...');
    
    let attempts = 0;
    let auditComplete = false;
    
    while (attempts < 60 && !auditComplete) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`${BASE_URL}/api/trpc/audits.getById?input=${encodeURIComponent(JSON.stringify({ json: { id: auditId } }))}`);
      const statusResult = await statusResponse.json();
      
      const status = statusResult.result?.data?.json?.status;
      console.log(`  Attempt ${attempts + 1}: Status = ${status}`);
      
      if (status === 'completed') {
        auditComplete = true;
        console.log('\n✅ Audit completed!');
        
        // Show scores
        const audit = statusResult.result.data.json;
        const gbpAudit = JSON.parse(audit.gbpAuditResults || '{}');
        const seoAudit = JSON.parse(audit.seoAuditResults || '{}');
        const aeoAnalysis = JSON.parse(audit.aeoResults || '{}');
        const competitiveResults = JSON.parse(audit.competitiveResults || '{}');
        
        console.log('\n=== Audit Scores ===');
        console.log(`GBP Score: ${gbpAudit.score}/100`);
        console.log(`SEO Score: ${seoAudit.score}/100`);
        console.log(`AEO Score: ${aeoAnalysis.score}/100`);
        console.log(`Competitors Found: ${competitiveResults.competitors?.length || 0}`);
        
        if (competitiveResults.competitors?.length > 0) {
          console.log('\n=== Top Competitors ===');
          competitiveResults.competitors.slice(0, 5).forEach((c, i) => {
            console.log(`${i + 1}. ${c.name} - ${c.rating}⭐ (${c.reviewCount} reviews)`);
          });
        }
      } else if (status === 'failed') {
        console.error('\n❌ Audit failed!');
        return;
      }
      
      attempts++;
    }
    
    if (!auditComplete) {
      console.error('\n❌ Audit timed out after 5 minutes');
      return;
    }
    
    // Step 3: Generate PDF
    console.log('\nStep 3: Generating PDF with redesigned template...');
    
    const pdfResponse = await fetch(`${BASE_URL}/api/trpc/audits.generatePDF`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { auditId } })
    });
    
    const pdfResult = await pdfResponse.json();
    console.log('PDF response:', JSON.stringify(pdfResult, null, 2));
    
    if (pdfResult.result?.data?.json?.pdfUrl) {
      console.log('\n✅ PDF Generated Successfully!');
      console.log(`PDF URL: ${pdfResult.result.data.json.pdfUrl}`);
    } else {
      console.error('\n❌ PDF generation failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPDFGeneration();
