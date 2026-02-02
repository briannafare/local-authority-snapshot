import fetch from 'node-fetch';

const API_URL = 'https://3000-i56btpkavbrw86vrtuxzx-4b8a7978.us2.manus.computer/api/trpc';

const auditData = {
  businessName: "Joe's Pizza",
  websiteUrl: "https://joespizzanyc.com",
  primaryLocation: "New York, NY",
  primaryNiche: "Restaurant / Local Retail",
  leadSources: ["Google Search", "Walk-ins"],
  runPaidAds: "No",
  hasLocalListing: "Yes",
  activeOnSocialMedia: "No",
  usesAutomation: "No",
  consistentCallAnswering: "Yes",
  businessGoals: ["More Customers"],
  painPoints: ["Not ranking on Google"]
};

console.log('Creating audit for Joe\'s Pizza...');
console.log('Audit data:', JSON.stringify(auditData, null, 2));

const response = await fetch(`${API_URL}/audits.create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(auditData)
});

const result = await response.json();
console.log('Response:', JSON.stringify(result, null, 2));

if (result.result?.data) {
  const auditId = result.result.data.auditId;
  console.log(`\n✅ Audit created successfully! ID: ${auditId}`);
  console.log(`View report at: https://3000-i56btpkavbrw86vrtuxzx-4b8a7978.us2.manus.computer/report/${auditId}`);
} else {
  console.error('❌ Failed to create audit');
}
