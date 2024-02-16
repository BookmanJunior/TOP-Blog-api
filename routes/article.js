const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

router.get("/", articleController.articles_get);

router.get("/:id", articleController.article_get);

router.post("/new", articleController.article_post);

router.put("/:id/edit", articleController.article_edit);

module.exports = router;
