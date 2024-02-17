const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

router.get("/", articleController.articles_get);

router.post("/", articleController.article_post);

router.get("/:id", articleController.article_get);

router.put("/:id", articleController.article_edit);

router.delete("/:id", articleController.article_delete);

module.exports = router;
