const Article = require("../models/Article");
const Comment = require("../models/Comment");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const commentOptions = {
  path: "comments",
  select: "-article -__v",
  options: { sort: { date: -1 } },
  populate: {
    path: "user",
    select: "-_id username ",
  },
};

async function getArticles() {
  try {
    const articles = await Article.find({})
      .sort({ featured: 1, date: 1 })
      .populate([{ path: "author", select: "-_id username" }, commentOptions])
      .exec();
    return articles;
  } catch (error) {
    throw new Error(error);
  }
}

exports.articles_get = async function (req, res, next) {
  try {
    const articles = await getArticles();
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  }
};

exports.article_get = async function (req, res, next) {
  try {
    const article = await Article.findById(req.params.id)
      .sort({ featured: 1, date: 1 })
      .populate([{ path: "author", select: "-_id username" }, commentOptions])
      .exec();

    if (!article) {
      return res.status(404).send("Article not found.");
    }

    return res.status(200).send(article);
  } catch (error) {
    return next(error);
  }
};

exports.article_post = [
  body("title", "Title can't be blank").trim().isLength({ min: 1 }),
  body("content", "Article content can't be blank").trim().isLength({ min: 1 }),
  body("cover", "Article cover can't be empty")
    .trim()
    .custom(async (value) => {
      try {
        new URL(value);
      } catch (error) {
        throw new Error("Invalid Url. Try again.");
      }
    })
    .escape(),
  body("author", "Author can't be empty").trim().isLength({ min: 1 }).escape(),
  body("featured").trim().optional({ checkFalsy: true }).isBoolean().escape(),
  body("published").trim().optional({ checkFalsy: true }).isBoolean().escape(),

  async function (req, res, next) {
    const errors = validationResult(req);
    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      cover: req.body.cover,
      author: req.body.author,
      featured: req.body.featured,
      published: req.body.published,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors);
    }

    try {
      await article.save();
      return res.status(200).send(article);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
];

exports.article_edit = [
  body("title", "Title can't be blank").trim().isLength({ min: 1 }),
  body("content", "Article content can't be blank").trim().isLength({ min: 1 }),
  body("cover", "Article cover can't be empty")
    .trim()
    .custom(async (value) => {
      try {
        new URL(value);
      } catch (error) {
        throw new Error("Invalid Url. Try again.");
      }
    })
    .escape(),
  body("author", "Author can't be empty").trim().isLength({ min: 1 }).escape(),
  body("featured").trim().optional({ checkFalsy: true }).isBoolean().escape(),
  body("published").trim().optional({ checkFalsy: true }).isBoolean().escape(),

  async function (req, res, next) {
    const errors = validationResult(req);
    const articleId = req.params.id;
    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      cover: req.body.cover,
      author: req.body.author,
      featured: req.body.featured,
      published: req.body.published,
      _id: articleId,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors);
    }

    try {
      await Article.findByIdAndUpdate(articleId, article);
      return res.status(200).send(article);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
];

exports.article_delete = async function (req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const article = await Article.findById(req.params.id)
      .session(session)
      .exec();

    if (!article) {
      await session.abortTransaction();
      return res.status(404).send("Article not found");
    }

    await article.deleteOne({ session });
    await Comment.deleteMany({ article: req.params.id }, { session });

    await session.commitTransaction();
    const articles = await getArticles();
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  } finally {
    session.endSession();
  }
};
