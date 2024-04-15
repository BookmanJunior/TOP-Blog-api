const { body } = require("./CustomValidator");

exports.ArticleValidation = () => [
  body("title", "Title can't be blank").trim().isLength({ min: 1 }),
  body("content", "Article content can't be blank").trim().isLength({ min: 1 }),
  body("cover", "Article cover can't be empty")
    .trim()
    .isURL()
    .withMessage("Article cover must be a URL"),
  body("featured").trim().optional({ checkFalsy: true }).isBoolean().escape(),
  body("published").trim().optional({ checkFalsy: true }).isBoolean().escape(),
];
