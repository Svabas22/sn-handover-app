var express = require('express');
const msal = require('@azure/msal-node');
// const authProvider = require('../auth/AuthProvider');
const { msalConfig, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');
const isAuthenticated = require('../auth/isAuthenticated');

const router = express.Router();


const cca = new msal.ConfidentialClientApplication(msalConfig);

router.get('/login', (req, res) => {
    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: process.env.REDIRECT_URI
    };

    cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
        res.redirect(response);
    }).catch((error) => console.log(JSON.stringify(error)));
});

router.get('/redirect', (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read"],
        redirectUri: process.env.REDIRECT_URI
    };

    cca.acquireTokenByCode(tokenRequest).then((response) => {
        req.session.accessToken = response.accessToken;
        res.redirect('/home');
    }).catch((error) => console.log(JSON.stringify(error)));
});

router.get('/user', (req, res) => {
    if (req.session.accessToken) {
        // Use the access token to fetch user information
        // Example: Microsoft Graph API call
        res.send({ accessToken: req.session.accessToken });
    } else {
        res.status(401).send('User not authenticated');
    }
});


//module.exports = { router, isAuthenticated };
module.exports = router;
