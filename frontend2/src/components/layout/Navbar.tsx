import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = (): React.JSX.Element => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full bg-white border-b border-[#dfdeda] py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between">
      <div className="text-xl sm:text-2xl font-bold [font-family:'Lexend_Deca',Helvetica] text-[#3b3a39]">
        TweetWatch
      </div>
      <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
        <Link 
          to="/" 
          className={`font-medium hover:text-[#3b3a39] hover:underline ${
            isActive('/') ? 'text-[#3b3a39] underline' : 'text-[#6e6d6b]'
          }`}
        >
          Home
        </Link>
        <Link 
          to="/detection" 
          className={`font-medium hover:text-[#3b3a39] hover:underline ${
            isActive('/detection') ? 'text-[#3b3a39] underline' : 'text-[#6e6d6b]'
          }`}
        >
          Analysis
        </Link>
        <Link 
          to="/reports" 
          className={`font-medium hover:text-[#3b3a39] hover:underline ${
            isActive('/reports') ? 'text-[#3b3a39] underline' : 'text-[#6e6d6b]'
          }`}
        >
          Reports
        </Link>
        <Link 
          to="/about" 
          className={`font-medium hover:text-[#3b3a39] hover:underline ${
            isActive('/about') ? 'text-[#3b3a39] underline' : 'text-[#6e6d6b]'
          }`}
        >
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;