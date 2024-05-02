const express = require("express");
const request = require("supertest");
const MongoServer = require("./mongoConfigTesting");
const categoryController = require("../controllers/categoryController");

app = express();

app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals.currentUser = "65cde24a86437d8bd4d493a4";
  next();
});

app.post("/category", categoryController.categories_post);
app.delete(
  "/category/:id",
  categoryController.category_delete,
  categoryController.categories_get
);

describe("Category post route tests", () => {
  beforeAll(MongoServer.initializeMongoServer);
  afterAll(MongoServer.closeMongoServer);

  it("Successfully create a category", async () => {
    const res = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "test" });
    expect(res._body).toHaveProperty("title", "test");
  });

  it("Prevent creating an empty category", async () => {
    await request(app).post("/category").type("form").send({});
    expect(400);
  });

  it("Prevent creating a duplicate category", async () => {
    const res = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "test" });
    const duplicateRes = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "Test" });
    expect(400);
  });
});

describe("Category delete middleware tests", () => {
  beforeAll(MongoServer.initializeMongoServer);
  afterAll(MongoServer.closeMongoServer);

  it("Delete category and return empty category list", async () => {
    const res = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "test" });
    expect(res._body).toHaveProperty("title", "test");
    const deleteRes = await request(app).delete(`/category/${res._body._id}`);
    expect(deleteRes._body.length).toBe(0);
  });

  it("Return not found error", async () => {
    await request(app).delete(`/category/${123345}`);
    expect(404);
  });
});
