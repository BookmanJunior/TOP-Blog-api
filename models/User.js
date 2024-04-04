const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { first: String, last: String },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "user", required: true },
});

UserSchema.methods.encryptPassword = async function () {
  return await bcrypt.hash(this.password, 10);
};

UserSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("User", UserSchema);
