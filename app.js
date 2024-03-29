const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const strategy = require("./Auth/Authentication");
const User = require("./models/User");
require("dotenv").config();

main().catch(() => console.log("Failed to connect to DB"));

async function main() {
  await mongoose.connect(process.env.DBURI);
}

const usersRouter = require("./routes/users");
const articleRouter = require("./routes/article");
const commentRouter = require("./routes/comment");
const loginController = require("./routes/login");
const cmsController = require("./routes/cms");

const app = express();
const sessionOptions = {
  name: "blog",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
};

if (process.env.NODE_ENV === "production") {
  sessionOptions.cookie.secure = true;
  sessionOptions.cookie.sameSite = "none";
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session(sessionOptions));
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
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/articles", articleRouter);
app.use("/comments", commentRouter);
app.use("/login", loginController);
app.use("/sign-up", usersRouter);
app.use("/cms", cmsController);
app.post("/auto-login", (req, res, next) => {
  if (res.locals.currentUser) {
    return res.status(200).send({
      username: res.locals.currentUser.username,
      role: res.locals.currentUser.role,
    });
  }

  return res.sendStatus(400);
});
app.delete("/log-out", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.sendStatus(200);
  });
});

module.exports = app;
