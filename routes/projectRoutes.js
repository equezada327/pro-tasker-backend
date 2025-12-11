const express = require("express");
// const { authMiddleware } = require("../middlewares/auth"); // Temporarily disabled for Lab 2
const Project = require("../models/Project");

const projectRouter = express.Router();

// projectRouter.use(authMiddleware); // Temporarily disabled for Lab 2

/**
 * GET /api/projects
 */
projectRouter.get("/", async (req, res) => {
  try {
    const userProjects = await Project.find(); // No user filtering for Lab 2
    res.json(userProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId
 */
projectRouter.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: `Project with id: ${projectId} not found!` });
    }

    res.json(project); // Skipping user ownership check
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 */
projectRouter.post("/", async (req, res) => {
  try {
    const newProject = await Project.create({
      ...req.body,
      // user: req.user._id, // Skipped for Lab 2
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/:projectId
 */
projectRouter.put("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:projectId
 */
projectRouter.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = projectRouter;
