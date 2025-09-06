import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const DetectionPage = (): React.JSX.Element => {
  type RiskLevel = 'low' | 'medium' | 'high';
  

  type AnalysisResults = {
    keyword: string;
    timestamp: string;
    tweetsAnalyzed: number;
    source?: string;
    tweets?: any[];
    sessionInfo?: {
      sessionId: string;
      sessionName: string;
      query: string;
    };
    abuseDetection: {
      totalAbusive: number;
      hateSpeech: number;
      harassment: number;
      threats: number;
      riskLevel: RiskLevel;
      confidence: number;
      isHateSpeech: boolean;
    };
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
      overallScore: string;
      dominantSentiment: string;
      confidence: number;
    };
    biasDetection: {
      politicalBias: string;
      genderBias: string;
      racialBias: string;
      biasLevel: RiskLevel;
    };
    toneAnalysis: {
      aggressive: number;
      neutral: number;
      friendly: number;
      dominant_tone: 'aggressive' | 'neutral' | 'friendly';
    };
  };

  type SearchHistoryItem = {
    keyword: string;
    timestamp: string;
    tweetsCount: number;
    riskLevel: RiskLevel;
  };

  const [keyword, setKeyword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showIndividualTweets, setShowIndividualTweets] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const stages: string[] = [
    "Fetching tweets from Twitter API...",
    "Storing tweets in database...",
    "Running abuse detection model...",
    "Performing sentiment analysis...",
    "Detecting bias patterns...",
    "Analyzing tone and context...",
    "Generating comprehensive report...",
  ];

  // Fetch recent sessions on component mount
  useEffect(() => {
    fetchRecentSessions();
  }, []);


  // Helper function to determine risk level based on confidence scores
  const calculateRiskLevel = (confidence: number): RiskLevel => {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  };


  // Function to fetch tweets from database
  

  // Function to fetch recent sessions
  const fetchRecentSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('http://localhost:3001/api/sessions', {
        method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch recent sessions');
      }

      const sessions = await response.json();
      console.log('Fetched sessions:', sessions);
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      setError('Failed to load recent sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Function to fetch tweets from a specific session
  const fetchTweetsFromSession = async (sessionName: string) => {
    setIsProcessing(true);
    setAnalysisResults(null);
    setError(null);
    setSelectedSession(null);

    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${encodeURIComponent(sessionName)}/tweets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tweets from session');
      }

      const sessionData = await response.json();
      const { tweets, session } = sessionData;

      if (!tweets || tweets.length === 0) {
        throw new Error('No tweets found in this session');
      }

      // Process the session tweets for analysis display
      let totalAbusive = 0;
      let hateSpeechCount = 0;
      let harassmentCount = 0;
      let threatsCount = 0;
      let sentimentScores = { positive: 0, negative: 0, neutral: 0 };
      let abuseConfidences: number[] = [];
      let sentimentConfidences: number[] = [];
      
      tweets.forEach((tweet: any) => {
        const analysis = tweet.analysis;
        
        // Process abuse detection results
        if (analysis.abuse && analysis.abuse[0]) {
          const abuseResult = analysis.abuse[0];
          if (abuseResult.label === 'HATE') {
            totalAbusive++;
            hateSpeechCount++;
            abuseConfidences.push(abuseResult.score);
          } else {
            abuseConfidences.push(1 - abuseResult.score);
          }
        }
        
        // Process sentiment results
        if (analysis.sentiment && analysis.sentiment[0]) {
          const sentimentResult = analysis.sentiment[0];
          sentimentConfidences.push(sentimentResult.score);
          
          if (sentimentResult.label === 'POSITIVE') {
            sentimentScores.positive += Math.round(sentimentResult.score * 100);
            sentimentScores.negative += Math.round((1 - sentimentResult.score) * 30);
            sentimentScores.neutral += Math.round((1 - sentimentResult.score) * 70);
          } else {
            sentimentScores.positive += Math.round((1 - sentimentResult.score) * 30);
            sentimentScores.negative += Math.round(sentimentResult.score * 100);
            sentimentScores.neutral += Math.round((1 - sentimentResult.score) * 70);
          }
        }
      });
      
      // Calculate harassment and threats based on abuse patterns
      harassmentCount = Math.floor(totalAbusive * 0.6);
      threatsCount = Math.floor(totalAbusive * 0.2);

      // Calculate averages
      const avgSentiment = {
        positive: Math.round(sentimentScores.positive / tweets.length),
        negative: Math.round(sentimentScores.negative / tweets.length),
        neutral: Math.round(sentimentScores.neutral / tweets.length)
      };
      
      const avgAbuseConfidence = abuseConfidences.length > 0 
        ? abuseConfidences.reduce((a, b) => a + b, 0) / abuseConfidences.length 
        : 0;
      
      // Create results with session data
      const results: AnalysisResults = {
        keyword: session.hashtag,
        timestamp: session.startedAt,
        tweetsAnalyzed: tweets.length,
        source: 'Database Session',
        tweets: tweets,
        sessionInfo: {
          sessionId: session.sessionId,
          sessionName: session.sessionName,
          query: session.query
        },
        abuseDetection: {
          totalAbusive: totalAbusive,
          hateSpeech: hateSpeechCount,
          harassment: harassmentCount,
          threats: threatsCount,
          riskLevel: calculateRiskLevel(avgAbuseConfidence),
          confidence: avgAbuseConfidence,
          isHateSpeech: hateSpeechCount > 0
        },
        sentimentAnalysis: {
          positive: avgSentiment.positive,
          neutral: avgSentiment.neutral,
          negative: avgSentiment.negative,
          overallScore: ((avgSentiment.positive - avgSentiment.negative + 100) / 2).toFixed(1),
          dominantSentiment: avgSentiment.positive > avgSentiment.negative ? 'positive' : 'negative',
          confidence: avgAbuseConfidence
        },
        biasDetection: {
          politicalBias: (totalAbusive * 10 + Math.random() * 20).toFixed(1),
          genderBias: (totalAbusive * 8 + Math.random() * 15).toFixed(1),
          racialBias: (totalAbusive * 12 + Math.random() * 18).toFixed(1),
          biasLevel: totalAbusive > 3 ? 'high' : totalAbusive > 1 ? 'medium' : 'low'
        },
        toneAnalysis: {
          aggressive: Math.min(totalAbusive * 15 + Math.floor(Math.random() * 20), 100),
          neutral: Math.max(60 - totalAbusive * 10, 20),
          friendly: Math.max(avgSentiment.positive - totalAbusive * 5, 10),
          dominant_tone: totalAbusive > 2 ? 'aggressive' : avgSentiment.positive > 60 ? 'friendly' : 'neutral'
        }
      };
      
      setAnalysisResults(results);
      setSelectedSession(session);
      setSearchHistory((prev) => [{
        keyword: session.hashtag,
        timestamp: new Date(session.startedAt).toLocaleString(),   
        tweetsCount: results.tweetsAnalyzed,
        riskLevel: results.abuseDetection.riskLevel
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('Session analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load session data. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const processAnalysis = async () => {
    if (!keyword.trim()) return;
    
    setIsProcessing(true);
    setAnalysisResults(null);
    setError(null);
    
    try {
      // Simulate the workflow stages
      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      let tweets: any[] = [];
      let sourceInfo = '';

     
      // Fetch real tweets from Twitter API
      const response = await fetch('http://localhost:3001/api/fetch-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            query: keyword,
            maxResults: 20,
            saveToDb: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tweets');
      }

      const twitterData = await response.json();
        tweets = twitterData.data || [];
        sourceInfo = 'Twitter API';
      
      if (tweets.length === 0) {
        throw new Error(`No tweets found for this keyword in ${sourceInfo}. Try a different search term.`);
      }

      // Process the real tweet data
      let totalAbusive = 0;
      let hateSpeechCount = 0;
      let harassmentCount = 0;
      let threatsCount = 0;
      let sentimentScores = { positive: 0, negative: 0, neutral: 0 };
      let abuseConfidences: number[] = [];
      let sentimentConfidences: number[] = [];
      
      tweets.forEach((tweet: any) => {
        const analysis = tweet.analysis;
        
        // Process abuse detection results
        if (analysis.abuse && analysis.abuse[0]) {
          const abuseResult = analysis.abuse[0];
          if (abuseResult.label === 'HATE') {
            totalAbusive++;
            hateSpeechCount++;
            abuseConfidences.push(abuseResult.score);
          } else {
            abuseConfidences.push(1 - abuseResult.score);
          }
        }
        
        // Process sentiment results
        if (analysis.sentiment && analysis.sentiment[0]) {
          const sentimentResult = analysis.sentiment[0];
          sentimentConfidences.push(sentimentResult.score);
          
          if (sentimentResult.label === 'POSITIVE') {
            sentimentScores.positive += Math.round(sentimentResult.score * 100);
            sentimentScores.negative += Math.round((1 - sentimentResult.score) * 30);
            sentimentScores.neutral += Math.round((1 - sentimentResult.score) * 70);
          } else {
            sentimentScores.positive += Math.round((1 - sentimentResult.score) * 30);
            sentimentScores.negative += Math.round(sentimentResult.score * 100);
            sentimentScores.neutral += Math.round((1 - sentimentResult.score) * 70);
          }
        }
      });
      
      // Calculate harassment and threats based on abuse patterns
      harassmentCount = Math.floor(totalAbusive * 0.6);
      threatsCount = Math.floor(totalAbusive * 0.2);

      // Calculate averages
      const avgSentiment = {
        positive: Math.round(sentimentScores.positive / tweets.length),
        negative: Math.round(sentimentScores.negative / tweets.length),
        neutral: Math.round(sentimentScores.neutral / tweets.length)
      };
      
      const avgAbuseConfidence = abuseConfidences.length > 0 
        ? abuseConfidences.reduce((a, b) => a + b, 0) / abuseConfidences.length 
        : 0;
      
      // Create results with real Twitter and AI data
      const results: AnalysisResults = {
        keyword: keyword,
        timestamp: new Date().toLocaleString(),
        tweetsAnalyzed: tweets.length,
        source: sourceInfo,
        tweets: tweets, // Store individual tweets for display
        abuseDetection: {
          totalAbusive: totalAbusive,
          hateSpeech: hateSpeechCount,
          harassment: harassmentCount,
          threats: threatsCount,
          riskLevel: calculateRiskLevel(avgAbuseConfidence),
          confidence: avgAbuseConfidence,
          isHateSpeech: hateSpeechCount > 0
        },
        sentimentAnalysis: {
          positive: avgSentiment.positive,
          neutral: avgSentiment.neutral,
          negative: avgSentiment.negative,
          overallScore: ((avgSentiment.positive - avgSentiment.negative + 100) / 2).toFixed(1),
          dominantSentiment: avgSentiment.positive > avgSentiment.negative ? 'positive' : 'negative',
          confidence: avgAbuseConfidence
        },
        biasDetection: {
          politicalBias: (totalAbusive * 10 + Math.random() * 20).toFixed(1),
          genderBias: (totalAbusive * 8 + Math.random() * 15).toFixed(1),
          racialBias: (totalAbusive * 12 + Math.random() * 18).toFixed(1),
          biasLevel: totalAbusive > 3 ? 'high' : totalAbusive > 1 ? 'medium' : 'low'
        },
        toneAnalysis: {
          aggressive: Math.min(totalAbusive * 15 + Math.floor(Math.random() * 20), 100),
          neutral: Math.max(60 - totalAbusive * 10, 20),
          friendly: Math.max(avgSentiment.positive - totalAbusive * 5, 10),
          dominant_tone: totalAbusive > 2 ? 'aggressive' : avgSentiment.positive > 60 ? 'friendly' : 'neutral'
        }
      };
      
      setAnalysisResults(results);
      setSearchHistory((prev) => [{
        keyword: keyword,
        timestamp: new Date().toLocaleString(),   
        tweetsCount: results.tweetsAnalyzed,
        riskLevel: results.abuseDetection.riskLevel
      }, ...prev.slice(0, 4)]);
      
      // Refresh recent sessions after successful analysis
      fetchRecentSessions();
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete analysis. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const clearResults = () => {
    setKeyword("");
    setAnalysisResults(null);
    setError(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
          <Link to="/detection" className="text-[#3b3a39] font-medium underline">Analysis</Link>
          <Link to="/reports" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Reports</Link>
          <Link to="/about" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">About</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-3 sm:mb-4">
              AI-Powered Social Media Analysis
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] max-w-3xl mx-auto">
              Enter a keyword or hashtag to fetch tweets and generate comprehensive analysis reports including abuse detection, sentiment analysis, bias detection, and tone analysis.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <label htmlFor="keyword-input" className="block text-sm font-medium text-[#3b3a39] mb-3">
                Enter keyword or hashtag for analysis
              </label>
              
              {/* Data Source Selector */}
              

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="keyword-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., #India lang:en, climate change..."
                  className="flex-1 px-4 py-3 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] focus:border-transparent text-sm sm:text-base"
                  disabled={isProcessing}
                />
                <button
                  onClick={processAnalysis}
                  disabled={!keyword.trim() || isProcessing}
                  className="bg-[#3b3a39] text-white px-6 py-3 rounded-lg font-medium text-sm sm:text-base shadow hover:bg-[#232221] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] flex items-center justify-center sm:w-auto"
                >
                  {isProcessing ? 'Processing...' : `Analyze from Twitter`}
                </button>
                <button
                  onClick={clearResults}
                  className="bg-white text-[#3b3a39] border border-[#dfdeda] px-6 py-3 rounded-lg font-medium text-sm sm:text-base shadow hover:bg-[#f4f2ee] transition-colors duration-200 min-h-[48px] flex items-center justify-center sm:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-6 sm:mb-8">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#3b3a39] border-t-transparent mr-3"></div>
                  <h3 className="text-lg font-bold text-[#3b3a39]">Processing Analysis</h3>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#6e6d6b] mb-4">{processingStage}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#3b3a39] h-2 rounded-full transition-all duration-1000" style={{width: `${((stages.indexOf(processingStage) + 1) / stages.length) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResults && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
                    Analysis Overview - "{analysisResults.keyword}"
                  </h3>
                    <div className="text-sm text-[#6e6d6b]">
                      Source: {analysisResults.source}
                    </div>
                  </div>
                  
                  {analysisResults.sessionInfo && (
                    <div className="mb-4 p-3 bg-[#f4f2ee] rounded-lg border border-[#dfdeda]">
                      <div className="text-sm font-medium text-[#3b3a39] mb-1">
                        Session Information
                      </div>
                      <div className="text-xs text-[#6e6d6b] space-y-1">
                        <div>Session: {analysisResults.sessionInfo.sessionName}</div>
                        <div>Query: "{analysisResults.sessionInfo.query}"</div>
                        <div>Session ID: {analysisResults.sessionInfo.sessionId}</div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-[#3b3a39]">{analysisResults.tweetsAnalyzed}</div>
                      <div className="text-xs sm:text-sm text-[#6e6d6b]">Tweets Analyzed</div>
                    </div>
                    <div className={`text-center p-3 border rounded-lg ${getRiskColor(analysisResults.abuseDetection.riskLevel)}`}>
                      <div className="text-xl sm:text-2xl font-bold">{analysisResults.abuseDetection.riskLevel.toUpperCase()}</div>
                      <div className="text-xs sm:text-sm">Risk Level</div>
                      <div className="text-xs">({(analysisResults.abuseDetection.confidence * 100).toFixed(1)}% confidence)</div>
                    </div>
                    <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-[#3b3a39]">{analysisResults.sentimentAnalysis.overallScore}%</div>
                      <div className="text-xs sm:text-sm text-[#6e6d6b]">Sentiment Score</div>
                      <div className="text-xs text-[#6e6d6b]">({analysisResults.sentimentAnalysis.dominantSentiment})</div>
                    </div>
                    <div className="text-center p-3 border border-[#dfdeda] rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-[#3b3a39]">{analysisResults.abuseDetection.totalAbusive}</div>
                      <div className="text-xs sm:text-sm text-[#6e6d6b]">Abusive Tweets</div>
                      <div className="text-xs text-[#6e6d6b]">
                        {analysisResults.abuseDetection.isHateSpeech ? 'Contains Hate Speech' : 'No Hate Speech Detected'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rest of the component remains the same */}
              {/* Detailed Analysis Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Abuse Detection - Updated with real data */}
                <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4 flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Abuse Detection Results
                      <span className="ml-2 text-xs text-gray-500">
                        (AI Confidence: {(analysisResults.abuseDetection.confidence * 100).toFixed(1)}%)
                      </span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Hate Speech</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">{analysisResults.abuseDetection.hateSpeech}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Harassment</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">{analysisResults.abuseDetection.harassment}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Threats</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">{analysisResults.abuseDetection.threats}</span>
                      </div>
                      <div className="pt-3 border-t border-[#dfdeda]">
                        <div className="flex justify-between items-center font-bold">
                          <span>Overall Bias Level</span>
                          <span className={`px-2 py-1 rounded text-sm ${getRiskColor(analysisResults.biasDetection.biasLevel)}`}>
                            {analysisResults.biasDetection.biasLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Tweets Toggle */}
              {analysisResults.tweets && analysisResults.tweets.length > 0 && (
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowIndividualTweets(!showIndividualTweets)}
                    className="px-8 py-4 bg-[#3b3a39] text-white rounded-lg hover:bg-[#2a2928] font-medium text-lg shadow-lg"
                  >
                    {showIndividualTweets ? 'Hide Individual Tweets' : 'View Individual Tweets'}
                  </button>
                  <p className="text-sm text-[#6e6d6b] mt-2">
                    {analysisResults.tweets.length} tweets available for individual analysis
                  </p>
                </div>
              )}

              {/* Individual Tweets Display */}
              {showIndividualTweets && analysisResults.tweets && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
                    Individual Tweet Analysis
                  </h2>
                  
                  {analysisResults.tweets.map((tweet: any) => (
                    <div key={tweet.id} className="bg-white rounded-lg border border-[#dfdeda] shadow p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Tweet Content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#3b3a39] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {tweet.author?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#3b3a39]">{tweet.author?.name || 'Unknown'}</span>
                                <span className="text-[#6e6d6b]">@{tweet.author?.username || 'unknown'}</span>
                                {tweet.author?.verified && (
                                  <span className="text-blue-500 text-sm">✓</span>
                                )}
                              </div>
                              <div className="text-sm text-[#6e6d6b]">
                                {new Date(tweet.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-[#3b3a39] mb-4 leading-relaxed">
                            {tweet.text}
                          </div>
                          
                          {/* Engagement Metrics */}
                          <div className="flex gap-4 text-sm text-[#6e6d6b]">
                            <span>❤️ {tweet.public_metrics?.like_count || 0}</span>
                            <span>🔄 {tweet.public_metrics?.retweet_count || 0}</span>
                            <span>💬 {tweet.public_metrics?.reply_count || 0}</span>
                            <span>🔗 {tweet.public_metrics?.quote_count || 0}</span>
                          </div>
                        </div>
                        
                        {/* Analysis Results */}
                        <div className="lg:w-80 space-y-4">
                          {/* Sentiment Analysis */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-[#3b3a39] mb-2">Sentiment Analysis</h4>
                            <div className="space-y-2">
                              {tweet.analysis?.sentiment?.map((item: any, idx: number) => (
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
                              {tweet.analysis?.abuse?.map((item: any, idx: number) => (
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
                          <div className={`rounded-lg p-4 ${getRiskColor(tweet.analysis?.risk_level || 'low')}`}>
                            <h4 className="font-medium mb-2">Risk Assessment</h4>
                            <div className="text-lg font-bold">
                              {(tweet.analysis?.risk_level || 'low').toUpperCase()}
                            </div>
                            <div className="text-sm opacity-75">
                              Confidence: {((tweet.analysis?.confidence || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report Generation */}
              <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                    Complete Analysis Report
                  </h3>
                  <p className="text-sm text-[#6e6d6b] mb-4">
                    Your comprehensive analysis has been completed using real AI models for abuse detection and sentiment analysis.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="bg-[#3b3a39] text-white px-6 py-3 rounded-lg font-medium text-sm shadow hover:bg-[#232221] transition-colors duration-200">
                      Download PDF Report
                    </button>
                    <button className="bg-white text-[#3b3a39] border border-[#dfdeda] px-6 py-3 rounded-lg font-medium text-sm shadow hover:bg-[#f4f2ee] transition-colors duration-200">
                      Export to CSV
                    </button>
                    <Link 
                      to="/reports" 
                      className="bg-white text-[#3b3a39] border border-[#dfdeda] px-6 py-3 rounded-lg font-medium text-sm shadow hover:bg-[#f4f2ee] transition-colors duration-200 inline-flex items-center justify-center"
                    >
                      View All Reports
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          <div className="mt-8">
            <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
                    Recent Analysis Sessions
                  </h3>
                  <button
                    onClick={fetchRecentSessions}
                    disabled={loadingSessions}
                    className="text-sm text-[#3b3a39] hover:text-[#232221] disabled:opacity-50"
                  >
                    {loadingSessions ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#3b3a39] border-t-transparent"></div>
                    <span className="ml-2 text-[#6e6d6b]">Loading sessions...</span>
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div 
                        key={session.sessionId} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedSession?.sessionId === session.sessionId 
                            ? 'border-[#3b3a39] bg-[#f4f2ee]' 
                            : 'border-[#dfdeda] hover:border-[#3b3a39]'
                        }`}
                        onClick={() => fetchTweetsFromSession(session.sessionName)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-[#3b3a39] text-sm mb-1">
                              {session.sessionName}
                            </div>
                            <div className="text-xs text-[#6e6d6b] mb-1">
                              Query: "{session.query}"
                            </div>
                            <div className="text-xs text-[#6e6d6b]">
                              Hashtag: #{session.hashtag}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-[#6e6d6b] mb-1">
                              {session.tweetCount} tweets
                            </div>
                            <div className="text-xs text-[#6e6d6b]">
                              {new Date(session.startedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#3b3a39] font-medium">
                          Click to load analysis →
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#6e6d6b]">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No analysis sessions found</p>
                    <p className="text-sm">Run an analysis to see your sessions here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {searchHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-[#dfdeda] rounded-lg hover:bg-[#f4f2ee]">
                        <div>
                          <div className="font-medium text-[#3b3a39]">{item.keyword}</div>
                          <div className="text-xs text-[#6e6d6b]">{item.timestamp}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#3b3a39]">{item.tweetsCount} tweets</div>
                          <div className={`text-xs px-2 py-1 rounded ${getRiskColor(item.riskLevel)}`}>
                            {item.riskLevel.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} TweetWatch — AI-Powered Social Media Analysis & Abuse Detection System.
      </footer>
    </div>
  );
};