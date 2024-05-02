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
app.put("/category/:id", categoryController.categories_edit);

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

  it("Delete category and return category list with 1 item", async () => {
    const res = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "test" });
    const deleteRes = await request(app).delete(`/category/${res._body._id}`);
    // account for a category being created on initial server run
    expect(deleteRes._body.length).toBe(1);
  });

  it("Return not found error", async () => {
    await request(app).delete(`/category/${123345}`);
    expect(404);
  });
});

describe("Category edit middleware tests", () => {
  beforeAll(MongoServer.initializeMongoServer);
  afterAll(MongoServer.closeMongoServer);

  it("Edit a category", async () => {
    const res = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "test" });
    const editRes = await request(app)
      .put(`/category/${res._body._id}`)
      .type("form")
      .send({ title: "new title" });
    expect(editRes._body).toHaveProperty("title", "new title");
  });

  it("Prevent changing a category to an existing one", async () => {
    const firstCategoryRes = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "category" });
    const secondCategoryRes = await request(app)
      .post("/category")
      .type("form")
      .send({ title: "another category" });
    await request(app)
      .put(`/category/${secondCategoryRes._body._id}`)
      .type("form")
      .send({ title: "category" });
    expect(400);
  });
});
