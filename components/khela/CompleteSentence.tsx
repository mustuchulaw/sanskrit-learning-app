import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, ArrowRight, Award } from 'lucide-react-native';
import { ThemeContext } from '../../App';
import { GameProgress } from './khelaState';

interface CompleteSentenceProps {
  progress: GameProgress;
  onBack: () => void;
  onUpdateProgress: (updates: Partial<GameProgress>) => void;
}

export interface SentenceLevel {
  sentence: string;
  translation: string;
  options: string[];
  answer: string;
  explanation: string;
}

const COMPLETE_SENTENCE_DATABASE: SentenceLevel[] = [
  {
    sentence: "अहं प्रतिदिनं संस्कृतं _______ ।",
    translation: "I study Sanskrit every day.",
    options: ["पठति", "पठामि", "पठसि", "पठन्ति"],
    answer: "पठामि",
    explanation: "अहं (I) is first-person singular (उत्तमपुरुष एकवचन), requiring suffix '-आमि'. Hence, पठामि is correct."
  },
  {
    sentence: "छात्रः विद्यालये _______ ।",
    translation: "The student studies in school.",
    options: ["पठति", "पठामि", "पठसि", "लिखन्ति"],
    answer: "पठति",
    explanation: "छात्रः (student) is third-person singular (प्रथमपुरुष एकवचन), requiring suffix '-ति'. Hence, पठति is correct."
  },
  {
    sentence: "त्वं कुत्र _______ ?",
    translation: "Where are you going?",
    options: ["गच्छति", "गच्छसि", "गच्छामि", "गच्छन्ति"],
    answer: "गच्छसि",
    explanation: "त्वं (you) is second-person singular (मध्यमपुरुष एकवचन), requiring suffix '-सि'. Hence, गच्छसि is correct."
  },
  {
    sentence: "खगाः आकाशे _______ ।",
    translation: "Birds fly in the sky.",
    options: ["उत्पतति", "उत्पतन्ति", "उत्पतामि", "उत्पतसि"],
    answer: "उत्पतन्ति",
    explanation: "खगाः (birds) is third-person plural (प्रथमपुरुष बहुवचन), requiring plural suffix '-न्ति'. Hence, उत्पतन्ति is correct."
  },
  {
    sentence: "वयं चित्रं _______ ।",
    translation: "We see the picture.",
    options: ["पश्यामि", "पश्यति", "पश्यामः", "पश्यसि"],
    answer: "पश्यामः",
    explanation: "वयं (we) is first-person plural (उत्तमपुरुष बहुवचन), requiring suffix '-आमः'. Hence, पश्यामः is correct."
  },
  {
    sentence: "बालकाः कन्दुकेन _______ ।",
    translation: "Boys play with a ball.",
    options: ["क्रीडति", "क्रीडामि", "क्रीडन्ति", "क्रीडसि"],
    answer: "क्रीडन्ति",
    explanation: "बालकाः (boys) is third-person plural, requiring verb suffix '-न्ति'. Hence, क्रीडन्ति is correct."
  },
  {
    sentence: "यूयं सत्यं _______ ।",
    translation: "You (plural) speak the truth.",
    options: ["वदामि", "वदथ", "वदति", "वदसि"],
    answer: "वदथ",
    explanation: "यूयं (you all) is second-person plural (मध्यमपुरुष बहुवचन), requiring suffix '-थ'. Hence, वदथ is correct."
  },
  {
    sentence: "आवाम् उद्याने _______ ।",
    translation: "We two walk in the garden.",
    options: ["चरावः", "चरामि", "चरति", "चरन्ति"],
    answer: "चरावः",
    explanation: "आवाम् (we two) is first-person dual (उत्तमपुरुष द्विवचन), requiring suffix '-आवः'. Hence, चरावः is correct."
  },
  {
    sentence: "सा मधुरं गीतं _______ ।",
    translation: "She sings a sweet song.",
    options: ["गायति", "गायामि", "गायसि", "गायान्तः"],
    answer: "गायति",
    explanation: "सा (she) is third-person feminine singular, requiring suffix '-ति'. Hence, गायति is correct."
  },
  {
    sentence: "ते शीतलं जलं _______ ।",
    translation: "They drink cold water.",
    options: ["पिबति", "पिबामि", "पिबन्ति", "पिबसि"],
    answer: "पिबन्ति",
    explanation: "ते (they) is third-person masculine plural, requiring suffix '-न्ति'. Hence, पिबन्ति is correct."
  },
  {
    sentence: "मयूराः वर्षाकाले _______ ।",
    translation: "Peacocks dance during the monsoon.",
    options: ["नृत्यति", "नृत्यन्ति", "नृत्यामि", "नृत्यसि"],
    answer: "नृत्यन्ति",
    explanation: "मयूराः (peacocks) is third-person plural, requiring suffix '-न्ति'. Hence, नृत्यन्ति is correct."
  },
  {
    sentence: "सूर्यः प्राच्यां दिशि _______ ।",
    translation: "The Sun rises in the East.",
    options: ["उदेति", "उदयामि", "उदयंति", "उदेसि"],
    answer: "उदेति",
    explanation: "सूर्यः (Sun) is third-person singular, requiring verb form उदेति (udeti)."
  },
  {
    sentence: "त्वं संस्कृत पुस्तकं _______ ।",
    translation: "You read the Sanskrit book.",
    options: ["पठसि", "पठति", "पठामि", "पठन्ति"],
    answer: "पठसि",
    explanation: "त्वं (you) takes the second-person singular suffix '-सि'. Hence, पठसि is correct."
  },
  {
    sentence: "अहं सदा गुरुं _______ ।",
    translation: "I always bow to the teacher.",
    options: ["नमामि", "नमति", "नमसि", "नमन्ति"],
    answer: "नमामि",
    explanation: "अहं (I) takes the first-person singular verb ending '-आमि'. Hence, नमामि is correct."
  },
  {
    sentence: "अश्वाः तीव्रम _______ ।",
    translation: "Horses run fast.",
    options: ["धावन्ति", "धावति", "धावामि", "धावसि"],
    answer: "धावन्ति",
    explanation: "अश्वाः (horses) is plural, requiring the verb form धावन्ति (dhāvanti)."
  }
];

const XP_PER_LEVEL = 25;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDynamicRound(): SentenceLevel[] {
  const shuffledDb = shuffleArray(COMPLETE_SENTENCE_DATABASE);
  return shuffledDb.slice(0, 5).map(lvl => ({
    ...lvl,
    options: shuffleArray(lvl.options)
  }));
}

export default function CompleteSentence({ progress, onBack, onUpdateProgress }: CompleteSentenceProps) {
  const { theme } = useContext(ThemeContext);

  const [activeLevels, setActiveLevels] = useState<SentenceLevel[]>(() => generateDynamicRound());
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const isGameFinished = currentStepIndex >= activeLevels.length;
  const levelData = activeLevels[Math.min(currentStepIndex, activeLevels.length - 1)];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
      completeSentence: {
        currentLevel: progress.completeSentence.currentLevel + 1,
        highScore: Math.max(progress.completeSentence.highScore, (progress.completeSentence.currentLevel + 1) * 25),
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
          <Text style={[styles.successTitle, { color: theme.textDark }]}>Sentence Master Complete!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
            Impressive grammar skills! You completed all 5 sentence challenges in this set.
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

      {/* Sentence Prompt Card */}
      <View style={[styles.promptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.promptSubtitle, { color: theme.textMuted }]}>Select the correct verb to complete:</Text>
        <Text style={[styles.sentenceText, { color: theme.textDark }]}>{levelData.sentence}</Text>
        <Text style={[styles.translationText, { color: theme.primary }]}>"{levelData.translation}"</Text>
      </View>

      {/* Options List */}
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
                <Text style={[styles.explanationHeading, { color: theme.textDark }]}>Correct! (उत्तमम्)</Text>
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
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
  },
  promptSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sentenceText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 32,
  },
  translationText: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
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
