import {
  addDoc,
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PronunciationLanguage } from './pronunciation';

// ============ Lesson Content Types ============

export type LessonContent = {
  id: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  title: string;
  description?: string;
  grammarNote?: string;
  culturalInsight?: string;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type VocabularyItem = {
  id: string;
  lessonId: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  word: string;
  meaning: string;
  romanization?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  order: number;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type PracticeSentence = {
  id: string;
  lessonId: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  sentence: string;
  translation: string;
  romanization?: string;
  order: number;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type IntroductionSection = {
  id: string;
  language: PronunciationLanguage;
  title: string;
  content: string;
  romanization?: string;
  translation?: string;
  order: number;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

// ============ Lesson Content CRUD ============

export async function createOrUpdateLesson(input: {
  id?: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  title: string;
  description?: string;
  grammarNote?: string;
  culturalInsight?: string;
  createdByUid: string;
}): Promise<string> {
  if (input.id) {
    // Update existing
    const docRef = doc(db, 'lessonContent', input.id);
    await updateDoc(docRef, {
      title: input.title,
      description: input.description || '',
      grammarNote: input.grammarNote || '',
      culturalInsight: input.culturalInsight || '',
      updatedAt: serverTimestamp(),
    });
    return input.id;
  } else {
    // Create new
    const docRef = await addDoc(collection(db, 'lessonContent'), {
      language: input.language,
      lessonNumber: input.lessonNumber,
      title: input.title,
      description: input.description || '',
      grammarNote: input.grammarNote || '',
      culturalInsight: input.culturalInsight || '',
      createdByUid: input.createdByUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await deleteDoc(doc(db, 'lessonContent', lessonId));
}

export function subscribeLessons(
  language: PronunciationLanguage,
  onLessons: (lessons: LessonContent[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'lessonContent'),
    where('language', '==', language),
    orderBy('lessonNumber', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onLessons(
        snap.docs.map((d) => {
          const data = d.data() as Omit<LessonContent, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

// ============ Vocabulary CRUD ============

export async function createVocabularyItem(input: {
  lessonId: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  word: string;
  meaning: string;
  romanization?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  order: number;
  createdByUid: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'vocabularyItems'), {
    lessonId: input.lessonId,
    language: input.language,
    lessonNumber: input.lessonNumber,
    word: input.word,
    meaning: input.meaning,
    romanization: input.romanization || '',
    partOfSpeech: input.partOfSpeech || '',
    exampleSentence: input.exampleSentence || '',
    order: input.order,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateVocabularyItem(
  itemId: string,
  updates: {
    word?: string;
    meaning?: string;
    romanization?: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    order?: number;
  }
): Promise<void> {
  const docRef = doc(db, 'vocabularyItems', itemId);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteVocabularyItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'vocabularyItems', itemId));
}

export function subscribeVocabulary(
  language: PronunciationLanguage,
  onVocab: (items: VocabularyItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'vocabularyItems'),
    where('language', '==', language),
    orderBy('lessonNumber', 'asc'),
    orderBy('order', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onVocab(
        snap.docs.map((d) => {
          const data = d.data() as Omit<VocabularyItem, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

// ============ Practice Sentences CRUD ============

export async function createPracticeSentence(input: {
  lessonId: string;
  language: PronunciationLanguage;
  lessonNumber: number;
  sentence: string;
  translation: string;
  romanization?: string;
  order: number;
  createdByUid: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'practiceSentences'), {
    lessonId: input.lessonId,
    language: input.language,
    lessonNumber: input.lessonNumber,
    sentence: input.sentence,
    translation: input.translation,
    romanization: input.romanization || '',
    order: input.order,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePracticeSentence(
  sentenceId: string,
  updates: {
    sentence?: string;
    translation?: string;
    romanization?: string;
    order?: number;
  }
): Promise<void> {
  const docRef = doc(db, 'practiceSentences', sentenceId);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deletePracticeSentence(sentenceId: string): Promise<void> {
  await deleteDoc(doc(db, 'practiceSentences', sentenceId));
}

export function subscribePracticeSentences(
  language: PronunciationLanguage,
  onSentences: (sentences: PracticeSentence[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'practiceSentences'),
    where('language', '==', language),
    orderBy('lessonNumber', 'asc'),
    orderBy('order', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onSentences(
        snap.docs.map((d) => {
          const data = d.data() as Omit<PracticeSentence, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

// ============ Introduction Sections CRUD ============

export async function createIntroductionSection(input: {
  language: PronunciationLanguage;
  title: string;
  content: string;
  romanization?: string;
  translation?: string;
  order: number;
  createdByUid: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'introductionSections'), {
    language: input.language,
    title: input.title,
    content: input.content,
    romanization: input.romanization || '',
    translation: input.translation || '',
    order: input.order,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateIntroductionSection(
  sectionId: string,
  updates: {
    title?: string;
    content?: string;
    romanization?: string;
    translation?: string;
    order?: number;
  }
): Promise<void> {
  const docRef = doc(db, 'introductionSections', sectionId);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteIntroductionSection(sectionId: string): Promise<void> {
  await deleteDoc(doc(db, 'introductionSections', sectionId));
}

export function subscribeIntroductionSections(
  language: PronunciationLanguage,
  onSections: (sections: IntroductionSection[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'introductionSections'),
    where('language', '==', language),
    orderBy('order', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onSections(
        snap.docs.map((d) => {
          const data = d.data() as Omit<IntroductionSection, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

// ============ Bulk Operations ============

export async function bulkDeleteVocabulary(lessonId: string): Promise<void> {
  // This would need to be implemented with batched deletes
  console.warn('Bulk delete vocabulary for lesson:', lessonId);
}

export async function bulkDeletePracticeSentences(lessonId: string): Promise<void> {
  // This would need to be implemented with batched deletes
  console.warn('Bulk delete practice sentences for lesson:', lessonId);
}
