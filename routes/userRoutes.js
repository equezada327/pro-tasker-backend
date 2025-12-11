const express = require("express");
const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
} = require("../controllers/userController");

const {
  authMiddleware,
  adminOnly,
  signToken,
} = require("../middlewares/auth");

const passport = require("passport");

const userRouter = express.Router();

// GET /api/users/ — Admin-only: Get all users
userRouter.get("/", authMiddleware, adminOnly, getAllUsers);

// GET /api/users/:id — Public: Get user by ID
userRouter.get("/:id", getUserById);

// POST /api/users/register — Public: Register new user
userRouter.post("/register", registerUser);

// POST /api/users/login — Public: Login and get JWT
userRouter.post("/login", loginUser);

// GitHub OAuth — Step 1: Redirect to GitHub
userRouter.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub OAuth — Step 2: GitHub redirects back here
userRouter.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);

module.exports = userRouter;
