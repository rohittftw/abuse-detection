import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';

const benefits = [
  {
    icon: BarChart3,
    title: 'Your sessions, your data',
    description:
      'Every analysis run is tied to your account, so reports stay private and scoped to you.',
  },
  {
    icon: Zap,
    title: 'Fast moderation loop',
    description:
      'Fetch tweets, score them with the abuse and sentiment models, and review results in one place.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for accountability',
    description:
      'Re-analysis keeps a short history so you can see how a tweet was classified over time.',
  },
];

type Mode = 'login' | 'signup';

export const AuthPage = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, signup } = useAuth();

  const mode: Mode = location.pathname === '/signup' ? 'signup' : 'login';
  const from =
    (location.state as { from?: string } | null)?.from || '/detection';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="home-page flex min-h-screen items-center justify-center bg-home-bg">
        <div className="tw-spinner h-9 w-9" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const isSignup = mode === 'signup';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignup && name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not complete sign in.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const switchLink = isSignup ? '/login' : '/signup';
  const switchPrompt = isSignup
    ? 'Already have an account?'
    : 'New to TweetWatch?';
  const switchLabel = isSignup ? 'Log in' : 'Create an account';

  return (
    <AppLayout>
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-10">
        <section className="order-2 lg:order-1">
          <span className="ws-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-home-accent" />
            {isSignup ? 'Create your workspace' : 'Welcome back'}
          </span>

          <h1 className="ws-display mt-4">
            {isSignup ? (
              <>
                Moderate at the speed of the{' '}
                <span className="ws-accent">conversation.</span>
              </>
            ) : (
              <>
                Pick up where your <span className="ws-accent">analysis</span>{' '}
                left off.
              </>
            )}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-home-body">
            {isSignup
              ? 'Create an account to run tweet searches, keep a private history of every analysis session, and generate reports that belong to you.'
              : 'Sign in to access your sessions, re-run analyses, and review the reports you have already generated.'}
          </p>

          <ul className="mt-8 space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-home-accent-soft text-home-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-home-heading">
                      {benefit.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-home-muted">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="order-1 lg:order-2">
          <div className="ws-card p-6 shadow-[0_20px_60px_-30px_rgba(1,15,48,0.35)] sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-home-heading">
                {isSignup ? 'Create your account' : 'Sign in to TweetWatch'}
              </h2>
              <p className="mt-1.5 text-sm text-home-muted">
                {isSignup
                  ? 'It takes less than a minute.'
                  : 'Use the email and password you signed up with.'}
              </p>
            </div>

            {error && (
              <div className="tw-alert-error mb-5 flex items-start gap-2 text-sm">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-home-muted">
                    Name
                  </span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-home-muted" />
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Rohit Dhawadkar"
                      className="tw-input !pl-10"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-home-muted">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-home-muted" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="tw-input !pl-10"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-home-muted">
                  Password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-home-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                    className="tw-input !pl-10 !pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-home-muted transition-colors hover:text-home-heading"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="ws-btn-purple mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? isSignup
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isSignup
                    ? 'Create account'
                    : 'Sign in'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {isSignup && (
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-home-muted">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-home-accent" />
                Your password is hashed with bcrypt and never returned by the
                API.
              </p>
            )}

            <p className="mt-6 border-t border-home-border pt-5 text-sm text-home-muted">
              {switchPrompt}{' '}
              <Link
                to={switchLink}
                state={location.state}
                className="font-semibold text-home-accent hover:underline"
              >
                {switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default AuthPage;
