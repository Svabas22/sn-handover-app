var express = require('express');
var router = express.Router();

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT } = require('../authConfig');

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

// router.get('/id',
//     isAuthenticated, // check if user is authenticated
//     async function (req, res, next) {
//         res.render('id', { idTokenClaims: req.session.account.idTokenClaims });
//     }
// );

// router.get('/userclaims', (req, res) => {
//     if (req.session.user) {
//         res.json(req.session.user);
//     } else {
//         res.status(401).json({ error: 'No user claims available' });
//     }
//   });

router.get('/profile',
    isAuthenticated, // check if user is authenticated
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
