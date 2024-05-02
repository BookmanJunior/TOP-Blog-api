const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const Category = require("../models/Category");
const { mockCategoryID } = require("./mockCategoryId");

let mongoServer;

exports.initializeMongoServer = async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  await new Category({
    title: "mock category",
    _id: mockCategoryID,
  }).save();

  mongoose.connection.on("error", (e) => {
    if (e.message.code === "ETIMEDOUT") {
      console.log(e);
      mongoose.connect(mongoUri);
    }
  });

  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
};

exports.closeMongoServer = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};
