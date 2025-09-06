import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import modelRoutes from './routes/modelRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', modelRoutes);

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
