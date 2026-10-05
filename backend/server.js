const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({
  path: path.join(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const {
  notFound,
  errorHandler
} = require('./middleware/errorMiddleware');

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true
  })
);

// Parse JSON requests
app.use(
  express.json({
    limit: '1mb'
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FixMyCampus API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.use(
  '/api/users',
  require('./routes/userRoutes')
);

app.use(
  '/api/issues',
  require('./routes/issueRoutes')
);

app.use(
  '/api/announcements',
  require('./routes/announcementRoutes')
);

app.use(
  '/api/feedback',
  require('./routes/feedbackRoutes')
);

app.use(
  '/api/admin',
  require('./routes/adminRoutes')
);

/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

// 404 - Route not found
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify required environment variables
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI is not configured. Check backend/.env'
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET is not configured. Check backend/.env'
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(port, () => {
      console.log(`FixMyCampus API listening on port ${port}`);
      console.log(`Local API: http://localhost:${port}`);
    });
  } catch (error) {
    console.error(
      `Database/server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();