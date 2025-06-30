import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'gentle' | 'moderate' | 'adventurous';
  duration: string;
  location?: string;
  isCompleted: boolean;
  isGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

const QUESTS_STORAGE_KEY = '@froliik_quests';
const QUEST_HISTORY_KEY = '@froliik_quest_history';

export async function saveQuest(
  quest: Omit<StoredQuest, 'id' | 'createdAt'>,
): Promise<StoredQuest> {
  try {
    const newQuest: StoredQuest = {
      ...quest,
      id: generateQuestId(),
      createdAt: new Date().toISOString(),
    };

    const existingQuests = await getQuests();
    const updatedQuests = [newQuest, ...existingQuests];

    await AsyncStorage.setItem(
      QUESTS_STORAGE_KEY,
      JSON.stringify(updatedQuests),
    );

    return newQuest;
  } catch (error) {
    console.error('Error saving quest:', error);
    throw new Error('Failed to save quest');
  }
}

export async function getQuests(): Promise<StoredQuest[]> {
  try {
    const questsJson = await AsyncStorage.getItem(QUESTS_STORAGE_KEY);
    return questsJson ? JSON.parse(questsJson) : [];
  } catch (error) {
    console.error('Error loading quests:', error);
    return [];
  }
}

export async function completeQuest(questId: string): Promise<void> {
  try {
    const quests = await getQuests();
    const updatedQuests = quests.map((quest) =>
      quest.id === questId
        ? { ...quest, isCompleted: true, completedAt: new Date().toISOString() }
        : quest,
    );

    await AsyncStorage.setItem(
      QUESTS_STORAGE_KEY,
      JSON.stringify(updatedQuests),
    );

    // Also save to quest history
    const completedQuest = updatedQuests.find((q) => q.id === questId);
    if (completedQuest) {
      await addToQuestHistory(completedQuest);
    }
  } catch (error) {
    console.error('Error completing quest:', error);
    throw new Error('Failed to complete quest');
  }
}

export async function deleteQuest(questId: string): Promise<void> {
  try {
    const quests = await getQuests();
    const updatedQuests = quests.filter((quest) => quest.id !== questId);
    await AsyncStorage.setItem(
      QUESTS_STORAGE_KEY,
      JSON.stringify(updatedQuests),
    );
  } catch (error) {
    console.error('Error deleting quest:', error);
    throw new Error('Failed to delete quest');
  }
}

export async function getQuestHistory(): Promise<StoredQuest[]> {
  try {
    const historyJson = await AsyncStorage.getItem(QUEST_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error loading quest history:', error);
    return [];
  }
}

async function addToQuestHistory(quest: StoredQuest): Promise<void> {
  try {
    const history = await getQuestHistory();
    const updatedHistory = [quest, ...history].slice(0, 100); // Keep last 100 completed quests
    await AsyncStorage.setItem(
      QUEST_HISTORY_KEY,
      JSON.stringify(updatedHistory),
    );
  } catch (error) {
    console.error('Error adding to quest history:', error);
  }
}

export async function clearAllQuests(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUESTS_STORAGE_KEY);
    await AsyncStorage.removeItem(QUEST_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing quests:', error);
    throw new Error('Failed to clear quests');
  }
}

function generateQuestId(): string {
  return `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getDifficultyFromDescription(
  description: string,
): 'gentle' | 'moderate' | 'adventurous' {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes('gentle') ||
    lowerDesc.includes('simple') ||
    lowerDesc.includes('easy')
  ) {
    return 'gentle';
  } else if (
    lowerDesc.includes('bold') ||
    lowerDesc.includes('exciting') ||
    lowerDesc.includes('challenge')
  ) {
    return 'adventurous';
  } else {
    return 'moderate';
  }
}

export function estimateDuration(description: string): string {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes('quick') ||
    lowerDesc.includes('minute') ||
    lowerDesc.includes('brief')
  ) {
    return '5 min';
  } else if (lowerDesc.includes('short') || lowerDesc.includes('small')) {
    return '10 min';
  } else {
    return '15 min';
  }
}
