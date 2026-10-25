import React, { useState, useEffect } from "react";
import { BadgeCheck, BarChart3, Heart, Link2, MessageCircle, Repeat2 } from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/home/PageHeader";

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
      default: return "text-gray-600 bg-home-surface-elevated border-gray-200";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return "text-red-600 bg-red-50 border-red-200";
      case 'low': return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-home-surface-elevated border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  return (
    <AppLayout>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
            <PageHeader
              label="Dashboard"
              title="Tweet Analysis Dashboard"
              description="Real-time Twitter sentiment and abuse analysis"
              className="mb-0 lg:mb-0"
            />
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter query (e.g., #India lang:en)"
                className="tw-input min-w-64 py-2"
              />
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="tw-input py-2 w-auto"
              >
                <option value={5}>5 tweets</option>
                <option value={10}>10 tweets</option>
                <option value={20}>20 tweets</option>
                <option value={50}>50 tweets</option>
              </select>
              <button
                onClick={fetchAnalysisData}
                disabled={loading}
                className="tw-btn-primary py-2"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {error && (
            <div className="tw-alert-error mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          )}

          {analyticsData ? (
            <>
              {/* Overall Analysis Results */}
              <div className="tw-card p-6 mb-8">
                <h2 className="text-xl font-bold text-home-heading mb-6">
                  Overall Analysis Results
                </h2>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-home-surface-elevated rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-home-heading mb-2">
                      {analyticsData.meta.result_count}
                    </div>
                    <div className="text-xs sm:text-sm text-home-muted">Tweets Analyzed</div>
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
                  <div className="bg-home-surface-elevated rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-home-heading mb-2">
                      {(analyticsData.overall.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-home-muted">Confidence Score</div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-home-heading mb-4">
                      Sentiment Breakdown
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.overall.sentiment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-home-heading capitalize">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-home-border rounded-full h-2">
                              <div 
                                className="bg-home-accent h-2 rounded-full" 
                                style={{width: `${item.score * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-home-muted w-12">
                              {(item.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-home-heading mb-4">
                      Abuse Detection
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.overall.abuse.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-home-heading capitalize">
                            {item.label.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-home-border rounded-full h-2">
                              <div 
                                className="bg-home-accent h-2 rounded-full" 
                                style={{width: `${item.score * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-home-muted w-12">
                              {(item.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Query Info */}
                <div className="mt-6 pt-6 border-t border-home-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-home-muted">
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
                  className="tw-btn-primary"
                >
                  {showIndividualTweets ? 'Hide Individual Analysis' : 'See Analysis for Each Tweet'}
                </button>
              </div>

              {/* Individual Tweet Analysis */}
              {showIndividualTweets && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-home-heading">
                    Individual Tweet Analysis
                  </h2>
                  
                  {analyticsData.data.map((tweet) => (
                    <div key={tweet.id} className="bg-home-surface tw-card p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Tweet Content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-home-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {tweet.author.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-home-heading">{tweet.author.name}</span>
                                <span className="text-home-muted">@{tweet.author.username}</span>
                                {tweet.author.verified && (
                                  <BadgeCheck className="h-4 w-4 text-home-accent" aria-label="Verified" />
                                )}
                              </div>
                              <div className="text-sm text-home-muted">
                                {formatDate(tweet.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-home-heading mb-4 leading-relaxed">
                            {tweet.text}
                          </div>
                          
                          {/* Engagement Metrics */}
                          <div className="flex flex-wrap gap-4 text-sm text-home-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <Heart className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics.like_count}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Repeat2 className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics.retweet_count}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics.reply_count}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Link2 className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics.quote_count}
                            </span>
                          </div>
                        </div>
                        
                        {/* Analysis Results */}
                        <div className="lg:w-80 space-y-4">
                          {/* Sentiment Analysis */}
                          <div className="bg-home-surface-elevated rounded-lg p-4">
                            <h4 className="font-medium text-home-heading mb-2">Sentiment Analysis</h4>
                            <div className="space-y-2">
                              {tweet.analysis.sentiment.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{item.label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-home-border rounded-full h-2">
                                      <div 
                                        className="bg-home-accent h-2 rounded-full" 
                                        style={{width: `${item.score * 100}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-home-muted w-8">
                                      {(item.score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Abuse Detection */}
                          <div className="bg-home-surface-elevated rounded-lg p-4">
                            <h4 className="font-medium text-home-heading mb-2">Abuse Detection</h4>
                            <div className="space-y-2">
                              {tweet.analysis.abuse.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{item.label.replace('_', ' ')}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-home-border rounded-full h-2">
                                      <div 
                                        className="bg-home-accent h-2 rounded-full" 
                                        style={{width: `${item.score * 100}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-home-muted w-8">
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-home-accent border-t-transparent mx-auto mb-4"></div>
                <p className="text-home-muted">Analyzing tweets...</p>
              </div>
            </div>
          ) : (
            /* No Data State */
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-home-accent-soft text-home-accent">
                  <BarChart3 className="h-8 w-8" strokeWidth={1.7} />
                </div>
                <h3 className="text-xl font-bold text-home-heading mb-2">No Analysis Data</h3>
                <p className="text-home-muted mb-4">Enter a query and click "Analyze" to get started</p>
                <button
                  onClick={fetchAnalysisData}
                  className="tw-btn-primary"
                >
                  Analyze Tweets
                </button>
              </div>
            </div>
          )}
    </AppLayout>
  );
};