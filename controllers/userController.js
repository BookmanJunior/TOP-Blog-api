const { ExpressValidator } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

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
  isRole: async (value) => {
    const role = Role.findOne({ role: value }).exec();

    if (!role) {
      throw new Error("Please pick an existing role");
    }
  },
});

exports.users_get = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password -__v")
      .sort({ username: -1 })
      .exec();
    return res.status(200).send(users);
  } catch (error) {
    return next(error);
  }
};

exports.user_get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, "-password").exec();

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    return next(error);
  }
};

exports.user_update = [
  body("username", "Username must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .bail()
    .isUsernameTaken()
    .escape(),
  body("role", "Choose a user role").trim().isRole(),

  async (req, res, next) => {
    const update = {
      username: req.body.username,
      role: req.body.role,
    };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.mapped());
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, update, {
        new: true,
      }).exec();
      return res.status(200).send(updatedUser);
    } catch (error) {
      return next(error);
    }
  },
];

exports.user_post = [
  body("username", "Username must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .bail()
    .isUsernameTaken()
    .escape(),
  body("password", "Password must be at least 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("confirmPassword", "Confirm Password must be at least 8 characters long")
    .trim()
    .isPasswordMatch()
    .bail()
    .isLength({ min: 8 })
    .escape(),
  body("name.*").optional({ checkFalsy: true }).trim().escape(),

  async function (req, res, next) {
    const errorFormatter = ({ msg }) => {
      return msg;
    };

    const errors = validationResult(req).formatWith(errorFormatter);
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors.mapped());
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
