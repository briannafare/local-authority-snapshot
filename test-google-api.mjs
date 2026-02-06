import axios from 'axios';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log('API Key present:', !!API_KEY, API_KEY ? '('+API_KEY.substring(0,10)+'...)' : '');

async function test() {
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: 'The Lindley Team Portland Oregon mortgage' },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount'
        }
      }
    );
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

test();
