import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  Gauge,
  Layers,
  MessageSquareText,
  Minus,
  Plus,
  Quote,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HomeNavbar from "./home/HomeNavbar";
import AppFooter from "./layout/AppFooter";
import { LogoMark } from "./Logo";

const stats = [
  {
    icon: ShieldCheck,
    value: "99.2%",
    label: "Model accuracy",
    desc: "Fine-tuned BERT detection with high precision across diverse content.",
  },
  {
    icon: Activity,
    value: "50K+",
    label: "Posts analyzed",
    desc: "Batch and real-time pipelines that scale with your community.",
  },
  {
    icon: Layers,
    value: "4 AI models",
    label: "Detection types",
    desc: "Abuse, sentiment, bias, and tone analysis in a single pass.",
  },
  {
    icon: Gauge,
    value: "200ms",
    label: "Avg response",
    desc: "FastAPI inference optimized for high-volume moderation.",
  },
];

const features = [
  {
    icon: ShieldAlert,
    title: "Abuse detection",
    desc: "Identify hate speech, harassment, and threats with confidence scoring and clear risk levels.",
  },
  {
    icon: MessageSquareText,
    title: "Sentiment analysis",
    desc: "Classify every tweet as positive, negative, or neutral with per-post breakdowns and trends.",
  },
  {
    icon: BarChart3,
    title: "Batch processing",
    desc: "Async job queues handle large datasets efficiently with 3x throughput improvement.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    desc: "Best option for personal projects & hobby use.",
    price: "Free",
    period: "",
    features: ["Up to 100 tweets/day", "Basic abuse detection", "PDF report export", "Community support"],
  },
  {
    name: "Pro",
    desc: "Relevant for multiple users & small teams.",
    price: "$29",
    period: "/month",
    features: ["Unlimited tweet analysis", "All 4 AI models", "Session history & reports", "Priority support", "API access"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    desc: "Best for large scale uses & extended rights.",
    price: "$99",
    period: "/month",
    features: ["Custom model training", "Dedicated infrastructure", "SLA guarantee", "OCR & image analysis", "24/7 support"],
  },
];

const faqs = [
  {
    q: "How does TweetWatch detect abusive content?",
    a: "TweetWatch uses BERT-based transformer models fine-tuned on hate speech and abuse datasets. Each tweet is analyzed for hate speech, harassment, and threats with confidence scores and risk level classification.",
  },
  {
    q: "Can I analyze tweets in real-time?",
    a: "Yes. TweetWatch integrates with the Twitter API to fetch tweets by keyword or hashtag, then runs them through our FastAPI microservice for real-time NLP analysis with ~200ms average response time.",
  },
  {
    q: "What data is stored after analysis?",
    a: "Analysis sessions are stored in MongoDB with optimized indexing. You can revisit past sessions, reanalyze tweets, and download comprehensive PDF reports from the dashboard.",
  },
  {
    q: "Is there a free tier available?",
    a: "The Starter plan is free and includes up to 100 tweets per day with basic abuse detection and PDF report export. Upgrade to Pro for unlimited analysis and all AI models.",
  },
];

const chartBars = [42, 68, 54, 82, 63, 91, 74, 58, 86, 70, 96, 64];

const flags = [
  { text: "Aggressive reply in @design thread", risk: "High", tone: "bg-red-50 text-red-700" },
  { text: "Coordinated spam across 14 accounts", risk: "Medium", tone: "bg-amber-50 text-amber-700" },
  { text: "Sarcastic mention flagged for review", risk: "Low", tone: "bg-emerald-50 text-emerald-700" },
];

const DashboardMock = (): React.JSX.Element => (
  <div className="relative mx-auto mt-14 max-w-5xl">
    <div
      aria-hidden="true"
      className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-[#e8ecff] via-[#f3edfb] to-transparent blur-2xl"
    />
    <div className="relative overflow-hidden rounded-2xl border border-home-border bg-home-surface shadow-[0_40px_100px_-40px_rgba(1,15,48,0.45)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-home-border bg-home-surface-elevated/70 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto hidden w-64 items-center justify-center gap-1.5 rounded-md border border-home-border bg-home-surface px-3 py-1 text-[10px] text-home-muted sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          app.tweetwatch.ai/overview
        </div>
        <span className="hidden text-[10px] font-medium text-home-muted sm:block">Live</span>
      </div>

      <div className="grid sm:grid-cols-[168px_1fr]">
        {/* App sidebar */}
        <aside className="hidden flex-col border-r border-home-border bg-home-surface-elevated/40 p-4 sm:flex">
          <div className="mb-6 flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xs font-bold text-home-heading">TweetWatch</span>
          </div>
          <nav className="space-y-1 text-[11px]">
            {["Overview", "Tweets", "Reports", "Models", "Settings"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${
                  i === 0
                    ? "bg-home-accent-soft font-semibold text-home-accent"
                    : "text-home-muted"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {item}
              </div>
            ))}
          </nav>
          <div className="mt-auto rounded-lg bg-home-surface p-2.5">
            <p className="text-[10px] font-semibold text-home-heading">Pro workspace</p>
            <p className="mt-0.5 text-[9px] text-home-muted">Unlimited analysis</p>
            <div className="mt-2 h-1 rounded-full bg-home-border">
              <div className="h-1 w-3/4 rounded-full bg-home-purple" />
            </div>
          </div>
        </aside>

        {/* App content */}
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-accent">
                Workspace overview
              </p>
              <h3 className="mt-1 text-base font-semibold text-home-heading sm:text-lg">
                Community health
              </h3>
            </div>
            <span className="ws-pill hidden !text-[10px] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All models active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Tweets analyzed", value: "2,481" },
              { label: "Flagged", value: "37" },
              { label: "Avg confidence", value: "94.2%" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-home-border p-2.5 sm:p-3">
                <p className="text-sm font-semibold text-home-heading sm:text-lg">{metric.value}</p>
                <p className="text-[9px] text-home-muted sm:text-[10px]">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-lg border border-home-border p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-home-heading">Detection volume</p>
                <span className="text-[9px] text-home-muted">Last 12 hours</span>
              </div>
              <div className="flex h-20 items-end gap-1.5">
                {chartBars.map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`flex-1 rounded-sm ${
                      i === 10 ? "bg-home-purple" : "bg-home-accent-soft"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-home-border p-3">
              <p className="mb-2.5 text-[10px] font-semibold text-home-heading">Recent flags</p>
              <div className="space-y-2">
                {flags.map((flag) => (
                  <div key={flag.text} className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-[9px] text-home-body">{flag.text}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold ${flag.tone}`}>
                      {flag.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating cards removed for a cleaner, uninterrupted product frame */}
  </div>
);

export const Hero = (): React.JSX.Element => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="home-page min-h-screen bg-home-bg text-home-body normal-case">
      <HomeNavbar />

      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-home-lavender via-home-bg to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="ws-rise mx-auto inline-flex items-center gap-2 rounded-full border border-home-border bg-home-surface px-3.5 py-1.5 text-xs font-medium text-home-body shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#a948e3]" />
            AI-native content moderation
            <span className="rounded-full bg-home-accent-soft px-2 py-0.5 text-[10px] font-semibold text-home-accent">
              v2.0
            </span>
          </div>

          <h1 className="ws-display ws-rise ws-rise-delay-1 mx-auto mt-7 max-w-4xl">
            You build the community.
            <br />
            <span className="ws-accent">TweetWatch AI protects it.</span>
          </h1>

          <p className="ws-rise ws-rise-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-home-muted sm:text-lg">
            Abuse detection, sentiment analysis, and real-time monitoring in one
            shared workspace — so your team can act on what matters, not chase
            spreadsheets.
          </p>

          <div className="ws-rise ws-rise-delay-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/detection" className="ws-btn-purple w-full sm:w-auto">
              Explore the platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/reports" className="ws-btn-ghost w-full bg-home-surface sm:w-auto">
              See a sample report
            </Link>
          </div>

          <p className="mt-4 text-xs text-home-muted">
            No credit card required · Free tier available
          </p>

          <DashboardMock />
        </div>
      </section>

      {/* ---------------------------- Trust strip ---------------------------- */}
      <section className="border-y border-home-border bg-home-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-home-muted">
            Powered by a production-grade stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {["BERT", "FastAPI", "MongoDB", "React", "Tailwind CSS", "Twitter API"].map((name) => (
              <span
                key={name}
                className="text-base font-semibold tracking-tight text-home-muted transition-colors hover:text-home-heading sm:text-lg"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- Stats ------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-home-heading sm:text-[2.75rem]">
            TweetWatch has analyzed <span className="ws-accent">50,000+ posts</span> across
            social platforms
          </h2>
          <p className="mt-4 text-home-muted">
            Across research teams, community managers, and trust &amp; safety
            operations.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-home-border bg-home-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-home-accent-soft text-home-accent">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-semibold tracking-tight text-home-heading">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-home-heading">{stat.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-home-muted">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- Feature story --------------------------- */}
      <section className="ws-section-lavender border-y border-home-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="ws-eyebrow mb-4">01 — One shared plan</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-home-heading sm:text-4xl">
                Start with a shared <span className="ws-accent">moderation plan</span>
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-home-muted">
                Every keyword, model, and review queue lives in one live view of
                your community. No more stitching exports together before a
                stakeholder meeting.
              </p>

              <ul className="mt-8 space-y-5">
                {[
                  {
                    title: "Always QBR-ready",
                    desc: "Live pipeline and risk progress against your shared goals.",
                  },
                  {
                    title: "Shared context for every teammate",
                    desc: "Analysts, moderators, and leads work from the same source of truth.",
                  },
                  {
                    title: "Agents take action",
                    desc: "Automated summaries, escalations, and review queues keep work moving.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-home-accent text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <div>
                      <p className="font-semibold text-home-heading">{item.title}</p>
                      <p className="text-sm text-home-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                to="/detection"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-home-accent hover:text-home-accent-hover"
              >
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Plan card */}
            <div className="relative">
              <div className="rounded-2xl border border-home-border bg-home-surface p-5 shadow-[0_30px_80px_-40px_rgba(1,15,48,0.4)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-home-accent-soft text-home-accent">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-home-heading">Q4 Community Plan</p>
                      <p className="text-[10px] text-home-muted">Shared with 6 teammates</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    On track
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Posts reviewed", value: "18.4K", pct: "82%" },
                    { label: "Risk resolved", value: "96%", pct: "96%" },
                    { label: "Response time", value: "1.8h", pct: "64%" },
                  ].map((goal) => (
                    <div key={goal.label} className="rounded-xl border border-home-border p-3">
                      <p className="text-base font-semibold text-home-heading">{goal.value}</p>
                      <p className="text-[9px] text-home-muted">{goal.label}</p>
                      <div className="mt-2 h-1 rounded-full bg-home-border">
                        <div
                          className="h-1 rounded-full bg-home-accent"
                          style={{ width: goal.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-home-border p-4">
                  <p className="mb-3 text-xs font-semibold text-home-heading">Action items</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Review high-risk escalations", status: "In progress", tone: "bg-amber-50 text-amber-700" },
                      { label: "Tune sentiment thresholds", status: "Done", tone: "bg-emerald-50 text-emerald-700" },
                      { label: "Export weekly PDF report", status: "For review", tone: "bg-home-accent-soft text-home-accent" },
                    ].map((task) => (
                      <div key={task.label} className="flex items-center justify-between gap-3">
                        <p className="text-[11px] text-home-body">{task.label}</p>
                        <span className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-semibold ${task.tone}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-home-surface-elevated px-4 py-3">
                  <div className="flex -space-x-2">
                    {["AR", "KM", "JD", "SL"].map((initials, i) => (
                      <span
                        key={initials}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-home-surface text-[9px] font-bold text-white ${
                          ["bg-[#2f4bff]", "bg-[#a948e3]", "bg-[#0e9f6e]", "bg-[#f59e0b]"][i]
                        }`}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-home-muted">Everyone is up to date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Features ------------------------------ */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ws-eyebrow mb-4 justify-center">02 — Every signal</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-home-heading sm:text-4xl">
            One shared <span className="ws-accent">source of truth</span>
          </h2>
          <p className="mt-4 text-home-muted">
            Models, sessions, and reports stay connected — from the first keyword
            to the final export.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-home-border bg-home-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-home-accent hover:shadow-card"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-home-lavender text-[#a948e3] transition-colors group-hover:bg-home-accent-soft group-hover:text-home-accent">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-home-heading">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-home-muted">{feature.desc}</p>
              <Link
                to="/detection"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-home-accent"
              >
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- Testimonial ----------------------------- */}
      <section className="border-y border-home-border bg-home-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f4bff] to-[#a948e3]">
              <Quote className="h-7 w-7 text-white" />
            </div>
            <div>
              <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-home-heading sm:text-2xl">
                “TweetWatch is just awesome. It contains powerful AI models for
                abuse detection, sentiment analysis, and real-time monitoring.
                It's the perfect choice for your next content moderation project.”
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-home-accent text-sm font-bold text-white">
                  RD
                </div>
                <div>
                  <p className="text-sm font-semibold text-home-heading">Rohit Dhawadkar</p>
                  <p className="text-sm text-home-muted">Creator of TweetWatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ Pricing ------------------------------ */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ws-eyebrow mb-4 justify-center">03 — Plans</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-home-heading sm:text-4xl">
            Designed for teams <span className="ws-accent">like yours</span>
          </h2>
          <p className="mt-4 text-home-muted">
            Start free, then scale to unlimited analysis, all four models, and
            priority support.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-transparent bg-[#010f30] text-white shadow-[0_30px_70px_-30px_rgba(1,15,48,0.6)]"
                  : "border-home-border bg-home-surface"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-[#a948e3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Most popular
                </span>
              )}
              <h3 className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-home-heading"}`}>
                {plan.name}
              </h3>
              <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/60" : "text-home-muted"}`}>
                {plan.desc}
              </p>
              <div className="mt-6">
                <span className={`text-4xl font-semibold tracking-tight ${plan.highlighted ? "text-white" : "text-home-heading"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={plan.highlighted ? "text-white/55" : "text-home-muted"}>
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-[#c987f2]" : "text-emerald-600"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span className={plan.highlighted ? "text-white/80" : "text-home-body"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/detection"
                className={`mt-8 flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-[#a948e3] text-white hover:bg-[#9333d1]"
                    : "border border-home-border text-home-heading hover:bg-home-surface-elevated"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------- FAQ -------------------------------- */}
      <section className="border-t border-home-border bg-home-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="ws-eyebrow mb-4 justify-center">FAQ</p>
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-home-heading">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-home-border border-y border-home-border">
            {faqs.map((faq, i) => (
              <div key={faq.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-home-heading">{faq.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-home-border text-home-muted">
                    {openFaq === i ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="pb-5 pr-10 text-sm leading-relaxed text-home-muted">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="bg-home-bg px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#010f30] px-6 py-14 text-center sm:px-12 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2f4bff] opacity-40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#a948e3] opacity-30 blur-3xl"
          />
          <div className="relative">
            <span className="ws-pill !bg-white/10 !text-white/80">
              <AlertTriangle className="h-3.5 w-3.5" />
              Your community never sleeps
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Make moderation your team's fastest workflow.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Run your first analysis in minutes. Bring every model, session, and
              report into one shared workspace.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/detection" className="ws-btn-purple w-full sm:w-auto">
                Start analyzing free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Talk to the team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};
