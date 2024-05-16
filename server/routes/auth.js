var express = require('express');
const msal = require('@azure/msal-node');
// const authProvider = require('../auth/AuthProvider');
const { msalConfig, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');
const isAuthenticated = require('../auth/isAuthenticated');

const router = express.Router();

router.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

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

router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

router.get('/status', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});
module.exports = router;

//authentication backend