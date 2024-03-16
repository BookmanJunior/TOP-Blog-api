exports.isAdmin = (req, res, next) => {
  if (res.locals.currentUser.role !== "admin") {
    return res.status(401).send({ message: "Unauthorized" });
  }

  return next();
};
