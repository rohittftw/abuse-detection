import React, { useId } from "react";

type LogoMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * TweetWatch brand mark — a shield with an eye cut-out.
 * "Watch" (the eye) + "protect" (the shield), on a blue → purple gradient.
 */
export const LogoMark = ({
  size = 32,
  className = "",
  title,
}: LogoMarkProps): React.JSX.Element => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `tw-gradient-${uid}`;
  const maskId = `tw-mask-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2F4BFF" />
          <stop offset="1" stopColor="#A948E3" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="32" height="32" fill="black" />
          <path
            d="M16 4.8 24.5 8v7.2c0 5.2-3.6 9.7-8.5 11.5-4.9-1.8-8.5-6.3-8.5-11.5V8L16 4.8Z"
            fill="white"
          />
          <path
            d="M10.8 13c1.5-2 3.2-3 5.2-3s3.7 1 5.2 3c-1.5 2-3.2 3-5.2 3s-3.7-1-5.2-3Z"
            fill="black"
          />
        </mask>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <rect width="32" height="32" fill="white" mask={`url(#${maskId})`} />
      <circle cx="16" cy="13" r="1.7" fill="white" />
    </svg>
  );
};

type LogoProps = {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
};

export const Logo = ({
  size = 32,
  className = "",
  wordmarkClassName = "text-lg font-bold tracking-tight text-home-heading",
}: LogoProps): React.JSX.Element => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    <span className={wordmarkClassName}>TweetWatch</span>
  </span>
);

export default LogoMark;
