import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit,
  Flame,
  History,
  Lock,
  Mic,
  Play,
  Plus,
  Save,
  Search,
  Shuffle,
  Square,
  Star,
  Trash2,
  Volume2,
  X,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createPronunciationItem,
  createPronunciationSubmission,
  getPronunciationItemDeterministicId,
  importPronunciationSeedItems,
  subscribePronunciationItems,
  uploadPronunciationRecording,
  subscribeDailyQuizzes,
  subscribeShoutouts,
  submitQuizAnswer,
  type PronunciationItem,
  type PronunciationItemType,
  type PronunciationLanguage,
  type DailyQuiz,
  type Shoutout,
} from '../lib/pronunciation';
import { PRONUNCIATION_SEED } from '../data/pronunciationSeed';
import { loadPronunciationSeedFile, type SeedFileEntry } from '../data/pronunciationSeedLoader';
import { LESSONS, isLessonUnlocked, type LessonContent as StaticLessonContent } from '../data/lessonContent';
import { PremiumPaymentModal } from './PremiumPaymentModal';
import { InstructorPracticeAdmin } from './InstructorPracticeAdmin';
import { 
  subscribeLessons,
  subscribeVocabulary,
  subscribePracticeSentences,
  subscribeIntroductionSections,
  createOrUpdateLesson,
  createVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  createPracticeSentence,
  updatePracticeSentence,
  deletePracticeSentence,
  type LessonContent,
  type VocabularyItem,
  type PracticeSentence,
  type IntroductionSection
} from '../lib/lessonManagement';
import { updatePronunciationItem, deletePronunciationItem } from '../lib/pronunciation';
import { subscribeUserPurchases, type UserPurchases } from '../lib/payments';
import { AILanguageChat } from './AILanguageChat';

interface PronunciationPracticeProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
}

type Feedback = 'idle' | 'recording' | 'submitted' | 'error';

type PracticeStats = {
  // Keyed by itemId
  items: Record<
    string,
    {
      plays: number;
      recordings: number;
      submissions: number;
      lastPracticedAt: number;
    }
  >;
  // Keyed by YYYY-MM-DD in local time
  days: Record<string, number>;
};

const PRACTICE_STATS_KEY = 'lingualive_pronunciation_practice_stats_v1';
const DICT_CACHE_KEY = 'lingualive_dictionary_cache_v2';
const LESSON_STATE_KEY = 'lingualive_pronunciation_lessons_v1';
const PREMIUM_ACCESS_KEY = 'lingualive_premium_access_v1';
const LESSON_SIZE = 50;
const LESSON_COMPLETE_MIN = 10;

type DictionaryResult = {
  language: PronunciationLanguage;
  word: string;
  phonetic?: string;
  definitions: string[];
  synonyms: string[];
  antonyms: string[];
};

type DictionaryCache = Record<
  string,
  {
    fetchedAt: number;
    result: DictionaryResult;
  }
>;

type LessonState = Record<string, number>; // key -> selected lesson index (1-based)

function lessonKey(params: { language: PronunciationLanguage; type: PronunciationItemType }): string {
  return `${params.language}:${params.type}`;
}

function getLessonItems(items: PronunciationItem[], lessonIndex1: number): PronunciationItem[] {
  const i = Math.max(1, lessonIndex1) - 1;
  const start = i * LESSON_SIZE;
  return items.slice(start, start + LESSON_SIZE);
}

function dayKeyLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysLocal(d: Date, deltaDays: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

function stringHashInt(input: string): number {
  // small deterministic hash (djb2-ish)
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  // force unsigned 32-bit
  return h >>> 0;
}

function computeStreakFromDays(days: Record<string, number>, today: Date): number {
  let streak = 0;
  // Walk backwards day by day from today.
  for (let offset = 0; offset < 3650; offset++) {
    const k = dayKeyLocal(addDaysLocal(today, -offset));
    if ((days[k] ?? 0) > 0) streak += 1;
    else break;
  }
  return streak;
}

function languageCode(lang: PronunciationLanguage): string {
  // bn-IN is more commonly available in Windows/Edge voices than bn-BD.
  if (lang === 'Bengali') return 'bn-IN';
  if (lang === 'Hindi') return 'hi-IN';
  return 'en-US';
}

function transliterateDevanagariToLatin(input: string): string {
  // Very lightweight approximate transliteration for guidance only.
  const map: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga', 'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
    'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na', 'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
    'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma', 'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', '्': '', 'ं': 'n', 'ः': 'h',
    '‍ि': 'i',
  };
  let out = '';
  for (const ch of input) out += map[ch] ?? ch;
  return out;
}

function transliterateBengaliToLatin(input: string): string {
  // Lightweight guidance transliteration, not perfect.
  const map: Record<string, string> = {
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'y', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'য়': 'y', 'য়': 'y', 'ং': 'n', 'ঃ': 'h', 'ঁ': 'n',
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': '',
  };
  let out = '';
  for (const ch of input) out += map[ch] ?? ch;
  return out;
}

function pronounceGuide(item: PronunciationItem | null, language: PronunciationLanguage): string | undefined {
  if (!item) return undefined;
  const roman = (item.romanization ?? '').trim();
  if (roman) return roman;
  if (language === 'Hindi') return transliterateDevanagariToLatin(item.targetText || '');
  if (language === 'Bengali') return transliterateBengaliToLatin(item.targetText || '');
  return undefined;
}

function studentNameFromUser(user: { displayName: string | null; email: string | null } | null): string {
  if (!user) return 'Student';
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.email) return user.email.split('@')[0] || 'Student';
  return 'Student';
}

export function PronunciationPractice({ onNavigate }: PronunciationPracticeProps) {
  const { user, role, profileLoading } = useAuth();
  const isTeacher = role === 'teacher' || role === 'admin';

  console.log('👤 User:', user?.email, '| Role:', role, '| isTeacher:', isTeacher, '| ProfileLoading:', profileLoading);

  const ttsVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const ttsVoicesReadyRef = useRef(false);
  const bengaliVoiceWarnedRef = useRef(false);
  const autoSpokenItemRef = useRef<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState<PronunciationLanguage>('Bengali');
  const [selectedType, setSelectedType] = useState<PronunciationItemType>('word');
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<PronunciationItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  // Enhanced practice modes
  const [practiceMode, setPracticeMode] = useState<'browse' | 'flashcards' | 'quiz' | 'listen'>('browse');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({});  // 0-5 stars per item
  const [listenModeAuto, setListenModeAuto] = useState(false);

  const [showAllSavedItems, setShowAllSavedItems] = useState(false);
  const [showAllPracticeItems, setShowAllPracticeItems] = useState(false);

  const [practiceStats, setPracticeStats] = useState<PracticeStats>(() => ({ items: {}, days: {} }));

  const [lessonState, setLessonState] = useState<LessonState>(() => ({}));
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => []);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [purchasedLessons, setPurchasedLessons] = useState<number[]>([]);
  
  // Detect if device is mobile (voice pronunciation works better on mobile)
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });
  const [hasAIBotAccess, setHasAIBotAccess] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'lesson' | 'aibot' | 'bulk'>('bulk');
  const [paymentLessonId, setPaymentLessonId] = useState<number | undefined>(undefined);
  const [paymentLessonTitle, setPaymentLessonTitle] = useState<string | undefined>(undefined);

  const [loadedSeedFileItems, setLoadedSeedFileItems] = useState<SeedFileEntry[]>([]);
  const [seedFileLoaded, setSeedFileLoaded] = useState(false);

  const [dictionaryQuery, setDictionaryQuery] = useState('');
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictListening, setDictListening] = useState(false);

  const speechRecRef = useRef<any | null>(null);

  const [ttsError, setTtsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('idle');

  const [newTargetText, setNewTargetText] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newRomanization, setNewRomanization] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const recordingItemIdRef = useRef<string | null>(null);
  const recordingSectionRef = useRef<HTMLDivElement | null>(null);

  // Quiz and Shoutout states
  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuiz[]>([]);
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Firebase lesson content states
  const [firebaseLessons, setFirebaseLessons] = useState<LessonContent[]>([]);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [practiceSentences, setPracticeSentences] = useState<PracticeSentence[]>([]);
  const [introductionSections, setIntroductionSections] = useState<IntroductionSection[]>([]);

  // Inline editing states
  const [editingGrammar, setEditingGrammar] = useState(false);
  const [editingCultural, setEditingCultural] = useState(false);
  const [editGrammarText, setEditGrammarText] = useState('');
  const [editCulturalText, setEditCulturalText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<{ targetText: string; english: string; romanization: string }>({
    targetText: '',
    english: '',
    romanization: ''
  });
  
  // Vocabulary editing states
  const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
  const [editVocabData, setEditVocabData] = useState({
    word: '',
    meaning: '',
    romanization: '',
    partOfSpeech: '',
    exampleSentence: ''
  });
  const [showAddVocab, setShowAddVocab] = useState(false);
  const [newVocabData, setNewVocabData] = useState({
    word: '',
    meaning: '',
    romanization: '',
    partOfSpeech: '',
    exampleSentence: ''
  });

  // Practice sentence editing states
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  const [editSentenceData, setEditSentenceData] = useState({
    sentence: '',
    translation: '',
    romanization: ''
  });
  const [showAddSentence, setShowAddSentence] = useState(false);
  const [newSentenceData, setNewSentenceData] = useState({
    sentence: '',
    translation: '',
    romanization: ''
  });

  // Daily Challenge editing
  const [editingDailyChallenge, setEditingDailyChallenge] = useState(false);

  useEffect(() => {
    const unsub = subscribePronunciationItems(
      { language: selectedLanguage, type: selectedType },
      (list) => {
        console.log('📝 Items loaded:', list.length, 'items for', selectedLanguage, selectedType);
        setItems(list);
        // Auto-populate content on first load if database is empty (only for teachers)
        if (list.length === 0 && isTeacher && !seeding && user) {
          console.log('Database empty - auto-populating content...');
          void addInitialContent();
        }
      },
      () => setItems([])
    );
    return () => unsub();
  }, [selectedLanguage, selectedType, isTeacher, user]);

  // Subscribe to daily quizzes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsub = subscribeDailyQuizzes(today, setDailyQuizzes);
    return () => unsub();
  }, []);

  // Subscribe to shoutouts
  useEffect(() => {
    const unsub = subscribeShoutouts(setShoutouts);
    return () => unsub();
  }, []);

  // Subscribe to Firebase lesson content
  useEffect(() => {
    console.log('[PronunciationPractice] Setting up Firebase subscriptions for language:', selectedLanguage);
    
    const unsubLessons = subscribeLessons(selectedLanguage, setFirebaseLessons, (err) => {
      console.error('[PronunciationPractice] Error in lessons subscription:', err);
    });
    
    const unsubVocab = subscribeVocabulary(selectedLanguage, (items) => {
      console.log('[PronunciationPractice] Received vocabulary items:', items.length);
      setVocabularyItems(items);
    }, (err) => {
      console.error('[PronunciationPractice] Error in vocabulary subscription:', err);
    });
    
    const unsubSentences = subscribePracticeSentences(selectedLanguage, (items) => {
      console.log('[PronunciationPractice] Received practice sentences:', items.length);
      setPracticeSentences(items);
    }, (err) => {
      console.error('[PronunciationPractice] Error in sentences subscription:', err);
    });
    
    const unsubIntro = subscribeIntroductionSections(selectedLanguage, setIntroductionSections, (err) => {
      console.error('[PronunciationPractice] Error in intro sections subscription:', err);
    });
    
    return () => {
      console.log('[PronunciationPractice] Cleaning up Firebase subscriptions');
      unsubLessons();
      unsubVocab();
      unsubSentences();
      unsubIntro();
    };
  }, [selectedLanguage]);

  // Subscribe to user purchases from Firebase
  useEffect(() => {
    if (!user) {
      setPurchasedLessons([]);
      setHasPremiumAccess(false);
      setHasAIBotAccess(false);
      return;
    }

    console.log('[PronunciationPractice] Subscribing to user purchases for:', user.uid);
    
    const unsubscribe = subscribeUserPurchases(user.uid, (purchases) => {
      if (purchases) {
        console.log('[PronunciationPractice] User purchases loaded:', purchases);
        setPurchasedLessons(purchases.purchasedLessons || []);
        setHasPremiumAccess(purchases.hasBulkPremium || false);
        setHasAIBotAccess(purchases.hasAIBotAccess || false);
      } else {
        console.log('[PronunciationPractice] No purchases found for user');
        setPurchasedLessons([]);
        setHasPremiumAccess(false);
        setHasAIBotAccess(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Update mobile detection on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSeedFileLoaded(false);
    setLoadedSeedFileItems([]);

    void (async () => {
      // Only words/sentences are in the big JSON seed.
      const loaded = await loadPronunciationSeedFile({ language: selectedLanguage, type: selectedType });
      if (cancelled) return;
      setLoadedSeedFileItems(loaded);
      setSeedFileLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedLanguage, selectedType]);

  const rawSeedForView = useMemo(() => {
    const builtIn = PRONUNCIATION_SEED.filter((s) => s.language === selectedLanguage && s.type === selectedType);
    // For words/sentences prefer the externally loaded seed file if present.
    if (selectedType !== 'letter' && loadedSeedFileItems.length > 0) {
      return loadedSeedFileItems.map((x) => ({
        language: selectedLanguage,
        type: selectedType,
        targetText: x.targetText,
        english: x.english,
        romanization: x.romanization,
      }));
    }
    return builtIn;
  }, [loadedSeedFileItems, selectedLanguage, selectedType]);

  const seedItemsForView = useMemo<PronunciationItem[]>(() => {
    return rawSeedForView.map((s) => {
      const id = getPronunciationItemDeterministicId({
        language: s.language,
        type: s.type,
        targetText: s.targetText,
      });
      return {
        id,
        language: s.language,
        type: s.type,
        targetText: s.targetText,
        english: s.english,
        romanization: s.romanization,
        createdByUid: 'seed',
      };
    });
  }, [rawSeedForView]);

  const dedupeById = (list: PronunciationItem[]): PronunciationItem[] => {
    const map = new Map<string, PronunciationItem>();
    for (const it of list) {
      if (!it?.id) continue;
      const prev = map.get(it.id);
      if (!prev) {
        map.set(it.id, it);
        continue;
      }
      // Prefer entries that have english/romanization filled.
      map.set(it.id, {
        ...prev,
        english: prev.english || it.english,
        romanization: prev.romanization || it.romanization,
      });
    }
    return Array.from(map.values());
  };

  const effectiveItems = useMemo(() => {
    // Show only Firebase items for both teachers and students
    // Seed items are no longer used
    const combined = items;
    
    const base = dedupeById(combined);
    if (selectedType !== 'word') return base;
    // Words should be single-token (no spaces). Sentences cover phrases.
    return base.filter((it) => !/\s/.test((it.targetText ?? '').trim()));
  }, [items, selectedType]);

  const showingSeedFallback = false; // Seed items removed

  const effectiveItemsSorted = useMemo(() => {
    return [...effectiveItems].sort((a, b) => a.targetText.localeCompare(b.targetText));
  }, [effectiveItems]);

  const totalLessons = useMemo(() => {
    if (selectedType === 'letter') return 0;
    return Math.max(1, Math.ceil(effectiveItemsSorted.length / LESSON_SIZE));
  }, [effectiveItemsSorted.length, selectedType]);

  const unlockedLessonUpTo = useMemo(() => {
    if (selectedType === 'letter') return 1;

    let completedUpTo = 0;
    for (let idx = 1; idx <= totalLessons; idx++) {
      const lessonItems = getLessonItems(effectiveItemsSorted, idx);
      const practicedDistinct = lessonItems.filter((it) => {
        const st = practiceStats.items[it.id];
        return (st?.recordings ?? 0) > 0 || (st?.submissions ?? 0) > 0;
      }).length;
      const required = Math.min(LESSON_COMPLETE_MIN, lessonItems.length);
      const complete = lessonItems.length > 0 && practicedDistinct >= required;
      if (complete) completedUpTo = idx;
      else break;
    }

    return Math.min(totalLessons, completedUpTo + 1);
  }, [effectiveItemsSorted, practiceStats.items, selectedType, totalLessons]);

  useEffect(() => {
    if (selectedType === 'letter') return;
    const next = Math.min(Math.max(1, selectedLessonIndex), unlockedLessonUpTo);
    if (next !== selectedLessonIndex) setSelectedLessonIndex(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedLessonUpTo, selectedType]);

  const lessonItemsForView = useMemo(() => {
    if (selectedType === 'letter') return effectiveItems;
    return getLessonItems(effectiveItemsSorted, selectedLessonIndex);
  }, [effectiveItems, effectiveItemsSorted, selectedLessonIndex, selectedType]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const baseList = q ? effectiveItems : lessonItemsForView;
    const base = !q
      ? baseList
      : baseList.filter((i) => {
          return (
            i.targetText.toLowerCase().includes(q) ||
            (i.english ?? '').toLowerCase().includes(q) ||
            (i.romanization ?? '').toLowerCase().includes(q)
          );
        });

    if (!showOnlySaved) return base;
    return base.filter((i) => savedIds.has(i.id));
  }, [effectiveItems, lessonItemsForView, search, savedIds, showOnlySaved]);

  const savedItemsForView = useMemo(() => {
    if (savedIds.size === 0) return [] as PronunciationItem[];
    const q = search.trim().toLowerCase();
    const base = effectiveItems.filter((i) => savedIds.has(i.id));
    if (!q) return base;
    return base.filter((i) => {
      return (
        i.targetText.toLowerCase().includes(q) ||
        (i.english ?? '').toLowerCase().includes(q) ||
        (i.romanization ?? '').toLowerCase().includes(q)
      );
    });
  }, [effectiveItems, savedIds, search]);

  const selectedItem = useMemo(() => {
    if (filteredItems.length === 0) return null;
    if (!selectedItemId) return filteredItems[0];
    return filteredItems.find((x) => x.id === selectedItemId) ?? filteredItems[0];
  }, [filteredItems, selectedItemId]);

  // Merge Firebase lessons with static lessons - Firebase data takes precedence
  // Filter by selected language
  const mergedLessons = useMemo(() => {
    const lessonsMap = new Map<number, StaticLessonContent>();
    
    // Start with static lessons for the selected language only
    LESSONS.filter(lesson => lesson.language === selectedLanguage).forEach(lesson => {
      lessonsMap.set(lesson.id, lesson);
    });
    
    // Override with Firebase lessons if available
    firebaseLessons.forEach(fbLesson => {
      const existingLesson = lessonsMap.get(fbLesson.lessonNumber) || {} as StaticLessonContent;
      
      // Get vocabulary for this lesson from Firebase
      const lessonVocab = vocabularyItems
        .filter(v => v.lessonNumber === fbLesson.lessonNumber)
        .sort((a, b) => a.order - b.order)
        .map(v => `${v.word} - ${v.meaning} - ${v.romanization || ''}`);
      
      // Get practice sentences for this lesson from Firebase
      const lessonSentences = practiceSentences
        .filter(s => s.lessonNumber === fbLesson.lessonNumber)
        .sort((a, b) => a.order - b.order)
        .map(s => `${s.sentence} - ${s.translation} - ${s.romanization || ''}`);
      
      // Merge Firebase content with static content (Firebase takes priority, but keep both)
      const mergedWords = [...(existingLesson.words || []), ...lessonVocab];
      const mergedSentences = [...(existingLesson.sentences || []), ...lessonSentences];
      
      lessonsMap.set(fbLesson.lessonNumber, {
        id: fbLesson.lessonNumber,
        title: fbLesson.title || existingLesson.title || `Lesson ${fbLesson.lessonNumber}`,
        description: fbLesson.description || existingLesson.description || '',
        category: existingLesson.category || 'Beginner',
        language: existingLesson.language || selectedLanguage,
        words: mergedWords,
        sentences: mergedSentences,
        grammar: fbLesson.grammarNote || existingLesson.grammar,
        culturalNote: fbLesson.culturalInsight || existingLesson.culturalNote,
        quiz: existingLesson.quiz,
        unlockType: existingLesson.unlockType || 'free',
      });
    });
    
    return Array.from(lessonsMap.values()).sort((a, b) => a.id - b.id);
  }, [firebaseLessons, vocabularyItems, practiceSentences, selectedLanguage]);

  const storageKey = useMemo(
    () => `lingualive_pronunciation_saved_${selectedLanguage}_${selectedType}`,
    [selectedLanguage, selectedType]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setSavedIds(new Set());
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setSavedIds(new Set());
        return;
      }
      setSavedIds(new Set(parsed.filter((x) => typeof x === 'string') as string[]));
    } catch {
      setSavedIds(new Set());
    }
  }, [storageKey]);

  useEffect(() => {
    setSelectedItemId(null);
    setSearch('');
    setActionError(null);
    setTtsError(null);
    setFeedback('idle');
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setIsRecording(false);
    setShowOnlySaved(false);
    setDictionaryQuery('');
    setDictError(null);
    setDictResult(null);

    const k = lessonKey({ language: selectedLanguage, type: selectedType });
    setSelectedLessonIndex(lessonState[k] ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, selectedType]);

  useEffect(() => {
    const k = lessonKey({ language: selectedLanguage, type: selectedType });
    setLessonState((prev) => ({ ...prev, [k]: selectedLessonIndex }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLessonIndex]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRACTICE_STATS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return;

      const maybe = parsed as Partial<PracticeStats>;
      const safe: PracticeStats = {
        items: typeof maybe.items === 'object' && maybe.items ? (maybe.items as PracticeStats['items']) : {},
        days: typeof maybe.days === 'object' && maybe.days ? (maybe.days as PracticeStats['days']) : {},
      };
      setPracticeStats(safe);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LESSON_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return;
      setLessonState(parsed as LessonState);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREMIUM_ACCESS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setHasPremiumAccess(data.hasPremium === true);
        setCompletedLessons(Array.isArray(data.completedLessons) ? data.completedLessons : []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PRACTICE_STATS_KEY, JSON.stringify(practiceStats));
    } catch {
      // ignore
    }
  }, [practiceStats]);

  useEffect(() => {
    try {
      localStorage.setItem(LESSON_STATE_KEY, JSON.stringify(lessonState));
    } catch {
      // ignore
    }
  }, [lessonState]);

  useEffect(() => {
    try {
      localStorage.setItem(PREMIUM_ACCESS_KEY, JSON.stringify({
        hasPremium: hasPremiumAccess,
        completedLessons: completedLessons
      }));
    } catch {
      // ignore
    }
  }, [hasPremiumAccess, completedLessons]);

  const loadDictCache = (): DictionaryCache => {
    try {
      const raw = localStorage.getItem(DICT_CACHE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed as DictionaryCache;
    } catch {
      return {};
    }
  };

  const saveDictCache = (cache: DictionaryCache) => {
    try {
      localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // ignore
    }
  };

  const markLessonComplete = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  const normalizeLookup = (raw: string): string => {
    const cleaned = raw
      .trim()
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .trim();
    return cleaned;
  };

  const extractRelatedFromWiktionaryHtml = (html: string, opts: { synonymKeys: string[]; antonymKeys: string[] }) => {
    const out = { synonyms: [] as string[], antonyms: [] as string[] };
    if (!html) return out;
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body;
      if (!text) return out;

      const collectFromHeading = (keys: string[]) => {
        const lowerKeys = keys.map((k) => k.toLowerCase());
        const headlines = Array.from(text.querySelectorAll('.mw-headline')) as HTMLElement[];
        for (const hl of headlines) {
          const t = (hl.textContent || '').trim().toLowerCase();
          if (!t) continue;
          if (!lowerKeys.some((k) => t.includes(k))) continue;

          const heading = hl.closest('h2, h3, h4, h5, h6') as HTMLElement | null;
          if (!heading) continue;

          const items: string[] = [];
          let cur = heading.nextElementSibling as HTMLElement | null;
          while (cur) {
            const tag = cur.tagName.toLowerCase();
            if (tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') break;

            const anchors = Array.from(cur.querySelectorAll('a')) as HTMLAnchorElement[];
            for (const a of anchors) {
              const tx = (a.textContent || '').trim();
              if (!tx) continue;
              // drop UI-only / reference anchors
              if (tx === 'সম্পাদনা' || tx === 'edit') continue;
              items.push(tx);
            }

            // fallback: sometimes related terms appear as plain text separated by commas
            const rawText = (cur.textContent || '').replace(/\[.*?\]/g, '').trim();
            if (rawText) {
              for (const part of rawText.split(/[、,;؛|\/]/g)) {
                const tx = part.trim();
                if (tx.length >= 2 && tx.length <= 40) items.push(tx);
              }
            }

            cur = cur.nextElementSibling as HTMLElement | null;
          }

          return items;
        }
        return [] as string[];
      };

      out.synonyms = collectFromHeading(opts.synonymKeys);
      out.antonyms = collectFromHeading(opts.antonymKeys);
      return out;
    } catch {
      return out;
    }
  };

  const normalizeEnglishWordOnly = (raw: string): string => {
    const cleaned = raw
      .trim()
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .replace(/[^a-zA-Z\-\s']/g, '')
      .trim();
    const first = cleaned.split(/\s+/)[0] ?? '';
    return (first || cleaned).toLowerCase();
  };

  const lookupDictionary = async (wordRaw: string, language: PronunciationLanguage) => {
    const raw = normalizeLookup(wordRaw);
    const normalizedForRequest = language === 'English' ? normalizeEnglishWordOnly(raw) : raw.trim();
    if (!normalizedForRequest) {
      setDictError('Type a word to look up.');
      setDictResult(null);
      return;
    }

    const cache = loadDictCache();
    const cacheKey = `${language}:${normalizedForRequest.toLowerCase()}`;
    const cached = cache[cacheKey];
    const now = Date.now();
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (cached && now - cached.fetchedAt < maxAgeMs) {
      setDictError(null);
      setDictResult(cached.result);
      return;
    }

    setDictLoading(true);
    setDictError(null);
    try {
      const definitions: string[] = [];
      const synonyms: string[] = [];
      const antonyms: string[] = [];
      let phonetic: string | undefined;

      if (language === 'English' || language === 'Hindi') {
        const langCode = language === 'English' ? 'en' : 'hi';
        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${encodeURIComponent(normalizedForRequest)}`
        );
        
        if (!res.ok) {
          if (res.status === 404) {
            setDictResult(null);
            setDictError('No definition found for this word. Try a different word.');
          } else {
            setDictResult(null);
            setDictError(`Unable to fetch definition (Error ${res.status}). Please try again.`);
          }
          setDictLoading(false);
          return;
        }
        
        const json = (await res.json()) as unknown;
        if (!Array.isArray(json) || json.length === 0) {
          setDictResult(null);
          setDictError('No definition found for this word.');
          setDictLoading(false);
          return;
        }

        const entry = json[0] as any;
        phonetic = typeof entry?.phonetic === 'string' ? entry.phonetic : undefined;
        const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];

        for (const m of meanings) {
          const defs = Array.isArray(m?.definitions) ? m.definitions : [];
          for (const d of defs) {
            if (typeof d?.definition === 'string' && d.definition.trim()) definitions.push(d.definition.trim());
            const syns = Array.isArray(d?.synonyms) ? d.synonyms : [];
            for (const s of syns) if (typeof s === 'string' && s.trim()) synonyms.push(s.trim());

            const ants = Array.isArray(d?.antonyms) ? d.antonyms : [];
            for (const a of ants) if (typeof a === 'string' && a.trim()) antonyms.push(a.trim());
          }
          const mSyns = Array.isArray(m?.synonyms) ? m.synonyms : [];
          for (const s of mSyns) if (typeof s === 'string' && s.trim()) synonyms.push(s.trim());

          const mAnts = Array.isArray(m?.antonyms) ? m.antonyms : [];
          for (const a of mAnts) if (typeof a === 'string' && a.trim()) antonyms.push(a.trim());
        }
      } else {
        // Bengali: use Wiktionary REST API for definitions + MediaWiki parse HTML for synonyms/antonyms.
        const [defRes, parseRes] = await Promise.allSettled([
          fetch(`https://bn.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(normalizedForRequest)}`),
          fetch(
            `https://bn.wiktionary.org/w/api.php?action=parse&format=json&origin=*&page=${encodeURIComponent(normalizedForRequest)}&prop=text&formatversion=2`
          ),
        ]);

        if (defRes.status === 'fulfilled') {
          const res = defRes.value;
          if (res.ok) {
            const json = (await res.json()) as any;
            const entries = json?.bn;
            if (Array.isArray(entries)) {
              for (const e of entries) {
                const defs = Array.isArray(e?.definitions) ? e.definitions : [];
                for (const d of defs) {
                  if (typeof d === 'string' && d.trim()) definitions.push(d.trim());
                }
              }
            }
          }
        }

        if (parseRes.status === 'fulfilled') {
          const res = parseRes.value;
          if (res.ok) {
            const json = (await res.json()) as any;
            const html = typeof json?.parse?.text === 'string' ? json.parse.text : '';
            const related = extractRelatedFromWiktionaryHtml(html, {
              synonymKeys: ['সমার্থক', 'সমার্থক শব্দ', 'পর্যায়বাচী', 'synonym'],
              antonymKeys: ['বিপরীত', 'বিপরীতার্থক', 'বিপরীত শব্দ', 'antonym'],
            });
            for (const s of related.synonyms) if (typeof s === 'string' && s.trim()) synonyms.push(s.trim());
            for (const a of related.antonyms) if (typeof a === 'string' && a.trim()) antonyms.push(a.trim());
          }
        }

        if (definitions.length === 0 && synonyms.length === 0 && antonyms.length === 0) {
          setDictResult(null);
          setDictError('No definition found for this word in Wiktionary.');
          setDictLoading(false);
          return;
        }
      }

      const finalResult: DictionaryResult = {
        language,
        word: normalizedForRequest,
        phonetic,
        definitions: Array.from(new Set(definitions)).slice(0, 8),
        synonyms: Array.from(new Set(synonyms.map((s) => s.trim()).filter(Boolean))).slice(0, 24),
        antonyms: Array.from(new Set(antonyms.map((s) => s.trim()).filter(Boolean))).slice(0, 24),
      };

      cache[cacheKey] = { fetchedAt: now, result: finalResult };
      saveDictCache(cache);
      setDictResult(finalResult);
    } catch (err) {
      console.error('Dictionary lookup error:', err);
      setDictResult(null);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setDictError(`Unable to fetch meaning: ${errorMsg}. Please check your internet connection and try again.`);
    } finally {
      setDictLoading(false);
    }
  };

  const startVoiceLookup = () => {
    setDictError(null);
    if (typeof window === 'undefined') {
      setDictError('Voice input is not available.');
      return;
    }

    const AnyWindow = window as any;
    const SpeechRecognition = AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictError('Voice input is not supported in this browser. Try Chrome/Edge.');
      return;
    }

    try {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.abort();
        } catch {
          // ignore
        }
      }

      const rec = new SpeechRecognition();
      speechRecRef.current = rec;
      rec.lang = languageCode(selectedLanguage);
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setDictListening(true);
      rec.onerror = () => {
        setDictListening(false);
        setDictError('Unable to capture voice input.');
      };
      rec.onend = () => setDictListening(false);
      rec.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript ?? '';
        const text = typeof transcript === 'string' ? transcript.trim() : '';
        if (!text) {
          setDictError('Did not catch that. Please try again.');
          return;
        }
        setDictionaryQuery(text);
        void lookupDictionary(text, selectedLanguage);
      };

      rec.start();
    } catch {
      setDictListening(false);
      setDictError('Voice input failed to start.');
    }
  };

  const recordPracticeEvent = (itemId: string, kind: 'play' | 'recording' | 'submission') => {
    const now = Date.now();
    const todayKey = dayKeyLocal(new Date());

    setPracticeStats((prev) => {
      const prevItem = prev.items[itemId] ?? { plays: 0, recordings: 0, submissions: 0, lastPracticedAt: 0 };
      const nextItem = {
        ...prevItem,
        plays: kind === 'play' ? prevItem.plays + 1 : prevItem.plays,
        recordings: kind === 'recording' ? prevItem.recordings + 1 : prevItem.recordings,
        submissions: kind === 'submission' ? prevItem.submissions + 1 : prevItem.submissions,
        lastPracticedAt: now,
      };
      const nextDays = { ...prev.days, [todayKey]: (prev.days[todayKey] ?? 0) + 1 };
      return { items: { ...prev.items, [itemId]: nextItem }, days: nextDays };
    });
  };

  const dailyChallengeItem = useMemo(() => {
    const base = selectedType === 'letter' ? effectiveItems : lessonItemsForView;
    if (base.length === 0) return null;
    const seed = `${dayKeyLocal(new Date())}:${selectedLanguage}:${selectedType}`;
    const idx = stringHashInt(seed) % base.length;
    return base[idx] ?? base[0] ?? null;
  }, [effectiveItems, lessonItemsForView, selectedLanguage, selectedType]);

  const todayPracticeCount = useMemo(() => {
    const k = dayKeyLocal(new Date());
    return practiceStats.days[k] ?? 0;
  }, [practiceStats.days]);

  const streakDays = useMemo(() => computeStreakFromDays(practiceStats.days, new Date()), [practiceStats.days]);

  const recentItems = useMemo(() => {
    const map = practiceStats.items;
    const list = effectiveItems
      .filter((i) => map[i.id]?.lastPracticedAt)
      .map((i) => ({ item: i, last: map[i.id]!.lastPracticedAt }))
      .sort((a, b) => b.last - a.last)
      .slice(0, 6)
      .map((x) => x.item);
    return list;
  }, [effectiveItems, practiceStats.items]);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [recordedUrl]);

  // Removed auto-pronounce on lesson/language change. Now pronunciation only happens when Play is pressed.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    const refresh = () => {
      try {
        const v = synth.getVoices?.() ?? [];
        if (Array.isArray(v) && v.length > 0) {
          ttsVoicesRef.current = v;
          ttsVoicesReadyRef.current = true;
        }
      } catch {
        // ignore
      }
    };

    refresh();
    const onVoicesChanged = () => refresh();
    try {
      synth.addEventListener?.('voiceschanged', onVoicesChanged as any);
    } catch {
      // ignore
    }

    // Some browsers populate voices asynchronously without firing reliably.
    const t = window.setTimeout(refresh, 250);
    return () => {
      window.clearTimeout(t);
      try {
        synth.removeEventListener?.('voiceschanged', onVoicesChanged as any);
      } catch {
        // ignore
      }
    };
  }, []);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const stopSpeech = () => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  };

  const ensureTtsVoices = async () => {
    if (typeof window === 'undefined') return [] as SpeechSynthesisVoice[];
    if (!('speechSynthesis' in window)) return [] as SpeechSynthesisVoice[];
    const synth = window.speechSynthesis;

    const refresh = () => {
      const v = synth.getVoices?.() ?? [];
      if (Array.isArray(v) && v.length > 0) {
        ttsVoicesRef.current = v;
        ttsVoicesReadyRef.current = true;
      }
      return ttsVoicesRef.current;
    };

    const already = refresh();
    if (already.length > 0) return already;

    // Wait briefly for voices to become available.
    await new Promise<void>((resolve) => window.setTimeout(resolve, 200));
    const after = refresh();
    return after;
  };

  const pickBestVoice = (
    voices: SpeechSynthesisVoice[],
    lang: string,
    preferFemale = true
  ): SpeechSynthesisVoice | undefined => {
    if (!voices || voices.length === 0) return undefined;
    const wanted = (lang || '').toLowerCase();
    const prefix = wanted.split('-')[0];
    const femaleKeys = ['female', 'woman', 'girl', 'f-'];
    const maleKeys = ['male', 'man', 'boy', 'm-'];

    const scoreVoice = (v: SpeechSynthesisVoice) => {
      const name = (v.name || '').toLowerCase();
      const vlang = (v.lang || '').toLowerCase();
      let s = 0;
      if (vlang === wanted) s += 8;
      else if (vlang.startsWith(prefix)) s += 4;
      if ((v as any).localService) s += 2;
      if (preferFemale && femaleKeys.some((k) => name.includes(k))) s += 4;
      if (!preferFemale && maleKeys.some((k) => name.includes(k))) s += 3;
      if (femaleKeys.some((k) => name.includes(k))) s += 2;
      if (maleKeys.some((k) => name.includes(k))) s += 1;
      if (name.includes('neural') || name.includes('wavenet')) s += 1;
      return s;
    };

    let best: SpeechSynthesisVoice | undefined;
    let bestScore = -1;
    for (const v of voices) {
      const sc = scoreVoice(v);
      if (sc > bestScore) {
        best = v;
        bestScore = sc;
      }
    }
    return best ?? voices[0];
  };

  const speak = async (text: string, opts?: { itemId?: string }) => {
    setTtsError(null);
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) {
      setTtsError('Text-to-speech is not available in this browser.');
      return;
    }
    const cleaned = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return;

    const idForEvent = opts?.itemId ?? selectedItem?.id ?? null;
    if (idForEvent) recordPracticeEvent(idForEvent, 'play');

    const synth = window.speechSynthesis;
    const lang = languageCode(selectedLanguage);
    const voices = await ensureTtsVoices();

    const itemForFallback = opts?.itemId
      ? effectiveItems.find((i) => i.id === opts.itemId) ?? null
      : selectedItem;
    const romanization = (itemForFallback?.romanization ?? '').trim();

    // Some browsers get stuck in a paused state.
    try {
      synth.cancel();
      synth.resume?.();
    } catch {
      // ignore
    }

    let utterText = cleaned;
    const utter = new SpeechSynthesisUtterance(utterText);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    const best = pickBestVoice(voices, lang, true);

    // Bengali: always pick a Bengali voice if available; only fall back to pronounce/English when none exist.
    if (selectedLanguage === 'Bengali') {
      const bnVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('bn'));
      if (bnVoices.length > 0) {
        const bnBest = pickBestVoice(bnVoices, bnVoices[0].lang || 'bn-IN', true) || bnVoices[0];
        utter.voice = bnBest;
        if (bnBest.lang) utter.lang = bnBest.lang;
      } else {
        const guide = pronounceGuide(itemForFallback, selectedLanguage);
        const englishFallback = (itemForFallback?.english ?? '').trim();
        utterText = guide || englishFallback || cleaned;
        utter.text = utterText;
        // Use a default language so browsers don't refuse to speak with a missing locale.
        utter.lang = 'en-US';
        const fallbackVoice = pickBestVoice(voices, 'en-US', false);
        if (fallbackVoice) utter.voice = fallbackVoice;
        if (!bengaliVoiceWarnedRef.current) {
          bengaliVoiceWarnedRef.current = true;
          setTtsError('Bengali voice is not installed on this device. Using fallback audio.');
        }
      }
    } else {
      if (best) {
        utter.voice = best;
        if (best.lang) utter.lang = best.lang;
      }
    }

    utter.onerror = () => {
      setTtsError('Unable to play this word with your current device voice.');
    };

    try {
      // Small delay helps Chrome/Edge after cancel().
      await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
      synth.speak(utter);

      // If the device has zero voices, give a clearer hint.
      if (voices.length === 0) {
        setTtsError('No system voice is available. Install/enable voices in your browser/OS to hear pronunciation.');
      }
    } catch {
      setTtsError('Unable to play audio right now.');
    }
  };

  const startRecording = async () => {
    setActionError(null);
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setActionError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      recordingItemIdRef.current = selectedItem?.id ?? null;
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
      setFeedback('recording');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const preferredMime = 'audio/webm;codecs=opus';
      const mimeType = MediaRecorder.isTypeSupported(preferredMime) ? preferredMime : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);

        const itemId = recordingItemIdRef.current;
        if (itemId) recordPracticeEvent(itemId, 'recording');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setFeedback('error');
      setActionError('Microphone permission was denied or unavailable.');
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    mediaRecorderRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    setIsRecording(false);
    setFeedback('idle');
  };

  const handleRecordToggle = () => {
    if (isRecording) stopRecording();
    else void startRecording();
  };

  const submitRecording = async () => {
    if (!user) {
      setActionError('Please sign in first.');
      return;
    }
    if (!selectedItem) {
      setActionError('Select an item first.');
      return;
    }
    if (!recordedBlob) {
      setActionError('Record your voice first.');
      return;
    }

    try {
      setActionError(null);
      setUploading(true);

      const clientSubmissionId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const uploaded = await uploadPronunciationRecording({
        userId: user.uid,
        submissionId: clientSubmissionId,
        blob: recordedBlob,
      });

      await createPronunciationSubmission({
        itemId: selectedItem.id,
        language: selectedItem.language,
        type: selectedItem.type,
        targetText: selectedItem.targetText,
        userId: user.uid,
        studentName: studentNameFromUser({ displayName: user.displayName ?? null, email: user.email ?? null }),
        audioUrl: uploaded.audioUrl,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
      });

      recordPracticeEvent(selectedItem.id, 'submission');

      setFeedback('submitted');
      setTimeout(() => setFeedback('idle'), 2500);
    } catch {
      setFeedback('error');
      setActionError('Unable to submit recording right now.');
    } finally {
      setUploading(false);
    }
  };

  const createItem = async () => {
    if (!user) {
      setActionError('Please sign in to add items.');
      return;
    }
    if (!isTeacher) return;
    try {
      setActionError(null);
      setCreatingItem(true);
      const id = await createPronunciationItem({
        language: selectedLanguage,
        type: selectedType,
        targetText: newTargetText,
        english: newEnglish,
        romanization: newRomanization,
        createdByUid: user.uid,
      });
      setNewTargetText('');
      setNewEnglish('');
      setNewRomanization('');
      setSelectedItemId(id);
    } catch {
      setActionError('Unable to add item right now.');
    } finally {
      setCreatingItem(false);
    }
  };

  const importSeedForView = async () => {
    if (!user) {
      setActionError('Please sign in to seed the library.');
      return;
    }
    if (!isTeacher) return;

    const seed = rawSeedForView;
    if (seed.length === 0) return;

    try {
      setActionError(null);
      setSeeding(true);
      await importPronunciationSeedItems({ items: seed, createdByUid: user.uid });
    } catch {
      setActionError('Unable to import seed items right now.');
    } finally {
      setSeeding(false);
    }
  };

  const addInitialContent = async () => {
    if (!user || !isTeacher) return;
    
    const initialContent = {
      Bengali: {
        letters: [
          // Vowels (স্বরবর্ণ)
          { targetText: 'অ', english: 'a', romanization: 'a' },
          { targetText: 'আ', english: 'aa', romanization: 'aa' },
          { targetText: 'ই', english: 'i', romanization: 'i' },
          { targetText: 'ঈ', english: 'ii', romanization: 'ii' },
          { targetText: 'উ', english: 'u', romanization: 'u' },
          { targetText: 'ঊ', english: 'uu', romanization: 'uu' },
          { targetText: 'ঋ', english: 'ri', romanization: 'ri' },
          { targetText: 'এ', english: 'e', romanization: 'e' },
          { targetText: 'ঐ', english: 'oi', romanization: 'oi' },
          { targetText: 'ও', english: 'o', romanization: 'o' },
          { targetText: 'ঔ', english: 'ou', romanization: 'ou' },
          // Consonants (ব্যঞ্জনবর্ণ)
          { targetText: 'ক', english: 'ka', romanization: 'ka' },
          { targetText: 'খ', english: 'kha', romanization: 'kha' },
          { targetText: 'গ', english: 'ga', romanization: 'ga' },
          { targetText: 'ঘ', english: 'gha', romanization: 'gha' },
          { targetText: 'ঙ', english: 'nga', romanization: 'nga' },
          { targetText: 'চ', english: 'cha', romanization: 'cha' },
          { targetText: 'ছ', english: 'chha', romanization: 'chha' },
          { targetText: 'জ', english: 'ja', romanization: 'ja' },
          { targetText: 'ঝ', english: 'jha', romanization: 'jha' },
          { targetText: 'ঞ', english: 'nya', romanization: 'nya' },
          { targetText: 'ট', english: 'ta', romanization: 'ta' },
          { targetText: 'ঠ', english: 'tha', romanization: 'tha' },
          { targetText: 'ড', english: 'da', romanization: 'da' },
          { targetText: 'ঢ', english: 'dha', romanization: 'dha' },
          { targetText: 'ণ', english: 'na', romanization: 'na' },
          { targetText: 'ত', english: 'ta', romanization: 'ta' },
          { targetText: 'থ', english: 'tha', romanization: 'tha' },
          { targetText: 'দ', english: 'da', romanization: 'da' },
          { targetText: 'ধ', english: 'dha', romanization: 'dha' },
          { targetText: 'ন', english: 'na', romanization: 'na' },
          { targetText: 'প', english: 'pa', romanization: 'pa' },
          { targetText: 'ফ', english: 'pha', romanization: 'pha' },
          { targetText: 'ব', english: 'ba', romanization: 'ba' },
          { targetText: 'ভ', english: 'bha', romanization: 'bha' },
          { targetText: 'ম', english: 'ma', romanization: 'ma' },
          { targetText: 'য', english: 'ja', romanization: 'ja' },
          { targetText: 'র', english: 'ra', romanization: 'ra' },
          { targetText: 'ল', english: 'la', romanization: 'la' },
          { targetText: 'শ', english: 'sha', romanization: 'sha' },
          { targetText: 'ষ', english: 'sha', romanization: 'sha' },
          { targetText: 'স', english: 'sa', romanization: 'sa' },
          { targetText: 'হ', english: 'ha', romanization: 'ha' },
          { targetText: 'ড়', english: 'ra', romanization: 'ra' },
          { targetText: 'ঢ়', english: 'rha', romanization: 'rha' },
          { targetText: 'য়', english: 'ya', romanization: 'ya' },
          { targetText: 'ৎ', english: 't', romanization: 't' },
          { targetText: 'ং', english: 'ng', romanization: 'ng' },
          { targetText: 'ঃ', english: 'h', romanization: 'h' },
          { targetText: 'ঁ', english: 'n', romanization: 'n' },
        ],
        words: [
          { targetText: 'নমস্কার', english: 'Hello', romanization: 'Nomoshkar' },
          { targetText: 'ধন্যবাদ', english: 'Thank you', romanization: 'Dhonnobad' },
          { targetText: 'জল', english: 'Water', romanization: 'Jol' },
          { targetText: 'খাবার', english: 'Food', romanization: 'Khabar' },
          { targetText: 'বই', english: 'Book', romanization: 'Boi' },
          { targetText: 'বাড়ি', english: 'Home', romanization: 'Bari' },
          { targetText: 'মা', english: 'Mother', romanization: 'Maa' },
          { targetText: 'বাবা', english: 'Father', romanization: 'Baba' },
          { targetText: 'ভাই', english: 'Brother', romanization: 'Bhai' },
          { targetText: 'বোন', english: 'Sister', romanization: 'Bon' },
          { targetText: 'দিন', english: 'Day', romanization: 'Din' },
          { targetText: 'রাত', english: 'Night', romanization: 'Raat' },
          { targetText: 'সকাল', english: 'Morning', romanization: 'Shokal' },
          { targetText: 'বিকাল', english: 'Evening', romanization: 'Bikal' },
          { targetText: 'ভালো', english: 'Good', romanization: 'Bhalo' },
          { targetText: 'খারাপ', english: 'Bad', romanization: 'Kharap' },
          { targetText: 'বড়', english: 'Big', romanization: 'Boro' },
          { targetText: 'ছোট', english: 'Small', romanization: 'Choto' },
          { targetText: 'নতুন', english: 'New', romanization: 'Notun' },
          { targetText: 'পুরানো', english: 'Old', romanization: 'Purano' },
          { targetText: 'সুন্দর', english: 'Beautiful', romanization: 'Shundor' },
          { targetText: 'ভাত', english: 'Rice', romanization: 'Bhat' },
          { targetText: 'মাছ', english: 'Fish', romanization: 'Machh' },
          { targetText: 'দুধ', english: 'Milk', romanization: 'Dudh' },
          { targetText: 'চা', english: 'Tea', romanization: 'Cha' },
          { targetText: 'শিক্ষক', english: 'Teacher', romanization: 'Shikkhok' },
          { targetText: 'ছাত্র', english: 'Student', romanization: 'Chatro' },
          { targetText: 'স্কুল', english: 'School', romanization: 'School' },
          { targetText: 'বন্ধু', english: 'Friend', romanization: 'Bondhu' },
          { targetText: 'প্রেম', english: 'Love', romanization: 'Prem' },
        ],
        sentences: [
          { targetText: 'আমার নাম রাহুল', english: 'My name is Rahul', romanization: 'Amar naam Rahul' },
          { targetText: 'আপনি কেমন আছেন?', english: 'How are you?', romanization: 'Apni kemon achhen?' },
          { targetText: 'আমি ভালো আছি', english: 'I am fine', romanization: 'Ami bhalo achhi' },
          { targetText: 'এটা কত টাকা?', english: 'How much is this?', romanization: 'Eta koto taka?' },
          { targetText: 'আমি বাংলা শিখছি', english: 'I am learning Bengali', romanization: 'Ami Bangla shikhchhi' },
          { targetText: 'আমি কলকাতায় থাকি', english: 'I live in Kolkata', romanization: 'Ami Kolkatay thaki' },
          { targetText: 'তুমি কোথায় যাচ্ছো?', english: 'Where are you going?', romanization: 'Tumi kothay jachho?' },
          { targetText: 'আমি বাজারে যাচ্ছি', english: 'I am going to the market', romanization: 'Ami bajare jachhi' },
          { targetText: 'এটা খুব সুন্দর', english: 'This is very beautiful', romanization: 'Eta khub shundor' },
          { targetText: 'আমার খুব খিদে পেয়েছে', english: 'I am very hungry', romanization: 'Amar khub khide peyechhe' },
          { targetText: 'দয়া করে বসুন', english: 'Please sit down', romanization: 'Doya kore boshun' },
          { targetText: 'আপনার নাম কী?', english: 'What is your name?', romanization: 'Apnar naam ki?' },
          { targetText: 'আমি ভারত থেকে এসেছি', english: 'I am from India', romanization: 'Ami Bharat theke eshechhi' },
          { targetText: 'আমি চা খাব', english: 'I will drink tea', romanization: 'Ami cha khabo' },
          { targetText: 'এখন কয়টা বাজে?', english: 'What time is it now?', romanization: 'Ekhon koyota baje?' },
          { targetText: 'আমি তোমাকে ভালোবাসি', english: 'I love you', romanization: 'Ami tomake bhalobashi' },
          { targetText: 'তোমার পরিবার কেমন আছে?', english: 'How is your family?', romanization: 'Tomar poribar kemon achhe?' },
          { targetText: 'আমি প্রতিদিন স্কুলে যাই', english: 'I go to school every day', romanization: 'Ami protidin schoole jai' },
          { targetText: 'আজ আবহাওয়া ভালো', english: 'The weather is good today', romanization: 'Aj abohawa bhalo' },
          { targetText: 'আমি বই পড়তে ভালোবাসি', english: 'I love reading books', romanization: 'Ami boi porte bhalobashi' },
          { targetText: 'তুমি কি খাবে?', english: 'What will you eat?', romanization: 'Tumi ki khabe?' },
          { targetText: 'আমার একটা বোন আছে', english: 'I have one sister', romanization: 'Amar ekta bon achhe' },
          { targetText: 'আমি ক্লান্ত', english: 'I am tired', romanization: 'Ami klanto' },
          { targetText: 'আমি খুশি', english: 'I am happy', romanization: 'Ami khushi' },
          { targetText: 'আবার দেখা হবে', english: 'See you again', romanization: 'Abar dekha hobe' },
          { targetText: 'শুভ রাত্রি', english: 'Good night', romanization: 'Shubho ratri' },
          { targetText: 'শুভ সকাল', english: 'Good morning', romanization: 'Shubho shokal' },
          { targetText: 'দয়া করে সাহায্য করুন', english: 'Please help', romanization: 'Doya kore shahajjo korun' },
          { targetText: 'আমি বুঝতে পারছি না', english: "I don't understand", romanization: 'Ami bujhte parchhi na' },
          { targetText: 'আমার বাংলা ভালো না', english: 'My Bengali is not good', romanization: 'Amar Bangla bhalo na' },
        ]
      },
      Hindi: {
        letters: [
          // Vowels (स्वर)
          { targetText: 'अ', english: 'a', romanization: 'a' },
          { targetText: 'आ', english: 'aa', romanization: 'aa' },
          { targetText: 'इ', english: 'i', romanization: 'i' },
          { targetText: 'ई', english: 'ii', romanization: 'ii' },
          { targetText: 'उ', english: 'u', romanization: 'u' },
          { targetText: 'ऊ', english: 'uu', romanization: 'uu' },
          { targetText: 'ऋ', english: 'ri', romanization: 'ri' },
          { targetText: 'ए', english: 'e', romanization: 'e' },
          { targetText: 'ऐ', english: 'ai', romanization: 'ai' },
          { targetText: 'ओ', english: 'o', romanization: 'o' },
          { targetText: 'औ', english: 'au', romanization: 'au' },
          { targetText: 'अं', english: 'an', romanization: 'an' },
          { targetText: 'अः', english: 'ah', romanization: 'ah' },
          // Consonants (व्यंजन)
          { targetText: 'क', english: 'ka', romanization: 'ka' },
          { targetText: 'ख', english: 'kha', romanization: 'kha' },
          { targetText: 'ग', english: 'ga', romanization: 'ga' },
          { targetText: 'घ', english: 'gha', romanization: 'gha' },
          { targetText: 'ङ', english: 'nga', romanization: 'nga' },
          { targetText: 'च', english: 'cha', romanization: 'cha' },
          { targetText: 'छ', english: 'chha', romanization: 'chha' },
          { targetText: 'ज', english: 'ja', romanization: 'ja' },
          { targetText: 'झ', english: 'jha', romanization: 'jha' },
          { targetText: 'ञ', english: 'nya', romanization: 'nya' },
          { targetText: 'ट', english: 'ta', romanization: 'ta' },
          { targetText: 'ठ', english: 'tha', romanization: 'tha' },
          { targetText: 'ड', english: 'da', romanization: 'da' },
          { targetText: 'ढ', english: 'dha', romanization: 'dha' },
          { targetText: 'ण', english: 'na', romanization: 'na' },
          { targetText: 'त', english: 'ta', romanization: 'ta' },
          { targetText: 'थ', english: 'tha', romanization: 'tha' },
          { targetText: 'द', english: 'da', romanization: 'da' },
          { targetText: 'ध', english: 'dha', romanization: 'dha' },
          { targetText: 'न', english: 'na', romanization: 'na' },
          { targetText: 'प', english: 'pa', romanization: 'pa' },
          { targetText: 'फ', english: 'pha', romanization: 'pha' },
          { targetText: 'ब', english: 'ba', romanization: 'ba' },
          { targetText: 'भ', english: 'bha', romanization: 'bha' },
          { targetText: 'म', english: 'ma', romanization: 'ma' },
          { targetText: 'य', english: 'ya', romanization: 'ya' },
          { targetText: 'र', english: 'ra', romanization: 'ra' },
          { targetText: 'ल', english: 'la', romanization: 'la' },
          { targetText: 'व', english: 'va', romanization: 'va' },
          { targetText: 'श', english: 'sha', romanization: 'sha' },
          { targetText: 'ष', english: 'sha', romanization: 'sha' },
          { targetText: 'स', english: 'sa', romanization: 'sa' },
          { targetText: 'ह', english: 'ha', romanization: 'ha' },
          { targetText: 'क्ष', english: 'ksha', romanization: 'ksha' },
          { targetText: 'त्र', english: 'tra', romanization: 'tra' },
          { targetText: 'ज्ञ', english: 'gya', romanization: 'gya' },
        ],
        words: [
          { targetText: 'नमस्ते', english: 'Hello', romanization: 'Namaste' },
          { targetText: 'धन्यवाद', english: 'Thank you', romanization: 'Dhanyavaad' },
          { targetText: 'पानी', english: 'Water', romanization: 'Paani' },
          { targetText: 'खाना', english: 'Food', romanization: 'Khaana' },
          { targetText: 'किताब', english: 'Book', romanization: 'Kitaab' },
          { targetText: 'घर', english: 'Home', romanization: 'Ghar' },
          { targetText: 'माँ', english: 'Mother', romanization: 'Maan' },
          { targetText: 'पिता', english: 'Father', romanization: 'Pita' },
          { targetText: 'भाई', english: 'Brother', romanization: 'Bhai' },
          { targetText: 'बहन', english: 'Sister', romanization: 'Bahen' },
          { targetText: 'दिन', english: 'Day', romanization: 'Din' },
          { targetText: 'रात', english: 'Night', romanization: 'Raat' },
          { targetText: 'सुबह', english: 'Morning', romanization: 'Subah' },
          { targetText: 'शाम', english: 'Evening', romanization: 'Shaam' },
          { targetText: 'अच्छा', english: 'Good', romanization: 'Achha' },
          { targetText: 'बुरा', english: 'Bad', romanization: 'Bura' },
          { targetText: 'बड़ा', english: 'Big', romanization: 'Bada' },
          { targetText: 'छोटा', english: 'Small', romanization: 'Chhota' },
          { targetText: 'नया', english: 'New', romanization: 'Naya' },
          { targetText: 'पुराना', english: 'Old', romanization: 'Purana' },
          { targetText: 'सुंदर', english: 'Beautiful', romanization: 'Sundar' },
          { targetText: 'चावल', english: 'Rice', romanization: 'Chaawal' },
          { targetText: 'मछली', english: 'Fish', romanization: 'Machhli' },
          { targetText: 'दूध', english: 'Milk', romanization: 'Doodh' },
          { targetText: 'चाय', english: 'Tea', romanization: 'Chaay' },
          { targetText: 'शिक्षक', english: 'Teacher', romanization: 'Shikshak' },
          { targetText: 'छात्र', english: 'Student', romanization: 'Chhaatra' },
          { targetText: 'स्कूल', english: 'School', romanization: 'School' },
          { targetText: 'दोस्त', english: 'Friend', romanization: 'Dost' },
          { targetText: 'प्यार', english: 'Love', romanization: 'Pyaar' },
        ],
        sentences: [
          { targetText: 'मेरा नाम राहुल है', english: 'My name is Rahul', romanization: 'Mera naam Rahul hai' },
          { targetText: 'आप कैसे हैं?', english: 'How are you?', romanization: 'Aap kaise hain?' },
          { targetText: 'मैं ठीक हूँ', english: 'I am fine', romanization: 'Main theek hoon' },
          { targetText: 'यह कितना है?', english: 'How much is this?', romanization: 'Yah kitna hai?' },
          { targetText: 'मैं हिंदी सीख रहा हूँ', english: 'I am learning Hindi', romanization: 'Main Hindi seekh raha hoon' },
          { targetText: 'मैं दिल्ली में रहता हूँ', english: 'I live in Delhi', romanization: 'Main Dilli mein rehta hoon' },
          { targetText: 'तुम कहाँ जा रहे हो?', english: 'Where are you going?', romanization: 'Tum kahan ja rahe ho?' },
          { targetText: 'मैं बाज़ार जा रहा हूँ', english: 'I am going to the market', romanization: 'Main bazaar ja raha hoon' },
          { targetText: 'यह बहुत सुंदर है', english: 'This is very beautiful', romanization: 'Yah bahut sundar hai' },
          { targetText: 'मुझे भूख लगी है', english: 'I am hungry', romanization: 'Mujhe bhookh lagi hai' },
          { targetText: 'कृपया बैठिए', english: 'Please sit down', romanization: 'Kripya baithiye' },
          { targetText: 'आपका नाम क्या है?', english: 'What is your name?', romanization: 'Aapka naam kya hai?' },
          { targetText: 'मैं भारत से हूँ', english: 'I am from India', romanization: 'Main Bharat se hoon' },
          { targetText: 'मैं चाय पीऊँगा', english: 'I will drink tea', romanization: 'Main chaay peeoonnga' },
          { targetText: 'अभी कितने बजे हैं?', english: 'What time is it now?', romanization: 'Abhi kitne baje hain?' },
          { targetText: 'मैं तुमसे प्यार करता हूँ', english: 'I love you', romanization: 'Main tumse pyaar karta hoon' },
          { targetText: 'आपका परिवार कैसा है?', english: 'How is your family?', romanization: 'Aapka parivaar kaisa hai?' },
          { targetText: 'मैं रोज़ स्कूल जाता हूँ', english: 'I go to school every day', romanization: 'Main roz school jata hoon' },
          { targetText: 'आज मौसम अच्छा है', english: 'The weather is good today', romanization: 'Aaj mausam achha hai' },
          { targetText: 'मुझे किताबें पढ़ना पसंद है', english: 'I love reading books', romanization: 'Mujhe kitaabein padhna pasand hai' },
          { targetText: 'तुम क्या खाओगे?', english: 'What will you eat?', romanization: 'Tum kya khaoge?' },
          { targetText: 'मेरी एक बहन है', english: 'I have one sister', romanization: 'Meri ek bahen hai' },
          { targetText: 'मैं थका हुआ हूँ', english: 'I am tired', romanization: 'Main thaka hua hoon' },
          { targetText: 'मैं खुश हूँ', english: 'I am happy', romanization: 'Main khush hoon' },
          { targetText: 'फिर मिलेंगे', english: 'See you again', romanization: 'Phir milenge' },
          { targetText: 'शुभ रात्रि', english: 'Good night', romanization: 'Shubh ratri' },
          { targetText: 'सुप्रभात', english: 'Good morning', romanization: 'Suprabhaat' },
          { targetText: 'कृपया मदद करें', english: 'Please help', romanization: 'Kripya madad karein' },
          { targetText: 'मुझे समझ नहीं आ रहा', english: "I don't understand", romanization: 'Mujhe samajh nahin aa raha' },
          { targetText: 'मेरी हिंदी अच्छी नहीं है', english: 'My Hindi is not good', romanization: 'Meri Hindi achhi nahin hai' },
        ]
      },
      English: {
        letters: [
          { targetText: 'A', english: 'A', romanization: 'ay' },
          { targetText: 'B', english: 'B', romanization: 'bee' },
          { targetText: 'C', english: 'C', romanization: 'see' },
          { targetText: 'D', english: 'D', romanization: 'dee' },
          { targetText: 'E', english: 'E', romanization: 'ee' },
          { targetText: 'F', english: 'F', romanization: 'eff' },
          { targetText: 'G', english: 'G', romanization: 'jee' },
          { targetText: 'H', english: 'H', romanization: 'aych' },
          { targetText: 'I', english: 'I', romanization: 'eye' },
          { targetText: 'J', english: 'J', romanization: 'jay' },
          { targetText: 'K', english: 'K', romanization: 'kay' },
          { targetText: 'L', english: 'L', romanization: 'ell' },
          { targetText: 'M', english: 'M', romanization: 'em' },
          { targetText: 'N', english: 'N', romanization: 'en' },
          { targetText: 'O', english: 'O', romanization: 'oh' },
          { targetText: 'P', english: 'P', romanization: 'pee' },
          { targetText: 'Q', english: 'Q', romanization: 'kyoo' },
          { targetText: 'R', english: 'R', romanization: 'ar' },
          { targetText: 'S', english: 'S', romanization: 'ess' },
          { targetText: 'T', english: 'T', romanization: 'tee' },
          { targetText: 'U', english: 'U', romanization: 'yoo' },
          { targetText: 'V', english: 'V', romanization: 'vee' },
          { targetText: 'W', english: 'W', romanization: 'double-yoo' },
          { targetText: 'X', english: 'X', romanization: 'eks' },
          { targetText: 'Y', english: 'Y', romanization: 'why' },
          { targetText: 'Z', english: 'Z', romanization: 'zee' },
        ],
        words: [
          { targetText: 'Hello', english: 'Hello', romanization: 'he-loh' },
          { targetText: 'Thank you', english: 'Thank you', romanization: 'thank yoo' },
          { targetText: 'Water', english: 'Water', romanization: 'waw-ter' },
          { targetText: 'Food', english: 'Food', romanization: 'food' },
          { targetText: 'Book', english: 'Book', romanization: 'book' },
          { targetText: 'Home', english: 'Home', romanization: 'hohm' },
          { targetText: 'Mother', english: 'Mother', romanization: 'muth-er' },
          { targetText: 'Father', english: 'Father', romanization: 'fah-ther' },
          { targetText: 'Brother', english: 'Brother', romanization: 'bruth-er' },
          { targetText: 'Sister', english: 'Sister', romanization: 'sis-ter' },
          { targetText: 'Day', english: 'Day', romanization: 'day' },
          { targetText: 'Night', english: 'Night', romanization: 'nyte' },
          { targetText: 'Morning', english: 'Morning', romanization: 'mor-ning' },
          { targetText: 'Evening', english: 'Evening', romanization: 'eev-ning' },
          { targetText: 'Good', english: 'Good', romanization: 'good' },
          { targetText: 'Bad', english: 'Bad', romanization: 'bad' },
          { targetText: 'Big', english: 'Big', romanization: 'big' },
          { targetText: 'Small', english: 'Small', romanization: 'smawl' },
          { targetText: 'New', english: 'New', romanization: 'noo' },
          { targetText: 'Old', english: 'Old', romanization: 'ohld' },
          { targetText: 'Beautiful', english: 'Beautiful', romanization: 'byoo-ti-ful' },
          { targetText: 'Rice', english: 'Rice', romanization: 'ryce' },
          { targetText: 'Fish', english: 'Fish', romanization: 'fish' },
          { targetText: 'Milk', english: 'Milk', romanization: 'milk' },
          { targetText: 'Tea', english: 'Tea', romanization: 'tee' },
          { targetText: 'Teacher', english: 'Teacher', romanization: 'tee-cher' },
          { targetText: 'Student', english: 'Student', romanization: 'stoo-dent' },
          { targetText: 'School', english: 'School', romanization: 'skool' },
          { targetText: 'Friend', english: 'Friend', romanization: 'frend' },
          { targetText: 'Love', english: 'Love', romanization: 'luv' },
        ],
        sentences: [
          { targetText: 'My name is Sarah', english: 'My name is Sarah', romanization: 'my naym iz Sarah' },
          { targetText: 'How are you?', english: 'How are you?', romanization: 'how ar yoo' },
          { targetText: 'I am fine', english: 'I am fine', romanization: 'I am fyn' },
          { targetText: 'How much is this?', english: 'How much is this?', romanization: 'how much iz this' },
          { targetText: 'I am learning English', english: 'I am learning English', romanization: 'I am learning English' },
          { targetText: 'I live in London', english: 'I live in London', romanization: 'I liv in London' },
          { targetText: 'Where are you going?', english: 'Where are you going?', romanization: 'wair ar yoo going' },
          { targetText: 'I am going to the store', english: 'I am going to the store', romanization: 'I am going to the stor' },
          { targetText: 'This is very nice', english: 'This is very nice', romanization: 'this iz verry nyce' },
          { targetText: 'I am very hungry', english: 'I am very hungry', romanization: 'I am verry hungry' },
          { targetText: 'Please sit down', english: 'Please sit down', romanization: 'pleez sit down' },
          { targetText: 'What is your name?', english: 'What is your name?', romanization: 'what iz yor naym' },
          { targetText: 'I am from America', english: 'I am from America', romanization: 'I am from America' },
          { targetText: 'I will have tea', english: 'I will have tea', romanization: 'I wil hav tee' },
          { targetText: 'What time is it?', english: 'What time is it?', romanization: 'what tym iz it' },
          { targetText: 'I love you', english: 'I love you', romanization: 'I luv yoo' },
          { targetText: 'How is your family?', english: 'How is your family?', romanization: 'how iz yor family' },
          { targetText: 'I go to school every day', english: 'I go to school every day', romanization: 'I goh to skool every day' },
          { targetText: 'The weather is nice today', english: 'The weather is nice today', romanization: 'the wether iz nyce today' },
          { targetText: 'I love reading books', english: 'I love reading books', romanization: 'I luv reading books' },
          { targetText: 'What will you eat?', english: 'What will you eat?', romanization: 'what wil yoo eet' },
          { targetText: 'I have one sister', english: 'I have one sister', romanization: 'I hav wun sister' },
          { targetText: 'I am tired', english: 'I am tired', romanization: 'I am tyred' },
          { targetText: 'I am happy', english: 'I am happy', romanization: 'I am happy' },
          { targetText: 'See you later', english: 'See you later', romanization: 'see yoo lay-ter' },
          { targetText: 'Good night', english: 'Good night', romanization: 'good nyte' },
          { targetText: 'Good morning', english: 'Good morning', romanization: 'good morning' },
          { targetText: 'Please help me', english: 'Please help me', romanization: 'pleez help mee' },
          { targetText: "I don't understand", english: "I don't understand", romanization: 'I dohnt understand' },
          { targetText: 'My English is not good', english: 'My English is not good', romanization: 'my English iz not good' },
        ]
      }
    };

    try {
      setSeeding(true);
      setActionError(null);
      let added = 0;
      let skipped = 0;

      console.log('Starting to add initial content...');

      for (const [lang, content] of Object.entries(initialContent)) {
        const language = lang as PronunciationLanguage;
        console.log(`Processing ${language}...`);
        
        // Add letters
        for (const item of content.letters) {
          try {
            await createPronunciationItem({
              language,
              type: 'letter',
              targetText: item.targetText,
              english: item.english,
              romanization: item.romanization,
              createdByUid: user.uid,
            });
            added++;
            console.log(`✓ Added letter: ${item.targetText}`);
          } catch (err: any) {
            console.warn(`⚠ Skipped letter ${item.targetText}:`, err.message);
            skipped++;
          }
        }
        
        // Add words
        for (const item of content.words) {
          try {
            await createPronunciationItem({
              language,
              type: 'word',
              targetText: item.targetText,
              english: item.english,
              romanization: item.romanization,
              createdByUid: user.uid,
            });
            added++;
            console.log(`✓ Added word: ${item.targetText}`);
          } catch (err: any) {
            console.warn(`⚠ Skipped word ${item.targetText}:`, err.message);
            skipped++;
          }
        }
        
        // Add sentences
        for (const item of content.sentences) {
          try {
            await createPronunciationItem({
              language,
              type: 'sentence',
              targetText: item.targetText,
              english: item.english,
              romanization: item.romanization,
              createdByUid: user.uid,
            });
            added++;
            console.log(`✓ Added sentence: ${item.targetText}`);
          } catch (err: any) {
            console.warn(`⚠ Skipped sentence ${item.targetText}:`, err.message);
            skipped++;
          }
        }
      }

      console.log(`Completed! Added: ${added}, Skipped: ${skipped}`);
      showSuccess(`Added ${added} items! ${skipped > 0 ? `(${skipped} skipped)` : ''} You can now edit/delete them.`);
    } catch (error) {
      console.error('Error adding initial content:', error);
      showError(`Failed to add initial content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSeeding(false);
    }
  };

  // Lesson content editing handlers
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setActionError(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setActionError(message);
    setSuccessMessage(null);
    setTimeout(() => setActionError(null), 5000);
  };

  const handleSaveGrammar = async () => {
    if (!user || !selectedLessonIndex) return;
    const fbLesson = firebaseLessons.find(l => l.lessonNumber === selectedLessonIndex);
    
    try {
      await createOrUpdateLesson({
        lessonNumber: selectedLessonIndex,
        language: selectedLanguage,
        title: fbLesson?.title || `Lesson ${selectedLessonIndex}`,
        description: fbLesson?.description || '',
        grammarNote: editGrammarText,
        culturalInsight: fbLesson?.culturalInsight,
        createdByUid: user.uid
      });
      setEditingGrammar(false);
      showSuccess('Grammar note updated successfully!');
    } catch (error: any) {
      console.error('Error saving grammar:', error);
      const errorMsg = error?.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in as a teacher or admin.'
        : `Failed to save grammar note: ${error?.message || 'Please try again.'}`;
      showError(errorMsg);
    }
  };

  const handleSaveCultural = async () => {
    if (!user || !selectedLessonIndex) return;
    const fbLesson = firebaseLessons.find(l => l.lessonNumber === selectedLessonIndex);
    
    try {
      await createOrUpdateLesson({
        lessonNumber: selectedLessonIndex,
        language: selectedLanguage,
        title: fbLesson?.title || `Lesson ${selectedLessonIndex}`,
        description: fbLesson?.description || '',
        grammarNote: fbLesson?.grammarNote,
        culturalInsight: editCulturalText,
        createdByUid: user.uid
      });
      setEditingCultural(false);
      showSuccess('Cultural insight updated successfully!');
    } catch (error) {
      console.error('Error saving cultural insight:', error);
      showError('Failed to save cultural insight. Please try again.');
    }
  };

  const handleDeleteVocab = async (vocabId: string) => {
    if (!confirm('Delete this vocabulary word?')) return;
    try {
      await deleteVocabularyItem(vocabId);
      showSuccess('Vocabulary deleted successfully!');
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      showError('Failed to delete vocabulary. Please try again.');
    }
  };

  const handleEditVocab = async (vocabId: string) => {
    if (!user || !selectedLessonIndex) return;
    if (!isTeacher) {
      showError('Only teachers and admins can edit vocabulary.');
      return;
    }
    try {
      await updateVocabularyItem(vocabId, {
        word: editVocabData.word,
        meaning: editVocabData.meaning,
        romanization: editVocabData.romanization,
        partOfSpeech: editVocabData.partOfSpeech,
        exampleSentence: editVocabData.exampleSentence
      });
      setEditingVocabId(null);
      showSuccess('Vocabulary updated successfully!');
    } catch (error: any) {
      console.error('Error updating vocabulary:', error);
      const errorMsg = error?.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in as a teacher or admin.'
        : `Failed to update vocabulary: ${error?.message || 'Please try again.'}`;
      showError(errorMsg);
    }
  };

  const handleAddVocab = async () => {
    if (!user || !selectedLessonIndex) return;
    try {
      const maxOrder = vocabularyItems
        .filter(v => v.lessonNumber === selectedLessonIndex)
        .reduce((max, v) => Math.max(max, v.order), 0);
      
      await createVocabularyItem({
        lessonId: `${selectedLanguage}-${selectedLessonIndex}`,
        language: selectedLanguage,
        lessonNumber: selectedLessonIndex,
        word: newVocabData.word,
        meaning: newVocabData.meaning,
        romanization: newVocabData.romanization,
        partOfSpeech: newVocabData.partOfSpeech,
        exampleSentence: newVocabData.exampleSentence,
        order: maxOrder + 1,
        createdByUid: user.uid
      });
      
      setShowAddVocab(false);
      setNewVocabData({ word: '', meaning: '', romanization: '', partOfSpeech: '', exampleSentence: '' });
      showSuccess('Vocabulary added successfully!');
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      showError('Failed to add vocabulary. Please try again.');
    }
  };

  const handleDeleteSentence = async (sentenceId: string) => {
    if (!confirm('Delete this sentence?')) return;
    try {
      await deletePracticeSentence(sentenceId);
      showSuccess('Sentence deleted successfully!');
    } catch (error) {
      console.error('Error deleting sentence:', error);
      showError('Failed to delete sentence. Please try again.');
    }
  };

  const handleEditSentence = async (sentenceId: string) => {
    if (!user || !selectedLessonIndex) return;
    if (!isTeacher) {
      showError('Only teachers and admins can edit sentences.');
      return;
    }
    try {
      await updatePracticeSentence(sentenceId, {
        sentence: editSentenceData.sentence,
        translation: editSentenceData.translation,
        romanization: editSentenceData.romanization
      });
      setEditingSentenceId(null);
      showSuccess('Sentence updated successfully!');
    } catch (error: any) {
      console.error('Error updating sentence:', error);
      const errorMsg = error?.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in as a teacher or admin.'
        : `Failed to update sentence: ${error?.message || 'Please try again.'}`;
      showError(errorMsg);
    }
  };

  const handleAddSentence = async () => {
    if (!user || !selectedLessonIndex) return;
    try {
      const maxOrder = practiceSentences
        .filter(s => s.lessonNumber === selectedLessonIndex)
        .reduce((max, s) => Math.max(max, s.order), 0);
      
      await createPracticeSentence({
        lessonId: `${selectedLanguage}-${selectedLessonIndex}`,
        language: selectedLanguage,
        lessonNumber: selectedLessonIndex,
        sentence: newSentenceData.sentence,
        translation: newSentenceData.translation,
        romanization: newSentenceData.romanization,
        order: maxOrder + 1,
        createdByUid: user.uid
      });
      
      setShowAddSentence(false);
      setNewSentenceData({ sentence: '', translation: '', romanization: '' });
      showSuccess('Sentence added successfully!');
    } catch (error) {
      console.error('Error adding sentence:', error);
      showError('Failed to add sentence. Please try again.');
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!user) return;
    if (!isTeacher) {
      showError('Only teachers and admins can edit items.');
      return;
    }
    
    try {
      // Simple update for Firebase items (no seed item logic for teachers)
      console.log('Updating existing item:', itemId, editItemData);
      await updatePronunciationItem(itemId, {
        targetText: editItemData.targetText,
        english: editItemData.english,
        romanization: editItemData.romanization,
      });
      setEditingItemId(null);
      showSuccess('Item updated successfully!');
    } catch (error: any) {
      console.error('Error updating item:', error);
      const errorMsg = error?.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in as a teacher or admin.'
        : `Failed to update item: ${error?.message || 'Please try again.'}`;
      showError(errorMsg);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    if (!isTeacher) {
      showError('Only teachers and admins can delete items.');
      return;
    }
    
    try {
      await deletePronunciationItem(itemId);
      showSuccess('Item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      const errorMsg = error?.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in as a teacher or admin.'
        : `Failed to delete item: ${error?.message || 'Please try again.'}`;
      showError(errorMsg);
    }
  };

  // Show loading while profile is being fetched to avoid showing wrong view
  if (profileLoading && user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar currentPage="pronunciation" onNavigate={onNavigate} userType="student" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pt-20 lg:pt-8">
          <div className="mb-6 sm:mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-slate-900 mb-2">Pronunciation Practice</h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600">Letters, words, and sentences — record and submit for teacher review.</p>
              
              {/* Mobile Phone Disclaimer */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-blue-900">
                  <strong>💡 Tip:</strong> For better pronunciation recording and playback, we recommend using your mobile phone instead of a desktop computer.
                </p>
              </div>
              
              {user && (
                <p className="text-xs text-slate-500 mt-2">
                  Role: {role || 'none'} {isTeacher && '(Teacher/Admin privileges enabled)'}
                </p>
              )}
            </div>
            {!hasPremiumAccess && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                Unlock Premium $10
              </button>
            )}
            {hasPremiumAccess && (
              <div className="ml-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Premium Active
              </div>
            )}
          </div>

          {/* Instructor Admin Panel - Only visible to teachers */}
          {isTeacher && (
            <InstructorPracticeAdmin language={selectedLanguage} type={selectedType} />
          )}

          {/* Enhanced Practice Dashboard - Premium Feature */}
          {hasPremiumAccess && !isTeacher && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Streak Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <div className="text-sm opacity-90">Day Streak</div>
                <div className="text-xs opacity-75 mt-1">Keep practicing daily!</div>
              </div>

              {/* Items Mastered */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-6 h-6" />
                  <span className="text-2xl font-bold">
                    {Object.values(masteryLevels).filter(level => level >= 5).length}
                  </span>
                </div>
                <div className="text-sm opacity-90">Items Mastered</div>
                <div className="text-xs opacity-75 mt-1">Keep up the great work!</div>
              </div>

              {/* Total Practice Time */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <History className="w-6 h-6" />
                  <span className="text-2xl font-bold">
                    {Object.values(practiceStats.items).reduce((sum, stat) => sum + stat.plays, 0)}
                  </span>
                </div>
                <div className="text-sm opacity-90">Items Practiced</div>
                <div className="text-xs opacity-75 mt-1">Total plays across all items</div>
              </div>

              {/* Saved Items */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-6 h-6" />
                  <span className="text-2xl font-bold">{savedIds.size}</span>
                </div>
                <div className="text-sm opacity-90">Saved Favorites</div>
                <div className="text-xs opacity-75 mt-1">Your bookmarked items</div>
              </div>
            </div>
          )}

          {/* Practice Mode Selector - Premium Feature */}
          {hasPremiumAccess && !isTeacher && effectiveItems.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
              <div className="text-sm font-semibold text-slate-700 mb-3">📚 Choose Your Practice Mode</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setPracticeMode('browse')}
                  className={`p-4 rounded-xl transition-all ${
                    practiceMode === 'browse'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Browse</div>
                  <div className="text-xs opacity-75 mt-1">Explore all items</div>
                </button>

                <button
                  onClick={() => {
                    setPracticeMode('flashcards');
                    setCurrentFlashcardIndex(0);
                    setFlashcardFlipped(false);
                  }}
                  className={`p-4 rounded-xl transition-all ${
                    practiceMode === 'flashcards'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Star className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Flashcards</div>
                  <div className="text-xs opacity-75 mt-1">Interactive learning</div>
                </button>

                <button
                  onClick={() => {
                    setPracticeMode('quiz');
                    setQuizScore({ correct: 0, total: 0 });
                    setCurrentFlashcardIndex(0);
                    setQuizFeedback(null);
                  }}
                  className={`p-4 rounded-xl transition-all ${
                    practiceMode === 'quiz'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Trophy className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Quiz</div>
                  <div className="text-xs opacity-75 mt-1">Test yourself</div>
                </button>

                {isMobile && (
                  <button
                    onClick={() => {
                      setPracticeMode('listen');
                      setCurrentFlashcardIndex(0);
                    }}
                    className={`p-4 rounded-xl transition-all ${
                      practiceMode === 'listen'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Volume2 className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-semibold">Listen & Repeat</div>
                    <div className="text-xs opacity-75 mt-1">Audio practice</div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Flashcard Mode - Premium Feature */}
          {hasPremiumAccess && !isTeacher && practiceMode === 'flashcards' && effectiveItems.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-900">🎴 Flashcard Mode</h3>
                <div className="text-sm text-slate-600">
                  {currentFlashcardIndex + 1} / {effectiveItems.length}
                </div>
              </div>
              
              {effectiveItems[currentFlashcardIndex] && (
                <div>
                  <div
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    className="cursor-pointer perspective-1000 mb-4"
                  >
                    <div
                      className={`relative bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-12 min-h-[300px] flex items-center justify-center text-center transition-all duration-500 transform ${
                        flashcardFlipped ? 'rotate-y-180' : ''
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="text-center">
                        {!flashcardFlipped ? (
                          <div>
                            <div className="text-5xl font-bold mb-4">
                              {effectiveItems[currentFlashcardIndex].targetText}
                            </div>
                            <div className="text-sm opacity-75">Tap to reveal meaning</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold mb-4">
                              {effectiveItems[currentFlashcardIndex].english}
                            </div>
                            {effectiveItems[currentFlashcardIndex].romanization && (
                              <div className="text-xl opacity-90">
                                {effectiveItems[currentFlashcardIndex].romanization}
                              </div>
                            )}
                            <div className="text-sm opacity-75 mt-4">Tap to flip back</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        if (currentFlashcardIndex > 0) {
                          setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                          setFlashcardFlipped(false);
                        }
                      }}
                      disabled={currentFlashcardIndex === 0}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold disabled:opacity-50"
                    >
                      ← Previous
                    </button>

                    {isMobile && (
                      <button
                        onClick={() => speak(effectiveItems[currentFlashcardIndex].targetText)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Volume2 className="w-5 h-5" />
                        Listen
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (currentFlashcardIndex < effectiveItems.length - 1) {
                          setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                          setFlashcardFlipped(false);
                        } else {
                          alert('🎉 You completed all flashcards! Great job!');
                          setPracticeMode('browse');
                        }
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Mastery Rating */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Rate your mastery:</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => {
                            const itemId = effectiveItems[currentFlashcardIndex].id;
                            setMasteryLevels({ ...masteryLevels, [itemId]: level });
                            if (currentFlashcardIndex < effectiveItems.length - 1) {
                              setTimeout(() => {
                                setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                setFlashcardFlipped(false);
                              }, 300);
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg transition-all ${
                            masteryLevels[effectiveItems[currentFlashcardIndex].id] === level
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-white text-slate-600 hover:bg-yellow-100'
                          }`}
                        >
                          {'⭐'.repeat(level)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Mode - Premium Feature */}
          {hasPremiumAccess && !isTeacher && practiceMode === 'quiz' && effectiveItems.length > 3 && (
            <div className="mb-6 bg-white rounded-2xl p-6 shadow-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-900">🏆 Quiz Mode</h3>
                <div className="text-sm font-semibold text-green-700">
                  Score: {quizScore.correct} / {quizScore.total}
                </div>
              </div>

              {effectiveItems[currentFlashcardIndex] && (
                <div>
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-2">What does this mean?</div>
                    <div className="text-4xl font-bold text-slate-900 mb-4">
                      {effectiveItems[currentFlashcardIndex].targetText}
                    </div>
                    {effectiveItems[currentFlashcardIndex].romanization && (
                      <div className="text-lg text-slate-600">
                        ({effectiveItems[currentFlashcardIndex].romanization})
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {(() => {
                      const correctAnswer = effectiveItems[currentFlashcardIndex].english;
                      const wrongAnswers = effectiveItems
                        .filter((_, i) => i !== currentFlashcardIndex)
                        .map(item => item.english)
                        .filter((eng, i, arr) => arr.indexOf(eng) === i)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3);
                      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());

                      return allOptions.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedQuizOption(i);
                            const isCorrect = option === correctAnswer;
                            setQuizFeedback(isCorrect ? 'correct' : 'wrong');
                            setQuizScore({
                              correct: quizScore.correct + (isCorrect ? 1 : 0),
                              total: quizScore.total + 1
                            });
                            
                            setTimeout(() => {
                              if (currentFlashcardIndex < effectiveItems.length - 1) {
                                setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                setSelectedQuizOption(null);
                                setQuizFeedback(null);
                              } else {
                                const percentage = ((quizScore.correct + (isCorrect ? 1 : 0)) / (quizScore.total + 1) * 100).toFixed(0);
                                alert(`🎉 Quiz Complete! Your score: ${percentage}%`);
                                setPracticeMode('browse');
                              }
                            }, 1500);
                          }}
                          disabled={quizFeedback !== null}
                          className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
                            selectedQuizOption === i && quizFeedback === 'correct'
                              ? 'bg-green-100 border-2 border-green-500 text-green-900'
                              : selectedQuizOption === i && quizFeedback === 'wrong'
                              ? 'bg-red-100 border-2 border-red-500 text-red-900'
                              : 'bg-slate-50 border-2 border-slate-200 hover:border-green-400 text-slate-900'
                          }`}
                        >
                          {option}
                          {selectedQuizOption === i && quizFeedback === 'correct' && ' ✅'}
                          {selectedQuizOption === i && quizFeedback === 'wrong' && ' ❌'}
                        </button>
                      ));
                    })()}
                  </div>

                  {isMobile && (
                    <div className="text-center">
                      <button
                        onClick={() => speak(effectiveItems[currentFlashcardIndex].targetText)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 inline-flex items-center gap-2"
                      >
                        <Volume2 className="w-5 h-5" />
                        Play Audio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Listen & Repeat Mode - Premium Feature (Mobile Only) */}
          {isMobile && hasPremiumAccess && !isTeacher && practiceMode === 'listen' && effectiveItems.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-900">🎧 Listen & Repeat</h3>
                <div className="text-sm text-slate-600">
                  {currentFlashcardIndex + 1} / {effectiveItems.length}
                </div>
              </div>

              {effectiveItems[currentFlashcardIndex] && (
                <div>
                  <div className="mb-6 p-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl text-center">
                    <div className="text-5xl font-bold mb-4">
                      {effectiveItems[currentFlashcardIndex].targetText}
                    </div>
                    <div className="text-2xl opacity-90 mb-2">
                      {effectiveItems[currentFlashcardIndex].english}
                    </div>
                    {effectiveItems[currentFlashcardIndex].romanization && (
                      <div className="text-lg opacity-75">
                        ({effectiveItems[currentFlashcardIndex].romanization})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={() => {
                        speak(effectiveItems[currentFlashcardIndex].targetText);
                        if (listenModeAuto && currentFlashcardIndex < effectiveItems.length - 1) {
                          setTimeout(() => {
                            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                          }, 3000);
                        }
                      }}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 flex items-center gap-3 text-lg"
                    >
                      <Play className="w-6 h-6" />
                      Play & Repeat
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        if (currentFlashcardIndex > 0) {
                          setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                        }
                      }}
                      disabled={currentFlashcardIndex === 0}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold disabled:opacity-50"
                    >
                      ← Previous
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={listenModeAuto}
                        onChange={(e) => setListenModeAuto(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm text-slate-700">Auto-play next</span>
                    </label>

                    <button
                      onClick={() => {
                        if (currentFlashcardIndex < effectiveItems.length - 1) {
                          setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                        } else {
                          alert('🎉 You completed all items! Excellent practice!');
                          setPracticeMode('browse');
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily Quizzes Section - Visible to all */}
          {dailyQuizzes.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 mb-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                🎯 Today's Quiz Challenge
              </h3>
              {dailyQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-xl p-4 mb-3">
                  <div className="font-semibold text-gray-900 mb-3">{quiz.question}</div>
                  {quiz.hint && (
                    <div className="text-sm text-gray-600 italic mb-3">💡 Hint: {quiz.hint}</div>
                  )}
                  <div className="space-y-2">
                    {quiz.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (!quizSubmitted[quiz.id]) {
                            setSelectedQuizAnswer(option);
                          }
                        }}
                        disabled={quizSubmitted[quiz.id]}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          quizSubmitted[quiz.id]
                            ? option === quiz.correctAnswer
                              ? 'bg-green-100 border-2 border-green-500'
                              : selectedQuizAnswer === option
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-gray-50'
                            : selectedQuizAnswer === option
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {option}
                        {quizSubmitted[quiz.id] && option === quiz.correctAnswer && ' ✓'}
                      </button>
                    ))}
                  </div>
                  {!quizSubmitted[quiz.id] && selectedQuizAnswer && (
                    <button
                      onClick={async () => {
                        if (!user || !selectedQuizAnswer) return;
                        const isCorrect = selectedQuizAnswer === quiz.correctAnswer;
                        try {
                          await submitQuizAnswer({
                            quizId: quiz.id,
                            userId: user.uid,
                            studentName: studentNameFromUser(user),
                            answer: selectedQuizAnswer,
                            isCorrect,
                          });
                          setQuizSubmitted({ ...quizSubmitted, [quiz.id]: true });
                          if (isCorrect) {
                            alert('🎉 Correct! Great job!');
                          } else {
                            alert('Not quite. Try again tomorrow!');
                          }
                        } catch (error) {
                          console.error('Error submitting quiz:', error);
                        }
                      }}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Shoutouts Section - Visible to all */}
          {shoutouts.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 sm:p-6 border-2 border-yellow-200 mb-6">
              <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Student Shoutouts
              </h3>
              <div className="grid gap-3">
                {shoutouts.slice(0, 5).map((shoutout) => (
                  <div
                    key={shoutout.id}
                    className="bg-white rounded-lg p-4 flex items-start gap-3"
                  >
                    <Star className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="font-bold text-purple-900">{shoutout.studentName}</div>
                      <p className="text-gray-700 mt-1">{shoutout.message}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        {shoutout.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Daily Challenge</div>
                  <div className="text-base sm:text-lg text-slate-900">Practice one today</div>
                </div>
                <div className="w-10 h-10 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              {dailyChallengeItem ? (
                <div className="rounded-xl bg-white border border-indigo-100 p-4">
                  {editingDailyChallenge && isTeacher ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editItemData.targetText}
                        onChange={(e) => setEditItemData({ ...editItemData, targetText: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Text"
                      />
                      <input
                        type="text"
                        value={editItemData.english}
                        onChange={(e) => setEditItemData({ ...editItemData, english: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="English meaning"
                      />
                      <input
                        type="text"
                        value={editItemData.romanization}
                        onChange={(e) => setEditItemData({ ...editItemData, romanization: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Romanization"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await handleEditItem(dailyChallengeItem.id);
                            setEditingDailyChallenge(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDailyChallenge(false)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-slate-900 text-xl leading-snug">{dailyChallengeItem.targetText}</div>
                          {dailyChallengeItem.english ? <div className="text-slate-600 text-sm mt-1">{dailyChallengeItem.english}</div> : null}
                          {dailyChallengeItem.romanization ? (
                            <div className="text-slate-500 text-sm mt-1">{dailyChallengeItem.romanization}</div>
                          ) : null}
                        </div>
                        {isTeacher && (
                          <button
                            onClick={() => {
                              setEditItemData({
                                targetText: dailyChallengeItem.targetText,
                                english: dailyChallengeItem.english || '',
                                romanization: dailyChallengeItem.romanization || ''
                              });
                              setEditingDailyChallenge(true);
                            }}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speak(dailyChallengeItem.targetText)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItemId(dailyChallengeItem.id);
                            recordingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                        >
                          Practice now
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No items available yet.</div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Progress</div>
                  <div className="text-lg text-slate-900">Keep your streak</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white border border-indigo-100 p-4">
                  <div className="text-xs text-slate-500">Today</div>
                  <div className="text-2xl text-slate-900 mt-1">{todayPracticeCount}</div>
                </div>
                <div className="rounded-xl bg-white border border-indigo-100 p-4">
                  <div className="text-xs text-slate-500">Streak</div>
                  <div className="text-2xl text-slate-900 mt-1">{streakDays}</div>
                </div>
                <div className="rounded-xl bg-white border border-indigo-100 p-4">
                  <div className="text-xs text-slate-500">Saved</div>
                  <div className="text-2xl text-slate-900 mt-1">{savedIds.size}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-3">Tracks plays/recordings/submissions on this device.</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Favorites</div>
                  <div className="text-lg text-slate-900">Practice your saved list</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Star className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnlySaved(false)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    !showOnlySaved
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white border border-indigo-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  All items
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnlySaved(true)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    showOnlySaved
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white border border-indigo-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  Saved only
                </button>
              </div>
              {savedIds.size === 0 ? (
                <div className="text-sm text-slate-600 mt-3">Save words/sentences to build your own practice list.</div>
              ) : null}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="text-sm text-slate-600">Language</div>
                <div className="inline-flex rounded-xl overflow-hidden border border-indigo-200 bg-white">
                  {(['Bengali', 'Hindi', 'English'] as PronunciationLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 text-sm transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-slate-700 hover:bg-indigo-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="ml-0 md:ml-4 text-sm text-slate-600">Type</div>
                <div className="inline-flex rounded-xl overflow-hidden border border-indigo-200 bg-white">
                  {([
                    { id: 'letter' as const, label: 'Letters' },
                    { id: 'word' as const, label: 'Words' },
                    { id: 'sentence' as const, label: 'Sentences' },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`px-4 py-2 text-sm transition-colors ${
                        selectedType === t.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-slate-700 hover:bg-indigo-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="pl-9 pr-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-72"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowOnlySaved((v) => !v)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    showOnlySaved
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white border border-indigo-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  {showOnlySaved ? 'Saved only' : 'All items'}
                </button>

                {selectedType === 'word' ? (
                  <button
                    type="button"
                    onClick={() => void lookupDictionary(search || selectedItem?.targetText || dictionaryQuery || '', selectedLanguage)}
                    disabled={dictLoading}
                    className={`px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                      dictLoading
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Dictionary
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {actionError ? (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              {actionError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
              {successMessage}
            </div>
          ) : null}

          {ttsError ? (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <div>
                <div className="text-sm">{ttsError}</div>
                <div className="text-xs text-amber-800 mt-1">Try Chrome/Edge, or enable system voices.</div>
              </div>
            </div>
          ) : null}

          {showingSeedFallback ? (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm">
              Showing built-in {selectedType} list for {selectedLanguage}. Tap Play to hear pronunciation.
              {isTeacher ? ' You can import these into the database using “Import Seed (this view)”.' : ''}
              {selectedType !== 'letter' && !seedFileLoaded ? ' Loading the full library…' : ''}
            </div>
          ) : null}

          {isTeacher ? (
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl text-slate-900">Manage Library</h2>
                  <div className="text-sm text-slate-600">Add new letters/words/sentences for students.</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void addInitialContent()}
                    disabled={seeding}
                    className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                      seeding ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }`}
                  >
                    {seeding ? 'Adding…' : '🚀 Quick Setup'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <input
                  value={newTargetText}
                  onChange={(e) => setNewTargetText(e.target.value)}
                  placeholder={selectedType === 'letter' ? 'Letter' : selectedType === 'word' ? 'Word' : 'Sentence'}
                  className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="English meaning (optional)"
                  className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                />
                <div className="flex gap-2">
                  <input
                    value={newRomanization}
                    onChange={(e) => setNewRomanization(e.target.value)}
                    placeholder="Romanization"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => void createItem()}
                    disabled={creatingItem || !newTargetText.trim()}
                    className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                      creatingItem || !newTargetText.trim()
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {creatingItem ? 'Adding…' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {savedIds.size > 0 ? (
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl text-slate-900">Saved List</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (savedItemsForView.length === 0) return;
                        const pick = savedItemsForView[Math.floor(Math.random() * savedItemsForView.length)];
                        if (!pick) return;
                        setSelectedItemId(pick.id);
                        recordingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      disabled={savedItemsForView.length === 0}
                      className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
                        savedItemsForView.length === 0
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }`}
                    >
                      <Shuffle className="w-4 h-4" />
                      <span className="hidden sm:inline">Practice random saved</span>
                      <span className="sm:hidden">Random</span>
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white">
                    <div className="grid grid-cols-[1.2fr_1.4fr_110px] gap-0 px-4 py-3 bg-slate-50 text-xs text-slate-600">
                      <div>English</div>
                      <div>{selectedLanguage}</div>
                      <div className="text-right">Play / Unsave</div>
                    </div>

                    <div className="divide-y divide-indigo-100">
                      {savedItemsForView.length === 0 ? (
                        <div className="p-4 text-sm text-slate-600">No saved items match your search.</div>
                      ) : (
                        savedItemsForView.map((entry) => {
                          const isSelected = entry.id === (selectedItem?.id ?? '');
                          return (
                            <div
                              key={entry.id}
                              className={`grid grid-cols-[1.2fr_1.4fr_110px] gap-0 px-4 py-3 items-center hover:bg-indigo-50 cursor-pointer ${
                                isSelected ? 'bg-indigo-50' : 'bg-white'
                              }`}
                              onClick={() => setSelectedItemId(entry.id)}
                            >
                              <div className="text-slate-900 text-sm truncate">{entry.english || '—'}</div>
                              <div className="min-w-0">
                                <div className="text-slate-900 text-sm truncate">{entry.targetText}</div>
                                {pronounceGuide(entry, selectedLanguage) ? (
                                  <div className="text-xs text-slate-500 truncate">{pronounceGuide(entry, selectedLanguage)}</div>
                                ) : null}
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak(entry.targetText, { itemId: entry.id });
                                  }}
                                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                                  aria-label="Play"
                                  title="Play"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaved(entry.id);
                                  }}
                                  className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center"
                                  aria-label="Unsave"
                                  title="Unsave"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-3 w-full">
                    <h2 className="text-xl text-slate-900">Structured Lessons</h2>

                    {selectedType === 'letter' ? null : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {mergedLessons.map((lesson) => {
                          // Pass full premium access as boolean true, or individual purchases as array
                          const purchaseStatus = hasPremiumAccess ? true : purchasedLessons;
                          const isUnlocked = isLessonUnlocked(lesson.id, completedLessons, purchaseStatus, isTeacher);
                          const isActive = lesson.id === selectedLessonIndex;
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isPurchased = purchasedLessons.includes(lesson.id);
                          
                          return (
                            <div key={lesson.id} className="relative">
                              <button
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => {
                                  if (!isUnlocked) return;
                                  setSelectedLessonIndex(lesson.id);
                                }}
                                className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg'
                                    : isUnlocked
                                      ? 'bg-white text-slate-900 border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                } ${
                                  !isUnlocked && lesson.unlockType === 'premium' ? 'pb-12' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-indigo-600'}`}>
                                    Lesson {lesson.id}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!isUnlocked && <Lock className="w-3 h-3" />}
                                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                    {isPurchased && !isCompleted && <CheckCircle2 className="w-3 h-3 text-purple-500" />}
                                  </div>
                                </div>
                                <div className={`text-sm font-semibold mb-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                  {lesson.title}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                                  {lesson.category}
                                </div>
                              </button>
                              {!isUnlocked && lesson.unlockType === 'premium' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentType('lesson');
                                    setPaymentLessonId(lesson.id);
                                    setPaymentLessonTitle(lesson.title);
                                    setShowPremiumModal(true);
                                  }}
                                  className="absolute bottom-3 left-3 right-3 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-pink-600 transition-all flex items-center justify-center gap-1 shadow-md"
                                >
                                  <Lock className="w-3 h-3" />
                                  Buy for $2
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lesson Content Details */}
                {selectedType !== 'letter' && selectedLessonIndex && mergedLessons.find(l => l.id === selectedLessonIndex) && (
                  <div className="mt-6 space-y-4">
                    {(() => {
                      const currentLesson = mergedLessons.find(l => l.id === selectedLessonIndex);
                      if (!currentLesson) return null;
                      const isCompleted = completedLessons.includes(currentLesson.id);
                      
                      return (
                        <>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{currentLesson.title}</h3>
                                <p className="text-sm text-slate-700">{currentLesson.description}</p>
                              </div>
                              {!isCompleted && (
                                <button
                                  onClick={() => markLessonComplete(currentLesson.id)}
                                  className="ml-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark Complete
                                </button>
                              )}
                              {isCompleted && (
                                <div className="ml-4 px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Completed
                                </div>
                              )}
                            </div>
                          </div>

                          {currentLesson.grammar && (
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-blue-900">📚 Grammar Note</h4>
                                {isTeacher && !editingGrammar && (
                                  <button
                                    onClick={() => {
                                      setEditGrammarText(currentLesson.grammar || '');
                                      setEditingGrammar(true);
                                    }}
                                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                                  >
                                    <Edit className="w-4 h-4 text-blue-700" />
                                  </button>
                                )}
                              </div>
                              {editingGrammar && isTeacher ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editGrammarText}
                                    onChange={(e) => setEditGrammarText(e.target.value)}
                                    className="w-full p-2 border-2 border-blue-300 rounded-lg text-sm"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveGrammar}
                                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingGrammar(false)}
                                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-blue-800">{currentLesson.grammar}</p>
                              )}
                            </div>
                          )}

                          {currentLesson.culturalNote && (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-amber-900">🌍 Cultural Insight</h4>
                                {isTeacher && !editingCultural && (
                                  <button
                                    onClick={() => {
                                      setEditCulturalText(currentLesson.culturalNote || '');
                                      setEditingCultural(true);
                                    }}
                                    className="p-1 hover:bg-amber-200 rounded transition-colors"
                                  >
                                    <Edit className="w-4 h-4 text-amber-700" />
                                  </button>
                                )}
                              </div>
                              {editingCultural && isTeacher ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editCulturalText}
                                    onChange={(e) => setEditCulturalText(e.target.value)}
                                    className="w-full p-2 border-2 border-amber-300 rounded-lg text-sm"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveCultural}
                                      className="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCultural(false)}
                                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-amber-800">{currentLesson.culturalNote}</p>
                              )}
                            </div>
                          )}



                          {/* Lesson Vocabulary */}
                          <div className="p-4 rounded-xl bg-white border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-slate-900">
                                📝 Vocabulary ({vocabularyItems.filter(v => v.lessonNumber === currentLesson.id).length} words)
                              </h4>
                              {isTeacher && (
                                <button
                                  onClick={() => setShowAddVocab(!showAddVocab)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Word
                                </button>
                              )}
                            </div>
                            
                            {showAddVocab && isTeacher && (
                              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                                <input
                                  type="text"
                                  placeholder="Word"
                                  value={newVocabData.word}
                                  onChange={(e) => setNewVocabData({ ...newVocabData, word: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Meaning"
                                  value={newVocabData.meaning}
                                  onChange={(e) => setNewVocabData({ ...newVocabData, meaning: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Romanization"
                                  value={newVocabData.romanization}
                                  onChange={(e) => setNewVocabData({ ...newVocabData, romanization: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAddVocab}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddVocab(false);
                                      setNewVocabData({ word: '', meaning: '', romanization: '', partOfSpeech: '', exampleSentence: '' });
                                    }}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Firebase vocabulary items (editable by teacher) */}
                              {vocabularyItems
                                .filter(v => v.lessonNumber === currentLesson.id)
                                .sort((a, b) => a.order - b.order)
                                .map((vocab) => {
                                  const isEditing = editingVocabId === vocab.id;
                                  return (
                                    <div
                                      key={vocab.id}
                                      className="px-3 py-3 rounded-lg bg-indigo-50 border border-indigo-100 transition-colors"
                                    >
                                      {isEditing && isTeacher ? (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            value={editVocabData.word}
                                            onChange={(e) => setEditVocabData({ ...editVocabData, word: e.target.value })}
                                            className="w-full p-1 border rounded text-sm"
                                            placeholder="Word"
                                          />
                                          <input
                                            type="text"
                                            value={editVocabData.meaning}
                                            onChange={(e) => setEditVocabData({ ...editVocabData, meaning: e.target.value })}
                                            className="w-full p-1 border rounded text-sm"
                                            placeholder="Meaning"
                                          />
                                          <input
                                            type="text"
                                            value={editVocabData.romanization}
                                            onChange={(e) => setEditVocabData({ ...editVocabData, romanization: e.target.value })}
                                            className="w-full p-1 border rounded text-sm"
                                            placeholder="Romanization"
                                          />
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleEditVocab(vocab.id!)}
                                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                                            >
                                              <Save className="w-3 h-3" />
                                              Save
                                            </button>
                                            <button
                                              onClick={() => setEditingVocabId(null)}
                                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 cursor-pointer" onClick={() => speak(vocab.word, {})}>
                                              <div className="text-base font-semibold text-indigo-900">{vocab.word}</div>
                                              <div className="text-xs text-indigo-600 mt-0.5">{vocab.meaning}</div>
                                              {vocab.romanization && (
                                                <div className="text-xs text-indigo-500 mt-1 italic">{vocab.romanization}</div>
                                              )}
                                            </div>
                                            {isTeacher && (
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => {
                                                    setEditVocabData({
                                                      word: vocab.word,
                                                      meaning: vocab.meaning,
                                                      romanization: vocab.romanization || '',
                                                      partOfSpeech: vocab.partOfSpeech || '',
                                                      exampleSentence: vocab.exampleSentence || ''
                                                    });
                                                    setEditingVocabId(vocab.id!);
                                                  }}
                                                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                >
                                                  <Edit className="w-3 h-3 text-blue-600" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteVocab(vocab.id!)}
                                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                                >
                                                  <Trash2 className="w-3 h-3 text-red-600" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              
                              {/* Static words from lessonContent.ts (always show if they exist) */}
                              {currentLesson.words.map((word, idx) => {
                                const parts = word.split(' - ');
                                const bengaliText = parts[0]?.trim() || '';
                                const englishText = parts[1]?.trim() || '';
                                const romanization = parts[2]?.trim() || '';
                                
                                // Skip if this is actually a Firebase item (to avoid duplicates)
                                const isFirebaseItem = vocabularyItems.some(v => 
                                  v.lessonNumber === currentLesson.id && 
                                  v.word === bengaliText
                                );
                                if (isFirebaseItem) return null;
                                
                                const staticItemEditKey = `static-vocab-${currentLesson.id}-${idx}`;
                                const isEditingStatic = editingVocabId === staticItemEditKey;
                                
                                return (
                                  <div
                                    key={`static-${idx}`}
                                    className="px-3 py-3 rounded-lg bg-indigo-50 border border-indigo-100 transition-colors"
                                  >
                                    {isEditingStatic && isTeacher ? (
                                      <div className="space-y-2">
                                        <input
                                          type="text"
                                          value={editVocabData.word}
                                          onChange={(e) => setEditVocabData({ ...editVocabData, word: e.target.value })}
                                          className="w-full p-1 border rounded text-sm"
                                          placeholder="Word"
                                        />
                                        <input
                                          type="text"
                                          value={editVocabData.meaning}
                                          onChange={(e) => setEditVocabData({ ...editVocabData, meaning: e.target.value })}
                                          className="w-full p-1 border rounded text-sm"
                                          placeholder="Meaning"
                                        />
                                        <input
                                          type="text"
                                          value={editVocabData.romanization}
                                          onChange={(e) => setEditVocabData({ ...editVocabData, romanization: e.target.value })}
                                          className="w-full p-1 border rounded text-sm"
                                          placeholder="Romanization"
                                        />
                                        <div className="flex gap-1">
                                          <button
                                            onClick={async () => {
                                              // Convert static item to Firebase item
                                              if (!user) return;
                                              try {
                                                const maxOrder = vocabularyItems
                                                  .filter(v => v.lessonNumber === currentLesson.id)
                                                  .reduce((max, v) => Math.max(max, v.order), 0);
                                                
                                                await createVocabularyItem({
                                                  lessonId: currentLesson.id.toString(),
                                                  language: selectedLanguage,
                                                  lessonNumber: currentLesson.id,
                                                  word: editVocabData.word,
                                                  meaning: editVocabData.meaning,
                                                  romanization: editVocabData.romanization,
                                                  partOfSpeech: editVocabData.partOfSpeech,
                                                  exampleSentence: editVocabData.exampleSentence,
                                                  order: maxOrder + 1,
                                                  createdByUid: user.uid,
                                                });
                                                setEditingVocabId(null);
                                                setEditVocabData({ word: '', meaning: '', romanization: '', partOfSpeech: '', exampleSentence: '' });
                                              } catch (error) {
                                                console.error('Error converting static item:', error);
                                                alert('Failed to save changes');
                                              }
                                            }}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                                          >
                                            <Save className="w-3 h-3" />
                                            Save as New
                                          </button>
                                          <button
                                            onClick={() => setEditingVocabId(null)}
                                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                        <p className="text-xs text-slate-500">Note: This will create a new editable copy. Original remains in code.</p>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 cursor-pointer" onClick={() => speak(bengaliText, {})}>
                                            <div className="text-base font-semibold text-indigo-900">{bengaliText}</div>
                                            <div className="text-xs text-indigo-600 mt-0.5">{englishText}</div>
                                            {romanization && (
                                              <div className="text-xs text-slate-500 italic mt-0.5">({romanization})</div>
                                            )}
                                          </div>
                                          {isTeacher && (
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => {
                                                  setEditVocabData({
                                                    word: bengaliText,
                                                    meaning: englishText,
                                                    romanization: romanization,
                                                    partOfSpeech: '',
                                                    exampleSentence: ''
                                                  });
                                                  setEditingVocabId(staticItemEditKey);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                title="Edit (creates editable copy)"
                                              >
                                                <Edit className="w-3 h-3 text-blue-600" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Lesson Sentences */}
                          <div className="p-4 rounded-xl bg-white border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-slate-900">
                                💬 Practice Sentences ({practiceSentences.filter(s => s.lessonNumber === currentLesson.id).length})
                              </h4>
                              {isTeacher && (
                                <button
                                  onClick={() => setShowAddSentence(!showAddSentence)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Sentence
                                </button>
                              )}
                            </div>
                            
                            {showAddSentence && isTeacher && (
                              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                                <input
                                  type="text"
                                  placeholder="Sentence"
                                  value={newSentenceData.sentence}
                                  onChange={(e) => setNewSentenceData({ ...newSentenceData, sentence: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Translation"
                                  value={newSentenceData.translation}
                                  onChange={(e) => setNewSentenceData({ ...newSentenceData, translation: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Romanization"
                                  value={newSentenceData.romanization}
                                  onChange={(e) => setNewSentenceData({ ...newSentenceData, romanization: e.target.value })}
                                  className="w-full p-2 border rounded text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAddSentence}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddSentence(false);
                                      setNewSentenceData({ sentence: '', translation: '', romanization: '' });
                                    }}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              {practiceSentences
                                .filter(s => s.lessonNumber === currentLesson.id)
                                .sort((a, b) => a.order - b.order)
                                .map((sentence) => {
                                  const isEditing = editingSentenceId === sentence.id;
                                  return (
                                    <div
                                      key={sentence.id}
                                      className="p-3 rounded-lg bg-purple-50 border border-purple-100"
                                    >
                                      {isEditing && isTeacher ? (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            value={editSentenceData.sentence}
                                            onChange={(e) => setEditSentenceData({ ...editSentenceData, sentence: e.target.value })}
                                            className="w-full p-2 border rounded text-sm"
                                            placeholder="Sentence"
                                          />
                                          <input
                                            type="text"
                                            value={editSentenceData.translation}
                                            onChange={(e) => setEditSentenceData({ ...editSentenceData, translation: e.target.value })}
                                            className="w-full p-2 border rounded text-sm"
                                            placeholder="Translation"
                                          />
                                          <input
                                            type="text"
                                            value={editSentenceData.romanization}
                                            onChange={(e) => setEditSentenceData({ ...editSentenceData, romanization: e.target.value })}
                                            className="w-full p-2 border rounded text-sm"
                                            placeholder="Romanization"
                                          />
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleEditSentence(sentence.id!)}
                                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                                            >
                                              <Save className="w-3 h-3" />
                                              Save
                                            </button>
                                            <button
                                              onClick={() => setEditingSentenceId(null)}
                                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">{sentence.sentence}</div>
                                            <div className="text-xs text-slate-600 mt-1">{sentence.translation}</div>
                                            {sentence.romanization && (
                                              <div className="text-xs text-slate-500 mt-1 italic">{sentence.romanization}</div>
                                            )}
                                          </div>
                                          {isTeacher && (
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => {
                                                  setEditSentenceData({
                                                    sentence: sentence.sentence,
                                                    translation: sentence.translation,
                                                    romanization: sentence.romanization || ''
                                                  });
                                                  setEditingSentenceId(sentence.id!);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded transition-colors"
                                              >
                                                <Edit className="w-3 h-3 text-blue-600" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteSentence(sentence.id!)}
                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                              >
                                                <Trash2 className="w-3 h-3 text-red-600" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              
                              {/* Static sentences from lessonContent.ts (always show if they exist) */}
                              {currentLesson.sentences.map((sentence, idx) => {
                                const parts = sentence.split(' - ');
                                const bengaliText = parts[0]?.trim() || '';
                                const englishText = parts[1]?.trim() || '';
                                const romanization = parts[2]?.trim() || '';
                                
                                // Skip if this is actually a Firebase item (to avoid duplicates)
                                const isFirebaseItem = practiceSentences.some(s => 
                                  s.lessonNumber === currentLesson.id && 
                                  s.sentence === bengaliText
                                );
                                if (isFirebaseItem) return null;
                                
                                const staticItemEditKey = `static-sentence-${currentLesson.id}-${idx}`;
                                const isEditingStatic = editingSentenceId === staticItemEditKey;
                                
                                return (
                                  <div
                                    key={`static-${idx}`}
                                    className="p-3 rounded-lg bg-purple-50 border border-purple-100"
                                  >
                                    {isEditingStatic && isTeacher ? (
                                      <div className="space-y-2">
                                        <input
                                          type="text"
                                          value={editSentenceData.sentence}
                                          onChange={(e) => setEditSentenceData({ ...editSentenceData, sentence: e.target.value })}
                                          className="w-full p-2 border rounded text-sm"
                                          placeholder="Sentence"
                                        />
                                        <input
                                          type="text"
                                          value={editSentenceData.translation}
                                          onChange={(e) => setEditSentenceData({ ...editSentenceData, translation: e.target.value })}
                                          className="w-full p-2 border rounded text-sm"
                                          placeholder="Translation"
                                        />
                                        <input
                                          type="text"
                                          value={editSentenceData.romanization}
                                          onChange={(e) => setEditSentenceData({ ...editSentenceData, romanization: e.target.value })}
                                          className="w-full p-2 border rounded text-sm"
                                          placeholder="Romanization"
                                        />
                                        <div className="flex gap-1">
                                          <button
                                            onClick={async () => {
                                              // Convert static item to Firebase item
                                              if (!user) return;
                                              try {
                                                const maxOrder = practiceSentences
                                                  .filter(s => s.lessonNumber === currentLesson.id)
                                                  .reduce((max, s) => Math.max(max, s.order), 0);
                                                
                                                await createPracticeSentence({
                                                  lessonId: currentLesson.id.toString(),
                                                  language: selectedLanguage,
                                                  lessonNumber: currentLesson.id,
                                                  sentence: editSentenceData.sentence,
                                                  translation: editSentenceData.translation,
                                                  romanization: editSentenceData.romanization,
                                                  order: maxOrder + 1,
                                                  createdByUid: user.uid,
                                                });
                                                setEditingSentenceId(null);
                                                setEditSentenceData({ sentence: '', translation: '', romanization: '' });
                                              } catch (error) {
                                                console.error('Error converting static sentence:', error);
                                                alert('Failed to save changes');
                                              }
                                            }}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                                          >
                                            <Save className="w-3 h-3" />
                                            Save as New
                                          </button>
                                          <button
                                            onClick={() => setEditingSentenceId(null)}
                                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                        <p className="text-xs text-slate-500">Note: This will create a new editable copy. Original remains in code.</p>
                                      </div>
                                    ) : (
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 cursor-pointer" onClick={() => speak(bengaliText, {})}>
                                          <div className="text-sm font-medium text-slate-900">{bengaliText}</div>
                                          {englishText && <div className="text-xs text-slate-600 mt-1">{englishText}</div>}
                                          {romanization && (
                                            <div className="text-xs text-slate-500 italic mt-1">({romanization})</div>
                                          )}
                                        </div>
                                        {isTeacher && (
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => {
                                                setEditSentenceData({
                                                  sentence: bengaliText,
                                                  translation: englishText,
                                                  romanization: romanization
                                                });
                                                setEditingSentenceId(staticItemEditKey);
                                              }}
                                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                                              title="Edit (creates editable copy)"
                                            >
                                              <Edit className="w-3 h-3 text-blue-600" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white mt-6">
                  <div className={`grid ${isTeacher ? 'grid-cols-[1.2fr_1.4fr_150px]' : 'grid-cols-[1.2fr_1.4fr_110px]'} gap-0 px-4 py-3 bg-slate-50 text-xs text-slate-600`}>
                    <div>English</div>
                    <div>{selectedLanguage}</div>
                    <div className="text-right">{isTeacher ? 'Actions' : 'Play / Save'}</div>
                  </div>

                  <div className="divide-y divide-indigo-100">
                    {filteredItems.length === 0 ? (
                      <div className="p-6 text-center">
                        {isTeacher ? (
                          <div className="space-y-3">
                            <p className="text-sm text-slate-600">No items in database yet.</p>
                            <p className="text-xs text-slate-500">Use "Quick Setup" button above to add initial content, or create your own items.</p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600">No items available yet.</p>
                        )}
                      </div>
                    ) : (
                      filteredItems.map((entry) => {
                        const isSelected = entry.id === (selectedItem?.id ?? '');
                        const isSaved = savedIds.has(entry.id);
                        const isEditing = editingItemId === entry.id;
                        const isSeedItem = entry.id.startsWith('seed_');
                        const canEdit = isTeacher; // Teachers can edit all items, seeds will be auto-imported
                        
                        return (
                          <div
                            key={entry.id}
                            className={`grid ${isTeacher ? 'grid-cols-[1.2fr_1.4fr_150px]' : 'grid-cols-[1.2fr_1.4fr_110px]'} gap-0 px-4 py-3 items-center hover:bg-indigo-50 ${
                              isSelected ? 'bg-indigo-50' : 'bg-white'
                            }`}
                          >
                            {isEditing ? (
                              <>
                                <input
                                  value={editItemData.english}
                                  onChange={(e) => setEditItemData({ ...editItemData, english: e.target.value })}
                                  className="text-sm p-1 border rounded"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                  value={editItemData.targetText}
                                  onChange={(e) => setEditItemData({ ...editItemData, targetText: e.target.value })}
                                  className="text-sm p-1 border rounded"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditItem(entry.id);
                                    }}
                                    className="p-1 hover:bg-green-100 rounded"
                                  >
                                    <Save className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingItemId(null);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <X className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-slate-900 text-sm truncate" onClick={() => setSelectedItemId(entry.id)}>
                                  {entry.english || '—'}
                                </div>
                                <div className="min-w-0" onClick={() => setSelectedItemId(entry.id)}>
                                  <div className="text-slate-900 text-sm truncate">{entry.targetText}</div>
                                  {pronounceGuide(entry, selectedLanguage) ? (
                                    <div className="text-xs text-slate-500 truncate">{pronounceGuide(entry, selectedLanguage)}</div>
                                  ) : null}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  {canEdit ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditItemData({
                                            targetText: entry.targetText,
                                            english: entry.english || '',
                                            romanization: entry.romanization || ''
                                          });
                                          setEditingItemId(entry.id);
                                        }}
                                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                                      >
                                        <Edit className="w-4 h-4 text-blue-600" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteItem(entry.id);
                                        }}
                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          speak(entry.targetText, { itemId: entry.id });
                                        }}
                                        className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
                                      >
                                        <Play className="w-4 h-4 text-indigo-600" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          speak(entry.targetText, { itemId: entry.id });
                                        }}
                                        className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
                                      >
                                        <Play className="w-4 h-4 text-indigo-600" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSaved(entry.id);
                                        }}
                                        className={`p-1 rounded-full transition-colors ${
                                          isSaved ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-slate-100 text-slate-400'
                                        }`}
                                      >
                                        <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -mr-28 -mt-28" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-wider text-white/80 mb-2">Selected</div>
                  <div className="text-3xl leading-tight mb-2">{selectedItem?.targetText ?? '—'}</div>
                  <div className="text-white/90 text-sm mb-2">{selectedItem?.english ?? ''}</div>
                  {selectedItem ? (
                    <div className="text-white/80 text-sm">
                      {pronounceGuide(selectedItem, selectedLanguage) ?? ''}
                    </div>
                  ) : null}
                  {!selectedItem?.romanization && selectedLanguage !== 'English' ? (
                    <div className="text-white/80 text-xs mt-2">Tap Play to hear pronunciation.</div>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => selectedItem && speak(selectedItem.targetText, { itemId: selectedItem.id })}
                      disabled={!selectedItem}
                      className={`px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 ${
                        selectedItem ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-white/20 text-white/70 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={stopSpeech}
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/25 transition-colors text-sm flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Stop
                    </button>
                    {selectedItem ? (
                      <button
                        type="button"
                        onClick={() => toggleSaved(selectedItem.id)}
                        className={`ml-auto px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 ${
                          savedIds.has(selectedItem.id)
                            ? 'bg-white text-indigo-700'
                            : 'bg-white/20 hover:bg-white/25 text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        {savedIds.has(selectedItem.id) ? 'Saved' : 'Save'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {selectedType === 'word' ? (
                <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg text-slate-900">Dictionary</h3>
                    <div className="text-xs text-slate-500">{selectedLanguage}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 mb-3">
                    <input
                      value={dictionaryQuery}
                      onChange={(e) => setDictionaryQuery(e.target.value)}
                      placeholder={`Type any ${selectedLanguage} word`}
                      className="w-full min-w-0 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => void lookupDictionary(dictionaryQuery || selectedItem?.targetText || '', selectedLanguage)}
                      disabled={dictLoading}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm transition-colors ${
                        dictLoading
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {dictLoading ? 'Loading…' : 'Lookup'}
                    </button>
                    <button
                      type="button"
                      onClick={startVoiceLookup}
                      disabled={dictLoading || dictListening}
                      className={`w-full sm:col-span-2 md:col-span-1 sm:w-full md:w-auto px-4 py-2 rounded-xl text-sm transition-colors ${
                        dictLoading || dictListening
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }`}
                      title="Voice search"
                    >
                      {dictListening ? 'Listening…' : 'Voice'}
                    </button>
                  </div>

                  {dictError ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                      {dictError}
                    </div>
                  ) : null}

                  {dictResult ? (
                    <div className="rounded-xl bg-white border border-indigo-100 p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="text-lg text-slate-900">{dictResult.word}</div>
                        {dictResult.phonetic ? <div className="text-sm text-slate-500">{dictResult.phonetic}</div> : null}
                      </div>

                      {dictResult.definitions.length > 0 ? (
                        <div className="mt-3">
                          <div className="text-xs uppercase tracking-wider text-slate-500">Meaning</div>
                          <div className="mt-2 space-y-2">
                            {dictResult.definitions.map((d) => (
                              <div key={d} className="text-sm text-slate-700">
                                • {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {dictResult.synonyms.length > 0 ? (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-wider text-slate-500">Synonyms</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {dictResult.synonyms.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setDictionaryQuery(s);
                                  void lookupDictionary(s, selectedLanguage);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {dictResult.antonyms.length > 0 ? (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-wider text-slate-500">Antonyms</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {dictResult.antonyms.map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => {
                                  setDictionaryQuery(a);
                                  void lookupDictionary(a, selectedLanguage);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {dictResult.synonyms.length === 0 && dictResult.antonyms.length === 0 ? (
                        <div className="mt-3 text-sm text-slate-600">No synonyms/antonyms found for this word.</div>
                      ) : null}

                      <div className="mt-4 text-xs text-slate-500">Fetched online and cached on this device.</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">Look up a word to see meaning, synonyms, and antonyms.</div>
                  )}
                </div>
              ) : null}

              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <h3 className="text-lg text-slate-900 mb-3">Recent practice</h3>
                {recentItems.length === 0 ? (
                  <div className="text-sm text-slate-600">Practice something to see it here.</div>
                ) : (
                  <div className="space-y-2">
                    {recentItems.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setSelectedItemId(it.id)}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white border border-indigo-100 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="text-sm text-slate-900 truncate">{it.targetText}</div>
                        {it.english ? <div className="text-xs text-slate-600 truncate">{it.english}</div> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <h3 className="text-lg text-slate-900 mb-3">Note</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A full “every word dictionary” is not bundled in the app because of size/licensing.
                  This library is teacher-managed and can be expanded over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PremiumPaymentModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setPaymentType('bulk');
          setPaymentLessonId(undefined);
          setPaymentLessonTitle(undefined);
        }}
        onPaymentSuccess={() => {
          // Payment submitted successfully
          // Access will be granted after admin verification
          // No need to update state here - Firebase subscription will handle it
        }}
        type={paymentType === 'aibot' ? 'aibot' : 'lesson'}
        lessonId={paymentType === 'lesson' ? paymentLessonId : undefined}
        lessonTitle={paymentType === 'lesson' ? paymentLessonTitle : undefined}
      />
      
      {/* AI Chat Assistant */}
      <AILanguageChat 
        defaultLanguage={selectedLanguage}
        onUpgradeClick={() => {
          setPaymentType('aibot');
          setPaymentLessonId(undefined);
          setPaymentLessonTitle(undefined);
          setShowPremiumModal(true);
        }}
      />
    </div>
  );
}
