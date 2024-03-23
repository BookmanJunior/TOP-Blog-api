const User = require("../models/User");
const Article = require("../models/Article");
const Comment = require("../models/Comment");

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
