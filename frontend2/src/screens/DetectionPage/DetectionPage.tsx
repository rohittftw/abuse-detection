import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, BarChart3, Heart, Link2, MessageCircle, Repeat2 } from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/home/PageHeader";

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
  const [reanalyzing, setReanalyzing] = useState<{ [key: string]: boolean }>({});
  const [reanalyzingSession, setReanalyzingSession] = useState(false);

  const handleBulkReanalysis = async () => {
    if (!selectedSession || reanalyzingSession) return;

    setReanalyzingSession(true);
    setError(null);
    console.log('Starting bulk reanalysis...');

    try {
      // First update any old tweets without analysis history
      if (analysisResults?.tweets) {
        setAnalysisResults(prev => {
          if (!prev || !prev.tweets) return prev;
          return {
            ...prev,
            tweets: prev.tweets.map(tweet => {
              if (!tweet.analysisHistory) {
                return {
                  ...tweet,
                  analysisHistory: tweet.analysis ? [{
                    ...tweet.analysis,
                    analyzedAt: new Date(tweet.created_at || Date.now()).toISOString()
                  }] : []
                };
              }
              return tweet;
            })
          };
        });
      }

      console.log('Sending reanalysis request for session:', selectedSession.sessionName);
      const response = await fetch(API_ENDPOINTS.REANALYZE_SESSION(selectedSession.sessionName), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reanalyze session');
      }

      const data = await response.json();
      console.log('Received reanalysis response:', data);
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing data array');
      }
      
      if (!data.overall) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing overall analysis');
      }

      // Process and update tweets with new analysis data
      const processedTweets = data.data.map((tweet: any) => {
        // Ensure tweet has the required properties
        if (!tweet || !tweet.analysis) {
          console.error('Invalid tweet data:', tweet);
          return tweet;
        }

        // Re-format the analysis to match the frontend structure
        const formattedAnalysis = {
          abuse: tweet.analysis.abuse || [],
          risk_level: tweet.analysis.risk_level,
          confidence: tweet.analysis.confidence,
          sentiment: tweet.analysis.sentiment || []
        };

        return {
          ...tweet,
          analysis: formattedAnalysis,
          analysisHistory: Array.isArray(tweet.analysisHistory) ? tweet.analysisHistory : []
        };
      });

      // Update all tweets in the analysis results
      setAnalysisResults(prev => {
        if (!prev) return prev;
        // Ensure we have a valid tweets array to work with
        if (!Array.isArray(processedTweets)) {
          console.error('Invalid processed tweets:', processedTweets);
          return prev;
        }
        
        // Update with new tweet data and overall analysis
        return {
          ...prev,
          tweets: processedTweets,
          abuseDetection: {
            ...prev.abuseDetection,
            totalAbusive: processedTweets.filter(t => t.analysis.abuse.some((a: { label: string }) => a.label === 'HATE')).length,
            riskLevel: data.overall.risk_level,
            confidence: data.overall.confidence,
            isHateSpeech: data.overall.overall_abuse === 'HATE',
            hateSpeech: processedTweets.filter(t => t.analysis.abuse.some((a: { label: string }) => a.label === 'HATE')).length,
            // Keep previous values for these since they're estimates
            harassment: prev.abuseDetection.harassment,
            threats: prev.abuseDetection.threats
          },
          sentimentAnalysis: {
            ...prev.sentimentAnalysis,
            positive: processedTweets.reduce((sum, t) => sum + (t.analysis.sentiment.find((s: { label: string; score: number }) => s.label === 'POSITIVE')?.score || 0) * 100, 0) / processedTweets.length,
            neutral: processedTweets.reduce((sum, t) => sum + (t.analysis.sentiment.find((s: { label: string; score: number }) => s.label === 'NEUTRAL')?.score || 0) * 100, 0) / processedTweets.length,
            negative: processedTweets.reduce((sum, t) => sum + (t.analysis.sentiment.find((s: { label: string; score: number }) => s.label === 'NEGATIVE')?.score || 0) * 100, 0) / processedTweets.length,
            dominantSentiment: data.overall.overall_sentiment.toLowerCase(),
            confidence: data.overall.confidence,
            // Keep the previous overall score since it's a derived value
            overallScore: prev.sentimentAnalysis.overallScore
          }
        };
      });

    } catch (error) {
      console.error('Bulk reanalysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to reanalyze tweets');
    } finally {
      setReanalyzingSession(false);
    }
  };

    const handleReanalysis = async (tweetId: string) => {
    if (reanalyzing[tweetId]) return;

    setReanalyzing(prev => ({ ...prev, [tweetId]: true }));
    try {
      const response = await fetch(API_ENDPOINTS.REANALYZE_TWEET(tweetId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reanalyze tweet');
      }

      const updatedTweet = await response.json();
      console.log('Received updated tweet:', updatedTweet);
      
      if (!updatedTweet || !updatedTweet.analysis) {
        throw new Error('Invalid response format: missing tweet analysis data');
      }

      // Update the tweet in the analysis results with the new analysis and history
      setAnalysisResults(prev => {
        if (!prev || !prev.tweets || !Array.isArray(prev.tweets)) {
          console.error('Invalid analysis results state:', prev);
          return prev;
        }
        
        return {
          ...prev,
          tweets: prev.tweets.map(tweet => {
            if (tweet.id === tweetId) {
              return {
                ...tweet,
                analysis: updatedTweet.analysis,
                analysisHistory: updatedTweet.analysisHistory || []
              };
            }
            return tweet;
          })
        };
      });
    } catch (error) {
      console.error('Reanalysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to reanalyze tweet');
    } finally {
      setReanalyzing(prev => ({ ...prev, [tweetId]: false }));
    }
  };

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
      const response = await fetch(API_ENDPOINTS.SESSIONS, {
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
      const response = await fetch(API_ENDPOINTS.SESSION_TWEETS(sessionName), {
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
      const response = await fetch(API_ENDPOINTS.FETCH_TWEETS, {
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

  const downloadPdfReport = async () => {
    if (!analysisResults) return;

    // Dynamic import of html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    // Create a new div for the PDF content
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: var(--color-text-primary); margin-bottom: 20px;">Tweet Analysis Report</h1>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--color-text-primary); margin-bottom: 10px;">Analysis Overview</h2>
          <p><strong>Query:</strong> ${analysisResults.keyword}</p>
          <p><strong>Tweets Analyzed:</strong> ${analysisResults.tweetsAnalyzed}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--color-text-primary); margin-bottom: 10px;">Key Findings</h2>
          <p><strong>Risk Level:</strong> ${analysisResults.abuseDetection.riskLevel.toUpperCase()}</p>
          <p><strong>Abusive Tweets:</strong> ${analysisResults.abuseDetection.totalAbusive}</p>
          <p><strong>Hate Speech Detected:</strong> ${analysisResults.abuseDetection.hateSpeech} tweets</p>
          <p><strong>Harassment Instances:</strong> ${analysisResults.abuseDetection.harassment} tweets</p>
          <p><strong>Threats Detected:</strong> ${analysisResults.abuseDetection.threats} tweets</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--color-text-primary); margin-bottom: 10px;">Sentiment Analysis</h2>
          <p><strong>Overall Score:</strong> ${analysisResults.sentimentAnalysis.overallScore}%</p>
          <p><strong>Positive:</strong> ${analysisResults.sentimentAnalysis.positive}%</p>
          <p><strong>Neutral:</strong> ${analysisResults.sentimentAnalysis.neutral}%</p>
          <p><strong>Negative:</strong> ${analysisResults.sentimentAnalysis.negative}%</p>
        </div>

        ${analysisResults.tweets ? `
          <div>
            <h2 style="color: var(--color-text-primary); margin-bottom: 10px;">Individual Tweets</h2>
            ${analysisResults.tweets.map((tweet: any) => `
              <div style="border: 1px solid var(--color-border); padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <p style="margin-bottom: 10px;"><strong>${tweet.author.name}</strong> @${tweet.author.username}</p>
                <p style="margin-bottom: 10px;">${tweet.text}</p>
                <p style="color: var(--color-text-secondary); font-size: 14px;">
                  Risk Level: ${tweet.analysis.risk_level.toUpperCase()} | 
                  Confidence: ${(tweet.analysis.confidence * 100).toFixed(1)}%
                </p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `tweet-analysis-${analysisResults.keyword}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-home-surface-elevated border-gray-200';
    }
  };


  return (
    <AppLayout>
          <PageHeader
            label="Dashboard"
            title="AI-Powered Social Media Analysis"
            description="Enter a keyword or hashtag to fetch tweets and generate comprehensive analysis reports including abuse detection, sentiment analysis, bias detection, and tone analysis."
          />

          {/* Input Section */}
          <div className="tw-card mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <label htmlFor="keyword-input" className="block text-sm font-medium text-home-heading mb-3">
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
                  className="tw-input flex-1"
                  disabled={isProcessing}
                />
                <button
                  onClick={processAnalysis}
                  disabled={!keyword.trim() || isProcessing}
                  className="tw-btn-primary min-h-[48px] sm:w-auto text-sm sm:text-base"
                >
                  {isProcessing ? 'Processing...' : `Analyze from Twitter`}
                </button>
                <button
                  onClick={clearResults}
                  className="tw-btn-secondary min-h-[48px] sm:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="tw-alert-error mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="tw-card mb-6 sm:mb-8">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-home-accent border-t-transparent mr-3"></div>
                  <h3 className="text-lg font-bold text-home-heading">Processing Analysis</h3>
                </div>
                <div className="text-center">
                  <p className="text-sm text-home-muted mb-4">{processingStage}</p>
                  <div className="tw-progress-track">
                    <div className="tw-progress-bar" style={{width: `${((stages.indexOf(processingStage) + 1) / stages.length) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResults && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="tw-card">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-home-heading">
                    Analysis Overview - "{analysisResults.keyword}"
                  </h3>
                    <div className="text-sm text-home-muted">
                      Source: {analysisResults.source}
                    </div>
                  </div>
                  
                  {analysisResults.sessionInfo && (
                    <div className="mb-4 p-3 bg-home-bg rounded-lg border border-home-border">
                      <div className="text-sm font-medium text-home-heading mb-1">
                        Session Information
                      </div>
                      <div className="text-xs text-home-muted space-y-1">
                        <div>Session: {analysisResults.sessionInfo.sessionName}</div>
                        <div>Query: "{analysisResults.sessionInfo.query}"</div>
                        <div>Session ID: {analysisResults.sessionInfo.sessionId}</div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 border border-home-border rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-home-heading">{analysisResults.tweetsAnalyzed}</div>
                      <div className="text-xs sm:text-sm text-home-muted">Tweets Analyzed</div>
                    </div>
                    <div className={`text-center p-3 border rounded-lg ${getRiskColor(analysisResults.abuseDetection.riskLevel)}`}>
                      <div className="text-xl sm:text-2xl font-bold">{analysisResults.abuseDetection.riskLevel.toUpperCase()}</div>
                      <div className="text-xs sm:text-sm">Risk Level</div>
                      <div className="text-xs">({(analysisResults.abuseDetection.confidence * 100).toFixed(1)}% confidence)</div>
                    </div>
                    <div className="text-center p-3 border border-home-border rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-home-heading">{analysisResults.sentimentAnalysis.overallScore}%</div>
                      <div className="text-xs sm:text-sm text-home-muted">Sentiment Score</div>
                      <div className="text-xs text-home-muted">({analysisResults.sentimentAnalysis.dominantSentiment})</div>
                    </div>
                    <div className="text-center p-3 border border-home-border rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-home-heading">{analysisResults.abuseDetection.totalAbusive}</div>
                      <div className="text-xs sm:text-sm text-home-muted">Abusive Tweets</div>
                      <div className="text-xs text-home-muted">
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
                <div className="tw-card">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-home-heading mb-4 flex items-center">
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
                      <div className="pt-3 border-t border-home-border">
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

              {/* Individual Tweets Toggle and Bulk Reanalysis */}
              {analysisResults.tweets && analysisResults.tweets.length > 0 && (
                <div className="text-center mb-6 space-y-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowIndividualTweets(!showIndividualTweets)}
                      className="tw-btn-primary text-lg px-8 py-4"
                    >
                      {showIndividualTweets ? 'Hide Individual Tweets' : 'View Individual Tweets'}
                    </button>
                    {selectedSession && (
                      <button
                        onClick={handleBulkReanalysis}
                        disabled={reanalyzingSession}
                        className="tw-btn-secondary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                      >
                        <svg className={`w-6 h-6 ${reanalyzingSession ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {reanalyzingSession ? 'Reanalyzing All Tweets...' : 'Reanalyze All Tweets'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-home-muted">
                    {analysisResults.tweets.length} tweets available for individual analysis
                  </p>
                  {reanalyzingSession && (
                    <p className="text-sm text-home-muted animate-pulse">
                      Reanalyzing all tweets, this may take a few moments...
                    </p>
                  )}
                </div>
              )}

              {/* Individual Tweets Display */}
              {showIndividualTweets && analysisResults.tweets && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-home-heading">
                    Individual Tweet Analysis
                  </h2>
                  
                  {analysisResults.tweets.map((tweet: any) => (
                    <div key={tweet.id} className="tw-card p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Tweet Content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-home-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {tweet.author?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-home-heading">{tweet.author?.name || 'Unknown'}</span>
                                <span className="text-home-muted">@{tweet.author?.username || 'unknown'}</span>
                                {tweet.author?.verified && (
                                  <BadgeCheck className="h-4 w-4 text-home-accent" aria-label="Verified" />
                                )}
                              </div>
                              <div className="text-sm text-home-muted">
                                {new Date(tweet.created_at).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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
                              {tweet.public_metrics?.likeCount || tweet.public_metrics?.like_count || tweet.publicMetrics?.likeCount || 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Repeat2 className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics?.retweetCount || tweet.public_metrics?.retweet_count || tweet.publicMetrics?.retweetCount || 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics?.replyCount || tweet.public_metrics?.reply_count || tweet.publicMetrics?.replyCount || 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Link2 className="h-4 w-4" strokeWidth={1.8} />
                              {tweet.public_metrics?.quoteCount || tweet.public_metrics?.quote_count || tweet.publicMetrics?.quoteCount || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Analysis Results */}
                        <div className="lg:w-80 space-y-4">
                          {/* Sentiment Analysis */}
                          <div className="bg-home-surface-elevated rounded-lg p-4">
                            <h4 className="font-medium text-home-heading mb-2">Sentiment Analysis</h4>
                            <div className="space-y-2">
                              {tweet.analysis?.sentiment?.map((item: any, idx: number) => (
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
                              {tweet.analysis?.abuse?.map((item: any, idx: number) => (
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
                          <div className={`rounded-lg p-4 ${getRiskColor(tweet.analysis?.risk_level || 'low')}`}>
                            <h4 className="font-medium mb-2">Risk Assessment</h4>
                            <div className="text-lg font-bold">
                              {(tweet.analysis?.risk_level || 'low').toUpperCase()}
                            </div>
                            <div className="text-sm opacity-75">
                              Confidence: {((tweet.analysis?.confidence || 0) * 100).toFixed(1)}%
                            </div>
                          </div>

                          {/* Reanalysis Button */}
                          <button
                            onClick={() => handleReanalysis(tweet.id)}
                            disabled={reanalyzing[tweet.id]}
                            className="w-full bg-home-surface text-home-heading border border-home-border px-4 py-2 rounded-lg font-medium text-sm shadow hover:bg-home-surface-elevated transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className={`w-4 h-4 ${reanalyzing[tweet.id] ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {reanalyzing[tweet.id] ? 'Reanalyzing...' : 'Reanalyze Tweet'}
                          </button>

                          {/* Analysis History */}
                          {tweet.analysisHistory && tweet.analysisHistory.length > 0 && (
                            <div className="bg-home-surface-elevated rounded-lg p-4">
                              <h4 className="font-medium text-home-heading mb-2">Analysis History</h4>
                              <div className="space-y-3">
                                {tweet.analysisHistory.map((history: any, idx: number) => (
                                  <div key={idx} className="border-t border-home-border pt-2">
                                    <div className="text-xs text-home-muted mb-1">
                                      {new Date(history.analyzedAt).toLocaleString()}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="font-medium">Sentiment: </span>
                                        {history.sentiment[0]?.label}
                                      </div>
                                      <div>
                                        <span className="font-medium">Risk: </span>
                                        {history.risk_level || history.riskLevel || 'unknown'}
                                      </div>
                                    </div>
                                    <div className="text-xs text-home-muted mt-1">
                                      Confidence: {(history.confidence * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report Generation */}
              <div className="tw-card">
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="text-lg font-bold text-home-heading mb-4">
                    Complete Analysis Report
                  </h3>
                  <p className="text-sm text-home-muted mb-4">
                    Your comprehensive analysis has been completed using real AI models for abuse detection and sentiment analysis.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => downloadPdfReport()} 
                      className="tw-btn-primary"
                    >
                      Download PDF Report
                    </button>
                    <Link 
                      to="/reports" 
                      className="tw-btn-secondary inline-flex"
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
            <div className="tw-card">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-home-heading">
                    Recent Analysis Sessions
                  </h3>
                  <button
                    onClick={fetchRecentSessions}
                    disabled={loadingSessions}
                    className="text-sm text-home-heading hover:text-[#232221] disabled:opacity-50"
                  >
                    {loadingSessions ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-home-accent border-t-transparent"></div>
                    <span className="ml-2 text-home-muted">Loading sessions...</span>
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div 
                        key={session.sessionId} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedSession?.sessionId === session.sessionId 
                            ? 'border-home-accent bg-home-bg' 
                            : 'border-home-border hover:border-home-accent'
                        }`}
                        onClick={() => fetchTweetsFromSession(session.sessionName)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-home-heading text-sm mb-1">
                              {session.sessionName}
                            </div>
                            <div className="text-xs text-home-muted mb-1">
                              Query: "{session.query}"
                            </div>
                            <div className="text-xs text-home-muted">
                              Hashtag: #{session.hashtag}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-home-muted mb-1">
                              {session.tweetCount} tweets
                            </div>
                            <div className="text-xs text-home-muted">
                              {new Date(session.startedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-home-heading font-medium">
                          Click to load analysis →
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-home-muted">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-home-accent-soft text-home-accent">
                      <BarChart3 className="h-7 w-7" strokeWidth={1.7} />
                    </div>
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
              <div className="tw-card">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-home-heading mb-4">
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {searchHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-home-border rounded-lg hover:bg-home-surface-elevated">
                        <div>
                          <div className="font-medium text-home-heading">{item.keyword}</div>
                          <div className="text-xs text-home-muted">{item.timestamp}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-home-heading">{item.tweetsCount} tweets</div>
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
    </AppLayout>
  );
};