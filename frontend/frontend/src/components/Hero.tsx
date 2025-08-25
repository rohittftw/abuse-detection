import React from "react";
import { Link } from "react-router-dom";

export const Hero = (): React.JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f2ee] via-white to-[#f8f6f2]">
      {/* Enhanced Navbar */}
      <nav className="w-full bg-white/90 backdrop-blur-sm border-b border-[#dfdeda] py-4 sm:py-6 px-6 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39] tracking-tight">
          <span className="bg-gradient-to-r from-[#3b3a39] to-[#6e6d6b] bg-clip-text text-transparent">
            AbuseDetect
          </span>
        </div>
        <div className="hidden sm:flex gap-8 text-base font-medium">
          <a href="/" className="text-[#3b3a39] hover:text-[#232221] transition-colors duration-200">Home</a>
          <Link to="/detection" className="text-[#3b3a39] hover:text-[#232221] transition-colors duration-200">Detection</Link>
          <Link to="/analysis" className="text-[#3b3a39] hover:text-[#232221] transition-colors duration-200">Analysis</Link>
          <Link to="/about" className="text-[#3b3a39] hover:text-[#232221] transition-colors duration-200">About</Link>
        </div>
        <button className="sm:hidden text-[#3b3a39]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Enhanced Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* Enhanced Profile Section */}
        <div className="relative mb-12 sm:mb-16">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3b3a39]/10 to-[#6e6d6b]/10 rounded-full blur-3xl scale-150"></div>
          
          {/* Profile Picture */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-black shadow-2xl bg-white flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#3b3a39] to-[#6e6d6b] flex items-center justify-center">
              <svg className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"/>
                <path d="M12 12L15.09 8.91L12 5.82L8.91 8.91L12 12Z" fill="white"/>
                <path d="M12 12L15.09 15.09L12 18.18L8.91 15.09L12 12Z" fill="white"/>
              </svg>
            </div>
          </div>
          
          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 bg-[#3b3a39] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
            AI-Powered
          </div>
        </div>

        {/* Enhanced Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#3b3a39] mb-6 sm:mb-8 leading-tight px-2 max-w-5xl">
          <span className="bg-gradient-to-r from-[#3b3a39] via-[#6e6d6b] to-[#3b3a39] bg-clip-text text-transparent">
            AI-Powered Abuse Detection
          </span>
        </h1>

        {/* Enhanced Description */}
        <p className="text-lg sm:text-xl md:text-2xl font-light text-[#6e6d6b] mb-8 sm:mb-12 max-w-3xl leading-relaxed px-2">
          Advanced machine learning algorithms to detect and prevent online abuse, harassment, and harmful content. 
          <span className="font-medium text-[#3b3a39]"> Protecting digital spaces with cutting-edge technology.</span>
        </p>

        {/* Enhanced CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12">
          <a
            href="#detection"
            className="inline-block bg-[#3b3a39] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-lg sm:text-xl shadow-xl hover:bg-[#232221] hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 min-h-[56px] flex items-center justify-center"
          >
            🚀 Start Detection
          </a>
          <a
            href="#demo"
            className="inline-block bg-white text-[#3b3a39] border-2 border-[#3b3a39] px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-lg sm:text-xl shadow-lg hover:bg-[#3b3a39] hover:text-white transform hover:-translate-y-1 transition-all duration-300 min-h-[56px] flex items-center justify-center"
          >
            📊 View Demo
          </a>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl w-full">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39]">99.8%</div>
            <div className="text-sm sm:text-base text-[#6e6d6b]">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39]">50ms</div>
            <div className="text-sm sm:text-base text-[#6e6d6b]">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39]">1M+</div>
            <div className="text-sm sm:text-base text-[#6e6d6b]">Analyses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#3b3a39]">24/7</div>
            <div className="text-sm sm:text-base text-[#6e6d6b]">Monitoring</div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="w-full bg-white/90 backdrop-blur-sm border-t border-[#dfdeda] py-6 sm:py-8 px-6 sm:px-8 lg:px-12 text-center">
        <div className="text-[#6e6d6b] text-sm sm:text-base mb-4">
          © {new Date().getFullYear()} AbuseDetect — AI-Powered Safety Solutions
        </div>
        <div className="flex justify-center gap-6 text-[#6e6d6b] text-sm">
          <a href="#" className="hover:text-[#3b3a39] transition-colors duration-200">Privacy</a>
          <a href="#" className="hover:text-[#3b3a39] transition-colors duration-200">Terms</a>
          <a href="#" className="hover:text-[#3b3a39] transition-colors duration-200">Contact</a>
        </div>
      </footer>
    </div>
  );
}; 