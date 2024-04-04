const router = require("express").Router();
const loginController = require("../controllers/loginController");
const userController = require("../controllers/userController");

router.post("/", loginController.login, userController.me);

module.exports = router;
