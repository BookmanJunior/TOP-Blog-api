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

  async function (req, res, next) {
    const errors = validationResult(req);
    const article = new Article({
      title: req.body.title,
      content: req.body.content,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors, article });
    }

    try {
      await article.save();
      return res.status(200).send(article);
    } catch (error) {
      return next(error);
    }
  },
];
