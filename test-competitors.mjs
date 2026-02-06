import axios from 'axios';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log('API Key present:', !!API_KEY);

async function searchCompetitors(category, location, limit = 5) {
  try {
    console.log(`Searching competitors: ${category} in ${location}`);

    const searchResponse = await axios.post(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        textQuery: `${category} ${location}`,
        maxResultCount: limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress'
        }
      }
    );

    if (!searchResponse.data.places) {
      return [];
    }

    return searchResponse.data.places.map((place) => ({
      placeId: place.id,
      name: place.displayName?.text,
      rating: place.rating,
      reviewCount: place.userRatingCount,
      address: place.formattedAddress,
    }));

  } catch (error) {
    console.error('Competitor search error:', error.response?.data || error.message);
    return [];
  }
}

const competitors = await searchCompetitors('mortgage lender', 'Portland Oregon', 5);
console.log('Competitors found:', competitors.length);
competitors.forEach((c, i) => {
  console.log((i+1) + '. ' + c.name + ' - ' + c.rating + ' stars (' + c.reviewCount + ' reviews)');
});
