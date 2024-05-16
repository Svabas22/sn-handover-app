function isAuthenticated(req, res, next) {
    if (req.session && req.session.accessToken) {
      return next();
    } else {
      res.redirect('/login');
    }
  }
  
module.exports = isAuthenticated;

//checks if authenticated