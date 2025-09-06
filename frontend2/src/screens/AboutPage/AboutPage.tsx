import React from "react";
import { Link } from "react-router-dom";

export const AboutPage = (): React.JSX.Element => {
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
          <Link to="/analysis" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Analysis</Link>
          <Link to="/about" className="text-[#3b3a39] font-medium underline">About</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black shadow bg-[#3b3a39] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4 sm:mb-6">
              About TweetWatch
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] max-w-3xl mx-auto leading-relaxed">
              Real-time Twitter monitoring and AI-powered content analysis to detect abuse, harassment, and harmful content across social media.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-8 sm:mb-10">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] leading-relaxed mb-4">
                TweetWatch was created to make social media safer by providing real-time monitoring and analysis of Twitter content. We believe that technology should be used to protect users from harmful content while preserving free speech and open dialogue.
              </p>
              <p className="text-base sm:text-lg font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] leading-relaxed">
                Our AI-powered system helps identify potential abuse, harassment, hate speech, and other harmful content, enabling proactive moderation and creating safer digital spaces for everyone.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-8 sm:mb-10">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-6 sm:mb-8">
                How TweetWatch Works
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#3b3a39] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                    1. Monitor
                  </h3>
                  <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                    Use hashtags to collect tweets in real-time via Twitter API. Track trending topics, events, or specific conversations.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#3b3a39] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                    2. Analyze
                  </h3>
                  <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                    Advanced AI algorithms analyze each tweet for potential abuse, harassment, hate speech, and harmful content patterns.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#3b3a39] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                    3. Report
                  </h3>
                  <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                    Generate detailed reports with risk classifications, confidence scores, and actionable insights for content moderation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-8 sm:mb-10">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-6 sm:mb-8">
                Key Features
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                      Real-time Monitoring
                    </h3>
                    <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                      Collect and analyze tweets as they happen using Twitter API integration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                      AI-Powered Analysis
                    </h3>
                    <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                      Advanced machine learning models trained to detect various forms of harmful content.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                      Risk Classification
                    </h3>
                    <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                      Categorize content by risk level with confidence scores for informed decision-making.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-2">
                      Hashtag Tracking
                    </h3>
                    <p className="text-sm sm:text-base font-light text-[#6e6d6b] leading-relaxed">
                      Monitor specific hashtags, trends, and conversations across the Twitter platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow mb-8 sm:mb-10">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-6 sm:mb-8">
                Technical Stack
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-4 border border-[#dfdeda] rounded-lg">
                  <div className="text-2xl mb-2">🐍</div>
                  <h3 className="font-bold text-[#3b3a39] mb-1">Python</h3>
                  <p className="text-sm text-[#6e6d6b]">Backend & AI Models</p>
                </div>
                <div className="text-center p-4 border border-[#dfdeda] rounded-lg">
                  <div className="text-2xl mb-2">🐦</div>
                  <h3 className="font-bold text-[#3b3a39] mb-1">Twitter API</h3>
                  <p className="text-sm text-[#6e6d6b]">Data Collection</p>
                </div>
                <div className="text-center p-4 border border-[#dfdeda] rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <h3 className="font-bold text-[#3b3a39] mb-1">Machine Learning</h3>
                  <p className="text-sm text-[#6e6d6b]">Content Analysis</p>
                </div>
                <div className="text-center p-4 border border-[#dfdeda] rounded-lg">
                  <div className="text-2xl mb-2">⚛️</div>
                  <h3 className="font-bold text-[#3b3a39] mb-1">React</h3>
                  <p className="text-sm text-[#6e6d6b]">Frontend Interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact/Get Started */}
          <div className="bg-white rounded-lg border border-[#dfdeda] shadow text-center">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4">
                Get Started with TweetWatch
              </h2>
              <p className="text-base sm:text-lg font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] mb-6 max-w-2xl mx-auto">
                Ready to start monitoring Twitter for harmful content? Begin tracking hashtags and analyzing tweets in real-time.
              </p>
              <Link
                to="/detection"
                className="inline-block bg-[#3b3a39] text-white px-8 py-4 rounded-lg font-medium text-lg shadow hover:bg-[#232221] transition-colors duration-200"
              >
                Start Monitoring
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} TweetWatch — Real-time Twitter Monitoring & Analysis.
      </footer>
    </div>
  );
};