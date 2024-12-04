var express = require('express');
var router = express.Router();

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT } = require('../authConfig');


function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); 
    }

    next();
};

router.get('/profile',
    isAuthenticated,
    async function (req, res, next) {
        try {
            const graphResponse = await fetch(GRAPH_ME_ENDPOINT, req.session.idToken);
            res.render('profile', { profile: graphResponse });
        } catch (error) {
            console.log(req.session.accessToken);
            next(error);
        }
    }
);

module.exports = router;
