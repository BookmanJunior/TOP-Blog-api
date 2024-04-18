const router = require("express").Router();
const loginController = require("../controllers/loginController");
const userController = require("../controllers/userController");
const authorizationController = require("../controllers/authorizationController");

router.post("/", loginController.login_cms, userController.me);
router.post("/auto-login", authorizationController.isAdmin, userController.me);

module.exports = router;
