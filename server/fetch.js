var axios = require('axios');

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint:
 * @param accessToken:
 */
async function fetch(endpoint, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    try {
        const response = await axios.get(endpoint, options);
        return await response.data;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = fetch;
