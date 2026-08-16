import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, Check, X, ArrowRight, Award,
  Sun, BookOpen, Flame, Trees, Heart, Moon, CloudRain,
  Feather, Droplets, Compass, Shield, Star, Sparkles, Mountain
} from 'lucide-react-native';
import { ThemeContext } from '../../App';
import { GameProgress } from './khelaState';

interface GuessImageProps {
  progress: GameProgress;
  onBack: () => void;
  onUpdateProgress: (updates: Partial<GameProgress>) => void;
}

export interface GuessImageLevel {
  iconName: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

const GUESS_IMAGE_DATABASE: GuessImageLevel[] = [
  {
    iconName: 'Sun',
    prompt: 'Identify this celestial body:',
    options: ['चन्द्रः', 'सूर्यः', 'भूमिः', 'नक्षत्रम्'],
    answer: 'सूर्यः',
    explanation: 'सूर्यः (Sūryaḥ) represents the Sun. In Sanskrit literature, the Sun is revered as the source of energy and light.'
  },
  {
    iconName: 'BookOpen',
    prompt: 'What is this physical object?',
    options: ['लेखनी', 'उत्पीठिका', 'मञ्जूषा', 'पुस्तकम्'],
    answer: 'पुस्तकम्',
    explanation: 'पुस्तकम् (Pustakam) means Book. Knowledge is preserved in pustakas in traditional Indian learning.'
  },
  {
    iconName: 'Flame',
    prompt: 'Identify this natural element:',
    options: ['जलम्', 'वायुः', 'अग्निः', 'आकाशः'],
    answer: 'अग्निः',
    explanation: 'अग्निः (Agniḥ) means Fire. Agni is one of the primary elements representing transformation and purity.'
  },
  {
    iconName: 'Trees',
    prompt: 'What category of life is this?',
    options: ['वृक्षः', 'पुष्पम्', 'फलम्', 'तृणम्'],
    answer: 'वृक्षः',
    explanation: 'वृक्षः (Vṛkṣaḥ) means Tree. Sanskrit texts praise trees for selflessly giving shade and fruit.'
  },
  {
    iconName: 'Heart',
    prompt: 'What human emotion is symbolized here?',
    options: ['क्रोधः', 'प्रेम', 'दुःखम्', 'भयम्'],
    answer: 'प्रेम',
    explanation: 'प्रेम (Prema) or स्नेह (Sneha) means Love or affection. It represents emotional devotion.'
  },
  {
    iconName: 'Moon',
    prompt: 'Identify this night sky body:',
    options: ['सूर्यः', 'चन्द्रः', 'मेघः', 'तारा'],
    answer: 'चन्द्रः',
    explanation: 'चन्द्रः (Candraḥ) means the Moon. Known for its cooling rays (Chandra-Kiran).'
  },
  {
    iconName: 'CloudRain',
    prompt: 'Identify this weather phenomenon:',
    options: ['अग्निः', 'मेघः', 'पर्वतः', 'समुद्रः'],
    answer: 'मेघः',
    explanation: 'मेघः (Meghaḥ) means Cloud or Rain Cloud. Famous in Kalidasa\'s classical poem Meghaduta.'
  },
  {
    iconName: 'Feather',
    prompt: 'Identify this sacred bird feather:',
    options: ['मयूरपिञ्छम्', 'हंसः', 'काकः', 'शुकः'],
    answer: 'मयूरपिञ्छम्',
    explanation: 'मयूरपिञ्छम् (Mayūra-piñcham) is a Peacock Feather, traditionally adorned by Lord Krishna.'
  },
  {
    iconName: 'Droplets',
    prompt: 'What essential life fluid is this?',
    options: ['अग्निः', 'जलम्', 'दुग्धम्', 'घृतम्'],
    answer: 'जलम्',
    explanation: 'जलम् (Jalam) means Water. Also referred to as "जीवनम्" (Life) in classical Sanskrit.'
  },
  {
    iconName: 'Compass',
    prompt: 'What spatial concept is shown?',
    options: ['दिशा', 'काली', 'स्थानम्', 'मार्गः'],
    answer: 'दिशा',
    explanation: 'दिशा (Diśā) means Direction or Cardinal point (such as East - Prachi, West - Pratichi).'
  },
  {
    iconName: 'Shield',
    prompt: 'What protective equipment is this?',
    options: ['खड्गः', 'कवचम्', 'धनुः', 'बाणः'],
    answer: 'कवचम्',
    explanation: 'कवचम् (Kavacam) means Shield or Armor. It signifies divine protection and strength.'
  },
  {
    iconName: 'Star',
    prompt: 'Identify this glowing cosmic entity:',
    options: ['सूर्यः', 'चन्द्रः', 'नक्षत्रम्', 'ग्रहः'],
    answer: 'नक्षत्रम्',
    explanation: 'नक्षत्रम् (Nakṣatram) means Star or Constellation in Vedic astronomy.'
  },
  {
    iconName: 'Sparkles',
    prompt: 'What quality of radiance is shown?',
    options: ['अन्धकारः', 'तेजः', 'शान्तिः', 'बलम्'],
    answer: 'तेजः',
    explanation: 'तेजः (Tejaḥ) means Luster, Splendor, or Spiritual Energy.'
  },
  {
    iconName: 'Mountain',
    prompt: 'What geographical landform is this?',
    options: ['नदी', 'समुद्रः', 'पर्वतः', 'वनम्'],
    answer: 'पर्वतः',
    explanation: 'पर्वतः (Parvataḥ) means Mountain or Hill, such as the sacred Himalayas.'
  }
];

const IconMap: { [key: string]: React.ComponentType<any> } = {
  Sun: Sun,
  BookOpen: BookOpen,
  Flame: Flame,
  Trees: Trees,
  Heart: Heart,
  Moon: Moon,
  CloudRain: CloudRain,
  Feather: Feather,
  Droplets: Droplets,
  Compass: Compass,
  Shield: Shield,
  Star: Star,
  Sparkles: Sparkles,
  Mountain: Mountain,
};

const XP_PER_LEVEL = 15;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDynamicRound(): GuessImageLevel[] {
  const shuffledDb = shuffleArray(GUESS_IMAGE_DATABASE);
  return shuffledDb.slice(0, 5).map(lvl => ({
    ...lvl,
    options: shuffleArray(lvl.options)
  }));
}

export default function GuessImage({ progress, onBack, onUpdateProgress }: GuessImageProps) {
  const { theme } = useContext(ThemeContext);

  const [activeLevels, setActiveLevels] = useState<GuessImageLevel[]>(() => generateDynamicRound());
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const isGameFinished = currentStepIndex >= activeLevels.length;
  const levelData = activeLevels[Math.min(currentStepIndex, activeLevels.length - 1)];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const IconComponent = levelData ? IconMap[levelData.iconName] || Sun : Sun;

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;

    const correct = option === levelData.answer;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrect(correct);
  };

  const handleNextLevel = () => {
    const nextStep = currentStepIndex + 1;
    const xpReward = isCorrect ? XP_PER_LEVEL : 0;
    const newXP = progress.totalXP + xpReward;

    onUpdateProgress({
      totalXP: newXP,
      guessImage: {
        currentLevel: progress.guessImage.currentLevel + 1,
        highScore: Math.max(progress.guessImage.highScore, (progress.guessImage.currentLevel + 1) * 15),
      }
    });

    setCurrentStepIndex(nextStep);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  };

  const handleNextRound = () => {
    setActiveLevels(generateDynamicRound());
    setCurrentStepIndex(0);
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
          <Text style={[styles.successTitle, { color: theme.textDark }]}>Picture Quiz Complete!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
            Fantastic! You identified all Sanskrit symbol and picture challenges in this round.
          </Text>
          <Text style={[styles.xpEarnedText, { color: theme.primary }]}>
            +{activeLevels.length * XP_PER_LEVEL} XP Earned
          </Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleNextRound}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>Play Next Round (New Quiz Set)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.secondaryBtn} onPress={onBack}>
            <Text style={[styles.secondaryBtnText, { color: theme.textMuted }]}>Back to Game Room</Text>
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
          Level {currentStepIndex + 1}/{activeLevels.length}
        </Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.pointsText, { color: theme.isDark ? '#FFF' : theme.primaryDark }]}>
            +{XP_PER_LEVEL} XP
          </Text>
        </View>
      </View>

      {/* Image / Icon Prompt Box */}
      <View style={[styles.promptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.iconWrapper}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.iconGradient}>
            <IconComponent size={56} color="#FFF" />
          </LinearGradient>
        </View>
        <Text style={[styles.promptSubtitle, { color: theme.textMuted }]}>{levelData.prompt}</Text>
      </View>

      {/* Options Grid */}
      <View style={styles.optionsContainer}>
        {levelData.options.map((option) => {
          const isSelected = selectedOption === option;
          let optionStyle = { backgroundColor: theme.surface, borderColor: theme.border };
          let textColor = theme.textDark;

          if (hasAnswered) {
            if (option === levelData.answer) {
              optionStyle = { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' };
              textColor = '#10B981';
            } else if (isSelected && !isCorrect) {
              optionStyle = { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' };
              textColor = '#EF4444';
            }
          }

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              style={[styles.optionBtn, optionStyle]}
              onPress={() => handleSelectOption(option)}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              {hasAnswered && option === levelData.answer && (
                <Check size={20} color="#10B981" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <X size={20} color="#EF4444" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation Panel */}
      {hasAnswered && (
        <View style={[
          styles.explanationCard,
          {
            backgroundColor: theme.surface,
            borderColor: isCorrect ? '#10B981' : '#EF4444'
          }
        ]}>
          <View style={styles.headingRow}>
            {isCorrect ? (
              <>
                <View style={styles.successTick}>
                  <Check size={18} color="#FFF" />
                </View>
                <Text style={[styles.explanationHeading, { color: theme.textDark }]}>Correct! (सम्यक्)</Text>
              </>
            ) : (
              <>
                <View style={styles.errorCross}>
                  <X size={18} color="#FFF" />
                </View>
                <Text style={[styles.explanationHeading, { color: theme.textDark }]}>Incorrect (अशुद्धम्)</Text>
              </>
            )}
          </View>

          <Text style={[styles.explanationText, { color: theme.textMuted }]}>
            {levelData.explanation}
          </Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleNextLevel}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>Next Question</Text>
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
    paddingHorizontal: 24,
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
  promptCard: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  promptSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
  },
  explanationCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  successTick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  errorCross: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  explanationHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
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
