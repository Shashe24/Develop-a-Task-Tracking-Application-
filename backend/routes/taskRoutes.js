const express = require("express");
const router = express.Router();
const { getTasks, getTask, postTask, patchTask, deleteTask } = require("../controllers/taskControllers");
const { verifyAccessToken } = require("../middlewares.js");

// Routes beginning with /api/tasks
router.get("/", verifyAccessToken, getTasks);
router.get("/:taskId", verifyAccessToken, getTask);
router.post("/", verifyAccessToken, postTask);
router.patch("/:taskId", verifyAccessToken, patchTask);
router.delete("/:taskId", verifyAccessToken, deleteTask);

module.exports = router;
