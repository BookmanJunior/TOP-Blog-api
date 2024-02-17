const { Schema, model } = require("mongoose");

const CommentSchema = new Schema({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
  date: { type: Date, default: Date.now() },
});

module.exports = model("Comment", CommentSchema);
