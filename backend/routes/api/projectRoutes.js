const express = require('express');
const Project = require('../../models/Project');
const Task = require('../../models/Task');
const { authenticateToken, verifyOwnership } = require('../../utils/auth');

const router = express.Router();

// Apply authentication middleware to all project routes
router.use(authenticateToken);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        message: 'Please provide project name and description.'
      });
    }

    // Create new project with authenticated user as owner
    const project = new Project({
      name: name.trim(),
      description: description.trim(),
      status: status || 'Active',
      user: req.user._id // Set owner from authenticated user
    });

    // Save project to database
    await project.save();

    // Populate user details for response
    await project.populate('user', 'username email');

    res.status(201).json({
      message: 'Project created successfully.',
      project
    });

  } catch (error) {
    console.error('Project creation error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error.',
        errors
      });
    }

    // Handle duplicate project name for user
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already have a project with this name.'
      });
    }

    res.status(500).json({
      message: 'Server error during project creation.'
    });
  }
});

// @route   GET /api/projects
// @desc    Get all projects for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Get query parameters for filtering and sorting
    const { status, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build query for user's projects
    const query = { user: req.user._id };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Find projects with optional filtering and sorting
    const projects = await Project.find(query)
      .sort(sortObj)
      .populate('user', 'username email');

    // Count tasks for each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return {
          ...project.toObject(),
          taskCount
        };
      })
    );

    res.json({
      message: 'Projects retrieved successfully.',
      count: projectsWithTaskCount.length,
      projects: projectsWithTaskCount
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching projects.'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Private (owner only)
router.get('/:id', verifyOwnership(Project), async (req, res) => {
  try {
    // Project is already verified and available from middleware
    const project = req.resource;

    // Populate user details
    await project.populate('user', 'username email');

    // Get task count and recent tasks
    const taskCount = await Task.countDocuments({ project: project._id });
    const recentTasks = await Task.find({ project: project._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt');

    res.json({
      message: 'Project retrieved successfully.',
      project: {
        ...project.toObject(),
        taskCount,
        recentTasks
      }
    });

  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching project.'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (owner only)
router.put('/:id', verifyOwnership(Project), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = req.resource;

    // Update fields if provided
    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status !== undefined) project.status = status;

    // Save updated project
    await project.save();

    // Populate user details for response
    await project.populate('user', 'username email');

    res.json({
      message: 'Project updated successfully.',
      project
    });

  } catch (error) {
    console.error('Project update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error.',
        errors
      });
    }

    // Handle duplicate project name for user
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already have a project with this name.'
      });
    }

    res.status(500).json({
      message: 'Server error during project update.'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project and all its tasks
// @access  Private (owner only)
router.delete('/:id', verifyOwnership(Project), async (req, res) => {
  try {
    const project = req.resource;

    // Count tasks that will be deleted
    const taskCount = await Task.countDocuments({ project: project._id });

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    // Delete the project
    await Project.deleteOne({ _id: project._id });

    res.json({
      message: 'Project and associated tasks deleted successfully.',
      deletedProject: {
        id: project._id,
        name: project.name,
        deletedTasksCount: taskCount
      }
    });

  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      message: 'Server error during project deletion.'
    });
  }
});

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private (project owner only)
router.get('/:projectId/tasks', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user._id;

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, user: userId });
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied.'
      });
    }

    // Get query parameters for filtering and sorting
    const { status, priority, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build query for project tasks
    const query = { project: projectId };
    
    // Add filters if provided
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Find tasks with filtering and sorting
    const tasks = await Task.find(query)
      .sort(sortObj)
      .populate('project', 'name');

    res.json({
      message: 'Tasks retrieved successfully.',
      project: {
        id: project._id,
        name: project.name
      },
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Project tasks fetch error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project ID format.'
      });
    }
    
    res.status(500).json({
      message: 'Server error fetching project tasks.'
    });
  }
});

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task for a specific project
// @access  Private (project owner only)
router.post('/:projectId/tasks', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user._id;
    const { title, description, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: 'Please provide task title and description.'
      });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, user: userId });
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied.'
      });
    }

    // Create new task
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      status: status || 'To Do',
      priority: priority || 'Medium',
      project: projectId,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    // Save task to database
    await task.save();

    // Populate project details for response
    await task.populate('project', 'name');

    res.status(201).json({
      message: 'Task created successfully.',
      task
    });

  } catch (error) {
    console.error('Task creation error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error.',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project ID format.'
      });
    }

    res.status(500).json({
      message: 'Server error during task creation.'
    });
  }
});

module.exports = router;