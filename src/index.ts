import dotenv from 'dotenv';
import connectDB from './config/database';
import app from './app';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
