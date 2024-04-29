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

app.get("/article/:id", articleController.article_get);
app.post("/article", ArticleValidation(), articleController.article_post);
app.put("/article/:id", ArticleValidation(), articleController.article_edit);

describe("Article post tests", () => {
  const mockArticle = {
    title: "Test article",
    content: "The content goes here",
    cover: "https://media.graphassets.com/fbC623WSCiSdF9djpWQo",
    comments: [],
    category: "6621205cbc0ae006099a1d05",
    featured: false,
    published: true,
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

describe("Article edit test", () => {
  const mockArticle = {
    title: "Test article",
    content: "The content goes here",
    cover: "https://media.graphassets.com/fbC623WSCiSdF9djpWQo",
    comments: [],
    category: "6621205cbc0ae006099a1d05",
    featured: false,
    published: true,
  };

  const mockArticleChanged = {
    ...mockArticle,
    title: "New title",
  };

  beforeAll(MongoMemory.initializeMongoServer);
  afterAll(MongoMemory.closeMongoServer);

  it("Create new article and change the title", async () => {
    const data = await request(app)
      .post("/article")
      .type("form")
      .send(mockArticle);
    const createdArticleId = data._body._id;
    mockArticleChanged._id = createdArticleId;
    const response = await request(app)
      .put(`/article/${createdArticleId}`)
      .type("form")
      .send(mockArticleChanged);
    expect(response._body).toHaveProperty("title", mockArticleChanged.title);
  });
});
