import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface TweetAnalysis {
  id: string;
  text: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
  };
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  lang: string;
  analysis: {
    sentiment: Array<{ label: string; score: number }>;
    abuse: Array<{ label: string; score: number }>;
    risk_level: string;
    confidence: number;
  };
}

interface OverallAnalysis {
  sentiment: Array<{ label: string; score: number }>;
  abuse: Array<{ label: string; score: number }>;
  risk_level: string;
  confidence: number;
  overall_sentiment: string;
  overall_abuse: string;
}

interface ApiResponse {
  data: TweetAnalysis[];
  overall: OverallAnalysis;
  meta: {
    result_count: number;
    total_fetched: number;
    failed_analysis: number;
    query: string;
  };
  query_info: {
    hashtag: string;
    max_results: number;
    processed_at: string;
  };
  session?: {
    sessionId: string;
    status: string;
    savedTweets: number;
  };
}

export const AnalysisPage = (): React.JSX.Element => {
  const [query, setQuery] = useState("#India lang:en");
  const [maxResults, setMaxResults] = useState(10);
  const [analyticsData, setAnalyticsData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIndividualTweets, setShowIndividualTweets] = useState(false);

  // Fetch data from backend
  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/fetch-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          maxResults: maxResults,
          saveToDb: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on component mount
    fetchAnalysisData();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return "text-green-600 bg-green-50 border-green-200";
      case 'negative': return "text-red-600 bg-red-50 border-red-200";
      case 'neutral': return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return "text-red-600 bg-red-50 border-red-200";
      case 'low': return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#f4f2ee]">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
          TweetWatch
        </div>
        <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
          <Link to="/" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Home</Link>
          <Link to="/detection" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Monitor</Link>
          <Link to="/analysis" className="text-[#3b3a39] font-medium underline">Analysis</Link>
          <Link to="/about" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">About</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                Tweet Analysis Dashboard
              </h1>
              <p className="text-sm sm:text-base font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b]">
                Real-time Twitter sentiment and abuse analysis
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter query (e.g., #India lang:en)"
                className="px-4 py-2 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] text-sm min-w-64"
              />
              <select 
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="px-4 py-2 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] text-sm"
              >
                <option value={5}>5 tweets</option>
                <option value={10}>10 tweets</option>
                <option value={20}>20 tweets</option>
                <option value={50}>50 tweets</option>
              </select>
              <button
                onClick={fetchAnalysisData}
                disabled={loading}
                className="px-6 py-2 bg-[#3b3a39] text-white rounded-lg hover:bg-[#2a2928] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800 font-medium">Error</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {analyticsData ? (
            <>
              {/* Overall Analysis Results */}
              <div className="bg-white rounded-lg border border-[#dfdeda] shadow p-6 mb-8">
                <h2 className="text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-6">
                  Overall Analysis Results
                </h2>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39] mb-2">
                      {analyticsData.meta.result_count}
                    </div>
                    <div className="text-xs sm:text-sm text-[#6e6d6b]">Tweets Analyzed</div>
                  </div>
                  <div className={`rounded-lg p-4 ${getRiskColor(analyticsData.overall.risk_level)}`}>
                    <div className="text-2xl sm:text-3xl font-bold mb-2">
                      {analyticsData.overall.risk_level.toUpperCase()}
                    </div>
                    <div className="text-xs sm:text-sm">Overall Risk Level</div>
                  </div>
                  <div className={`rounded-lg p-4 ${getSentimentColor(analyticsData.overall.overall_sentiment)}`}>
                    <div className="text-2xl sm:text-3xl font-bold mb-2">
                      {analyticsData.overall.overall_sentiment.toUpperCase()}
                    </div>
                    <div className="text-xs sm:text-sm">Overall Sentiment</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39] mb-2">
                      {(analyticsData.overall.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-[#6e6d6b]">Confidence Score</div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Sentiment Breakdown
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.overall.sentiment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#3b3a39] capitalize">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#3b3a39] h-2 rounded-full" 
                                style={{width: `${item.score * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-[#6e6d6b] w-12">
                              {(item.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Abuse Detection
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.overall.abuse.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#3b3a39] capitalize">
                            {item.label.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#3b3a39] h-2 rounded-full" 
                                style={{width: `${item.score * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-[#6e6d6b] w-12">
                              {(item.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Query Info */}
                <div className="mt-6 pt-6 border-t border-[#dfdeda]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#6e6d6b]">
                    <div>
                      <span className="font-medium">Query:</span> {analyticsData.meta.query}
                    </div>
                    <div>
                      <span className="font-medium">Processed:</span> {formatDate(analyticsData.query_info.processed_at)}
                    </div>
                    <div>
                      <span className="font-medium">Session:</span> {analyticsData.session?.sessionId || 'Not saved'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle for Individual Tweet Analysis */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowIndividualTweets(!showIndividualTweets)}
                  className="px-6 py-3 bg-[#3b3a39] text-white rounded-lg hover:bg-[#2a2928] font-medium"
                >
                  {showIndividualTweets ? 'Hide Individual Analysis' : 'See Analysis for Each Tweet'}
                </button>
              </div>

              {/* Individual Tweet Analysis */}
              {showIndividualTweets && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
                    Individual Tweet Analysis
                  </h2>
                  
                  {analyticsData.data.map((tweet) => (
                    <div key={tweet.id} className="bg-white rounded-lg border border-[#dfdeda] shadow p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Tweet Content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#3b3a39] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {tweet.author.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#3b3a39]">{tweet.author.name}</span>
                                <span className="text-[#6e6d6b]">@{tweet.author.username}</span>
                                {tweet.author.verified && (
                                  <span className="text-blue-500 text-sm">✓</span>
                                )}
                              </div>
                              <div className="text-sm text-[#6e6d6b]">
                                {formatDate(tweet.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-[#3b3a39] mb-4 leading-relaxed">
                            {tweet.text}
                          </div>
                          
                          {/* Engagement Metrics */}
                          <div className="flex gap-4 text-sm text-[#6e6d6b]">
                            <span>❤️ {tweet.public_metrics.like_count}</span>
                            <span>🔄 {tweet.public_metrics.retweet_count}</span>
                            <span>💬 {tweet.public_metrics.reply_count}</span>
                            <span>🔗 {tweet.public_metrics.quote_count}</span>
                          </div>
                        </div>
                        
                        {/* Analysis Results */}
                        <div className="lg:w-80 space-y-4">
                          {/* Sentiment Analysis */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-[#3b3a39] mb-2">Sentiment Analysis</h4>
                            <div className="space-y-2">
                              {tweet.analysis.sentiment.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{item.label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-[#3b3a39] h-2 rounded-full" 
                                        style={{width: `${item.score * 100}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-[#6e6d6b] w-8">
                                      {(item.score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Abuse Detection */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-[#3b3a39] mb-2">Abuse Detection</h4>
                            <div className="space-y-2">
                              {tweet.analysis.abuse.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{item.label.replace('_', ' ')}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-[#3b3a39] h-2 rounded-full" 
                                        style={{width: `${item.score * 100}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-[#6e6d6b] w-8">
                                      {(item.score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Risk Level */}
                          <div className={`rounded-lg p-4 ${getRiskColor(tweet.analysis.risk_level)}`}>
                            <h4 className="font-medium mb-2">Risk Assessment</h4>
                            <div className="text-lg font-bold">
                              {tweet.analysis.risk_level.toUpperCase()}
                            </div>
                            <div className="text-sm opacity-75">
                              Confidence: {(tweet.analysis.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : loading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3b3a39] border-t-transparent mx-auto mb-4"></div>
                <p className="text-[#6e6d6b]">Analyzing tweets...</p>
              </div>
            </div>
          ) : (
            /* No Data State */
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-[#3b3a39] mb-2">No Analysis Data</h3>
                <p className="text-[#6e6d6b] mb-4">Enter a query and click "Analyze" to get started</p>
                <button
                  onClick={fetchAnalysisData}
                  className="px-6 py-3 bg-[#3b3a39] text-white rounded-lg hover:bg-[#2a2928] font-medium"
                >
                  Analyze Tweets
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} TweetWatch — Real-time Twitter Monitoring & Analysis.
      </footer>
    </div>
  );
};