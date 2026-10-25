/**
 * One-time helper for databases created before per-user scoping.
 *
 * Usage:
 *   npx ts-node scripts/migrate-user-scope.ts you@example.com
 *   npx ts-node scripts/migrate-user-scope.ts you@example.com --sync-indexes
 *
 * The first form assigns every legacy session and tweet (documents without a
 * `userId`) to the given account. The second form also drops indexes that are
 * no longer declared in the schemas.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { AnalysisSession } from '../models/AnalysisSession';
import { Tweet } from '../models/tweet';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/tweetwatch';

const main = async (): Promise<void> => {
  const email = process.argv[2]?.trim().toLowerCase();
  const syncIndexes = process.argv.includes('--sync-indexes');

  if (!email) {
    console.error(
      'Usage: npx ts-node scripts/migrate-user-scope.ts <email> [--sync-indexes]'
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  const user = await User.findOne({ email }).select('_id name email').lean();
  if (!user) {
    console.error(`No user found for ${email}. Sign up first, then re-run.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const legacyFilter = {
    $or: [{ userId: { $exists: false } }, { userId: null }],
  };

  const sessions = await AnalysisSession.updateMany(legacyFilter, {
    $set: { userId: user._id },
  });

  const tweets = await Tweet.updateMany(legacyFilter, {
    $set: { userId: user._id },
  });

  console.log(
    `Assigned ${sessions.modifiedCount} session(s) and ${tweets.modifiedCount} tweet(s) to ${user.email}`
  );

  if (syncIndexes) {
    await Promise.all([
      User.syncIndexes(),
      AnalysisSession.syncIndexes(),
      Tweet.syncIndexes(),
    ]);
    console.log('Indexes synced with the current schemas');
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
