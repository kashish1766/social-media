const express = require("express");
const fs = require("fs");
const { authenticate } = require("./auth");
const router = express.Router();

const POSTS_FILE = "./UserData/posts.json";
const COMMENTS_FILE = "./UserData/comments.json";

// loading and writing data to the JSON files
const loadPosts = () => JSON.parse(fs.readFileSync(POSTS_FILE, "utf8"));
const savePosts = (posts) =>
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));

const loadComments = () => JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf8"));
const saveComments = (comments) =>
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));

// create route to create a post
router.post("/create", authenticate, (req, res) => {
  const { title, description, visibility } = req.body; // New field 'visibility'
  const newPost = {
    id: Date.now(),
    userId: req.user.id,
    title,
    description,
    visibility: visibility || "public", // Default to 'public' if not specified
    likes: 0,
    comments: [],
  };
  const posts = loadPosts();
  posts.push(newPost);
  savePosts(posts);
  res.json({ message: "Post created", post: newPost });
});

// to fetch all the posts
router.get("/", (req, res) => {
  const posts = loadPosts();
  if (req.user) {
    // if authenticated all posts are visible
    res.json({ posts });
  } else {
    // if not then only public ones
    const publicPosts = posts.filter((post) => post.visibility === "public");
    res.json({ posts: publicPosts });
  }
});

// to like a post
router.post("/like/:postId", authenticate, (req, res) => {
  const postId = parseInt(req.params.postId);
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) return res.status(404).json({ message: "Post not found" });
  post.likes += 1;
  savePosts(posts);
  res.json({ message: "Post liked", post });
});

// to delete a post
router.delete("/delete/:postId", authenticate, (req, res) => {
  const postId = parseInt(req.params.postId);
  const posts = loadPosts();
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  const post = posts[postIndex];
  const isAdmin = req.user.role === "admin"; // Check if user is admin

  if (post.userId !== req.user.id && !isAdmin) {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this post." });
  }

  posts.splice(postIndex, 1);
  savePosts(posts);
  res.json({ message: "Post removed successfully." });
});

module.exports = router;
