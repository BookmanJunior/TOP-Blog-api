const articleController = require("../controllers/articleController");
const { ArticleValidation } = require("../validators/ArticleValidation");

const express = require("express");
const request = require("supertest");
const app = express();
const MongoMemory = require("./mongoConfigTesting");

app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals.currentUser = "65cde24a86437d8bd4d493a4";
  next();
});
app.post("/article", ArticleValidation(), articleController.article_post);

describe("Article post tests", () => {
  const mockArticle = {
    title: "Test article",
    content: "The content goes here",
    cover: "https://media.graphassets.com/fbC623WSCiSdF9djpWQo",
    comments: [],
    category: "6621205cbc0ae006099a1d05",
    featured: false,
    published: true,
    date: Date.now,
  };

  beforeAll(MongoMemory.initializeMongoServer);
  afterAll(MongoMemory.closeMongoServer);

  it("Create new article successfully", (done) => {
    request(app)
      .post("/article")
      .type("form")
      .send(mockArticle)
      .expect(200, done);
  });

  it("New article should fail validation", (done) => {
    request(app).post("/article").type("form").send({}).expect(422, done);
  });
});
