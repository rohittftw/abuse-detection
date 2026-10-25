import React from "react";
import { Link } from "react-router-dom";
import { Atom, BrainCircuit, Code2, Twitter } from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/home/PageHeader";

const steps = [
  {
    title: "Monitor",
    description:
      "Use hashtags to collect tweets in real-time via Twitter API. Track trending topics, events, or specific conversations.",
  },
  {
    title: "Analyze",
    description:
      "Advanced AI algorithms analyze each tweet for potential abuse, harassment, hate speech, and harmful content patterns.",
  },
  {
    title: "Report",
    description:
      "Generate detailed reports with risk classifications, confidence scores, and actionable insights for content moderation.",
  },
];

const features = [
  "Real-time monitoring via Twitter API integration",
  "AI-powered analysis with machine learning models",
  "Risk classification with confidence scores",
  "Hashtag tracking across the Twitter platform",
];

const stack = [
  { icon: Code2, name: "Python", role: "Backend & AI Models" },
  { icon: Twitter, name: "Twitter API", role: "Data Collection" },
  { icon: BrainCircuit, name: "Machine Learning", role: "Content Analysis" },
  { icon: Atom, name: "React", role: "Frontend Interface" },
];

export const AboutPage = (): React.JSX.Element => {
  return (
    <AppLayout>
      <PageHeader
        label="About Us"
        title="About TweetWatch"
        description="Real-time Twitter monitoring and AI-powered content analysis to detect abuse, harassment, and harmful content across social media."
      />

      <section className="tw-card p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-home-heading mb-4">Our Mission</h2>
        <p className="text-home-muted leading-relaxed mb-4">
          TweetWatch was created to make social media safer by providing real-time monitoring and analysis of Twitter content. We believe that technology should be used to protect users from harmful content while preserving free speech and open dialogue.
        </p>
        <p className="text-home-muted leading-relaxed">
          Our AI-powered system helps identify potential abuse, harassment, hate speech, and other harmful content, enabling proactive moderation and creating safer digital spaces for everyone.
        </p>
      </section>

      <section className="tw-card p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-home-heading mb-8">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 bg-home-accent-soft text-home-accent rounded-lg flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-home-heading mb-2">{step.title}</h3>
              <p className="text-sm text-home-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tw-card p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-home-heading mb-6">Key Features</h2>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-home-muted text-sm sm:text-base">
              <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="tw-card p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-home-heading mb-6">Technical Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((item) => (
            <div key={item.name} className="text-center p-4 border border-home-border rounded-xl transition-colors hover:border-home-accent">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-home-accent-soft text-home-accent">
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-home-heading mb-1">{item.name}</h3>
              <p className="text-sm text-home-muted">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tw-card p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-home-heading mb-4">Get Started</h2>
        <p className="text-home-muted mb-6 max-w-xl mx-auto">
          Ready to start monitoring Twitter for harmful content? Begin tracking hashtags and analyzing tweets in real-time.
        </p>
        <Link to="/detection" className="tw-btn-primary text-base px-8">
          Start Monitoring
        </Link>
      </section>
    </AppLayout>
  );
};
