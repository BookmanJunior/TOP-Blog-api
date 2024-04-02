const User = require("../models/User");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const Role = require("../models/Role");

exports.documents_count_get = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({}).exec();
    const articleCount = await Article.countDocuments({}).exec();
    const commentCount = await Comment.countDocuments({}).exec();

    return res.status(200).send({ userCount, articleCount, commentCount });
  } catch (error) {
    return next(error);
  }
};

exports.roles_get = async (req, res, next) => {
  try {
    const roles = await Role.find({}).exec();
    return res.status(200).send(roles);
  } catch (error) {
    return next(error);
  }
};
