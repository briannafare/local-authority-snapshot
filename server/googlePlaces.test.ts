import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Google Places API (New)', () => {
  it('should validate API key with Places API (New)', async () => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    expect(apiKey).toBeDefined();
    
    // Test with the new Places API format
    const response = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: 'Spicy Vegetarian Food in Sydney, Australia'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.id'
        }
      }
    );
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    expect(response.status).toBe(200);
    expect(response.data.places).toBeDefined();
    expect(response.data.places.length).toBeGreaterThan(0);
  }, 10000);
});
