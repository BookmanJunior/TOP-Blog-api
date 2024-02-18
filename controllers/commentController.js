const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Article = require("../models/Article");

exports.comment_post = [
  body("text", "Comment can't be empty").trim().isLength({ min: 1 }),

  async function (req, res, next) {
    const errors = validationResult(req);

    const comment = new Comment({
      text: req.body.comment,
      article: req.body.articleId,
      user: req.body.user,
    });

    if (!errors.isEmpty) {
      return res.status(400).send(errors.array());
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const article = await Article.findById(req.body.articleId)
        .session(session)
        .exec();

      if (!article) {
        await session.abortTransaction();
        return res.status(400).send("Article not found");
      }

      await comment.save({ session });
      await article.updateOne(
        { $push: { comments: comment._id } },
        { session }
      );

      await session.commitTransaction();
      return res.status(200).send(comment);
    } catch (error) {
      return next(error);
    } finally {
      session.endSession();
    }
  },
];

exports.comment_delete = async function (req, res, next) {
  const session = await mongoose.startSession();
  const commentId = req.params.commentId;
  const articleId = req.body.articleId;

  try {
    session.startTransaction();

    const comment = await Comment.findById(commentId).session(session).exec();

    if (!comment) {
      await session.abortTransaction();
      return res.status(404).send("Comment not found");
    }

    await comment.deleteOne({ session });
    await Article.findByIdAndUpdate(
      articleId,
      {
        $pull: { comments: commentId },
      },
      { session }
    ).exec();

    await session.commitTransaction();
    res.status(200).send("Deleted comment");
  } catch (error) {
    return next(error);
  } finally {
    session.endSession();
  }
};
