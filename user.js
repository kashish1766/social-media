const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const usersDataPath = path.join(__dirname, "data", "users.json");

const getUsers = () => {
  const data = fs.readFileSync(usersDataPath);
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));
};

// to follow the user
const followUser = (followerId, followeeId) => {
  const users = getUsers();
  const follower = users.find((u) => u.id === followerId);
  const followee = users.find((u) => u.id === followeeId);

  if (follower && followee && !follower.following.includes(followeeId)) {
    follower.following.push(followeeId);
    followee.followers.push(followerId);
    saveUsers(users);
    return true;
  }
  return false;
};

// get follwing and follower counts
const getFollowersAndFollowing = (userId) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  return {
    followers: user ? user.followers : [],
    following: user ? user.following : [],
  };
};

// change account privacy settings
const setAccountPrivacy = (userId, isPublic) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.isPublic = isPublic;
    saveUsers(users);
    return true;
  }
  return false;
};

module.exports = { followUser, getFollowersAndFollowing, setAccountPrivacy };
