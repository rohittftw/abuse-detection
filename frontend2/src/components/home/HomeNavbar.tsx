import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../context/AuthContext";
import { LogoMark } from "../Logo";

const navLinks = [
  { label: "Analysis", path: "/detection" },
  { label: "Reports", path: "/reports" },
  { label: "Features", path: "/#features" },
  { label: "Pricing", path: "/#pricing" },
  { label: "About", path: "/about" },
];

export const HomeNavbar = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path.startsWith("/#")) return false;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="ws-announcement text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1.5 px-4 py-2 text-center sm:flex-row sm:gap-3">
          <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-[#2f4bff]">
            New
          </span>
          <p className="text-xs font-medium text-white/95 sm:text-[13px]">
            Batch moderation is live — analyze up to 50,000 posts in a single run.
          </p>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-[#010f30]">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                TweetWatch
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center justify-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`ws-nav-link whitespace-nowrap ${
                    isActive(link.path) ? "!text-white" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="h-[18px] w-[18px]" />
                ) : (
                  <Sun className="h-[18px] w-[18px]" />
                )}
              </button>

              {user ? (
                <>
                  <Link
                    to="/detection"
                    className="hidden items-center gap-1.5 rounded-[7px] bg-[#2f4bff] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f38e0] sm:inline-flex"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <div className="hidden items-center gap-2 md:flex">
                    <span className="max-w-[150px] truncate text-sm font-medium text-white/80">
                      {user.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Log out"
                      title="Log out"
                    >
                      <LogOut className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white md:inline-flex"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    className="hidden items-center gap-1.5 rounded-[7px] bg-[#2f4bff] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f38e0] sm:inline-flex"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              <button
                type="button"
                className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 lg:hidden"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="border-t border-white/10 pb-4 pt-4 lg:hidden">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Signed in as {user.name}
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-center text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#2f4bff] px-3 py-2.5 text-center text-sm font-medium text-white"
                    >
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HomeNavbar;
