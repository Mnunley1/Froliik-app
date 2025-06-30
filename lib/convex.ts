import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL || 'https://fiery-kiwi-114.convex.cloud';

if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
  console.warn(
    'Missing EXPO_PUBLIC_CONVEX_URL environment variable. Using default production URL.',
  );
}

console.log('🔗 Convex URL:', convexUrl);

export const convex = new ConvexReactClient(convexUrl);

// Re-export for convenience
export { ConvexProvider };
