import React from "react";

export const ShieldIcon = ({ className = "", size = 128 }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#3b3a39]"
      >
        <path
          d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 12L15.09 8.91L12 5.82L8.91 8.91L12 12Z"
          fill="currentColor"
        />
        <path
          d="M12 12L15.09 15.09L12 18.18L8.91 15.09L12 12Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}; 