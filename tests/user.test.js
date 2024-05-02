const express = require("express");
const request = require("supertest");
const MongoServer = require("./mongoConfigTesting");
const userController = require("../controllers/userController");
const { UserValidation } = require("../validators/UserValidation");

app = express();

app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals.currentUser = "65cde24a86437d8bd4d493a4";
  next();
});

app.get("/user/:id", userController.user_get);
app.post("/users", UserValidation(), userController.user_post);
app.put("/users/:id", UserValidation(), userController.user_update);
app.delete("/users/:id", userController.user_delete);
