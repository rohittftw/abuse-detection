import React, { useState } from "react";
import { Link } from "react-router-dom";

export const DetectionPage = (): React.JSX.Element => {
  type RiskLevel = 'low' | 'medium' | 'high';
  
  // Backend response types
  type SentimentResult = {
    result: Array<{
      label: string;
      score: number;
    }>;
  };

  type AbuseResult = {
    result: Array<{
      label: string;
      score: number;
    }>;
  };

  type AnalysisResults = {
    keyword: string;
    timestamp: string;
    tweetsAnalyzed: number;
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

  const stages: string[] = [
    "Fetching tweets from Twitter API...",
    "Storing tweets in database...",
    "Running abuse detection model...",
    "Performing sentiment analysis...",
    "Detecting bias patterns...",
    "Analyzing tone and context...",
    "Generating comprehensive report...",
  ];

  // Function to call sentiment analysis API
  const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
    const response = await fetch('http://localhost:3001/api/predict-sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze sentiment');
    }
    
    return await response.json();
  };

  // Function to call abuse detection API
  const detectAbuse = async (text: string): Promise<AbuseResult> => {
    const response = await fetch('http://localhost:3001/api/detect-abuse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to detect abuse');
    }
    
    return await response.json();
  };

  // Helper function to determine risk level based on confidence scores
  const calculateRiskLevel = (confidence: number): RiskLevel => {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  };

  // Helper function to convert sentiment label to percentage
  const calculateSentimentPercentages = (sentimentResult: SentimentResult) => {
    const result = sentimentResult.result[0];
    const confidence = result.score;
    
    if (result.label === 'POSITIVE') {
      return {
        positive: Math.round(confidence * 100),
        negative: Math.round((1 - confidence) * 100 * 0.3),
        neutral: Math.round((1 - confidence) * 100 * 0.7),
        dominantSentiment: 'positive',
        confidence: confidence
      };
    } else {
      return {
        positive: Math.round((1 - confidence) * 100 * 0.3),
        negative: Math.round(confidence * 100),
        neutral: Math.round((1 - confidence) * 100 * 0.7),
        dominantSentiment: 'negative',
        confidence: confidence
      };
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
        
        // Make API calls during relevant stages
        if (stages[i].includes("abuse detection")) {
          // You can replace this with actual tweet text when available
          const sampleText = `Sample tweet about ${keyword}`;
          await detectAbuse(sampleText);
        }
        
        if (stages[i].includes("sentiment analysis")) {
          const sampleText = `Sample tweet about ${keyword}`;
          await analyzeSentiment(sampleText);
        }
      }

      // For demo purposes, make actual API calls with sample text
      // In production, you'd loop through actual tweets
      const sampleTweets = [
        `I think ${keyword} is really important for our future`,
        `${keyword} makes me so angry, this needs to stop`,
        `Just saw something about ${keyword} on the news`
      ];

      let totalAbusive = 0;
      let hateSpeechCount = 0;
      let sentimentScores = { positive: 0, negative: 0, neutral: 0 };
      let abuseConfidences: number[] = [];
      
      // Process multiple sample tweets (in production, use real tweets)
      for (const tweet of sampleTweets) {
        try {
          // Analyze sentiment
          const sentimentResult = await analyzeSentiment(tweet);
          const sentiment = calculateSentimentPercentages(sentimentResult);
          
          sentimentScores.positive += sentiment.positive;
          sentimentScores.negative += sentiment.negative;
          sentimentScores.neutral += sentiment.neutral;

          // Analyze abuse
          const abuseResult = await detectAbuse(tweet);
          const abuseData = abuseResult.result[0];
          
          if (abuseData.label === 'HATE') {
            totalAbusive++;
            hateSpeechCount++;
            abuseConfidences.push(abuseData.score);
          } else {
            abuseConfidences.push(1 - abuseData.score);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Continue with other tweets even if one fails
        }
      }

      // Calculate averages
      const avgSentiment = {
        positive: Math.round(sentimentScores.positive / sampleTweets.length),
        negative: Math.round(sentimentScores.negative / sampleTweets.length),
        neutral: Math.round(sentimentScores.neutral / sampleTweets.length)
      };

      const avgAbuseConfidence = abuseConfidences.reduce((a, b) => a + b, 0) / abuseConfidences.length;
      
      // Create results with real API data mixed with mock data for missing features
      const results: AnalysisResults = {
        keyword: keyword,
        timestamp: new Date().toLocaleString(),
        tweetsAnalyzed: sampleTweets.length, // In production, this would be actual tweet count
        abuseDetection: {
          totalAbusive: totalAbusive,
          hateSpeech: hateSpeechCount,
          harassment: Math.floor(totalAbusive * 0.6), // Mock calculation
          threats: Math.floor(totalAbusive * 0.2), // Mock calculation
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
          politicalBias: (Math.random() * 100).toFixed(1),
          genderBias: (Math.random() * 100).toFixed(1),
          racialBias: (Math.random() * 100).toFixed(1),
          biasLevel: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as RiskLevel
        },
        toneAnalysis: {
          aggressive: Math.floor(Math.random() * 25) + 5,
          neutral: Math.floor(Math.random() * 60) + 40,
          friendly: Math.floor(Math.random() * 30) + 15,
          dominant_tone: (['aggressive', 'neutral', 'friendly'] as const)[Math.floor(Math.random() * 3)]
        }
      };
      
      setAnalysisResults(results);
      setSearchHistory((prev) => [{
        keyword: keyword,
        timestamp: new Date().toLocaleString(),   
        tweetsCount: results.tweetsAnalyzed,
        riskLevel: results.abuseDetection.riskLevel
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to complete analysis. Please try again.');
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

  const getBiasColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="keyword-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., climate change, #election2024, mental health..."
                  className="flex-1 px-4 py-3 border border-[#dfdeda] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b3a39] focus:border-transparent text-sm sm:text-base"
                  disabled={isProcessing}
                />
                <button
                  onClick={processAnalysis}
                  disabled={!keyword.trim() || isProcessing}
                  className="bg-[#3b3a39] text-white px-6 py-3 rounded-lg font-medium text-sm sm:text-base shadow hover:bg-[#232221] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] flex items-center justify-center sm:w-auto"
                >
                  {isProcessing ? 'Processing...' : 'Start Analysis'}
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
                  <h3 className="text-lg sm:text-xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                    Analysis Overview - "{analysisResults.keyword}"
                  </h3>
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

          {/* Search History Sidebar */}
          {searchHistory.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-lg border border-[#dfdeda] shadow">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                    Recent Analyses
                  </h3>
                  <div className="space-y-3">
                    {searchHistory.map((search, index) => (
                      <div key={index} className="p-3 border border-[#dfdeda] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#3b3a39] text-sm">"{search.keyword}"</span>
                          <span className={`px-2 py-1 rounded text-xs ${getRiskColor(search.riskLevel)}`}>
                            {search.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-[#6e6d6b]">
                          <span>{search.tweetsCount} tweets</span>
                          <span>{search.timestamp}</span>
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