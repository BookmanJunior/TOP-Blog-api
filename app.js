const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const strategy = require("./Auth/Authentication");
require("dotenv").config();

main().catch(() => console.log("Failed to connect to DB"));

async function main() {
  mongoose.connect(process.env.DBURI);
}

const usersRouter = require("./routes/users");
const articleRouter = require("./routes/article");
const commentRouter = require("./routes/comment");
const loginController = require("./routes/login");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "blog",
    secret: "test",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  })
);
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    console.log(`Deserialized user: ${user}`);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use("/users", usersRouter);
app.use("/articles", articleRouter);
app.use("/comments", commentRouter);
app.use("/login", loginController);

module.exports = app;
