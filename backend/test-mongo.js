require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');
console.log('URI (masked):', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('‚úÖ MongoDB Atlas connected successfully!');
    console.log('Ì≥ä Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((error) => {
    console.error('‚ùå MongoDB connection failed:', error.message);
    process.exit(1);
  });
