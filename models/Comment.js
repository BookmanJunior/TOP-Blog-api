const { Schema, model } = require("mongoose");

const CommentSchema = new Schema({
  text: { type: string, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
});

module.exports = model("Comment", CommentSchema);
