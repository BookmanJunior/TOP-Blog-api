const { Schema, model } = require("mongoose");

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  headerImage: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  featured: { type: Boolean, default: false },
});

module.exports = model("Article", ArticleSchema);
