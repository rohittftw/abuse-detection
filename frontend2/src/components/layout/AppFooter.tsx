import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, ShieldCheck, Twitter, Youtube } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Analysis dashboard", to: "/detection" },
      { label: "Reports", to: "/reports" },
      { label: "Features", to: "/#features" },
      { label: "Pricing", to: "/#pricing" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Abuse detection", to: "/detection" },
      { label: "Sentiment analysis", to: "/detection" },
      { label: "Batch processing", to: "/detection" },
      { label: "API reference", to: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", to: "/about" },
      { label: "Model card", to: "/about" },
      { label: "Documentation", to: "/about" },
      { label: "Support", to: "/about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/about" },
      { label: "Privacy policy", to: "/about" },
      { label: "Terms of service", to: "/about" },
    ],
  },
];

export const AppFooter = (): React.JSX.Element => (
  <footer className="mt-auto bg-[#010f30] text-white">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#b552e8] to-[#8f3bd9]">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">TweetWatch</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            AI-native content moderation. Detect abuse, track sentiment, and protect
            your community from one shared workspace.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[
              { icon: Twitter, label: "Twitter" },
              { icon: Linkedin, label: "LinkedIn" },
              { icon: Youtube, label: "YouTube" },
              { icon: Github, label: "GitHub" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="ws-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
        <p className="text-xs text-white/45">
          © {new Date().getFullYear()} TweetWatch. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-5 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </span>
          <Link to="/about" className="transition-colors hover:text-white/80">
            Privacy
          </Link>
          <Link to="/about" className="transition-colors hover:text-white/80">
            Terms
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default AppFooter;
