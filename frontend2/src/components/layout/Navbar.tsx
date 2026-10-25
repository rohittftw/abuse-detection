import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoMark } from "../Logo";

export const Navbar = (): React.JSX.Element => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-portfolio-surface border-b border-portfolio-border py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5">
        <LogoMark size={30} />
        <span className="text-xl font-bold tracking-tight text-portfolio-primary">
          TweetWatch
        </span>
      </Link>
      <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
        {[
          { path: "/", label: "home" },
          { path: "/detection", label: "analysis" },
          { path: "/reports", label: "reports" },
          { path: "/about", label: "about" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`font-medium transition-colors duration-200 ${
              isActive(item.path)
                ? "text-portfolio-primary underline"
                : "text-portfolio-secondary hover:text-portfolio-primary hover:underline"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
