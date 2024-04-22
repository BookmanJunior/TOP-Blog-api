const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const strategy = require("./Auth/Authentication");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const User = require("./models/User");
const UserController = require("./controllers/userController");
const authorizationController = require("./controllers/authorizationController");
const loginMiddlewares = require("./controllers/loginController");
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
const userController = require("./routes/user");
const adminLoginController = require("./routes/adminLogin");
const categoryController = require("./routes/category");

const app = express();
const sessionOptions = {
  name: "blog",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

if (process.env.NODE_ENV === "production") {
  sessionOptions.cookie.secure = true;
  sessionOptions.cookie.sameSite = "none";
}

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
    const user = await User.findById(id, "username bookmarks role").exec();
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
app.use("/category", categoryController);
app.use("/login", loginController);
app.use("/sign-up", usersRouter);
app.use("/admin", adminLoginController);
app.use("/cms", authorizationController.isAdmin, cmsController);
app.use("/me", userController);
app.post("/auto-login", UserController.me);
app.delete("/log-out", loginMiddlewares.logout);

module.exports = app;
