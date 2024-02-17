const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

main().catch(() => console.log("Failed to connect to DB"));

async function main() {
  mongoose.connect(process.env.DBURI);
}

const usersRouter = require("./routes/users");
const articleRouter = require("./routes/article");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/users", usersRouter);
app.use("/articles", articleRouter);

module.exports = app;
