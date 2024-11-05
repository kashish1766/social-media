const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const router = express.Router();

const USERS_FILE = "./UserData/users.json";
const SECRET_KEY = "your_jwt_secret_key";

// fetching user from JSON
const loadUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

// writing user to JSON
const saveUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Signup
router.post("/signup", (req, res) => {
  const { email, password, role } = req.body;
  const users = loadUsers();
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    role,
    followers: [],
    following: [],
  };
  users.push(newUser);
  saveUsers(users);
  res.json({ message: "Signup successful", user: newUser });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res
    .cookie("token", token, { httpOnly: true })
    .json({ message: "Login successful" });
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = router;
module.exports.authenticate = authenticate;
