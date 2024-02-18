const express = require("express");
const commentController = require("../controllers/commentController");
const router = express.Router();

router.post("/", commentController.comment_post);

router.delete("/:id", commentController.comment_delete);

module.exports = router;
