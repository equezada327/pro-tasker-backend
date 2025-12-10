const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token for user
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Middleware to verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if no token provided
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token format.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token payload
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is valid but user not found.' 
      });
    }

    // Add user to request object for use in protected routes
    req.user = user;
    next();

  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access denied. Token expired.' 
      });
    }

    // Handle other errors
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication.' 
    });
  }
};

// Middleware to verify resource ownership
const verifyOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user._id;

      // Find the resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          message: `${Model.modelName} not found.` 
        });
      }

      // Check ownership
      if (resource.user.toString() !== userId.toString()) {
        return res.status(403).json({ 
          message: `Access denied. You don't own this ${Model.modelName.toLowerCase()}.` 
        });
      }

      // Add resource to request for use in route handler
      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership verification error:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          message: 'Invalid resource ID format.' 
        });
      }
      
      res.status(500).json({ 
        message: 'Server error during ownership verification.' 
      });
    }
  };
};

// Middleware to verify task ownership through project
const verifyTaskOwnership = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user._id;

    const Task = require('../models/Task');
    
    // Find task and populate project
    const task = await Task.findById(taskId).populate('project', 'user');
    
    if (!task) {
      return res.status(404).json({ 
        message: 'Task not found.' 
      });
    }

    // Check if user owns the project that contains this task
    if (task.project.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You don\'t own the project containing this task.' 
      });
    }

    // Add task to request for use in route handler
    req.task = task;
    next();

  } catch (error) {
    console.error('Task ownership verification error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid task ID format.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during task ownership verification.' 
    });
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  verifyOwnership,
  verifyTaskOwnership
};