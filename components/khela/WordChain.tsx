import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, RotateCcw, ArrowRight, Award } from 'lucide-react-native';
import { ThemeContext } from '../../App';
import { GameProgress } from './khelaState';

interface WordChainProps {
  progress: GameProgress;
  onBack: () => void;
  onUpdateProgress: (updates: Partial<GameProgress>) => void;
}

export interface WordChainLevel {
  meaning: string;
  correctAnswer: string[];
  pool: string[];
  explanation: string;
}

const WORD_CHAIN_DATABASE: WordChainLevel[] = [
  {
    meaning: "Truth alone triumphs.",
    correctAnswer: ["सत्यमेव", "जयते"],
    pool: ["जयते", "सत्यमेव", "मिथ्या", "सदा"],
    explanation: "सत्यमेव (Satyameva) means 'Truth alone' and जयते (Jayate) means 'triumphs'. Sourced from the Mundaka Upanishad."
  },
  {
    meaning: "Mother and Motherland are greater than Heaven.",
    correctAnswer: ["जननी", "जन्मभूमिश्च", "स्वर्गादपि", "गरीयसी"],
    pool: ["गरीयसी", "स्वर्गादपि", "जन्मभूमिश्च", "जननी", "महिमा", "पिता"],
    explanation: "जननी (Mother) जन्मभूमिश्च (and Motherland) स्वर्गादपि (even than heaven) गरीयसी (are greater/superior). Sourced from the Ramayana."
  },
  {
    meaning: "Knowledge is the ultimate ornament.",
    correctAnswer: ["विद्या", "परं", "भूषणम्"],
    pool: ["भूषणम्", "परं", "विद्या", "अज्ञानं", "धनं"],
    explanation: "विद्या (Knowledge) परं (ultimate/greatest) भूषणम् (ornament/decoration). Knowledge is the supreme embellishment."
  },
  {
    meaning: "Work indeed is worship.",
    correctAnswer: ["कर्म", "एव", "पूजा"],
    pool: ["पूजा", "एव", "कर्म", "क्रोधः", "भक्तिः"],
    explanation: "कर्म (Work) एव (indeed) पूजा (worship). Performing duty dedicatedly is true devotion."
  },
  {
    meaning: "The entire world is indeed one family.",
    correctAnswer: ["वसुधैव", "कुटुम्बकम्"],
    pool: ["कुटुम्बकम्", "वसुधैव", "गृहं", "ग्रामः"],
    explanation: "वसुधा (the earth) + एव (indeed) = वसुधैव (the earth itself is) कुटुम्बकम् (a family). From the Maha Upanishad."
  },
  {
    meaning: "Non-violence is the highest duty.",
    correctAnswer: ["अहिंसा", "परमः", "धर्मः"],
    pool: ["धर्मः", "अहिंसा", "परमः", "हिंसा", "सत्यम्"],
    explanation: "अहिंसा (Non-violence) परमः (highest) धर्मः (duty/righteousness). A core ethical tenet in Sanskrit tradition."
  },
  {
    meaning: "Yoga is skill in action.",
    correctAnswer: ["योगः", "कर्मसु", "कौशलम्"],
    pool: ["कौशलम्", "कर्मसु", "योगः", "ज्ञानम्", "भक्तिः"],
    explanation: "योगः (Yoga) कर्मसु (in actions) कौशलम् (skillfulness). Sourced from the Bhagavad Gita (2.50)."
  },
  {
    meaning: "Speak the truth, practice righteousness.",
    correctAnswer: ["सत्यं", "वद", "धर्मं", "चर"],
    pool: ["चर", "सत्यं", "धर्मं", "वद", "असत्यम्", "त्यज"],
    explanation: "सत्यं (Truth) वद (speak), धर्मं (righteousness) चर (practice). Famous injunction from Taittiriya Upanishad."
  },
  {
    meaning: "Knowledge bestows humility.",
    correctAnswer: ["विद्या", "ददाति", "विनयम्"],
    pool: ["विनयम्", "ददाति", "विद्या", "अहङ्कारम्", "धनम्"],
    explanation: "विद्या (Knowledge) ददाति (bestows) विनयम् (humility/modesty). True learning brings selflessness."
  },
  {
    meaning: "Lead me from darkness to light.",
    correctAnswer: ["तमसो", "मा", "ज्योतिर्गमय"],
    pool: ["ज्योतिर्गमय", "मा", "तमसो", "प्रकाशः", "अन्धकारः"],
    explanation: "तमसः (from darkness) मा (me) ज्योतिः (to light) गमय (lead). From the Brihadaranyaka Upanishad."
  },
  {
    meaning: "May all beings be happy.",
    correctAnswer: ["सर्वे", "भवन्तु", "सुखिनः"],
    pool: ["सुखिनः", "भवन्तु", "सर्वे", "दुःखिनः", "शान्ताः"],
    explanation: "सर्वे (All) भवन्तु (may become) सुखिनः (happy/peaceful). Universal Sanskrit prayer for well-being."
  },
  {
    meaning: "Righteousness protects those who protect it.",
    correctAnswer: ["धर्मो", "रक्षति", "रक्षितः"],
    pool: ["रक्षितः", "रक्षति", "धर्मो", "सत्यम्", "पापम्"],
    explanation: "धर्मः (Righteousness) रक्षति (protects) रक्षितः (when protected). From the Mahabharata."
  }
];

const XP_PER_LEVEL = 20;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDynamicRound(): WordChainLevel[] {
  const shuffledDb = shuffleArray(WORD_CHAIN_DATABASE);
  return shuffledDb.slice(0, 5).map(lvl => ({
    ...lvl,
    pool: shuffleArray(lvl.pool)
  }));
}

export default function WordChain({ progress, onBack, onUpdateProgress }: WordChainProps) {
  const { theme } = useContext(ThemeContext);
  
  const [activeLevels, setActiveLevels] = useState<WordChainLevel[]>(() => generateDynamicRound());
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const isGameFinished = currentStepIndex >= activeLevels.length;
  const levelData = activeLevels[Math.min(currentStepIndex, activeLevels.length - 1)];

  const [placedBricks, setPlacedBricks] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSelectBrick = (brick: string) => {
    if (hasChecked && isCorrect) return;
    if (placedBricks.includes(brick)) {
      setPlacedBricks(prev => prev.filter(b => b !== brick));
    } else {
      setPlacedBricks(prev => [...prev, brick]);
    }
    setHasChecked(false);
  };

  const handleResetLevel = () => {
    setPlacedBricks([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheckAnswer = () => {
    if (placedBricks.length !== levelData.correctAnswer.length) {
      setHasChecked(true);
      setIsCorrect(false);
      triggerShake();
      return;
    }

    const correct = placedBricks.every((brick, idx) => brick === levelData.correctAnswer[idx]);
    setHasChecked(true);
    setIsCorrect(correct);
    
    if (!correct) {
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNextLevel = () => {
    const nextStep = currentStepIndex + 1;
    const newXP = progress.totalXP + XP_PER_LEVEL;
    
    onUpdateProgress({
      totalXP: newXP,
      wordChain: {
        currentLevel: progress.wordChain.currentLevel + 1,
        highScore: Math.max(progress.wordChain.highScore, (progress.wordChain.currentLevel + 1) * 20),
      }
    });

    setCurrentStepIndex(nextStep);
    setPlacedBricks([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleNextRound = () => {
    setActiveLevels(generateDynamicRound());
    setCurrentStepIndex(0);
    setPlacedBricks([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  if (isGameFinished) {
    return (
      <View style={styles.centerContainer}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <LinearGradient colors={['#F59E0B', '#B45309']} style={styles.trophyIcon}>
            <Award size={48} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.successTitle, { color: theme.textDark }]}>Word Chain Completed!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
            Awesome job! You arranged all 5 Sanskrit sentence puzzles in this set.
          </Text>
          <Text style={[styles.xpEarnedText, { color: theme.primary }]}>
            +{activeLevels.length * XP_PER_LEVEL} XP Earned
          </Text>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleNextRound}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>Play Next Round (New Sentences)</Text>
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

      {/* Level Prompts */}
      <View style={[styles.promptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.promptTitle, { color: theme.textMuted }]}>Arrange bricks to translate:</Text>
        <Text style={[styles.promptWord, { color: theme.textDark }]}>"{levelData.meaning}"</Text>
      </View>

      {/* Target Area */}
      <View style={[
        styles.targetArea, 
        { borderColor: hasChecked ? (isCorrect ? '#10B981' : '#EF4444') : theme.border },
        shake && styles.shakeAnimation
      ]}>
        {placedBricks.length === 0 ? (
          <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
            Tap bricks below to place them here
          </Text>
        ) : (
          <View style={styles.placedRow}>
            {placedBricks.map((brick) => (
              <TouchableOpacity
                key={brick}
                style={[styles.brick, { backgroundColor: theme.primary }]}
                onPress={() => handleSelectBrick(brick)}
                activeOpacity={0.8}
              >
                <Text style={styles.brickText}>{brick}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Scrambled Bricks Pool */}
      <Text style={[styles.poolLabel, { color: theme.textMuted }]}>Available Bricks:</Text>
      <View style={styles.poolRow}>
        {levelData.pool.map((brick) => {
          const isPlaced = placedBricks.includes(brick);
          return (
            <TouchableOpacity
              key={brick}
              style={[
                styles.poolBrick, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: isPlaced ? 'transparent' : theme.border,
                  opacity: isPlaced ? 0.35 : 1
                }
              ]}
              onPress={() => !isPlaced && handleSelectBrick(brick)}
              disabled={isPlaced}
              activeOpacity={0.7}
            >
              <Text style={[styles.poolBrickText, { color: theme.textDark }]}>{brick}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Verification / Next Level Panel */}
      {hasChecked && isCorrect ? (
        <View style={[styles.explanationCard, { backgroundColor: theme.surface, borderColor: '#10B981' }]}>
          <View style={styles.successHeadingRow}>
            <View style={styles.successTick}>
              <Check size={18} color="#FFF" />
            </View>
            <Text style={[styles.successHeading, { color: theme.textDark }]}>Excellent! (उत्तमम्)</Text>
          </View>
          <Text style={[styles.explanationText, { color: theme.textMuted }]}>
            {levelData.explanation}
          </Text>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleNextLevel}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradient}>
              <Text style={styles.btnText}>Next Level</Text>
              <ArrowRight size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={handleResetLevel}
          >
            <RotateCcw size={20} color={theme.textDark} />
            <Text style={[styles.actionBtnText, { color: theme.textDark, marginLeft: 8 }]}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.actionBtnCheck]} 
            onPress={handleCheckAnswer}
          >
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.btnGradientCompact}>
              <Check size={20} color="#FFF" />
              <Text style={[styles.btnText, { marginLeft: 8 }]}>Check</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {hasChecked && !isCorrect && (
        <Text style={styles.errorText}>Try again! The order is incorrect or incomplete.</Text>
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  promptWord: {
    fontSize: 22,
    fontWeight: '800',
  },
  targetArea: {
    minHeight: 100,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  brick: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  brickText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  poolLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  poolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  poolBrick: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  poolBrickText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnCheck: {
    flex: 1.5,
    height: 52,
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradientCompact: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    marginTop: 12,
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
  explanationCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  successHeadingRow: {
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
  successHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  shakeAnimation: {
    borderWidth: 2.5,
  },
});
