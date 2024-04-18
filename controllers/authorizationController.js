const unauthorizedError = { message: "Unauthorized" };

exports.isAdmin = (req, res, next) => {
  const currentUser = res.locals.currentUser;

  if (currentUser && currentUser.role === "admin") {
    return next();
  }

  return res.status(401).send(unauthorizedError);
};

exports.isAuthorized = async (req, res, next) => {
  const { currentUser } = res.locals;

  if (!currentUser) {
    return res.status(403).send(unauthorizedError);
  }

  next();
};
