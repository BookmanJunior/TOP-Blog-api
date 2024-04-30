const { body } = require("./CustomValidator");

exports.UserValidation = () => [
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
  body("role").trim().isRole().escape(),
  body("name.*").optional({ checkFalsy: true }).trim().escape(),
];
