import axios from 'axios';

const API_KEY = process.env.SERPSTACK_API_KEY;
console.log('SerpStack API Key present:', !!API_KEY);

async function test() {
  try {
    const response = await axios.get('http://api.serpstack.com/search', {
      params: {
        access_key: API_KEY,
        query: 'mortgage lender Portland Oregon',
        num: 10,
        gl: 'us',
        hl: 'en'
      }
    });
    console.log('SUCCESS - Results:', response.data.organic_results?.length || 0, 'organic results');
    if (response.data.organic_results) {
      console.log('Top 3:');
      response.data.organic_results.slice(0, 3).forEach((r, i) => {
        console.log((i+1) + '. ' + r.title);
      });
    }
    if (response.data.error) {
      console.log('API Error:', response.data.error);
    }
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

test();
