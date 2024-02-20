const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const errorMessage = "Wrong username or password";

const strategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return done(null, false, { message: errorMessage });
    }

    const isCorrectPassword = await user.validatePassword(password);
    if (!isCorrectPassword) {
      return done(null, false, { message: errorMessage });
    }

    return done(null, user);
  } catch (error) {
    return next(error);
  }
});

module.exports = strategy;
