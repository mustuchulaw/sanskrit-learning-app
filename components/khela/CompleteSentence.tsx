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

const COMPLETE_SENTENCE_LEVELS = [
  {
    sentence: "अहं प्रतिदिनं संस्कृतं _______ ।",
    translation: "I study Sanskrit every day.",
    options: ["पठति", "पठामि", "पठसि", "पठन्ति"],
    answer: "पठामि",
    explanation: "अहं (I) is first-person singular (उत्तमपुरुष एकवचन), which requires the verb suffix '-आमि'. Hence, पठामि (paṭhāmi) is correct. पठति is third-person singular and पठसि is second-person singular."
  },
  {
    sentence: "छात्रः विद्यालये _______ ।",
    translation: "The student studies in school.",
    options: ["पठति", "पठामि", "पठसि", "लिखन्ति"],
    answer: "पठति",
    explanation: "छात्रः (student) is third-person singular (प्रथमपुरुष एकवचन). It requires the verb suffix '-ति'. Hence, पठति (paṭhati) is correct."
  },
  {
    sentence: "त्वं कुत्र _______ ?",
    translation: "Where are you going?",
    options: ["गच्छति", "गच्छसि", "गच्छामि", "गच्छन्ति"],
    answer: "गच्छसि",
    explanation: "त्वं (you) is second-person singular (मध्यमपुरुष एकवचन). It requires the verb suffix '-सि'. Hence, गच्छसि (gacchasi) is correct."
  },
  {
    sentence: "खगाः आकाशे _______ ।",
    translation: "Birds fly in the sky.",
    options: ["उत्पतति", "उत्पतन्ति", "उत्पतामि", "उत्पतसि"],
    answer: "उत्पतन्ति",
    explanation: "खगाः (birds) is third-person plural (प्रथमपुरुष बहुवचन). It requires the plural verb suffix '-न्ति'. Hence, उत्पतन्ति (utpatanti) is correct."
  },
  {
    sentence: "वयं चित्रं _______ ।",
    translation: "We see the picture.",
    options: ["पश्यामि", "पश्यति", "पश्यामः", "पश्यसि"],
    answer: "पश्यामः",
    explanation: "वयं (we) is first-person plural (उत्तमपुरुष बहुवचन). It requires the verb suffix '-आमः'. Hence, पश्यामः (paśyāmaḥ) is correct."
  }
];

const XP_PER_LEVEL = 25;

export default function CompleteSentence({ progress, onBack, onUpdateProgress }: CompleteSentenceProps) {
  const { theme } = useContext(ThemeContext);
  
  const currentLevelIndex = Math.min(progress.completeSentence.currentLevel, COMPLETE_SENTENCE_LEVELS.length - 1);
  const isGameFinished = progress.completeSentence.currentLevel >= COMPLETE_SENTENCE_LEVELS.length;
  
  const levelData = COMPLETE_SENTENCE_LEVELS[currentLevelIndex];
  
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
    const nextLevel = progress.completeSentence.currentLevel + 1;
    const xpReward = isCorrect ? XP_PER_LEVEL : 0;
    const newXP = progress.totalXP + xpReward;

    onUpdateProgress({
      totalXP: newXP,
      completeSentence: {
        currentLevel: nextLevel,
        highScore: Math.max(progress.completeSentence.highScore, nextLevel * 25),
      }
    });

    // Reset local state
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  };

  const handleRestartGame = () => {
    onUpdateProgress({
      completeSentence: {
        currentLevel: 0,
        highScore: progress.completeSentence.highScore,
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
          <Text style={[styles.successTitle, { color: theme.textDark }]}>Sentence Room Complete!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
            Grammar Mastered! You have completed all sentence puzzle structures.
          </Text>
          <Text style={[styles.xpEarnedText, { color: theme.primary }]}>
            Syntax Mastered 🎓
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

  // Split sentence to insert inline blank pill
  const sentenceParts = levelData.sentence.split('_______');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Game Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ChevronLeft size={22} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textDark }]}>
          Level {currentLevelIndex + 1}/{COMPLETE_SENTENCE_LEVELS.length}
        </Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.pointsText, { color: theme.isDark ? '#FFF' : theme.primaryDark }]}>
            +{XP_PER_LEVEL} XP
          </Text>
        </View>
      </View>

      {/* Sentence Presentation Card */}
      <View style={[styles.sentenceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.promptTitle, { color: theme.textMuted }]}>Complete the Sentence:</Text>
        
        {/* Render Sanskrit text with inline custom blank */}
        <View style={styles.sentenceWrapper}>
          <Text style={[styles.sanskritText, { color: theme.textDark }]}>
            {sentenceParts[0]}
            <View style={[
              styles.blankPill, 
              { 
                backgroundColor: hasAnswered 
                  ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') 
                  : theme.primaryLight,
                borderColor: hasAnswered 
                  ? (isCorrect ? '#10B981' : '#EF4444') 
                  : theme.primary
              }
            ]}>
              <Text style={[
                styles.blankText, 
                { 
                  color: hasAnswered 
                    ? (isCorrect ? '#10B981' : '#EF4444') 
                    : (theme.isDark ? '#FFF' : theme.primaryDark) 
                }
              ]}>
                {hasAnswered ? (selectedOption?.split(' (')[0]) : '  ?  '}
              </Text>
            </View>
            {sentenceParts[1]}
          </Text>
        </View>

        {/* Translation Assistant */}
        <View style={[styles.translationBox, { backgroundColor: theme.isDark ? '#27272A' : '#F5F5F4' }]}>
          <Text style={[styles.translationLabel, { color: theme.primary }]}>Translation Helper:</Text>
          <Text style={[styles.translationText, { color: theme.textDark }]}>
            "{levelData.translation}"
          </Text>
        </View>
      </View>

      {/* Vertical Options List */}
      <View style={styles.optionsList}>
        {levelData.options.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrectAnswer = option === levelData.answer;
          
          let optionStyle = { backgroundColor: theme.surface, borderColor: theme.border };
          let optionTextColor = theme.textDark;
          let showIcon = null;

          if (hasAnswered) {
            if (isCorrectAnswer) {
              optionStyle = { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' };
              optionTextColor = '#10B981';
              showIcon = <Check size={18} color="#10B981" />;
            } else if (isSelected) {
              optionStyle = { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' };
              optionTextColor = '#EF4444';
              showIcon = <X size={18} color="#EF4444" />;
            } else {
              optionStyle = { backgroundColor: theme.surface, borderColor: theme.border };
              optionTextColor = theme.textMuted;
            }
          }

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              style={[styles.optionCard, optionStyle]}
              onPress={() => handleSelectOption(option)}
              disabled={hasAnswered}
            >
              <Text style={[styles.optionTextLabel, { color: optionTextColor }]}>{option}</Text>
              {showIcon && <View style={styles.iconIndicator}>{showIcon}</View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Answer Verdict & Explanation */}
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
          <Text style={[styles.explanationTextDetail, { color: theme.textMuted }]}>
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
  sentenceCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  promptTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  sentenceWrapper: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sanskritText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 38,
  },
  blankPill: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 8,
    alignSelf: 'center',
    transform: [{ translateY: 4 }], // align center with text
  },
  blankText: {
    fontSize: 18,
    fontWeight: '900',
  },
  translationBox: {
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  translationLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  optionsList: {
    marginBottom: 24,
  },
  optionCard: {
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  optionTextLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  explanationTextDetail: {
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
