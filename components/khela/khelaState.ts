import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameProgress {
  totalXP: number;
  wordChain: {
    currentLevel: number;
    highScore: number;
  };
  guessImage: {
    currentLevel: number;
    highScore: number;
  };
  completeSentence: {
    currentLevel: number;
    highScore: number;
  };
}

export const INITIAL_PROGRESS: GameProgress = {
  totalXP: 0,
  wordChain: {
    currentLevel: 0,
    highScore: 0,
  },
  guessImage: {
    currentLevel: 0,
    highScore: 0,
  },
  completeSentence: {
    currentLevel: 0,
    highScore: 0,
  },
};

const STORAGE_KEY = 'SANSKRIT_APP_GAME_PROGRESS_V1';

let memoryCache: GameProgress = { ...INITIAL_PROGRESS };

export const loadProgress = async (): Promise<GameProgress> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      memoryCache = {
        totalXP: parsed.totalXP ?? 0,
        wordChain: {
          currentLevel: parsed.wordChain?.currentLevel ?? 0,
          highScore: parsed.wordChain?.highScore ?? 0,
        },
        guessImage: {
          currentLevel: parsed.guessImage?.currentLevel ?? 0,
          highScore: parsed.guessImage?.highScore ?? 0,
        },
        completeSentence: {
          currentLevel: parsed.completeSentence?.currentLevel ?? 0,
          highScore: parsed.completeSentence?.highScore ?? 0,
        },
      };
      return memoryCache;
    }
  } catch (error) {
    console.warn('AsyncStorage load failed, using memory cache:', error);
  }
  return memoryCache;
};

export const saveProgress = async (progress: GameProgress): Promise<boolean> => {
  try {
    memoryCache = progress;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.warn('AsyncStorage save failed:', error);
    return false;
  }
};

export const getScholarRank = (xp: number): { title: string; nextRankXP: number; percent: number } => {
  if (xp < 100) {
    return { title: 'Prarambhika (प्रारम्भिकः - Beginner)', nextRankXP: 100, percent: Math.min(100, Math.max(0, (xp / 100) * 100)) };
  } else if (xp < 300) {
    return { title: 'Madhyama (मध्यमः - Intermediate)', nextRankXP: 300, percent: Math.min(100, Math.max(0, ((xp - 100) / 200) * 100)) };
  } else if (xp < 600) {
    return { title: 'Kovidha (कोविदः - Proficient)', nextRankXP: 600, percent: Math.min(100, Math.max(0, ((xp - 300) / 300) * 100)) };
  } else {
    return { title: 'Acharya (आचार्यः - Scholar Master)', nextRankXP: 9999, percent: 100 };
  }
};
