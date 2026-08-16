import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Compass, Image as ImageIcon, Type, Sparkles, RefreshCcw, HelpCircle } from 'lucide-react-native';
import { ThemeContext } from '../../App';
import { GameProgress, getScholarRank } from './khelaState';

interface KhelaMenuProps {
  progress: GameProgress;
  onSelectGame: (gameKey: 'wordChain' | 'guessImage' | 'completeSentence') => void;
  onResetProgress: () => void;
}

export default function KhelaMenu({ progress, onSelectGame, onResetProgress }: KhelaMenuProps) {
  const { theme } = useContext(ThemeContext);
  const rankInfo = getScholarRank(progress.totalXP);
  
  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your game scores, levels and XP? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Everything", style: "destructive", onPress: onResetProgress }
      ]
    );
  };

  const gameItems = [
    {
      key: 'wordChain' as const,
      title: 'Word Chain',
      sanskritTitle: 'शब्दानुक्रमः',
      desc: 'Arrange scrambled bricks to form correct Sanskrit words or wise quotes.',
      icon: Compass,
      colors: ['#0F766E', '#042F2E'] as [string, string],
      level: progress.wordChain.currentLevel + 1,
      totalLevels: 5,
      xpValue: '20 XP / lvl',
    },
    {
      key: 'guessImage' as const,
      title: 'Guess the Image',
      sanskritTitle: 'चित्रचिन्तनम्',
      desc: 'Identify the object in the illustration and select its correct Sanskrit name.',
      icon: ImageIcon,
      colors: ['#B45309', '#78350F'] as [string, string],
      level: progress.guessImage.currentLevel + 1,
      totalLevels: 5,
      xpValue: '15 XP / lvl',
    },
    {
      key: 'completeSentence' as const,
      title: 'Complete the Sentence',
      sanskritTitle: 'वाक्यपूर्तिः',
      desc: 'Fill in the blanks with the correct verb forms or noun declensions.',
      icon: Type,
      colors: ['#6D28D9', '#4C1D95'] as [string, string],
      level: progress.completeSentence.currentLevel + 1,
      totalLevels: 5,
      xpValue: '25 XP / lvl',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Progress & Scholar Rank Card */}
      <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.rankHeader}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.trophyIconBox}>
            <Trophy size={24} color="#FFF" />
          </LinearGradient>
          <View style={styles.rankInfoBox}>
            <Text style={[styles.rankLabel, { color: theme.textMuted }]}>Sanskrit Scholar Rank</Text>
            <Text style={[styles.rankTitle, { color: theme.textDark }]} numberOfLines={1}>
              {rankInfo.title.split(' (')[0]}
            </Text>
            <Text style={[styles.rankSubtitle, { color: theme.primary }]}>
              {rankInfo.title.substring(rankInfo.title.indexOf('('))}
            </Text>
          </View>
        </View>

        <View style={styles.xpInfoRow}>
          <Text style={[styles.xpText, { color: theme.textDark }]}>
            Total Score: <Text style={{ color: theme.primary, fontWeight: '900' }}>{progress.totalXP} XP</Text>
          </Text>
          {rankInfo.nextRankXP < 9999 && (
            <Text style={[styles.nextXPText, { color: theme.textMuted }]}>
              {rankInfo.nextRankXP - progress.totalXP} XP to next level
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: theme.isDark ? '#27272A' : '#E7E5E4' }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: theme.primary,
                width: `${rankInfo.percent}%` 
              }
            ]} 
          />
        </View>
      </View>

      {/* Game Selection Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>Select Sanskrit Game</Text>
        <Sparkles size={18} color={theme.primary} />
      </View>

      {/* Game Cards */}
      {gameItems.map((game) => {
        const IconComponent = game.icon;
        const isCompleted = game.level > game.totalLevels;
        
        return (
          <TouchableOpacity 
            key={game.key}
            activeOpacity={0.85}
            style={[styles.gameCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onSelectGame(game.key)}
          >
            <LinearGradient 
              colors={game.colors} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.gameIconWrapper}
            >
              <IconComponent size={28} color="#FFF" />
            </LinearGradient>

            <View style={styles.gameInfo}>
              <View style={styles.gameTitleRow}>
                <Text style={[styles.gameTitle, { color: theme.textDark }]}>{game.title}</Text>
                <Text style={[styles.gameSanskritTitle, { color: theme.primary }]}>{game.sanskritTitle}</Text>
              </View>
              <Text style={[styles.gameDesc, { color: theme.textMuted }]}>{game.desc}</Text>
              
              <View style={styles.gameFooter}>
                <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.badgeText, { color: theme.isDark ? '#FFF' : theme.primaryDark }]}>
                    {isCompleted ? 'Completed 🎉' : `Level ${game.level}/${game.totalLevels}`}
                  </Text>
                </View>
                <Text style={[styles.xpValueText, { color: theme.textMuted }]}>{game.xpValue}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Future Games Slot (Fulfilling the 1-2 future games requirement) */}
      <View style={[styles.futureCard, { borderColor: theme.border }]}>
        <HelpCircle size={26} color={theme.textMuted} style={{ opacity: 0.6 }} />
        <View style={styles.futureInfo}>
          <Text style={[styles.futureTitle, { color: theme.textMuted }]}>More Games Coming Soon</Text>
          <Text style={[styles.futureDesc, { color: theme.textMuted }]}>
            Preparing Verb conjugation master and Sandhi builder challenges.
          </Text>
        </View>
      </View>

      {/* Reset Progress Section */}
      <TouchableOpacity 
        onPress={handleReset} 
        style={styles.resetBtn}
        activeOpacity={0.7}
      >
        <RefreshCcw size={16} color={theme.textMuted} style={{ marginRight: 6 }} />
        <Text style={[styles.resetText, { color: theme.textMuted }]}>Reset Scholar Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 130,
  },
  progressCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  trophyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankInfoBox: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rankTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  rankSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  xpInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 15,
    fontWeight: '700',
  },
  nextXPText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gameCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  gameIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 16,
  },
  gameTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  gameSanskritTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  gameDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 10,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  xpValueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  futureCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    opacity: 0.7,
  },
  futureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  futureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  futureDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
