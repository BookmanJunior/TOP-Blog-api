const router = require("express").Router();
const articleController = require("../controllers/articleController");

router.get("/:categoryName", articleController.articles_by_category_get);

module.exports = router;
