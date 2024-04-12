const express = require("express");
const commentController = require("../controllers/commentController");
const authorizationController = require("../controllers/authorizationController");
const router = express.Router();

router.post("/", commentController.comment_post);

router.delete(
  "/:id",
  authorizationController.isAuthorized,
  commentController.comment_delete
);

module.exports = router;
