const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project', // Reference to Project model
    required: [true, 'Task must belong to a project']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
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
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance
taskSchema.index({ project: 1 }); // For finding tasks by project
taskSchema.index({ status: 1 }); // For filtering by status
taskSchema.index({ project: 1, status: 1 }); // Compound index for common queries

// Virtual to populate project details
taskSchema.virtual('projectDetails', {
  ref: 'Project',
  localField: 'project',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Static method to get tasks by project with user verification
taskSchema.statics.findByProjectAndUser = async function(projectId, userId) {
  try {
    // First verify the project belongs to the user
    const Project = mongoose.model('Project');
    const project = await Project.findOne({ _id: projectId, user: userId });
    
    if (!project) {
      return null; // Project not found or doesn't belong to user
    }
    
    // Return tasks for this project
    return await this.find({ project: projectId }).populate('project', 'name');
  } catch (error) {
    throw error;
  }
};

// Instance method to verify task ownership through project
taskSchema.methods.verifyOwnership = async function(userId) {
  try {
    await this.populate('project', 'user');
    return this.project.user.toString() === userId.toString();
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Task', taskSchema);
