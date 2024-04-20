const { ExpressValidator } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");
const Category = require("../models/Category");

const CustomValidator = new ExpressValidator({
  isUsernameTaken: async (value, { req }) => {
    const user = await User.findOne({ username: value })
      .collation({ locale: "en", strength: 2 })
      .exec();

    if (user && user.id !== req.body._id) {
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
  isCategory: async (value) => {
    const category = Category.findOne({ title: value }).exec();

    if (!category) {
      throw new Error("Please pick an existing category");
    }
  },
});

module.exports = CustomValidator;
