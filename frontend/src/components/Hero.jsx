import React from "react";
import { Link } from "react-router-dom";
import { ShieldIcon } from "./ShieldIcon";



export const Hero = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f2ee]">
      {/* Navbar - Responsive */}
      <nav className="w-full bg-white border-b border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
          AbuseDetect
        </div>
        <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
          <a href="/" className="text-[#3b3a39] font-medium hover:underline">Home</a>
          <Link to="/detection" className="text-[#3b3a39] font-medium hover:underline">Detection</Link>
          <Link to="/analysis" className="text-[#3b3a39] font-medium hover:underline">Analysis</Link>
          <Link to="/about" className="text-[#3b3a39] font-medium hover:underline">About</Link>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-4">
        {/* Shield Icon - Responsive sizing */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-black shadow mb-6 sm:mb-8 mt-8 sm:mt-12 bg-white flex items-center justify-center">
          <ShieldIcon size={80} className="sm:w-20 sm:h-20 md:w-24 md:h-24" />
        </div>

        {/* Heading - Responsive text sizing */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39] mb-4 sm:mb-6 leading-tight px-2">
          AI-Powered Abuse Detection
        </h1>

        {/* Description - Responsive text and spacing */}
        <p className="text-base sm:text-lg md:text-xl font-light [font-family:'Lexend_Deca',Helvetica] text-[#6e6d6b] mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl leading-relaxed px-2">
          Advanced machine learning algorithms to detect and prevent online abuse, harassment, and harmful content. Protecting digital spaces with cutting-edge technology.
        </p>

        {/* CTA Button - Touch-friendly sizing */}
        <a
          href="#detection"
          className="inline-block bg-[#3b3a39] text-white px-6 sm:px-8 py-3 sm:py-3 rounded-lg font-medium text-base sm:text-lg shadow hover:bg-[#232221] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
        >
          Start Detection
        </a>
      </main>

      {/* Footer - Responsive */}
      <footer className="w-full bg-white border-t border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 text-center text-[#6e6d6b] text-xs sm:text-sm">
        © {new Date().getFullYear()} AbuseDetect — AI-Powered Safety Solutions.
      </footer>
    </div>
  );
}; 