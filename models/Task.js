const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Task schema
// This schema models a Task with fields for title, description, status, project, user, priority, and due date
// It includes validation, indexing, virtuals, and methods to support ownership and querying
const taskSchema = new Schema({
  // Title of the task - required, trimmed, with length constraints
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },

  // Description of the task - required, trimmed, max length
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Status of the task - enum with default value
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
    required: true
  },

  // Reference to the Project this task belongs to - required
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project', // Reference to Project model
    required: [true, 'Task must belong to a project']
  },

  // Reference to the User who owns this task - required
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: [true, 'Task must belong to a user']
  },

  // Priority level of the task - enum with default
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Due date for the task - must be in the future if provided
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Due date should be in the future if provided
        return !value || value >= new Date();
      },
      message: 'Due date must be in the future'
    }
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Indexes to improve query performance
// Index to quickly find tasks by project
taskSchema.index({ project: 1 });
// Index to filter tasks by status
taskSchema.index({ status: 1 });
// Compound index for queries filtering by project and status
taskSchema.index({ project: 1, status: 1 });

// Virtual field to populate project details when needed
// This lets us get project info easily when populating
taskSchema.virtual('projectDetails', {
  ref: 'Project',
  localField: 'project',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included when converting to JSON or Objects
// This is important for API responses to include related project info
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Static method to find tasks by project and verify user ownership
// This method first checks if the project belongs to the user
// Then returns tasks for that project
// Usage example: Task.findByProjectAndUser(projectId, userId)
taskSchema.statics.findByProjectAndUser = async function(projectId, userId) {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findOne({ _id: projectId, user: userId });

    if (!project) {
      // If no project found or it doesn't belong to the user, return null
      return null;
    }

    // Return tasks for the project, populating project name
    return await this.find({ project: projectId }).populate('project', 'name');
  } catch (error) {
    throw error;
  }
};

// Instance method to verify task ownership through its project
// Checks if the task's project user matches the given userId
// Usage example: task.verifyOwnership(userId)
taskSchema.methods.verifyOwnership = async function(userId) {
  try {
    await this.populate('project', 'user');
    return this.project.user.toString() === userId.toString();
  } catch (error) {
    throw error;
  }
};

// Export the Task model
module.exports = mongoose.model('Task', taskSchema);
