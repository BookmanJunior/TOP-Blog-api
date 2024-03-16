const router = require("express").Router();
const loginController = require("../controllers/loginController");
const authorizationController = require("../controllers/authorizationController");
const userController = require("../controllers/userController");

router.post("/login", loginController.login_cms);

router.get("/users", userController.users_get);

module.exports = router;
