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
    const role = await Role.findOne({ role: value }).exec();

    if (!role) {
      throw new Error("Please pick an existing role");
    }
  },
  isCategory: async (value) => {
    const category = await Category.findById(value).exec();

    if (!category) {
      throw new Error("Please pick an existing category");
    }
  },

  isDuplicateCategory: async (value) => {
    const category = await Category.findOne({ title: value })
      .collation({
        locale: "en",
        strength: 2,
      })
      .exec();

    if (category) {
      throw new Error(
        `${value} category already exists. Enter a different category title`
      );
    }
  },
});

module.exports = CustomValidator;
