const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const expiration = "24h";

// Middleware to verify token and attach user to req.user
function authMiddleware(req, res, next) {
  let token = req.body?.token || req.query?.token || req.headers?.authorization;

  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    return res.status(403).json({ message: "Please Login or Register" });
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch (err) {
    console.log("Invalid token");
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  next();
}

// Middleware to restrict access to admins only
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}

// Generate a JWT token
function signToken({ username, email, _id }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

module.exports = {
  authMiddleware,
  adminOnly,
  signToken,
};
