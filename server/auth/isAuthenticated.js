function isAuthenticated(req, res, next) {
    if (req.session && req.session.accessToken) {
      return next();
    } else {
      res.redirect('/auth/login');
    }
  }
module.exports = isAuthenticated;