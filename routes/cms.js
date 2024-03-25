const router = require("express").Router();
const loginController = require("../controllers/loginController");
const authorizationController = require("../controllers/authorizationController");
const userController = require("../controllers/userController");
const cmsController = require("../controllers/cmsController");
const articleController = require("../controllers/articleController");
const Role = require("../models/Role");

router.post("/login", loginController.login_cms);

router.delete("/articles/:id", articleController.article_delete);

router.put("/articles/:id", articleController.article_edit);

router.put("/articles/:id/checkbox", articleController.article_checkbox_update);

router.get("/users", authorizationController.isAdmin, userController.users_get);

router.get(
  "/users/:id",
  authorizationController.isAdmin,
  userController.user_get
);

router.put(
  "/users/:id",
  authorizationController.isAdmin,
  userController.user_update
);

router.get(
  "/roles",
  authorizationController.isAdmin,
  async (req, res, next) => {
    try {
      const roles = await Role.find({}).exec();
      return res.status(200).send(roles);
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/count", cmsController.documents_count_get);

module.exports = router;
