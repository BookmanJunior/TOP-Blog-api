const passport = require("passport");

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) return res.status(403).send({ credentials: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);

      res.locals.currentUser = user;
      next();
    });
  })(req, res, next);
};

exports.login_cms = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) return res.status(403).send({ credentials: info.message });

    if (user.role !== "admin")
      return res.status(403).send({ error: "Unauthorized" });

    req.logIn(user, (err) => {
      if (err) return next(err);

      res.locals.currentUser = user;
      next();
    });
  })(req, res, next);
};
