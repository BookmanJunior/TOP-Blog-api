const passport = require("passport");

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) return next(info.message);

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).send({ message: "Logged In" });
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).send("Logged out");
  });
};
