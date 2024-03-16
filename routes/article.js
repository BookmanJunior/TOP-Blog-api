const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const authorizationController = require("../controllers/authorizationController");

router.get("/", articleController.articles_get);

router.post(
  "/",
  authorizationController.isAdmin,
  articleController.article_post
);

router.get("/:id", articleController.article_get);

module.exports = router;
