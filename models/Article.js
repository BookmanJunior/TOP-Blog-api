const { Schema, model } = require("mongoose");
const Comment = require("./Comment");

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  cover: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
});

module.exports = model("Article", ArticleSchema);
