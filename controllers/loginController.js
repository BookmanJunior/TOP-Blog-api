const passport = require("passport");

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) return res.status(403).send({ credentials: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).send({ username: user.username, role: user.role });
    });
  })(req, res, next);
};
