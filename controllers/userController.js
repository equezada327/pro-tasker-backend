const User = require("../models/User");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const expiration = "24h";

// GET /api/users — Admin-only
async function getAllUsers(req, res) {
  console.log(req.user);

  if (!req.user) {
    return res.status(401).json({ message: "You must be logged in to see this!" });
  }

  const users = await User.find({});
  res.json(users);
}

// GET /api/users/:id — Public
function getUserById(req, res) {
  res.send(`Data for user: ${req.params.id}`);
}

// POST /api/users/register
async function registerUser(req, res) {
  try {
    const dbUser = await User.findOne({ email: req.body.email });

    if (dbUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create(req.body);
    console.log(user);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed." });
  }
}

// POST /api/users/login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const dbUser = await User.findOne({ email });

    if (!dbUser) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const passwordMatched = await dbUser.isCorrectPassword(password);

    if (!passwordMatched) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const payload = {
      _id: dbUser._id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    };

    const token = jwt.sign({ data: payload }, secret, { expiresIn: expiration });

    res.json({ token, user: dbUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed." });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
};
