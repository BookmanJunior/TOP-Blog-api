const router = require("express").Router();
const loginController = require("../controllers/loginController");
const authorizationController = require("../controllers/authorizationController");
const userController = require("../controllers/userController");
const cmsController = require("../controllers/cmsController");
const articleController = require("../controllers/articleController");
const Role = require("../models/Role");
const { UserValidation } = require("../validators/UserValidation");

router.post("/login", loginController.login_cms);

router.delete("/articles/:id", articleController.article_delete);

router.put("/articles/:id", articleController.article_edit);

router.put("/articles/:id/checkbox", articleController.article_checkbox_update);

router.get("/users", authorizationController.isAdmin, userController.users_get);

router.delete("/users/:id", userController.user_delete);

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

router.post("/users", UserValidation, userController.user_cms_post);

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
