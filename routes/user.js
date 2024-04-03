const router = require("express").Router();
const userController = require("../controllers/userController");

router.get("/", userController.me);

router.put("/:articleId", userController.bookmark_post);

router.delete("/:articleId", userController.bookmark_delete);

module.exports = router;
