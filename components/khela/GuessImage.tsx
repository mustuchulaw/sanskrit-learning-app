import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, ArrowRight, Award, Sun, BookOpen, Flame, Trees, Heart } from 'lucide-react-native';
import { ThemeContext } from '../../App';
import { GameProgress } from './khelaState';

interface GuessImageProps {
  progress: GameProgress;
  onBack: () => void;
  onUpdateProgress: (updates: Partial<GameProgress>) => void;
}

const GUESS_IMAGE_LEVELS = [
  {
    iconName: 'Sun',
    prompt: 'Identify this celestial body:',
    options: ['चन्द्रः', 'सूर्यः', 'भूमिः', 'नक्षत्रम्'],
    answer: 'सूर्यः',
    explanation: 'सूर्यः (Sūryaḥ) represents the Sun. In Sanskrit literature, the Sun is revered as a source of energy, life, and light.'
  },
  {
    iconName: 'BookOpen',
    prompt: 'What is this physical object?',
    options: ['लेखनी', 'उत्पीठिका', 'मञ्जूषा', 'पुस्तकम्'],
    answer: 'पुस्तकम्',
    explanation: 'पुस्तकम् (Pustakam) means Book. Knowledge is recorded in pustakas, which are held in high regard in traditional Indian learning.'
  },
  {
    iconName: 'Flame',
    prompt: 'Identify this natural element:',
    options: ['जलम्', 'वायुः', 'अग्निः', 'आकाशः'],
    answer: 'अग्निः',
    explanation: 'अग्निः (Agniḥ) means Fire. Agni is one of the primary Vedic deities representing transformation, purity, and sacrifice.'
  },
  {
    iconName: 'Trees',
    prompt: 'What category of life is this?',
    options: ['वृक्षः', 'पुष्पम्', 'फलम्', 'तृणम्'],
    answer: 'वृक्षः',
    explanation: 'वृक्षः (Vṛkṣaḥ) means Tree. Sanskrit texts praise trees for selflessly giving shade and fruit to others.'
  },
  {
    iconName: 'Heart',
    prompt: 'What human emotion is symbolized here?',
    options: ['क्रोधः', 'प्रेम', 'दुःखम्', 'भयम्'],
    answer: 'प्रेम',
    explanation: 'प्रेम (Prema) or स्नेह (Sneha) means Love or affection. It represents binding emotional attachments and pure devotion.'
  }
];

const IconMap: { [key: string]: React.ComponentType<any> } = {
  Sun: Sun,
  BookOpen: BookOpen,
  Flame: Flame,
  Trees: Trees,
  Heart: Heart,
};

const XP_PER_LEVEL = 15;

export default function GuessImage({ progress, onBack, onUpdateProgress }: GuessImageProps) {
  const { theme } = useContext(ThemeContext);
  
  const currentLevelIndex = Math.min(progress.guessImage.currentLevel, GUESS_IMAGE_LEVELS.length - 1);
  const isGameFinished = progress.guessImage.currentLevel >= GUESS_IMAGE_LEVELS.length;
  
  const levelData = GUESS_IMAGE_LEVELS[currentLevelIndex];
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const IconComponent = levelData ? IconMap[levelData.iconName] : Sun;

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;
    
    const correct = option === levelData.answer;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrect(correct);
  };

  const handleNextLevel = () => {
    const nextLevel = progress.guessImage.currentLevel + 1;
    // Earn XP only if they got it right on the first try
    const xpReward = isCorrect ? XP_PER_LEVEL : 0;
    const newXP = progress.totalXP + xpReward;

    onUpdateProgress({
      totalXP: newXP,
      guessImage: {
        currentLevel: nextLevel,
        highScore: Math.max(progress.guessImage.highScore, nextLevel * 15),
      }
    });

    // Reset local state
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  };

  const handleRestartGame = () => {
    onUpdateProgress({
      guessImage: {
        currentLevel: 0,
        highScore: progress.guessImage.highScore,
      }
    });
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  };

  if (isGameFinished) {
    return (
      <View style={styles.centerContainer}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <LinearGradient colors={['#F59E0B', '#B45309']} style={styles.trophyIcon}>
            <Award size={48} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.successTitle, { color: theme.textDark }]}>Guess the Image Complete!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
            Superb work! You identified all visual elements in Sanskrit.
          </Text>
          <Text style={[styles.xpEarnedText, { color: theme.primary }]}>
            Vocabulary Mastered 🎯
          </Text>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={onBack}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>Back to Game Room</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.secondaryBtn} onPress={handleRestartGame}>
            <Text style={[styles.secondaryBtnText, { color: theme.textMuted }]}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Game Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ChevronLeft size={22} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textDark }]}>
          Level {currentLevelIndex + 1}/{GUESS_IMAGE_LEVELS.length}
        </Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.pointsText, { color: theme.isDark ? '#FFF' : theme.primaryDark }]}>
            +{XP_PER_LEVEL} XP
          </Text>
        </View>
      </View>

      {/* Image Display Card */}
      <View style={[styles.imageDisplayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <LinearGradient
          colors={theme.isDark ? ['#1F2937', '#111827'] : ['#F3F4F6', '#E5E7EB']}
          style={styles.imageInnerBg}
        >
          {IconComponent && <IconComponent size={80} color={theme.primary} />}
        </LinearGradient>
        <Text style={[styles.promptText, { color: theme.textMuted }]}>{levelData.prompt}</Text>
      </View>

      {/* Options Grid (2x2) */}
      <View style={styles.optionsGrid}>
        {levelData.options.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrectAnswer = option === levelData.answer;
          
          let btnStyle = { backgroundColor: theme.surface, borderColor: theme.border };
          let textColor = theme.textDark;
          let showIcon = null;

          if (hasAnswered) {
            if (isCorrectAnswer) {
              btnStyle = { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' };
              textColor = '#10B981';
              showIcon = <Check size={18} color="#10B981" />;
            } else if (isSelected) {
              btnStyle = { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' };
              textColor = '#EF4444';
              showIcon = <X size={18} color="#EF4444" />;
            } else {
              btnStyle = { backgroundColor: theme.surface, borderColor: theme.border };
              textColor = theme.textMuted;
            }
          }

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              style={[styles.optionBtn, btnStyle]}
              onPress={() => handleSelectOption(option)}
              disabled={hasAnswered}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              {showIcon && <View style={styles.optionIcon}>{showIcon}</View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Answer Verification & Explanation */}
      {hasAnswered && (
        <View style={[
          styles.explanationCard, 
          { 
            backgroundColor: theme.surface, 
            borderColor: isCorrect ? '#10B981' : '#EF4444' 
          }
        ]}>
          <Text style={[styles.explanationHeading, { color: isCorrect ? '#10B981' : '#EF4444' }]}>
            {isCorrect ? 'Correct! (शुद्धम्)' : 'Wrong! (अशुद्धम्)'}
          </Text>
          <Text style={[styles.explanationText, { color: theme.textMuted }]}>
            {levelData.explanation}
          </Text>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleNextLevel}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>
                {isGameFinished ? 'Finish Game' : 'Next Level'}
              </Text>
              <ArrowRight size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 130,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  trophyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  xpEarnedText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '800',
  },
  imageDisplayCard: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  imageInnerBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  promptText: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  optionBtn: {
    width: '48%',
    height: 80,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  explanationCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  explanationHeading: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 18,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
