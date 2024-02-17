const { ExpressValidator } = require("express-validator");
const User = require("../models/User");

const { body, validationResult } = new ExpressValidator({
  isUsernameTaken: async (value) => {
    const username = await User.findOne({ username: value })
      .collation({ locale: "en", strength: 2 })
      .exec();

    if (username) {
      throw new Error(
        `${value} already exists. Please pick a different username`
      );
    }
  },
  isPasswordMatch: async (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
  },
});

exports.user_post = [
  body("username", "Username must be 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .isUsernameTaken()
    .escape(),
  body("password", "Password must be 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("confirmPassword", "Confirm Password must be 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .isPasswordMatch()
    .escape(),
  body("name.*").optional({ checkFalsy: true }).trim().escape(),

  async function (req, res, next) {
    const errors = validationResult(req);
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors.array());
    }

    try {
      user.password = await user.encryptPassword();
      await user.save();
      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
];
