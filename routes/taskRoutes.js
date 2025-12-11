const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Task = require("../models/Task");

const taskRouter = express.Router();

// Protect all routes
taskRouter.use(authMiddleware);

/**
 * GET /api/tasks
 * Get all tasks for the logged-in user's projects
 */
taskRouter.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({}).populate("project");

    // Filter tasks to only include those owned by the user
    const userTasks = tasks.filter(task => task.project.user.toString() === req.user._id);
    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task under a project
 */
taskRouter.post("/", async (req, res) => {
  try {
    const { project, title, description, status } = req.body;

    const newTask = await Task.create({
      project,
      title,
      description,
      status,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/tasks/:taskId
 * Update a task
 */
taskRouter.put("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
taskRouter.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = taskRouter;
