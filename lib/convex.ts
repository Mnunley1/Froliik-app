import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Get the Convex URL from environment variables with proper fallback
const getConvexUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  const fallbackUrl = 'https://fiery-kiwi-114.convex.cloud';
  
  if (!envUrl) {
    console.warn(
      'Missing EXPO_PUBLIC_CONVEX_URL environment variable. Using fallback URL:',
      fallbackUrl
    );
    return fallbackUrl;
  }
  
  console.log('🔗 Using Convex URL:', envUrl);
  return envUrl;
};

const convexUrl = getConvexUrl();

export const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

// Re-export for convenience
export { ConvexProvider };