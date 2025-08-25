import React from "react";
import { Link } from "react-router-dom";

export const Hero = (): React.JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f2ee]">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
          TweetWatch
        </div>
        <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
          <a href="/" className="text-[#3b3a39] font-medium hover:underline">Home</a>
          <Link to="/detection" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Analysis</Link>
          <Link to="/reports" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">Reports</Link>
          <Link to="/about" className="text-[#6e6d6b] font-medium hover:text-[#3b3a39] hover:underline">About</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-4">
        {/* AI Shield Icon */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-black shadow mb-6 sm:mb-8 mt-8 sm:mt-12 bg-gradient-to-br from-[#3b3a39] to-[#6e6d6b] flex items-center justify-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"/>
            <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4 sm:mb-6 leading-tight px-2">
          AI-Powered Social Media Analysis
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-3xl leading-relaxed px-2">
          Advanced machine learning system for comprehensive Twitter analysis. Detect abuse, analyze sentiment, identify bias, and assess tone across social media conversations.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-4xl w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-[#3b3a39]">Abuse Detection</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-[#3b3a39]">Sentiment Analysis</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-[#3b3a39]">Bias Detection</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-[#3b3a39]">Tone Analysis</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Link
            to="/detection"
            className="inline-block bg-[#3b3a39] text-white px-6 sm:px-8 py-3 sm:py-3 rounded-lg font-medium text-base sm:text-lg shadow hover:bg-[#232221] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
          >
            Start Analysis
          </Link>
          <Link
            to="/about"
            className="inline-block bg-white text-[#3b3a39] border border-[#dfdeda] px-6 sm:px-8 py-3 sm:py-3 rounded-lg font-medium text-base sm:text-lg shadow hover:bg-[#f4f2ee] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
          >
            Learn More
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl w-full mb-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">99.2%</div>
            <div className="text-xs sm:text-sm text-[#6e6d6b]">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">4 AI Models</div>
            <div className="text-xs sm:text-sm text-[#6e6d6b]">Detection Types</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">Real-time</div>
            <div className="text-xs sm:text-sm text-[#6e6d6b]">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">Auto Reports</div>
            <div className="text-xs sm:text-sm text-[#6e6d6b]">Generated</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} TweetWatch — AI-Powered Social Media Analysis & Abuse Detection System.
      </footer>
    </div>
  );
};