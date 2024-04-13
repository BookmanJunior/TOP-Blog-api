const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

router.get("/", articleController.published_articles_get);

router.get("/:id", articleController.article_get);

module.exports = router;
