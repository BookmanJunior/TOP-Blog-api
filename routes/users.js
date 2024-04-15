const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { UserValidation } = require("../validators/UserValidation");

router.post("/", UserValidation(), userController.user_post);

module.exports = router;
