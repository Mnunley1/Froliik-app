import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

export interface SideQuest {
  _id: Id<'sideQuests'>;
  userId: Id<'users'>;
  title: string;
  description?: string;
  completed: boolean;
  reward?: string;
  difficultyLevel?: string;
  prerequisites?: string[];
  questGiver?: string;
  location?: string;
  timeLimit?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateQuestData {
  title: string;
  description?: string;
  reward?: string;
  difficultyLevel?: 'gentle' | 'moderate' | 'adventurous';
  prerequisites?: string[];
  questGiver?: string;
  location?: string;
  timeLimit?: string;
}

export interface CommunityUpdate {
  _id: Id<'communityUpdates'>;
  userId: Id<'users'>;
  userName: string;
  userEmail: string;
  action: 'completed' | 'created' | 'shared';
  questTitle: string;
  questCategory?: string;
  achievement?: string;
  timestamp: number;
}

// Hook for creating a side quest
export function useCreateSideQuest() {
  return useMutation(api.quests.createSideQuest);
}

// Hook for getting user's side quests
export function useUserSideQuests(userId: Id<'users'> | undefined) {
  return useQuery(api.quests.getUserSideQuests, userId ? { userId } : 'skip');
}

// Hook for getting active side quests
export function useActiveSideQuests(userId: Id<'users'> | undefined) {
  return useQuery(api.quests.getActiveSideQuests, userId ? { userId } : 'skip');
}

// Hook for getting completed side quests
export function useCompletedSideQuests(userId: Id<'users'> | undefined) {
  return useQuery(
    api.quests.getCompletedSideQuests,
    userId ? { userId } : 'skip',
  );
}

// Hook for completing a side quest
export function useCompleteSideQuest() {
  return useMutation(api.quests.completeSideQuest);
}

// Hook for deleting a side quest
export function useDeleteSideQuest() {
  return useMutation(api.quests.deleteSideQuest);
}

// Hook for updating a side quest
export function useUpdateSideQuest() {
  return useMutation(api.quests.updateSideQuest);
}

// Hook for getting community updates
export function useCommunityUpdates(limit?: number) {
  return useQuery(api.quests.getCommunityUpdates, { limit });
}

// Hook for getting user's recent activity
export function useUserRecentActivity(
  userId: Id<'users'> | undefined,
  limit?: number,
) {
  return useQuery(
    api.quests.getUserRecentActivity,
    userId ? { userId, limit } : 'skip',
  );
}

// Utility function to convert Convex quest to the format expected by components
export function convertConvexQuestToQuest(convexQuest: SideQuest) {
  return {
    id: convexQuest._id,
    title: convexQuest.title,
    description: convexQuest.description || '',
    category: convexQuest.difficultyLevel || 'general',
    difficulty: convexQuest.difficultyLevel || 'medium',
    estimatedDuration: '30 minutes', // Default value
    status: convexQuest.completed ? 'completed' : 'pending',
    reward: convexQuest.reward || '',
    prerequisites: convexQuest.prerequisites || [],
    questGiver: convexQuest.questGiver || '',
    location: convexQuest.location || '',
    timeLimit: convexQuest.timeLimit || '',
    createdAt: new Date(convexQuest.createdAt),
    updatedAt: new Date(convexQuest.updatedAt),
  };
}

// Utility function to convert quest data for Convex
export function convertQuestDataToConvex(data: CreateQuestData) {
  return {
    title: data.title,
    description: data.description,
    reward: data.reward,
    difficultyLevel: data.difficultyLevel,
    prerequisites: data.prerequisites,
    questGiver: data.questGiver,
    location: data.location,
    timeLimit: data.timeLimit,
  };
}
