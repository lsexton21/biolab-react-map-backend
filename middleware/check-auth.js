const HttpError = require("./http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new HttpError("Authentication Failed.", 401));
    }
    const authenticatedUser = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: authenticatedUser.userId };
    next();
  } catch (err) {
    return next(new HttpError("Verification Failed.", 500));
  }
};
