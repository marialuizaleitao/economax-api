import app from './app';
import { connectDB } from './database/connection';
import { runMigrations } from './database/migrations';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database and run migrations
    await connectDB();
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error('Error during server startup:', error);
  process.exit(1);
});