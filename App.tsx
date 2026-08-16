import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, Dimensions, useColorScheme, Image,
  Modal, Linking, Platform, ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  ArrowRightLeft, BookOpen, PlayCircle, 
  Copy, Search, Play, BookText, Sparkles, Sun, Moon, Gamepad2, Trophy,
  X, ExternalLink, Clock, Download
} from 'lucide-react-native';

import KhelaMenu from './components/khela/KhelaMenu';
import WordChain from './components/khela/WordChain';
import GuessImage from './components/khela/GuessImage';
import CompleteSentence from './components/khela/CompleteSentence';
import { GameProgress, INITIAL_PROGRESS, loadProgress, saveProgress } from './components/khela/khelaState';
import videoData from './data/videos.json';
import bookData from './data/books.json';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  level: string;
  isFeatured?: boolean;
  description: string;
}

interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  driveUrl: string;
  pages: string;
  fileType: string;
  colors: [string, string];
  isFeatured?: boolean;
  description: string;
}



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
// MODULE 1: ANUVADAK (TRANSLATOR - SARVAM.AI)
// ==========================================
interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en-IN', name: 'English', nativeName: 'English' },
  { code: 'sa-IN', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
];

const SARVAM_API_KEY = 'sk_d42jxzg7_TjLhFIBpwBAX9YyDSFRGSh0u';
const SARVAM_URL = 'https://api.sarvam.ai/translate';

async function translateWithSarvam(
  text: string,
  sourceCode: string,
  targetCode: string
): Promise<string> {
  if (!text.trim()) return '';
  try {
    const res = await fetch(SARVAM_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text.trim(),
        source_language_code: sourceCode,
        target_language_code: targetCode,
        model: 'sarvam-translate:v1'
      })
    });
    const data = await res.json();
    if (data && data.translated_text) {
      return data.translated_text;
    }
    return '';
  } catch (err) {
    console.error('Sarvam Translation Error:', err);
    return '';
  }
}

function TranslatorScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);
  
  const [sourceLangCode, setSourceLangCode] = useState<string>('en-IN');
  const [targetLangCode, setTargetLangCode] = useState<string>('sa-IN');
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const sourceLang = LANGUAGES.find(l => l.code === sourceLangCode) || LANGUAGES[0];
  const targetLang = LANGUAGES.find(l => l.code === targetLangCode) || LANGUAGES[1];

  // Debounced translation effect using Sarvam.ai
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText('');
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    const timer = setTimeout(async () => {
      const result = await translateWithSarvam(inputText, sourceLangCode, targetLangCode);
      setTranslatedText(result);
      setIsTranslating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [inputText, sourceLangCode, targetLangCode]);

  const swapLanguages = () => {
    const oldSource = sourceLangCode;
    const oldTarget = targetLangCode;
    setSourceLangCode(oldTarget);
    setTargetLangCode(oldSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (translatedText) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Anuvadak</Text>
            <Text style={styles.headerSubtitle}>Sarvam AI Neural Translator</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Source Language Selection Pills */}
        <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: theme.textMuted }]}>
          From Language
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = sourceLangCode === lang.code;
            return (
              <TouchableOpacity
                key={`src-${lang.code}`}
                onPress={() => {
                  if (lang.code === targetLangCode) {
                    setTargetLangCode(sourceLangCode);
                  }
                  setSourceLangCode(lang.code);
                }}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.activeCategoryChipText
                ]}>
                  {lang.name} ({lang.nativeName})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Source Text Card */}
        <View style={styles.translationCard}>
          <View style={styles.langHeader}>
            <Text style={styles.langText}>{sourceLang.name} ({sourceLang.nativeName})</Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText('')}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.textInput}
            placeholder={`Type text in ${sourceLang.name} to translate...`}
            placeholderTextColor={theme.textMuted}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
        </View>

        {/* Swap Languages Button */}
        <View style={styles.swapContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={swapLanguages}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.swapBtn}>
              <ArrowRightLeft size={22} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Target Language Selection Pills */}
        <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: theme.textMuted }]}>
          To Language
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = targetLangCode === lang.code;
            return (
              <TouchableOpacity
                key={`tgt-${lang.code}`}
                onPress={() => {
                  if (lang.code === sourceLangCode) {
                    setSourceLangCode(targetLangCode);
                  }
                  setTargetLangCode(lang.code);
                }}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.activeCategoryChipText
                ]}>
                  {lang.name} ({lang.nativeName})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Target Translation Output Card */}
        <LinearGradient
          colors={['#115E59', '#042F2E']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.translationCard, styles.outputCard]}
        >
          <View style={styles.langHeader}>
            <Text style={[styles.langText, { color: '#CCFBF1' }]}>
              {targetLang.name} ({targetLang.nativeName})
            </Text>
            {isTranslating && (
              <ActivityIndicator size="small" color="#CCFBF1" />
            )}
          </View>

          <Text style={[styles.outputText, { color: '#FFFFFF' }]}>
            {inputText.trim() 
              ? (isTranslating && !translatedText ? 'Translating via Sarvam AI...' : translatedText || 'Translating...')
              : `Translation in ${targetLang.name} will appear here when you type...`
            }
          </Text>

          <View style={styles.outputCardFooter}>
            <View style={styles.sarvamBadge}>
              <Sparkles size={13} color="#CCFBF1" style={{ marginRight: 5 }} />
              <Text style={styles.sarvamBadgeText}>Sarvam.ai</Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.copyButton, 
                copied && styles.copyButtonActive,
                !translatedText.trim() && { opacity: 0.5 }
              ]}
              onPress={handleCopy}
              disabled={!translatedText.trim()}
              activeOpacity={0.8}
            >
              <Copy size={14} color={copied ? '#042F2E' : '#CCFBF1'} style={{ marginRight: 6 }} />
              <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
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
function LibraryScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);

  const categories = ['All', 'Grammar', 'Scriptures', 'Chants'];

  const booksList = bookData as BookItem[];

  const filteredBooks = booksList.filter((book) => {
    const matchesCategory = selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openBookModal = (book: BookItem) => {
    setActiveBook(book);
  };

  const closeBookModal = () => {
    setActiveBook(null);
  };

  const handleOpenDrive = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Granthalaya</Text>
            <Text style={styles.headerSubtitle}>Sacred Texts & PDF Library</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          {theme.isDark ? <Sun size={24} color={theme.textDark} /> : <Moon size={24} color={theme.textDark} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={20} color={theme.textMuted} />
        <TextInput 
          placeholder="Search books, authors, topics..." 
          style={styles.searchInput} 
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.activeCategoryChipText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Readings Section */}
        {selectedCategory === 'All' && searchQuery === '' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Books</Text>
              <Sparkles size={18} color={theme.primary} />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {booksList.map((book) => (
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  key={book.id} 
                  style={styles.bookCard}
                  onPress={() => openBookModal(book)}
                >
                  <LinearGradient colors={book.colors as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bookCover}>
                    <BookText size={44} color="#FFF" style={{ opacity: 0.9 }} />
                    <View style={styles.bookCoverBadge}>
                      <Text style={styles.bookCoverBadgeText}>{book.category}</Text>
                    </View>
                  </LinearGradient>
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* All / Filtered Books Section */}
        <Text style={[styles.sectionTitle, { marginTop: selectedCategory === 'All' && searchQuery === '' ? 28 : 8, marginBottom: 14 }]}>
          {searchQuery ? `Search Results (${filteredBooks.length})` : selectedCategory === 'All' ? 'Granthalaya Collection' : `${selectedCategory} Books`}
        </Text>

        {filteredBooks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <BookOpen size={48} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyStateTitle}>No Books Found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your search or category filter.</Text>
          </View>
        ) : (
          filteredBooks.map((book) => (
            <TouchableOpacity 
              activeOpacity={0.8} 
              key={book.id} 
              style={styles.listCard}
              onPress={() => openBookModal(book)}
            >
              <LinearGradient colors={book.colors as [string, string]} style={styles.bookListCoverMini}>
                <BookOpen size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.listInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.levelTag}>{book.category}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.categoryTag}>{book.pages}</Text>
                </View>
                <Text style={styles.listTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.listSubtitle} numberOfLines={1}>{book.author}</Text>
              </View>
              <View style={styles.readBadgeBtn}>
                <Text style={styles.readBadgeText}>READ</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Book Reader Modal */}
      <Modal
        visible={!!activeBook}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBookModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeBook && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryBadgeText}>{activeBook.category}</Text>
                    </View>
                    <Text style={styles.modalLevelText}>{activeBook.pages}</Text>
                  </View>
                  <TouchableOpacity onPress={closeBookModal} style={styles.closeButton}>
                    <X size={22} color={theme.textDark} />
                  </TouchableOpacity>
                </View>

                {/* Book Cover Header */}
                <LinearGradient 
                  colors={activeBook.colors as [string, string]} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }} 
                  style={styles.modalBookCover}
                >
                  <BookText size={56} color="#FFF" style={{ opacity: 0.95 }} />
                  <Text style={styles.modalBookCoverTitle} numberOfLines={2}>{activeBook.title}</Text>
                  <Text style={styles.modalBookCoverAuthor}>{activeBook.author}</Text>
                </LinearGradient>

                <ScrollView style={{ marginTop: 16, maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.descriptionHeader}>About this Edition</Text>
                  <Text style={styles.descriptionText}>{activeBook.description}</Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.metaBadgeText, { color: theme.textMuted, marginLeft: 0 }]}>
                      Format: {activeBook.fileType} • Hosted on Supabase Storage
                    </Text>
                  </View>
                </ScrollView>

                {/* Actions */}
                <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                  <TouchableOpacity 
                    style={[styles.openYouTubeBtn, { flex: 1, backgroundColor: theme.primary }]}
                    onPress={() => handleOpenDrive(activeBook.driveUrl)}
                  >
                    <ExternalLink size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.openYouTubeBtnText}>Read Book</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.openYouTubeBtn, { flex: 1, backgroundColor: theme.isDark ? '#27272A' : '#E2E8F0' }]}
                    onPress={() => handleOpenDrive(activeBook.driveUrl)}
                  >
                    <Download size={18} color={theme.isDark ? '#FFF' : theme.textDark} style={{ marginRight: 8 }} />
                    <Text style={[styles.openYouTubeBtnText, { color: theme.isDark ? '#FFF' : theme.textDark }]}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


// ==========================================
// MODULE 3: GURUKUL (VIDEO LESSONS)
// ==========================================
function VideoLessonsScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const categories = ['All', 'Pronunciation', 'Grammar', 'Conversation', 'Chanting'];

  const videosList = videoData as VideoItem[];
  const featuredVideo = videosList.find((v) => v.isFeatured) || videosList[0];

  const filteredVideos = videosList.filter((video) => {
    if (selectedCategory === 'All') return true;
    return video.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const openVideo = (video: VideoItem) => {
    setActiveVideo(video);
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  const handleOpenYouTube = (youtubeId: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
  };

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
        {/* Featured Video Card */}
        {featuredVideo && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.featuredVideo}
            onPress={() => openVideo(featuredVideo)}
          >
            <View style={styles.videoThumbnailContainer}>
              <Image 
                source={{ uri: `https://img.youtube.com/vi/${featuredVideo.youtubeId}/hqdefault.jpg` }}
                style={styles.featuredThumbnailImage}
                resizeMode="cover"
              />
              <View style={styles.videoOverlayGradient}>
                <BlurView intensity={40} tint={theme.blurTint} style={styles.playButtonGlass}>
                  <Play size={28} color="#FFF" fill="#FFF" style={{ marginLeft: 4 }} />
                </BlurView>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.videoBadge}>NEW EPISODE • FEATURED</Text>
                <View style={styles.durationChip}>
                  <Clock size={12} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.durationChipText}>{featuredVideo.duration}</Text>
                </View>
              </View>
              <Text style={styles.videoTitle}>{featuredVideo.title}</Text>
              <Text style={styles.videoSubtitle}>{featuredVideo.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Category Filters */}
        <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 14 }]}>Explore Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.activeCategoryChipText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Video List */}
        <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>
          {selectedCategory === 'All' ? 'All Masterclasses' : `${selectedCategory} Videos`}
        </Text>

        {filteredVideos.map((video) => (
          <TouchableOpacity 
            activeOpacity={0.8} 
            key={video.id} 
            style={styles.videoListCard}
            onPress={() => openVideo(video)}
          >
            <View style={styles.smallThumbnailContainer}>
              <Image 
                source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                style={styles.smallThumbnailImage}
                resizeMode="cover"
              />
              <View style={styles.smallPlayOverlay}>
                <PlayCircle size={24} color="#FFF" />
              </View>
            </View>
            <View style={styles.listInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.levelTag}>{video.level}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.categoryTag}>{video.category}</Text>
              </View>
              <Text style={styles.listTitle} numberOfLines={2}>{video.title}</Text>
              <Text style={styles.listSubtitle}>{video.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Interactive Video Player Modal */}
      <Modal
        visible={!!activeVideo}
        animationType="slide"
        transparent={true}
        onRequestClose={closeVideo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeVideo && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryBadgeText}>{activeVideo.category}</Text>
                    </View>
                    <Text style={styles.modalLevelText}>{activeVideo.level}</Text>
                  </View>
                  <TouchableOpacity onPress={closeVideo} style={styles.closeButton}>
                    <X size={22} color={theme.textDark} />
                  </TouchableOpacity>
                </View>

                {/* Embedded Video Player */}
                <View style={styles.playerContainer}>
                  {Platform.OS === 'web' ? (
                    React.createElement('iframe', {
                      width: '100%',
                      height: '220',
                      src: `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`,
                      title: activeVideo.title,
                      frameBorder: '0',
                      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                      allowFullScreen: true,
                      style: { borderRadius: 16, border: 'none' }
                    })
                  ) : (
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      style={styles.nativePlayerPlaceholder}
                      onPress={() => handleOpenYouTube(activeVideo.youtubeId)}
                    >
                      <Image 
                        source={{ uri: `https://img.youtube.com/vi/${activeVideo.youtubeId}/hqdefault.jpg` }}
                        style={styles.modalThumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.nativePlayerOverlay}>
                        <PlayCircle size={56} color="#FFF" />
                        <Text style={styles.playNowText}>Tap to Watch on YouTube</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={{ marginTop: 16, maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>{activeVideo.title}</Text>
                  <Text style={styles.modalSubtitle}>{activeVideo.subtitle}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Clock size={14} color={theme.primary} />
                      <Text style={styles.metaBadgeText}>{activeVideo.duration}</Text>
                    </View>
                  </View>

                  <Text style={styles.descriptionHeader}>About this Masterclass</Text>
                  <Text style={styles.descriptionText}>{activeVideo.description}</Text>
                </ScrollView>

                <TouchableOpacity 
                  style={styles.openYouTubeBtn}
                  onPress={() => handleOpenYouTube(activeVideo.youtubeId)}
                >
                  <ExternalLink size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.openYouTubeBtnText}>Open in YouTube App</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  outputCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  sarvamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sarvamBadgeText: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(204,251,241,0.25)',
  },
  copyButtonActive: {
    backgroundColor: '#CCFBF1',
    borderColor: '#CCFBF1',
  },
  copyButtonText: {
    color: '#CCFBF1',
    fontSize: 13,
    fontWeight: '700',
  },
  copyButtonTextActive: {
    color: '#042F2E',
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
    position: 'relative',
    overflow: 'hidden',
  },
  bookCoverBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bookCoverBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
  bookListCoverMini: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  readBadgeBtn: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  readBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 0.5,
  },
  modalBookCover: {
    height: 180,
    width: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBookCoverTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  modalBookCoverAuthor: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textDark,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 4,
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
  videoThumbnailContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.isDark ? '#27272A' : '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredThumbnailImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
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
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeCategoryChip: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
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
  smallThumbnailContainer: {
    width: 110,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  smallThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  smallPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  dotSeparator: {
    fontSize: 11,
    color: theme.textMuted,
    marginHorizontal: 6,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
  },
  // Video Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCategoryBadge: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  modalCategoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  modalLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: theme.isDark ? '#27272A' : '#F1F5F9',
  },
  playerContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  nativePlayerPlaceholder: {
    width: '100%',
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  nativePlayerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textDark,
    marginTop: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
    marginLeft: 6,
  },
  descriptionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textMuted,
  },
  openYouTubeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 16,
  },
  openYouTubeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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