interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GenerateQuestOptions {
  category: string;
  userPreferences?: {
    difficulty?: 'gentle' | 'moderate' | 'adventurous';
    duration?: string;
    location?: string;
  };
}

export async function generateQuest(
  options: GenerateQuestOptions,
): Promise<{ quest?: string; error?: string }> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OpenAI API key not found, using mock quest');
      return { quest: getMockQuest(options.category) };
    }

    const { category, userPreferences } = options;

    // Create a dynamic prompt based on category and preferences
    const prompt = createQuestPrompt(category, userPreferences);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are Froliik, a fun, friendly life-coach companion. You create inspiring, safe, and accessible side quests that help people grow and explore. Always respond with just the quest description, no additional text or formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);

      if (response.status === 401) {
        return {
          error: 'Invalid API key. Please check your OpenAI configuration.',
        };
      } else if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please try again in a moment.' };
      } else {
        return { error: 'Failed to generate quest. Please try again.' };
      }
    }

    const data: OpenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return { error: 'No quest generated. Please try again.' };
    }

    const quest = data.choices[0].message.content.trim();

    if (!quest) {
      return { error: 'Empty quest generated. Please try again.' };
    }

    return { quest };
  } catch (error) {
    console.error('Error generating quest:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        error: 'Network error. Please check your connection and try again.',
      };
    }

    // Fallback to mock quest on any error
    return { quest: getMockQuest(options.category) };
  }
}

function createQuestPrompt(
  category: string,
  preferences?: GenerateQuestOptions['userPreferences'],
): string {
  const difficultyText =
    preferences?.difficulty === 'gentle'
      ? 'very gentle and comfortable'
      : preferences?.difficulty === 'adventurous'
        ? 'exciting and bold'
        : 'moderately challenging';

  const durationText = preferences?.duration || 'under 15 minutes';

  const locationHint = preferences?.location
    ? ` The quest should be suitable for ${preferences.location.toLowerCase()}.`
    : '';

  return `Create a short, doable side quest in the "${category}" category. The quest should be ${difficultyText}, inspiring, and take ${durationText} to complete. Format it as a single sentence or short paragraph. Keep it safe, positive, and accessible to anyone.${locationHint}`;
}

function getMockQuest(category: string): string {
  const mockQuests: Record<string, string[]> = {
    mindfulness: [
      'Take 5 deep breaths while noticing three different sounds around you.',
      'Spend 2 minutes observing the details of a single object near you.',
      'Practice gratitude by writing down three small things that made you smile today.',
      'Do a 3-minute body scan, noticing how each part of your body feels.',
    ],
    creativity: [
      'Draw your current mood using only shapes and colors.',
      'Write a haiku about the first thing you see when you look outside.',
      'Create a short story using these three words: adventure, purple, and whisper.',
      'Design your ideal room using only items you can draw in 5 minutes.',
    ],
    connection: [
      "Send a thoughtful message to someone you haven't talked to in a while.",
      'Give a genuine compliment to the next person you interact with.',
      'Call a family member and ask them about their favorite childhood memory.',
      'Write a thank you note to someone who has helped you recently.',
    ],
    movement: [
      'Do 10 jumping jacks while humming your favorite song.',
      'Take a 5-minute walk and count how many different colors you see.',
      'Stretch your arms above your head and hold for 30 seconds while smiling.',
      'Dance to one full song with your eyes closed.',
    ],
    learning: [
      'Learn how to say "hello" in a language you\'ve never studied.',
      'Look up one interesting fact about your hometown.',
      'Watch a 3-minute video about something you know nothing about.',
      "Ask someone to teach you something they're passionate about.",
    ],
    adventure: [
      "Explore a part of your neighborhood you've never walked through.",
      "Try eating something you've never tasted before.",
      'Take a photo of something that represents "adventure" to you.',
      'Plan a mini adventure you could do this weekend.',
    ],
    productivity: [
      'Organize one small area of your living space for 10 minutes.',
      'Write down three goals for tomorrow and put the list somewhere visible.',
      'Delete 10 photos from your phone that you no longer need.',
      'Set up one small system to make your morning routine easier.',
    ],
    community: [
      'Research one local charity or community organization.',
      'Pick up three pieces of litter during your next walk.',
      'Leave a positive review for a local business you appreciate.',
      'Share something helpful or inspiring on social media.',
    ],
    wildcard: [
      'Do something kind for yourself that takes less than 5 minutes.',
      'Try doing a familiar task with your non-dominant hand.',
      'Spend 3 minutes looking at the sky and noticing cloud shapes.',
      'Create a new tradition you could start today.',
    ],
  };

  const categoryQuests =
    mockQuests[category.toLowerCase()] || mockQuests['wildcard'];
  const randomIndex = Math.floor(Math.random() * categoryQuests.length);
  return categoryQuests[randomIndex];
}
