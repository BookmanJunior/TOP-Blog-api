const User = require("../models/User");
const Role = require("../models/Role");
const Comment = require("../models/Comment");
const Article = require("../models/Article");
const mongoose = require("mongoose");
const { body, validationResult } = require("../validators/CustomValidator");
const { ErrorFormatter } = require("../helpers/ErrorFormatter");

exports.users_get = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password -__v")
      .sort({ username: -1 })
      .exec();
    return res.status(200).send(users);
  } catch (error) {
    return next(error);
  }
};

exports.user_get = async (req, res, next) => {
  const errorMsg = { message: "User not found" };

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send(errorMsg);
    }

    const user = await User.findById(req.params.id, "-password").exec();

    if (!user) {
      return res.status(404).send(errorMsg);
    }

    return res.status(200).send(user);
  } catch (error) {
    return next(error);
  }
};

exports.user_update = [
  body("username", "Username must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .bail()
    .isUsernameTaken()
    .escape(),
  body("role", "Choose a user role").trim().isRole(),

  async (req, res, next) => {
    const update = {
      username: req.body.username,
      role: req.body.role,
    };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.mapped());
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, update, {
        new: true,
      }).exec();
      return res.status(200).send(updatedUser);
    } catch (error) {
      return next(error);
    }
  },
];

exports.user_post = async function (req, res, next) {
  const errors = validationResult(req).formatWith(ErrorFormatter);
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
  });

  if (!errors.isEmpty()) {
    return res.status(422).send(errors.mapped());
  }

  try {
    user.password = await user.encryptPassword();
    await user.save();
    return next();
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.user_cms_post = [
  body("role").trim().isRole().escape(),
  async function (req, res, next) {
    const errors = validationResult(req).formatWith(ErrorFormatter);
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role,
    });

    if (!errors.isEmpty()) {
      return res.status(422).send(errors.mapped());
    }

    try {
      user.password = await user.encryptPassword();
      await user.save();
      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
];

exports.user_delete = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await User.findByIdAndDelete(req.params.id).session(session).exec();
      await Comment.updateMany(
        { user: req.params.id },
        { $set: { deleted: true } }
      )
        .session(session)
        .exec();
    });

    const updatedUsers = await User.find({}).exec();
    return res.status(200).send(updatedUsers);
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

const BookmarkPopulateOptions = {
  path: "bookmarks",
  populate: [{ path: "author", select: "-_id username" }, { path: "category" }],
};

exports.me = async (req, res, next) => {
  const user = res.locals.currentUser;

  if (!user) {
    return res.sendStatus(400);
  }

  const populatedUser = await user.populate(BookmarkPopulateOptions);

  try {
    return res.status(200).send({
      username: populatedUser.username,
      _id: populatedUser._id,
      role: populatedUser.role,
      bookmarks: populatedUser.bookmarks,
    });
  } catch (error) {
    return next(error);
  }
};

exports.bookmark_post = async (req, res, next) => {
  try {
    const isArticle = await Article.findById(req.params.articleId);
    const { currentUser } = res.locals;

    if (!isArticle) {
      return res.status(404).send({ message: "Article not found" });
    }

    if (currentUser.bookmarks.includes(isArticle.id)) {
      return res
        .status(400)
        .send({ message: `${isArticle.title} is already bookmarked` });
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      { $push: { bookmarks: isArticle.id } },
      { new: true }
    )
      .populate(BookmarkPopulateOptions)
      .exec();

    return res.status(200).send(updatedUser.bookmarks);
  } catch (error) {
    return next(error);
  }
};

exports.bookmark_delete = async (req, res, next) => {
  try {
    const isArticle = await Article.findById(req.params.articleId);
    const { currentUser } = res.locals;

    if (!isArticle) {
      return res.status(404).send({ message: "Article not found" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      {
        $pull: { bookmarks: isArticle.id },
      },
      { new: true }
    )
      .populate(BookmarkPopulateOptions)
      .exec();

    return res.status(200).send(updatedUser.bookmarks);
  } catch (error) {
    return next(error);
  }
};
