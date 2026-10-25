import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { getJwtSecret } from './config/auth';
import authRoutes from './routes/authRoutes';
import modelRoutes from './routes/modelRoutes';
import { requireAuth } from './middleware/auth';

// Load environment variables
dotenv.config();

// Fail fast if production is missing its signing secret.
if (process.env.NODE_ENV === 'production') {
  getJwtSecret();
}

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDatabase();
const allowedOrigins = [
  'https://tweetwatch.rohitdhawadkar.in',
  'http://localhost:5173',
  'http://localhost:5199',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any localhost port during local development.
    if (
      process.env.NODE_ENV !== 'production' &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.log('Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
}));
// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Auth is public; every data route below requires a valid Bearer token.
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth, modelRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'TweetWatch Backend',
    database: 'Connected to MongoDB'
  });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`TweetWatch Backend server running on port ${port}`);
});
