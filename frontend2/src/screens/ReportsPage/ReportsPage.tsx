import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { API_ENDPOINTS } from '../../config/api';

type AnalysisSession = {
  sessionId: string;
  sessionName: string;
  query: string;
  hashtag: string;
  tweetCount: number;
  startedAt: string;
  status: string;
  risk_level?: string;
  sentiment?: string;
};

export const ReportsPage = (): React.JSX.Element => {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<AnalysisSession | null>(null);
  const [sessionTweets, setSessionTweets] = useState<any[] | null>(null);
  const [loadingTweets, setLoadingTweets] = useState(false);

  // Fetch all sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.SESSIONS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionTweets = async (sessionName: string) => {
    setLoadingTweets(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.SESSION_TWEETS(sessionName), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session tweets');
      }

      const data = await response.json();
      setSessionTweets(data.tweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session tweets');
      console.error('Error fetching session tweets:', err);
    } finally {
      setLoadingTweets(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f2ee]">
      <Navbar />

      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-3">
              Analysis Reports
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#6e6d6b]">
              View and manage your past analysis sessions and results
            </p>
          </div>

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3b3a39] border-t-transparent"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-[#3b3a39] mb-2">No Analysis Sessions Found</h3>
              <p className="text-[#6e6d6b]">Start analyzing tweets to see your sessions here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sessions List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#3b3a39] mb-4">Analysis Sessions</h2>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => {
                        setSelectedSession(session);
                        fetchSessionTweets(session.sessionName);
                      }}
                      className={`p-4 bg-white border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedSession?.sessionId === session.sessionId
                          ? 'border-[#3b3a39]'
                          : 'border-[#dfdeda]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-[#3b3a39]">{session.sessionName}</h3>
                          <p className="text-sm text-[#6e6d6b]">#{session.hashtag}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded ${getRiskLevelColor(session.risk_level)}`}>
                          {session.risk_level || 'Unknown'}
                        </div>
                      </div>
                      <div className="text-sm text-[#6e6d6b] space-y-1">
                        <p>Query: "{session.query}"</p>
                        <p>Tweets: {session.tweetCount}</p>
                        <p>Date: {formatDate(session.startedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-white border border-[#dfdeda] rounded-lg p-6">
                {selectedSession ? (
                  <div>
                    <h2 className="text-xl font-bold text-[#3b3a39] mb-4">Session Details</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-[#3b3a39]">Session Information</h3>
                        <div className="mt-2 space-y-2 text-sm text-[#6e6d6b]">
                          <p><span className="font-medium">Session Name:</span> {selectedSession.sessionName}</p>
                          <p><span className="font-medium">Query:</span> {selectedSession.query}</p>
                          <p><span className="font-medium">Hashtag:</span> #{selectedSession.hashtag}</p>
                          <p><span className="font-medium">Tweet Count:</span> {selectedSession.tweetCount}</p>
                          <p><span className="font-medium">Started:</span> {formatDate(selectedSession.startedAt)}</p>
                          <p><span className="font-medium">Status:</span> {selectedSession.status}</p>
                        </div>
                      </div>

                      {loadingTweets ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3b3a39] border-t-transparent mx-auto mb-2"></div>
                          <p className="text-sm text-[#6e6d6b]">Loading tweets...</p>
                        </div>
                      ) : sessionTweets ? (
                        <div>
                          <h3 className="font-medium text-[#3b3a39] mt-6 mb-3">Recent Tweets</h3>
                          <div className="space-y-4">
                            {sessionTweets.slice(0, 5).map((tweet: any) => (
                              <div key={tweet.id} className="border border-[#dfdeda] rounded-lg p-4">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="w-8 h-8 bg-[#3b3a39] rounded-full flex items-center justify-center text-white text-sm">
                                    {tweet.author.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{tweet.author.name}</span>
                                      <span className="text-sm text-[#6e6d6b]">@{tweet.author.username}</span>
                                    </div>
                                    <p className="text-sm mt-1">{tweet.text}</p>
                                  </div>
                                </div>
                                <div className="text-xs text-[#6e6d6b] mt-2">
                                  {formatDate(tweet.created_at)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👆</div>
                    <h3 className="text-xl font-bold text-[#3b3a39] mb-2">Select a Session</h3>
                    <p className="text-[#6e6d6b]">Click on a session to view its details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} TweetWatch — AI-Powered Social Media Analysis
      </footer>
    </div>
  );
};

export default ReportsPage;