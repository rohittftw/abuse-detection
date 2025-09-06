
# TweetWatch - Social Media Abuse Detection System

A comprehensive system for detecting and analyzing abusive content and sentiment in Twitter/X posts using advanced machine learning models.

## Overview

TweetWatch is a full-stack application that combines social media data collection with sophisticated AI analysis to identify potentially harmful content. The system uses state-of-the-art transformer models to classify tweets for abuse detection and sentiment analysis, providing real-time insights and historical analytics.

## Architecture

The system consists of three main components:

### Backend Services
- **Node.js/Express API** - Main application server with RESTful endpoints
- **FastAPI ML Service** - Dedicated Python service for machine learning predictions
- **MongoDB Database** - Document storage for tweets and analysis sessions

### Frontend Application
- **React/TypeScript** - Modern web interface with responsive design
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Smooth animations and interactions

### Machine Learning Models
- **Twitter RoBERTa Abuse Detection** - Fine-tuned model for identifying abusive content
- **Twitter RoBERTa Sentiment Analysis** - Specialized model for social media sentiment

## Features

### Core Functionality
- Real-time tweet analysis for abuse and sentiment
- Hashtag-based tweet collection and monitoring
- Risk level classification (Low, Medium, High)
- Batch processing with session tracking

### Analytics Dashboard
- Comprehensive statistics and metrics
- Risk distribution visualization
- Sentiment trends analysis
- Historical data querying

### Data Management
- Automated tweet storage and indexing
- Duplicate detection and handling
- Configurable analysis parameters
- Export capabilities

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- FastAPI for ML model serving
- Python with Transformers library

### Frontend
- React 19 with TypeScript
- Vite build system
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- Framer Motion for animations

### Machine Learning
- Hugging Face Transformers
- PyTorch backend
- cardiffnlp/twitter-roberta-base-hate-latest model
- Custom model fine-tuning capabilities

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (v5.0 or higher)
- Git

### Backend Setup

1. Install Node.js dependencies:
```bash
cd backend
npm install
```

2. Create environment configuration:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3001)
- Additional API keys as needed

4. Build TypeScript:
```bash
npm run build
```

5. Start the development server:
```bash
npm run dev
```

### Python ML Service Setup

1. Install Python dependencies:
```bash
pip install fastapi uvicorn transformers torch
```

2. Download and prepare models:
```bash
python app.py
```

3. Start the ML service:
```bash
python Server.py
```

The service will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Analysis Endpoints
- `POST /api/predict-abuse` - Analyze text for abusive content
- `POST /api/predict-sentiment` - Analyze sentiment of text
- `POST /api/fetch-tweets` - Collect and analyze tweets by hashtag

### Data Endpoints
- `GET /api/tweets` - Retrieve stored tweets with filtering
- `GET /api/sessions` - Get analysis session history
- `GET /api/dashboard/stats` - Dashboard statistics

### Analytics Endpoints
- `GET /api/analytics/risk-trends` - Risk trend analysis over time
- `GET /api/analytics/sentiment-analysis` - Detailed sentiment breakdown

### Health Check
- `GET /health` - Service health status

## Usage

### Single Text Analysis
Send a POST request to analyze individual text:
```json
{
  "text": "Your text content here"
}
```

### Hashtag Monitoring
Monitor hashtags for abusive content:
```json
{
  "hashtag": "#example",
  "maxResults": 50,
  "saveToDb": true
}
```

### Data Querying
Retrieve analyzed data with filters:
```
GET /api/tweets?hashtag=example&riskLevel=high&limit=20
```

## Configuration

### Environment Variables
- `MONGODB_URI` - Database connection string (default: mongodb://localhost:27017/tweetwatch)
- `PORT` - Backend server port (default: 3001)
- API keys for external services as required

### Database Configuration
The system automatically creates necessary indexes for optimal query performance. MongoDB connection is configured through the environment variables.

### Model Configuration
Models are automatically downloaded from Hugging Face Hub on first run. The system supports:
- Custom model paths
- GPU acceleration when available
- Model caching for improved performance

## Project Structure

```
project/
├── backend/                 # Node.js API server
│   ├── Controller/         # Request handlers
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   └── types/             # TypeScript type definitions
├── frontend/frontend/      # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   └── screens/       # Page components
│   └── public/            # Static assets
├── Server.py              # FastAPI ML service
└── app.py                # Model setup script
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

For questions and support:
- Open an issue in the GitHub repository
- Check existing issues for solutions
- Refer to the API documentation for usage details

## Acknowledgments

- Hugging Face for pre-trained transformer models
- Cardiff NLP for the Twitter RoBERTa abuse detection model
- Twitter/X API for data access capabilities
- MongoDB for robust document storage
- The open source community for essential libraries and frameworks
```
