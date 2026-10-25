import dotenv from 'dotenv';

dotenv.config();

/**
 * Read the JWT secret lazily so `dotenv.config()` has always run first.
 * Production must set JWT_SECRET; local development falls back to a
 * well-known value so the app works out of the box.
 */
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'tweetwatch-local-dev-secret-change-me';
};

export const JWT_EXPIRES_IN = '7d';
