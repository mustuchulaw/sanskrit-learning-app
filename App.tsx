import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, Dimensions, useColorScheme, Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowRightLeft, BookOpen, PlayCircle, Mic, 
  Copy, Volume2, Search, Play, BookText, Sparkles, Sun, Moon, Gamepad2, Trophy
} from 'lucide-react-native';

import KhelaMenu from './components/khela/KhelaMenu';
import WordChain from './components/khela/WordChain';
import GuessImage from './components/khela/GuessImage';
import CompleteSentence from './components/khela/CompleteSentence';
import { GameProgress, INITIAL_PROGRESS, loadProgress, saveProgress } from './components/khela/khelaState';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// ==========================================
// THEMES
// ==========================================
const lightTheme = {
  isDark: false,
  primary: '#0F766E',      
  primaryDark: '#042F2E',
  primaryLight: '#CCFBF1', 
  bgLight: '#FAF9F6',      
  surface: '#FFFFFF',      
  textDark: '#1C1917',     
  textMuted: '#78716C',    
  border: '#E7E5E4',
  blurTint: 'light' as const,
};

const darkTheme = {
  isDark: true,
  primary: '#14B8A6', 
  primaryDark: '#042F2E',
  primaryLight: '#115E59', 
  bgLight: '#09090B', 
  surface: '#18181B', 
  textDark: '#FAFAFA', 
  textMuted: '#A1A1AA',    
  border: '#27272A',
  blurTint: 'dark' as const,
};

// ==========================================
// THEME CONTEXT
// ==========================================
export type Theme = typeof lightTheme | typeof darkTheme;
export const ThemeContext = createContext<{theme: Theme, toggleTheme: () => void}>({
  theme: lightTheme,
  toggleTheme: () => {},
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// MODULE 1: ANUVADAK (TRANSLATOR)
// ==========================================
function TranslatorScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);
  
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Sanskrit (संस्कृतम्)');

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Anuvadak</Text>
            <Text style={styles.headerSubtitle}>Translate & Learn</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.translationCard}>
          <View style={styles.langHeader}>
            <Text style={styles.langText}>{sourceLang}</Text>
            <TouchableOpacity><Volume2 size={20} color={theme.textMuted} /></TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter text to translate..."
            placeholderTextColor={theme.textMuted}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.iconBtn}><Mic size={20} color={theme.textDark} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Copy size={20} color={theme.textDark} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.swapContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={swapLanguages}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.swapBtn}>
              <ArrowRightLeft size={22} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#115E59', '#042F2E']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.translationCard, styles.outputCard]}
        >
          <View style={styles.langHeader}>
            <Text style={[styles.langText, { color: '#CCFBF1' }]}>{targetLang}</Text>
            <TouchableOpacity><Volume2 size={20} color="#CCFBF1" /></TouchableOpacity>
          </View>
          <Text style={[styles.outputText, { color: '#FFFFFF' }]}>
            {inputText ? "नमस्ते, कथम् अस्ति भवान्?" : "Translation will appear here..."}
          </Text>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Copy size={20} color="#CCFBF1" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// ==========================================
// MODULE 2: GRANTHALAYA (PDF LIBRARY)
// ==========================================
const MOCK_BOOKS = [
  { id: 1, title: 'Sanskrit Grammar', author: 'Panini', colors: ['#0F766E', '#042F2E'] as [string, string] },
  { id: 2, title: 'Bhagavad Gita', author: 'Vyasa', colors: ['#B45309', '#78350F'] as [string, string] },
  { id: 3, title: 'Vedic Chants', author: 'Ancient Texts', colors: ['#6D28D9', '#4C1D95'] as [string, string] },
];

function LibraryScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Granthalaya</Text>
            <Text style={styles.headerSubtitle}>Sacred Texts & Guides</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color={theme.textMuted} />
        <TextInput placeholder="Search library..." style={styles.searchInput} placeholderTextColor={theme.textMuted} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Readings</Text>
          <Sparkles size={18} color={theme.primary} />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {MOCK_BOOKS.map((book) => (
            <TouchableOpacity activeOpacity={0.9} key={book.id} style={styles.bookCard}>
              <LinearGradient colors={book.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bookCover}>
                <BookText size={44} color="#FFF" opacity={0.9} />
              </LinearGradient>
              <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Recent PDFs</Text>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity activeOpacity={0.7} key={item} style={styles.listCard}>
            <View style={[styles.listIconBox, { backgroundColor: theme.primaryLight }]}>
              <BookOpen size={22} color={theme.isDark ? '#FFFFFF' : theme.primary} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>Chapter {item}: Vowels & Consonants</Text>
              <Text style={styles.listSubtitle}>12 Pages • PDF Document</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ==========================================
// MODULE 3: GURUKUL (VIDEO LESSONS)
// ==========================================
function VideoLessonsScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Gurukul</Text>
            <Text style={styles.headerSubtitle}>Video Masterclasses</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.9} style={styles.featuredVideo}>
          <View style={styles.videoThumbnail}>
            <BlurView intensity={40} tint={theme.blurTint} style={styles.playButtonGlass}>
              <Play size={28} color="#FFF" fill="#FFF" style={{ marginLeft: 4 }} />
            </BlurView>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoBadge}>NEW EPISODE</Text>
            <Text style={styles.videoTitle}>Mastering Sanskrit Pronunciation</Text>
            <Text style={styles.videoSubtitle}>Beginner • 15 Mins</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Grammar Basics</Text>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity activeOpacity={0.7} key={item} style={styles.videoListCard}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.smallThumbnail}>
              <PlayCircle size={24} color="#FFF" />
            </LinearGradient>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>Understanding Noun Cases (Vibhakti)</Text>
              <Text style={styles.listSubtitle}>Lesson {item} • 10 Mins</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function GameScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [activeGame, setActiveGame] = useState<'menu' | 'wordChain' | 'guessImage' | 'completeSentence'>('menu');
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initProgress() {
      const data = await loadProgress();
      setProgress(data);
      setIsLoading(false);
    }
    initProgress();
  }, []);

  const handleUpdateProgress = async (updates: Partial<GameProgress>) => {
    const nextProgress = {
      ...progress,
      ...updates,
      wordChain: updates.wordChain ? { ...progress.wordChain, ...updates.wordChain } : progress.wordChain,
      guessImage: updates.guessImage ? { ...progress.guessImage, ...updates.guessImage } : progress.guessImage,
      completeSentence: updates.completeSentence ? { ...progress.completeSentence, ...updates.completeSentence } : progress.completeSentence,
    };
    setProgress(nextProgress);
    await saveProgress(nextProgress);
  };

  const handleResetProgress = async () => {
    setProgress(INITIAL_PROGRESS);
    await saveProgress(INITIAL_PROGRESS);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textMuted, fontSize: 16, fontWeight: '600' }}>
          Loading Khela Room...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeGame === 'menu' && (
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('./assets/logo.png')} style={styles.logoImage} />
            <View>
              <Text style={styles.headerTitle}>Khela Room</Text>
              <Text style={styles.headerSubtitle}>Sanskrit Puzzles</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {activeGame === 'menu' && (
          <KhelaMenu 
            progress={progress} 
            onSelectGame={setActiveGame} 
            onResetProgress={handleResetProgress} 
          />
        )}

        {activeGame === 'wordChain' && (
          <WordChain 
            progress={progress} 
            onBack={() => setActiveGame('menu')} 
            onUpdateProgress={handleUpdateProgress} 
          />
        )}

        {activeGame === 'guessImage' && (
          <GuessImage 
            progress={progress} 
            onBack={() => setActiveGame('menu')} 
            onUpdateProgress={handleUpdateProgress} 
          />
        )}

        {activeGame === 'completeSentence' && (
          <CompleteSentence 
            progress={progress} 
            onBack={() => setActiveGame('menu')} 
            onUpdateProgress={handleUpdateProgress} 
          />
        )}
      </View>
    </View>
  );
}


// ==========================================
// MAIN APP NAVIGATOR
// ==========================================
function MainNavigator() {
  const { theme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <>
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.bgLight} 
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textMuted,
            tabBarStyle: styles.tabBar,
            tabBarBackground: () => (
              <BlurView intensity={98} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            ),
            tabBarLabelStyle: {
              fontWeight: '700',
              fontSize: 11, // Slightly reduced to fit 4 tabs nicely
              marginBottom: 5,
            }
          }}
        >
          <Tab.Screen 
            name="Anuvadak" 
            component={TranslatorScreen} 
            options={{ tabBarIcon: ({ color }) => <ArrowRightLeft size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Granthalaya" 
            component={LibraryScreen} 
            options={{ tabBarIcon: ({ color }) => <BookOpen size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Gurukul" 
            component={VideoLessonsScreen} 
            options={{ tabBarIcon: ({ color }) => <PlayCircle size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Khela" 
            component={GameScreen} 
            options={{ tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
}

// ==========================================
// DYNAMIC STYLESHEET
// ==========================================
const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgLight,
    paddingTop: 50, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 14,
    resizeMode: 'cover',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.textDark,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textDark,
    letterSpacing: -0.5,
  },
  
  // Translator Styles
  translationCard: {
    backgroundColor: theme.surface,
    borderRadius: 32,
    padding: 24,
    minHeight: 220,
    shadowColor: theme.isDark ? '#000' : theme.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: theme.isDark ? 0.3 : 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.isDark ? theme.border : 'rgba(0,0,0,0.03)',
  },
  outputCard: {
    borderWidth: 0,
    shadowOpacity: theme.isDark ? 0.5 : 0.15,
    shadowColor: '#000',
  },
  langHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  langText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.textDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    color: theme.textDark,
    textAlignVertical: 'top',
    fontWeight: '500',
  },
  outputText: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: theme.isDark ? theme.bgLight : 'rgba(0,0,0,0.03)',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: -24,
    zIndex: 10,
    elevation: 10,
  },
  swapBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.isDark ? '#000' : theme.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  // Library Styles
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: 24,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.textDark,
    fontWeight: '500',
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  bookCard: {
    width: 150,
    marginRight: 20,
  },
  bookCover: {
    height: 210,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.isDark ? '#000' : theme.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: theme.isDark ? 0.4 : 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  bookTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '800',
    color: theme.textDark,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 4,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.2 : 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  listIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textDark,
  },
  listSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textMuted,
    marginTop: 4,
  },

  // Video Styles
  featuredVideo: {
    backgroundColor: theme.surface,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: theme.isDark ? 0.3 : 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  videoThumbnail: {
    height: 220,
    backgroundColor: theme.isDark ? '#27272A' : '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonGlass: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  videoInfo: {
    padding: 24,
  },
  videoBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textDark,
    letterSpacing: -0.3,
  },
  videoSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 8,
  },
  videoListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.02,
    shadowRadius: 8,
  },
  smallThumbnail: {
    width: 110,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  // Game Styles
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.primaryLight,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.isDark ? '#FFFFFF' : theme.primaryDark,
  },
  questionCard: {
    backgroundColor: theme.surface,
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: theme.isDark ? 0.3 : 0.06,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  questionPrompt: {
    fontSize: 16,
    color: theme.textMuted,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionWord: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.primary,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  optionBtn: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textDark,
  },
  resultCard: {
    backgroundColor: theme.surface,
    padding: 40,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: theme.isDark ? 0.3 : 0.06,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.textDark,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: theme.textMuted,
    fontWeight: '600',
    marginBottom: 32,
  },
  playAgainBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: theme.isDark ? '#000' : theme.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  playAgainText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },

  // Navigation Bar Styles
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 25,
    paddingTop: 15,
  }
});