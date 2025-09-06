import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysisSession extends Document {
  sessionId: string;
  sessionName: string; // User-friendly name for the session
  query: string;
  hashtag: string;
  maxResults: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'completed' | 'failed';
  summary: {
    totalTweets: number;
    processedTweets: number;
    failedAnalysis: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      unknown: number;
    };
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
      unknown: number;
    };
  };
  error?: string;
  processingTime?: number;
}

const AnalysisSessionSchema = new Schema<IAnalysisSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionName: {
    type: String,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  hashtag: {
    type: String,
    required: true,
    index: true
  },
  maxResults: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  summary: {
    totalTweets: { type: Number, default: 0 },
    processedTweets: { type: Number, default: 0 },
    failedAnalysis: { type: Number, default: 0 },
    riskDistribution: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      unknown: { type: Number, default: 0 }
    },
    sentimentDistribution: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      unknown: { type: Number, default: 0 }
    }
  },
  error: String,
  processingTime: Number
}, {
  timestamps: true,
  collection: 'analysis_sessions'
});

export const AnalysisSession = mongoose.model<IAnalysisSession>('AnalysisSession', AnalysisSessionSchema);
