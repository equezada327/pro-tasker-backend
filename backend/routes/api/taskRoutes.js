const express = require('express');
const Task = require('../../models/Task');
const Project = require('../../models/Project');
const { authenticateToken, verifyTaskOwnership } = require('../../utils/auth');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// @route   PUT /api/tasks/:taskId
// @desc    Update a specific task
// @access  Private (project owner only)
router.put('/:taskId', verifyTaskOwnership, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = req.task; // Available from verifyTaskOwnership middleware

    // Update fields if provided
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Save updated task
    await task.save();

    // Populate project details for response
    await task.populate('project', 'name');

    res.json({
      message: 'Task updated successfully.',
      task
    });

  } catch (error) {
    console.error('Task update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error.',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error during task update.'
    });
  }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a specific task
// @access  Private (project owner only)
router.delete('/:taskId', verifyTaskOwnership, async (req, res) => {
  try {
    const task = req.task; // Available from verifyTaskOwnership middleware
    
    // Store task info for response before deletion
    const taskInfo = {
      id: task._id,
      title: task.title,
      projectName: task.project.name
    };

    // Delete the task
    await Task.deleteOne({ _id: task._id });

    res.json({
      message: 'Task deleted successfully.',
      deletedTask: taskInfo
    });

  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      message: 'Server error during task deletion.'
    });
  }
});

// @route   GET /api/tasks/:taskId
// @desc    Get a specific task
// @access  Private (project owner only)
router.get('/:taskId', verifyTaskOwnership, async (req, res) => {
  try {
    const task = req.task; // Available from verifyTaskOwnership middleware

    // Populate project details
    await task.populate('project', 'name description user');

    res.json({
      message: 'Task retrieved successfully.',
      task
    });

  } catch (error) {
    console.error('Task fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching task.'
    });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user across all projects
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, priority, project, sort = 'createdAt', order = 'desc' } = req.query;

    // First, get all projects owned by the user
    const userProjects = await Project.find({ user: userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    // Build query for tasks in user's projects
    const query = { project: { $in: projectIds } };

    // Add filters if provided
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) {
      // Verify the project belongs to the user
      if (projectIds.some(id => id.toString() === project)) {
        query.project = project;
      } else {
        return res.status(400).json({
          message: 'Invalid project ID or project does not belong to you.'
        });
      }
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Find tasks with filtering and sorting
    const tasks = await Task.find(query)
      .sort(sortObj)
      .populate('project', 'name')
      .limit(100); // Limit results for performance

    // Group tasks by status for summary
    const tasksSummary = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      message: 'Tasks retrieved successfully.',
      count: tasks.length,
      summary: tasksSummary,
      tasks
    });

  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching tasks.'
    });
  }
});

// @route   PATCH /api/tasks/:taskId/status
// @desc    Update only the status of a task (quick status change)
// @access  Private (project owner only)
router.patch('/:taskId/status', verifyTaskOwnership, async (req, res) => {
  try {
    const { status } = req.body;
    const task = req.task;

    // Validate status
    const validStatuses = ['To Do', 'In Progress', 'Done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: To Do, In Progress, Done'
      });
    }

    // Update only the status
    task.status = status;
    await task.save();

    // Populate project for response
    await task.populate('project', 'name');

    res.json({
      message: 'Task status updated successfully.',
      task: {
        id: task._id,
        title: task.title,
        status: task.status,
        project: task.project,
        updatedAt: task.updatedAt
      }
    });

  } catch (error) {
    console.error('Task status update error:', error);
    res.status(500).json({
      message: 'Server error during task status update.'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics for the authenticated user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all user's projects
    const userProjects = await Project.find({ user: userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    // Aggregate task statistics
    const stats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'To Do'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          doneTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
          },
          urgentTasks: {
            $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'Done'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const taskStats = stats[0] || {
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      doneTasks: 0,
      highPriorityTasks: 0,
      urgentTasks: 0,
      overdueTasks: 0
    };

    // Calculate completion rate
    const completionRate = taskStats.totalTasks > 0 
      ? Math.round((taskStats.doneTasks / taskStats.totalTasks) * 100)
      : 0;

    res.json({
      message: 'Task statistics retrieved successfully.',
      stats: {
        ...taskStats,
        completionRate: `${completionRate}%`,
        projectCount: userProjects.length
      }
    });

  } catch (error) {
    console.error('Task stats error:', error);
    res.status(500).json({
      message: 'Server error fetching task statistics.'
    });
  }
});

module.exports = router;