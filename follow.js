const express = require("express");
const fs = require("fs");
const { authenticate } = require("./auth");
const router = express.Router();

const USERS_FILE = "./UserData/users.json";

const loadUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
const saveUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Follow a User
router.post("/follow/:userId", authenticate, (req, res) => {
  const userIdToFollow = parseInt(req.params.userId);
  const users = loadUsers();
  const currentUser = users.find((u) => u.id === req.user.id);
  const userToFollow = users.find((u) => u.id === userIdToFollow);

  if (!userToFollow || currentUser.following.includes(userIdToFollow)) {
    return res.status(400).json({ message: "Sorry,Unable to follow user" });
  }

  currentUser.following.push(userIdToFollow);
  userToFollow.followers.push(currentUser.id);
  saveUsers(users);
  res.json({ message: `You are now following ${userToFollow.email}` });
});

// Get Followers and Following
router.get("/followers", authenticate, (req, res) => {
  const users = loadUsers();
  const currentUser = users.find((u) => u.id === req.user.id);
  res.json({
    followers: currentUser.followers,
    following: currentUser.following,
  });
});

module.exports = router;
