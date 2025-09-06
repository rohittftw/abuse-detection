# Session-Based Analysis Functionality

## ✅ **Features Implemented:**

### **🗄️ Database Schema with Foreign Key Relationships:**

#### **AnalysisSession Model:**
```typescript
{
  sessionId: string;        // Unique identifier
  sessionName: string;      // User-friendly name (e.g., "India Analysis - Dec 15")
  query: string;           // Original search query
  hashtag: string;         // Extracted hashtag
  maxResults: number;      // Number of tweets requested
  startedAt: Date;         // Session start time
  completedAt?: Date;      // Session completion time
  status: 'pending' | 'completed' | 'failed';
  summary: {               // Analysis summary
    totalTweets: number;
    processedTweets: number;
    riskDistribution: {...};
    sentimentDistribution: {...};
  }
}
```

#### **Tweet Model (Updated):**
```typescript
{
  tweetId: string;         // Twitter tweet ID
  sessionId: string;       // Foreign key to AnalysisSession
  text: string;           // Tweet content
  author: {...};          // Author information
  analysis: {...};        // AI analysis results
  // ... other fields
}
```

### **🔗 Foreign Key Relationships:**
- **One-to-Many**: One AnalysisSession can have many Tweets
- **Reference**: `Tweet.sessionId` → `AnalysisSession.sessionId`
- **Indexed**: Optimized queries for session-based tweet retrieval

### **🌐 API Endpoints:**

#### **1. Get All Sessions:**
```http
GET /api/sessions
```
**Response:**
```json
[
  {
    "sessionId": "uuid-123",
    "sessionName": "India Analysis - Dec 15",
    "query": "#India lang:en",
    "hashtag": "India",
    "startedAt": "2024-12-15T10:30:00Z",
    "tweetCount": 20
  }
]
```

#### **2. Get Tweets by Session Name:**
```http
GET /api/sessions/{sessionName}/tweets
```
**Response:**
```json
{
  "tweets": [...],
  "session": {
    "sessionId": "uuid-123",
    "sessionName": "India Analysis - Dec 15",
    "query": "#India lang:en",
    "hashtag": "India"
  }
}
```

#### **3. Get Tweets by Session ID:**
```http
GET /api/sessions/id/{sessionId}/tweets
```

#### **4. Re-analyze Session Tweets:**
```http
POST /api/sessions/{sessionName}/reanalyze
```
**Response:** Full analysis results with updated AI analysis

### **🎨 Frontend Features:**

#### **Recent Sessions Display:**
- **Location**: Below analysis results, above search history
- **Shows**: Session name, query, hashtag, tweet count, timestamp
- **Interactive**: Click to load analysis from database
- **Visual**: Selected session highlighted
- **Refresh**: Manual refresh button

#### **Session Information Panel:**
- **Shows**: Session ID, session name, original query
- **Appears**: When viewing analysis from a session
- **Styling**: Highlighted box with session details

#### **Click-to-Load Functionality:**
1. **Click Session**: Loads tweets from database
2. **Processing**: Shows loading state
3. **Analysis**: Displays full analysis results
4. **Individual Tweets**: Toggle to view detailed breakdown

### **🔄 Workflow:**

#### **Creating a New Session:**
1. Enter search term (e.g., "#India lang:en")
2. Optionally provide custom session name
3. Click "Analyze from Twitter"
4. System creates session with auto-generated or custom name
5. Tweets saved with sessionId reference
6. Recent sessions list updates automatically

#### **Loading from Existing Session:**
1. View "Recent Analysis Sessions" section
2. Click on any session card
3. System fetches tweets from database
4. Displays full analysis with session info
5. Can toggle individual tweet analysis

#### **Re-analyzing Session:**
1. Use reanalyze endpoint to run fresh AI analysis
2. Useful for updated models or different analysis parameters
3. Maintains original tweet data with new analysis

### **💾 Database Benefits:**

#### **Data Organization:**
- **Sessions**: Group related analyses
- **Tweets**: Linked to specific sessions
- **Queries**: Track what was searched
- **Timestamps**: When analysis was performed

#### **Query Performance:**
- **Indexed Fields**: sessionId, sessionName, hashtag, createdAt
- **Fast Lookups**: Session-based tweet retrieval
- **Efficient Filtering**: By session, hashtag, or date range

#### **Data Integrity:**
- **Foreign Key Constraints**: Ensures data consistency
- **Referential Integrity**: Can't delete session with tweets
- **Cascade Operations**: Handle related data properly

### **🎯 Usage Examples:**

#### **Frontend Integration:**
```typescript
// Fetch recent sessions
const sessions = await fetch('http://localhost:3001/api/sessions');

// Load tweets from session
const sessionData = await fetch(`http://localhost:3001/api/sessions/${sessionName}/tweets`);

// Re-analyze session
const reanalyzed = await fetch(`http://localhost:3001/api/sessions/${sessionName}/reanalyze`, {
  method: 'POST'
});
```

#### **Backend Service:**
```typescript
// Get tweets by session name
const { tweets, session } = await TweetService.getTweetsBySessionName(sessionName);

// Get all session names with metadata
const sessions = await TweetService.getSessionNames();

// Re-analyze session tweets
const results = await reanalyzeSessionTweets(sessionName);
```

### **🔧 Technical Implementation:**

#### **Session Name Generation:**
```typescript
// Auto-generated format: "hashtag_MMM DD, HH:MM"
// Example: "india_Dec 15, 10:30"
private static generateSessionName(query: string, hashtag: string): string {
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const cleanHashtag = hashtag.replace(/[#\s]/g, '').toLowerCase();
  return `${cleanHashtag}_${timestamp}`;
}
```

#### **Database Queries:**
```typescript
// Find session by name
const session = await AnalysisSession.findOne({ sessionName });

// Get tweets for session
const tweets = await Tweet.find({ sessionId: session.sessionId });

// Get session with tweet count
const sessions = await AnalysisSession.aggregate([
  { $lookup: { from: 'tweets', localField: 'sessionId', foreignField: 'sessionId', as: 'tweets' }},
  { $addFields: { tweetCount: { $size: '$tweets' }}}
]);
```

### **🚀 Ready to Use!**

The session-based functionality is now fully implemented with:
- ✅ Database schema with foreign key relationships
- ✅ API endpoints for session management
- ✅ Frontend interface for session selection
- ✅ Click-to-load functionality
- ✅ Session information display
- ✅ Re-analysis capabilities

Users can now create named analysis sessions, view recent sessions, and click to load previous analyses from the database! 🎉
