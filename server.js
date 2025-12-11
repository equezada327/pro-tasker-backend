// Load environment variables first
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');

// Import route files
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize Express app
const app = express();

app.use(cors({
  origin: 'https://pro-tasker-frontend-lpxn.onrender.com',
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false })); // Parse JSON bodies

// Define API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Pro-Tasker-v1 API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Pro-Tasker-v1 API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});