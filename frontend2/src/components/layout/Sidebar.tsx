import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { LogoMark } from "../Logo";

const navItems = [
  { path: "/", label: "home" },
  { path: "/detection", label: "analysis" },
  { path: "/reports", label: "reports" },
  { path: "/about", label: "about" },
];

export const Sidebar = (): React.JSX.Element => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.classList.toggle("sb-lock-scroll", menuOpen);
    return () => document.body.classList.remove("sb-lock-scroll");
  }, [menuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-[200] bg-portfolio-bg border-b border-portfolio-border px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <span className="font-serif text-lg font-bold text-portfolio-primary leading-tight">
            TweetWatch
          </span>
          <span className="text-xs text-portfolio-tertiary">ai content moderation</span>
        </div>
        <button
          type="button"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-portfolio-primary"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          aria-label="open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={`w-6 h-6 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[150] bg-portfolio-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <nav
        id="sidebar"
        className={`fixed top-0 left-0 z-[175] h-screen w-sidebar max-w-[85vw] bg-portfolio-bg border-r border-portfolio-border flex flex-col p-8 overflow-y-auto transition-transform duration-250 md:translate-x-0 ${
          menuOpen ? "translate-x-0 shadow-card" : "-translate-x-full"
        }`}
        aria-label="site navigation"
      >
        <div className="mb-8">
          <LogoMark size={56} className="mb-4" />
          <p className="font-serif text-xl font-bold text-portfolio-primary mb-1">TweetWatch</p>
          <p className="text-sm text-portfolio-tertiary">ai content moderation</p>
        </div>

        <ul className="flex-1 list-none space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={closeMenu}
                className={`block px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-portfolio-surface-soft text-portfolio-primary font-medium"
                    : "text-portfolio-secondary hover:bg-portfolio-surface-soft hover:text-portfolio-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={toggleTheme}
          className="w-full mt-4 flex items-center justify-between bg-portfolio-surface border border-portfolio-border rounded-lg px-3 py-2 text-sm text-portfolio-secondary hover:bg-portfolio-surface-soft hover:text-portfolio-primary transition-colors duration-200"
          aria-label={`switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <span>{theme === "light" ? "dark mode" : "light mode"}</span>
          <span aria-hidden="true">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </span>
        </button>

        <a
          href="https://portfolio-tygp.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-sm text-portfolio-tertiary hover:text-portfolio-primary transition-colors duration-200"
        >
          ← back to portfolio
        </a>

        <p className="mt-6 text-xs text-portfolio-tertiary">
          © {new Date().getFullYear()} Rohit Dhawadkar
        </p>
      </nav>
    </>
  );
};

export default Sidebar;
