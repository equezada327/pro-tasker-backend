// First, you import Mongoose — this is the library that lets you talk to MongoDB
const mongoose = require('mongoose');

// This is the function you'll call from server.js to connect to your database
const connectDB = async () => {
  try {
    // Here, you're telling Mongoose to connect using the MongoDB URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,        // This avoids warnings about the old URL parser
      useUnifiedTopology: true      // This uses the newer, more stable connection engine
    });

    // If the connection works, you'll see this message in your terminal
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If something goes wrong, this will print the error so you know what happened
    console.error(`❌ MongoDB connection error: ${error.message}`);

    // This stops your app from running if the database didn't connect 
    process.exit(1);
  }
};

// This line lets you use connectDB in other files (like server.js)
module.exports = connectDB;

