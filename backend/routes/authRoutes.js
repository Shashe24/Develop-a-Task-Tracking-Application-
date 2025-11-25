const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers } = require("../controllers/authControllers");
const { verifyAccessToken } = require("../middlewares.js");

// Routes beginning with /api/auth
router.post("/signup", signup);
router.post("/login", login);
router.get("/users", verifyAccessToken, getAllUsers);

module.exports = router;
