const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Article = require("../models/Article");

exports.comment_post = [
  body("comment", "Comment can't be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async function (req, res, next) {
    const errorFormatter = ({ msg }) => {
      return msg;
    };
    const errors = validationResult(req).formatWith(errorFormatter);

    const comment = new Comment({
      text: req.body.comment,
      article: req.body.articleId,
      user: res.locals.currentUser,
    });

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.mapped());
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const article = await Article.findById(req.body.articleId)
          .session(session)
          .exec();

        if (!article) {
          await session.abortTransaction();
          const error = new Error("Article not found");
          error.status = 404;
          return next(error);
        }

        await comment.save({ session: session });
        await article.updateOne(
          {
            $push: { comments: comment._id },
          },
          { session: session }
        );
      });
      return res.status(200).send(comment);
    } catch (error) {
      return next(error);
    } finally {
      await session.endSession();
    }
  },
];

exports.comment_delete = async function (req, res, next) {
  const { currentUser } = res.locals;

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).send({ message: "Comment not found" });
  }

  try {
    const comment = await Comment.findById(req.params.id).exec();

    if (
      comment.user.toString() === currentUser.id ||
      currentUser.role === "admin"
    ) {
      await comment.updateOne({ $set: { deleted: true } });
      return res.status(200).send({ message: "Deleted comment" });
    }

    return res.status(403).send({ message: "Unauthorized" });
  } catch (error) {
    return next(error);
  }
};
