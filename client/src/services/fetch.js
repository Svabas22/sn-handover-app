var axios = require('axios');

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint: REST API endpoint to call
 * @param accessToken: raw access token string
 */
async function fetch(endpoint, accessToken) {
    if (!accessToken) {
        throw new Error('Access token is required for the API call');
    }

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`Making a request to ${endpoint} with token: ${accessToken}`);

    try {
        const response = await axios.get(endpoint, options);
        if (response.status !== 200) {
            throw new Error(`API call failed with status: ${response.status} and message: ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        console.error('Request Failed:', error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message);
        throw error;
    }
}

module.exports = fetch;
