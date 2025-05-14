const axios = require('axios');

const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY;
const IPGEOLOCATION_BASE_URL = 'https://api.ipgeolocation.io';

async function getLocationDetails(city) {
    try {
        const response = await axios.get(`${IPGEOLOCATION_BASE_URL}/ipgeo`, {
            params: {
                apiKey: IPGEOLOCATION_API_KEY,
                ip: '1.1.1.1', // Using a dummy IP since we're searching by city
                city: city
            }
        });

        return response.data;
    } catch (error) {
        console.error('IPGeolocation API Error:', error.message);
        return null;
    }
}

async function searchNearbyHotels(latitude, longitude, radius = 10) {
    try {
        const response = await axios.get(`${IPGEOLOCATION_BASE_URL}/places`, {
            params: {
                apiKey: IPGEOLOCATION_API_KEY,
                lat: latitude,
                long: longitude,
                radius: radius,
                type: 'hotel'
            }
        });

        return response.data;
    } catch (error) {
        console.error('IPGeolocation Places API Error:', error.message);
        return null;
    }
}

module.exports = {
    getLocationDetails,
    searchNearbyHotels
}; 