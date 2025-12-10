const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: [true, 'Project must belong to a user']
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries by user
projectSchema.index({ user: 1 });

// Index for user + name combination for uniqueness per user
projectSchema.index({ user: 1, name: 1 }, { unique: true });

// Virtual for getting tasks associated with this project
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

// Pre-remove hook to delete associated tasks when project is deleted
projectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete all tasks associated with this project
    await mongoose.model('Task').deleteMany({ project: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Project', projectSchema);