const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth");
const postRoutes = require("./post");
const followRoutes = require("./follow");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/user", followRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
