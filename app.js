const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const User = require("./models/User");
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
app.use(
  session({
    name: "blog",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) {
        return done(null, false, { message: "Wrong username or password" });
      }

      const isCorrectPassword = await user.validatePassword(password);
      if (!isCorrectPassword) {
        return done(null, false, { message: "Wrong username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

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
