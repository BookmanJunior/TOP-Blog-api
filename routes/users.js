const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { UserValidation } = require("../validators/UserValidation");
const loginController = require("../controllers/loginController");

router.post(
  "/",
  UserValidation(),
  userController.user_post,
  loginController.login,
  userController.me
);

module.exports = router;
