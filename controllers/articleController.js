const Article = require("../models/Article");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { ErrorFormatter } = require("../helpers/ErrorFormatter");

const commentOptions = {
  path: "comments",
  select: "-article -__v",
  options: { sort: { date: -1 } },
  populate: {
    path: "user",
    select: "username",
  },
};

const articleSortOption = {
  date: -1,
};

const articleAuthorOptions = { path: "author", select: "username" };

const categoryOptions = { path: "category" };

async function getArticles() {
  try {
    const articles = await Article.find({})
      .sort(articleSortOption)
      .populate([articleAuthorOptions])
      .exec();
    return articles;
  } catch (error) {
    throw new Error(error);
  }
}

exports.published_articles_get = async function (req, res, next) {
  try {
    const articles = await Article.find({ published: true })
      .sort(articleSortOption)
      .populate([articleAuthorOptions, categoryOptions])
      .exec();
    return res.status(200).send(articles);
  } catch (error) {
    next(error);
  }
};

exports.articles_get = async function (req, res, next) {
  try {
    const articles = await getArticles();
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  }
};

exports.articles_by_category_get = async function (req, res, next) {
  try {
    const category = await Category.findOne({
      title: req.params.categoryName,
    }).exec();

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    const articles = await Article.find({ category: category._id })
      .sort(articleSortOption)
      .populate([articleAuthorOptions, categoryOptions]);
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  }
};

exports.article_get = async function (req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send({ message: "Article not found" });
    }

    const article = await Article.findById(req.params.id)
      .populate([articleAuthorOptions, commentOptions, categoryOptions])
      .exec();

    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }

    return res.status(200).send(article);
  } catch (error) {
    return next(error);
  }
};

exports.article_post = async function (req, res, next) {
  const errors = validationResult(req).formatWith(ErrorFormatter);
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    cover: req.body.cover,
    author: res.locals.currentUser,
    category: req.body.category,
    featured: req.body.featured,
    published: req.body.published,
  });

  if (!errors.isEmpty()) {
    return res.status(422).send(errors.mapped());
  }

  try {
    await article.save();
    return res.status(200).send(article);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.article_edit = [
  body("comments.*._id", "Invalid Comment ID").isMongoId(),

  async function (req, res, next) {
    const errors = validationResult(req).formatWith(ErrorFormatter);
    const articleId = req.params.id;
    const editedArticle = new Article({
      title: req.body.title,
      content: req.body.content,
      cover: req.body.cover,
      author: req.body.author,
      comments: req.body.comments,
      category: req.body.category,
      featured: req.body.featured,
      published: req.body.published,
      date: req.body.date,
      _id: articleId,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors.mapped());
    }

    try {
      const updatedArticle = await Article.findByIdAndUpdate(
        req.params.id,
        editedArticle
      );

      return res.status(200).send(updatedArticle);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
];

exports.article_checkbox_update = [
  body("featured").trim().optional({ checkFalsy: true }).isBoolean().escape(),
  body("published").trim().optional({ checkFalsy: true }).isBoolean().escape(),

  async (req, res, next) => {
    try {
      if (req.body.featured) {
        await Article.findOneAndUpdate(
          { featured: true },
          { $set: { featured: false } }
        );
        await Article.findByIdAndUpdate(req.params.id, {
          $set: { featured: true },
        });
      } else {
        await Article.findByIdAndUpdate(req.params.id, {
          $set: { published: req.body.published, featured: req.body.featured },
        });
      }

      const updatedArticles = await Article.find({})
        .populate([articleAuthorOptions])
        .sort(articleSortOption)
        .exec();
      return res.status(200).send(updatedArticles);
    } catch (error) {
      return next(error);
    }
  },
];

exports.article_delete = async function (req, res, next) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Article.findByIdAndDelete(req.params.id).session(session).exec();
      await Comment.deleteMany({ article: req.params.id })
        .session(session)
        .exec();
    });
    const articles = await getArticles();
    return res.status(200).send(articles);
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
