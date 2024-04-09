const router = require("express").Router();
const userController = require("../controllers/userController");
const cmsController = require("../controllers/cmsController");
const articleController = require("../controllers/articleController");
const { UserValidation } = require("../validators/UserValidation");

router.delete("/articles/:id", articleController.article_delete);

router.put("/articles/:id", articleController.article_edit);

router.put("/articles/:id/checkbox", articleController.article_checkbox_update);

router.get("/users", userController.users_get);

router.delete("/users/:id", userController.user_delete);

router.get("/users/:id", userController.user_get);

router.put("/users/:id", userController.user_update);

router.post("/users", UserValidation, userController.user_cms_post);

router.get("/roles", cmsController.roles_get);

router.get("/count", cmsController.documents_count_get);

module.exports = router;
