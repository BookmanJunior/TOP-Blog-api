const Category = require("../models/Category");
const { body, validationResult } = require("../validators/CustomValidator");
const { ErrorFormatter } = require("../helpers/ErrorFormatter");
const { isValidObjectId } = require("mongoose");

const NOTFOUNDERROR = {
  status: 404,
  statusText: { message: "Category not found" },
};

exports.categories_get = async (req, res, next) => {
  try {
    const categories = await Category.find({}).exec();
    return res.status(200).send(categories);
  } catch (error) {
    next(error);
  }
};

exports.category_get = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(NOTFOUNDERROR.status).send(NOTFOUNDERROR.statusText);
  }

  try {
    const category = await Category.findById(req.params.id).exec();
    return res.status(200).send(category);
  } catch (error) {
    return next(error);
  }
};

exports.categories_post = [
  body("title", "Category must be at least 3 characters long")
    .trim()
    .isLength({ min: 3 })
    .bail()
    .isDuplicateCategory()
    .escape(),

  async (req, res, next) => {
    const newCategory = new Category({ title: req.body.title });
    const errors = validationResult(req).formatWith(ErrorFormatter);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.mapped());
    }

    try {
      await newCategory.save();
      return res.status(200).send(newCategory);
    } catch (error) {
      next(error);
    }
  },
];

exports.categories_edit = [
  body("title", "Category must be at least 3 characters long")
    .trim()
    .isLength({ min: 3 })
    .bail()
    .isDuplicateCategory()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req).formatWith(ErrorFormatter);

    if (!isValidObjectId(req.params.id)) {
      return res.status(NOTFOUNDERROR.status).send(NOTFOUNDERROR.statusText);
    }

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.mapped());
    }

    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        {
          $set: { title: req.body.title },
        },
        { new: true }
      );
      return res.status(200).send(updatedCategory);
    } catch (error) {
      next(error);
    }
  },
];

exports.category_delete = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(NOTFOUNDERROR.status).send(NOTFOUNDERROR.statusText);
  }

  try {
    await Category.findByIdAndDelete(req.params.id);
    return next();
  } catch (error) {
    return next();
  }
};
