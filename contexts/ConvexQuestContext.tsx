import { useQuery } from 'convex/react';
import { createContext, ReactNode, useContext } from 'react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface ConvexQuestContextType {
  userId: Id<'users'> | null;
  loading: boolean;
}

const ConvexQuestContext = createContext<ConvexQuestContextType | undefined>(
  undefined,
);

/**
 * ConvexQuestProvider provides a unified interface for quest data
 * using Convex hooks for real-time data synchronization.
 *
 * This context automatically handles:
 * - Loading states
 * - Data fetching
 * - Real-time updates
 * - Error handling
 */
export function ConvexQuestProvider({ children }: { children: ReactNode }) {
  const currentUser = useQuery(api.users.current);

  const value: ConvexQuestContextType = {
    userId: currentUser?._id || null,
    loading: currentUser === undefined,
  };

  return (
    <ConvexQuestContext.Provider value={value}>
      {children}
    </ConvexQuestContext.Provider>
  );
}

export function useConvexQuest() {
  const context = useContext(ConvexQuestContext);
  if (context === undefined) {
    throw new Error('useConvexQuest must be used within a ConvexQuestProvider');
  }
  return context;
}
