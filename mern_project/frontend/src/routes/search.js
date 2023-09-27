const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Define a route to handle the search for hospitals
app.post('/search-hospitals', async (req, res) => {
  try {
    const address = req.body.address; // Get the user-entered address from the request body

    // Step 1: Geocode the address to get coordinates (latitude and longitude) using Google Geocoding API
    const geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: address,
        key: 'YOUR_GOOGLE_GEOCODING_API_KEY' // Replace with your Google Geocoding API key
      }
    });

    // Check if the geocoding was successful
    if (geocodingResponse.data.status !== 'OK') {
      throw new Error('Geocoding failed');
    }

    const location = geocodingResponse.data.results[0].geometry.location;
    const lat = location.lat;
    const lng = location.lng;

    // Step 2: Search for hospitals near the coordinates using Google Places API
    const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000, // Search within a 5-kilometer radius (adjust as needed)
        type: 'hospital',
        key: 'YOUR_GOOGLE_PLACES_API_KEY' // Replace with your Google Places API key
      }
    });

    // Check if the places search was successful
    if (placesResponse.data.status !== 'OK') {
      throw new Error('Places search failed');
    }

    const hospitals = placesResponse.data.results;

    // Return the list of hospitals to the client
    res.json(hospitals);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});