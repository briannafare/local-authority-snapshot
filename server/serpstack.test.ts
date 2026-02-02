import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('SerpStack API', () => {
  it('should validate API key with a simple search', async () => {
    const apiKey = process.env.SERPSTACK_API_KEY;
    expect(apiKey).toBeDefined();
    
    // Test with a simple search query
    const response = await axios.get('http://api.serpstack.com/search', {
      params: {
        access_key: apiKey,
        query: 'pizza New York',
        num: 10
      }
    });
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    expect(response.status).toBe(200);
    expect(response.data.organic_results).toBeDefined();
    expect(response.data.organic_results.length).toBeGreaterThan(0);
  }, 15000);
});
