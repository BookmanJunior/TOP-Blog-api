const Article = require("../models/Article");
const { body, validationResult } = require("express-validator");

exports.articles_get = async function (req, res, next) {
  try {
    const articles = await Article.find({})
      .sort({ featured: 1, date: 1 })
      .exec();
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  }
};

exports.article_get = async function (req, res, next) {
  try {
    const article = await Article.findById(req.params.id).exec();

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
