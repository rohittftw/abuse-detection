import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const AnalysisPage = (): React.JSX.Element => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [selectedHashtag, setSelectedHashtag] = useState("trending");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Mock analytics data
  const mockData: Record<string, Record<string, any>> = {
    "24h": {
      trending: {
        totalTweets: 1247,
        riskDistribution: { high: 23, medium: 156, low: 1068 },
        sentimentScore: 72,
        topKeywords: ["amazing", "love", "great", "excited", "horrible", "terrible"],
        hourlyData: [45, 67, 89, 123, 145, 167, 189, 201, 187, 165, 143, 121, 98, 76, 54, 43, 56, 78, 92, 115, 134, 152, 170, 158],
        categories: { harassment: 12, hate_speech: 8, threats: 3, spam: 15 },
        engagementAvg: { retweets: 4.2, likes: 18.7 }
      }
    }
  };

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      const data = mockData[selectedTimeframe]?.[selectedHashtag];
      setAnalyticsData(data);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedTimeframe, selectedHashtag]);

  const getRiskPercentage = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1);
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 70) return "Positive";
    if (score >= 40) return "Neutral";
    return "Negative";
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
                Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b]">
                Comprehensive analysis of collected tweet data and trends
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <select 
                value={selectedHashtag}
                onChange={(e) => setSelectedHashtag(e.target.value)}
                className="px-4 py-2 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] text-sm"
              >
                <option value="trending">Trending</option>
                <option value="politics">Politics</option>
                <option value="sports">Sports</option>
                <option value="news">News</option>
              </select>
            </div>
          </div>

          {analyticsData ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39] mb-2">
                    {analyticsData.totalTweets.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6e6d6b]">Total Tweets Analyzed</div>
                </div>
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                    {analyticsData.riskDistribution.high}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6e6d6b]">High Risk Tweets</div>
                </div>
                <div className={`rounded-lg border shadow p-4 sm:p-6 ${getSentimentColor(analyticsData.sentimentScore)}`}>
                  <div className="text-2xl sm:text-3xl font-bold mb-2">
                    {analyticsData.sentimentScore}%
                  </div>
                  <div className="text-xs sm:text-sm">Overall Sentiment ({getSentimentLabel(analyticsData.sentimentScore)})</div>
                </div>
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39] mb-2">
                    {analyticsData.engagementAvg.likes}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6e6d6b]">Avg Likes per Tweet</div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Risk Distribution Chart */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Risk Distribution
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Low Risk</span>
                        <span className="text-sm font-bold text-[#3b3a39]">
                          {getRiskPercentage(analyticsData.riskDistribution.low, analyticsData.totalTweets)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full" 
                          style={{width: `${getRiskPercentage(analyticsData.riskDistribution.low, analyticsData.totalTweets)}%`}}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-600">Medium Risk</span>
                        <span className="text-sm font-bold text-[#3b3a39]">
                          {getRiskPercentage(analyticsData.riskDistribution.medium, analyticsData.totalTweets)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full" 
                          style={{width: `${getRiskPercentage(analyticsData.riskDistribution.medium, analyticsData.totalTweets)}%`}}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">High Risk</span>
                        <span className="text-sm font-bold text-[#3b3a39]">
                          {getRiskPercentage(analyticsData.riskDistribution.high, analyticsData.totalTweets)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full" 
                          style={{width: `${getRiskPercentage(analyticsData.riskDistribution.high, analyticsData.totalTweets)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hourly Activity */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Activity Over Time
                    </h3>
                    <div className="flex items-end justify-between h-32 gap-1">
                      {analyticsData.hourlyData.map((value: number, index: number) => (
                        <div 
                          key={index}
                          className="bg-[#3b3a39] rounded-t flex-1 min-w-0"
                          style={{height: `${(value / Math.max(...analyticsData.hourlyData)) * 100}%`}}
                          title={`Hour ${index}: ${value} tweets`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-[#6e6d6b] mt-2">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>24:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Top Keywords */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Top Keywords
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.topKeywords.map((keyword: string, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#3b3a39]">#{keyword}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#3b3a39] h-2 rounded-full" 
                                style={{width: `${Math.random() * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-[#6e6d6b] w-8">
                              {Math.floor(Math.random() * 100)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Threat Categories */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Threat Categories
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.categories).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#3b3a39] capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                              {count as number}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                      Engagement Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                        <div className="text-xl font-bold text-[#3b3a39]">{analyticsData.engagementAvg.retweets}</div>
                        <div className="text-xs text-[#6e6d6b]">Avg Retweets</div>
                      </div>
                      <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                        <div className="text-xl font-bold text-[#3b3a39]">{analyticsData.engagementAvg.likes}</div>
                        <div className="text-xs text-[#6e6d6b]">Avg Likes</div>
                      </div>
                      <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                        <div className="text-xl font-bold text-[#3b3a39]">
                          {(analyticsData.engagementAvg.likes / analyticsData.engagementAvg.retweets).toFixed(1)}
                        </div>
                        <div className="text-xs text-[#6e6d6b]">Like/RT Ratio</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Loading State */
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3b3a39] border-t-transparent mx-auto mb-4"></div>
                <p className="text-[#6e6d6b]">Loading analytics data...</p>
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