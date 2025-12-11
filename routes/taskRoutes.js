const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Task = require("../models/Task");

const taskRouter = express.Router();

// Protect all routes with authentication middleware
// This ensures only logged-in users can access these endpoints
// We apply it globally to all routes in this router
taskRouter.use(authMiddleware);

/**
 * GET /api/tasks
 * Retrieve all tasks belonging to projects owned by the authenticated user
 * We query the database to find tasks where the project belongs to the logged-in user
 * This avoids fetching all tasks and filtering in memory, improving performance
 */
taskRouter.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    // Find tasks where the project belongs to the logged-in user
    const tasks = await Task.find()
      .populate({
        path: "project",
        match: { user: req.user._id }, // Only projects owned by this user
        select: "name user"
      });

    // Filter out tasks where project was not populated (i.e., not owned by user)
    const userTasks = tasks.filter(task => task.project !== null);

    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task under a project owned by the authenticated user
 * We verify ownership of the project before creating the task
 */
taskRouter.post("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { project, title, description, status, priority, dueDate } = req.body;

    // Verify the project belongs to the user
    const projectOwned = await Task.findOne({ _id: project }).populate({
      path: "project",
      match: { user: req.user._id }
    });

    if (!projectOwned) {
      return res.status(403).json({ message: "User not authorized to add tasks to this project" });
    }

    // Create the new task
    const newTask = await Task.create({
      project,
      user: req.user._id, // Assign the logged-in user as owner
      title,
      description,
      status,
      priority,
      dueDate
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/tasks/:taskId
 * Update a task if the authenticated user owns it
 * We verify ownership by checking the task's project user
 */
taskRouter.put("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if the logged-in user owns the project this task belongs to
    if (task.project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Update task fields if provided
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a task if the authenticated user owns it
 * Ownership is verified by checking the task's project user
 */
taskRouter.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Verify ownership
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
