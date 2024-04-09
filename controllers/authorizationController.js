exports.isAdmin = (req, res, next) => {
  const currentUser = res.locals.currentUser;

  if (currentUser && currentUser.role === "admin") {
    return next();
  }

  return res.status(401).send({ message: "Unauthorized" });
};
