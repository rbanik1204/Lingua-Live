import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  BookOpen,
  List,
  MessageSquare,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PronunciationLanguage } from '../lib/pronunciation';
import {
  subscribeLessons,
  createOrUpdateLesson,
  deleteLesson,
  subscribeVocabulary,
  createVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  subscribePracticeSentences,
  createPracticeSentence,
  updatePracticeSentence,
  deletePracticeSentence,
  subscribeIntroductionSections,
  createIntroductionSection,
  updateIntroductionSection,
  deleteIntroductionSection,
  type LessonContent,
  type VocabularyItem,
  type PracticeSentence,
  type IntroductionSection,
} from '../lib/lessonManagement';

interface LessonContentEditorProps {
  language: PronunciationLanguage;
}

export function LessonContentEditor({ language }: LessonContentEditorProps) {
  const { user, role } = useAuth();
  const isInstructor = role === 'teacher' || role === 'admin';

  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [introSections, setIntroSections] = useState<IntroductionSection[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    lessonNumber: 1,
    title: '',
    description: '',
    grammarNote: '',
    culturalInsight: '',
  });

  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyItem[]>>({});
  const [sentences, setSentences] = useState<Record<string, PracticeSentence[]>>({});
  const [editingVocab, setEditingVocab] = useState<string | null>(null);
  const [editingSentence, setEditingSentence] = useState<string | null>(null);

  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddIntro, setShowAddIntro] = useState(false);
  const [showAddVocab, setShowAddVocab] = useState<string | null>(null);
  const [showAddSentence, setShowAddSentence] = useState<string | null>(null);

  const [introForm, setIntroForm] = useState({
    title: '',
    content: '',
    romanization: '',
    translation: '',
  });

  const [vocabForm, setVocabForm] = useState({
    word: '',
    meaning: '',
    romanization: '',
    partOfSpeech: '',
    exampleSentence: '',
  });

  const [sentenceForm, setSentenceForm] = useState({
    sentence: '',
    translation: '',
    romanization: '',
  });

  useEffect(() => {
    if (!isInstructor) return;
    const unsub = subscribeLessons(language, setLessons);
    return () => unsub();
  }, [language, isInstructor]);

  useEffect(() => {
    if (!isInstructor) return;
    const unsub = subscribeIntroductionSections(language, setIntroSections);
    return () => unsub();
  }, [language, isInstructor]);

  useEffect(() => {
    if (!expandedLesson) return;
    const unsubVocab = subscribeVocabulary(expandedLesson as PronunciationLanguage, (items) => {
      setVocabulary((prev) => ({ ...prev, [expandedLesson]: items }));
    });
    const unsubSentences = subscribePracticeSentences(expandedLesson as PronunciationLanguage, (items) => {
      setSentences((prev) => ({ ...prev, [expandedLesson]: items }));
    });
    return () => {
      unsubVocab();
      unsubSentences();
    };
  }, [expandedLesson]);

  if (!isInstructor) return null;

  const handleSaveLesson = async () => {
    if (!user) return;
    try {
      await createOrUpdateLesson({
        id: editingLesson || undefined,
        language,
        lessonNumber: lessonForm.lessonNumber,
        title: lessonForm.title,
        description: lessonForm.description,
        grammarNote: lessonForm.grammarNote,
        culturalInsight: lessonForm.culturalInsight,
        createdByUid: user.uid,
      });
      setLessonForm({
        lessonNumber: lessons.length + 1,
        title: '',
        description: '',
        grammarNote: '',
        culturalInsight: '',
      });
      setShowAddLesson(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this entire lesson? All vocabulary and sentences will remain.')) return;
    try {
      await deleteLesson(lessonId);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleSaveIntro = async () => {
    if (!user) return;
    try {
      await createIntroductionSection({
        language,
        title: introForm.title,
        content: introForm.content,
        romanization: introForm.romanization,
        translation: introForm.translation,
        order: introSections.length,
        createdByUid: user.uid,
      });
      setIntroForm({ title: '', content: '', romanization: '', translation: '' });
      setShowAddIntro(false);
    } catch (error) {
      console.error('Error saving intro:', error);
      alert('Failed to save introduction section');
    }
  };

  const handleSaveVocab = async (lessonId: string, lessonNumber: number) => {
    if (!user) return;
    try {
      if (editingVocab) {
        await updateVocabularyItem(editingVocab, vocabForm);
        setEditingVocab(null);
      } else {
        await createVocabularyItem({
          lessonId,
          language,
          lessonNumber,
          word: vocabForm.word,
          meaning: vocabForm.meaning,
          romanization: vocabForm.romanization,
          partOfSpeech: vocabForm.partOfSpeech,
          exampleSentence: vocabForm.exampleSentence,
          order: vocabulary[lessonId]?.length || 0,
          createdByUid: user.uid,
        });
      }
      setVocabForm({ word: '', meaning: '', romanization: '', partOfSpeech: '', exampleSentence: '' });
      setShowAddVocab(null);
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      alert('Failed to save vocabulary');
    }
  };

  const handleSaveSentence = async (lessonId: string, lessonNumber: number) => {
    if (!user) return;
    try {
      if (editingSentence) {
        await updatePracticeSentence(editingSentence, sentenceForm);
        setEditingSentence(null);
      } else {
        await createPracticeSentence({
          lessonId,
          language,
          lessonNumber,
          sentence: sentenceForm.sentence,
          translation: sentenceForm.translation,
          romanization: sentenceForm.romanization,
          order: sentences[lessonId]?.length || 0,
          createdByUid: user.uid,
        });
      }
      setSentenceForm({ sentence: '', translation: '', romanization: '' });
      setShowAddSentence(null);
    } catch (error) {
      console.error('Error saving sentence:', error);
      alert('Failed to save sentence');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 mb-6">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-indigo-600" />
        Lesson Content Editor - {language}
      </h3>

      {/* Introduction Sections */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-indigo-900">Introducing Yourself Sections</h4>
          <button
            onClick={() => setShowAddIntro(!showAddIntro)}
            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>

        <AnimatePresence>
          {showAddIntro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg p-4 mb-3 space-y-2"
            >
              <input
                type="text"
                placeholder="Title"
                value={introForm.title}
                onChange={(e) => setIntroForm({ ...introForm, title: e.target.value })}
                className="w-full p-2 border-2 border-indigo-200 rounded-lg text-sm"
              />
              <textarea
                placeholder="Content"
                value={introForm.content}
                onChange={(e) => setIntroForm({ ...introForm, content: e.target.value })}
                className="w-full p-2 border-2 border-indigo-200 rounded-lg text-sm min-h-20"
              />
              <input
                type="text"
                placeholder="Romanization"
                value={introForm.romanization}
                onChange={(e) => setIntroForm({ ...introForm, romanization: e.target.value })}
                className="w-full p-2 border-2 border-indigo-200 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Translation"
                value={introForm.translation}
                onChange={(e) => setIntroForm({ ...introForm, translation: e.target.value })}
                className="w-full p-2 border-2 border-indigo-200 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveIntro} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  Save
                </button>
                <button onClick={() => setShowAddIntro(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {introSections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-indigo-900">{section.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{section.content}</div>
                  {section.romanization && <div className="text-xs text-gray-500 italic mt-1">{section.romanization}</div>}
                  {section.translation && <div className="text-xs text-gray-600 mt-1">{section.translation}</div>}
                </div>
                <button
                  onClick={() => deleteIntroductionSection(section.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-indigo-900">Lessons 1-20</h4>
        <button
          onClick={() => {
            setShowAddLesson(!showAddLesson);
            setLessonForm({
              lessonNumber: lessons.length + 1,
              title: '',
              description: '',
              grammarNote: '',
              culturalInsight: '',
            });
          }}
          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Lesson
        </button>
      </div>

      <AnimatePresence>
        {showAddLesson && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg p-4 mb-3 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Lesson Number"
                value={lessonForm.lessonNumber}
                onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: parseInt(e.target.value) })}
                className="p-2 border-2 border-indigo-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="p-2 border-2 border-indigo-200 rounded-lg"
              />
            </div>
            <textarea
              placeholder="Description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              className="w-full p-2 border-2 border-indigo-200 rounded-lg min-h-16"
            />
            <textarea
              placeholder="Grammar Note"
              value={lessonForm.grammarNote}
              onChange={(e) => setLessonForm({ ...lessonForm, grammarNote: e.target.value })}
              className="w-full p-2 border-2 border-indigo-200 rounded-lg min-h-20"
            />
            <textarea
              placeholder="Cultural Insight"
              value={lessonForm.culturalInsight}
              onChange={(e) => setLessonForm({ ...lessonForm, culturalInsight: e.target.value })}
              className="w-full p-2 border-2 border-indigo-200 rounded-lg min-h-20"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveLesson} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                Save Lesson
              </button>
              <button onClick={() => setShowAddLesson(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedLesson === lesson.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <span className="font-bold text-indigo-600">Lesson {lesson.lessonNumber}</span>
                <span className="font-semibold text-gray-900">{lesson.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLesson(lesson.id);
                    setLessonForm({
                      lessonNumber: lesson.lessonNumber,
                      title: lesson.title,
                      description: lesson.description || '',
                      grammarNote: lesson.grammarNote || '',
                      culturalInsight: lesson.culturalInsight || '',
                    });
                    setShowAddLesson(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedLesson === lesson.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-4 border-t pt-3"
                >
                  {/* Grammar Note */}
                  {lesson.grammarNote && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-blue-900 mb-1">GRAMMAR NOTE</div>
                      <div className="text-sm text-gray-700">{lesson.grammarNote}</div>
                    </div>
                  )}

                  {/* Cultural Insight */}
                  {lesson.culturalInsight && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-purple-900 mb-1">CULTURAL INSIGHT</div>
                      <div className="text-sm text-gray-700">{lesson.culturalInsight}</div>
                    </div>
                  )}

                  {/* Vocabulary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">Vocabulary</div>
                      <button
                        onClick={() => setShowAddVocab(showAddVocab === lesson.id ? null : lesson.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Word
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddVocab === lesson.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 rounded-lg p-3 mb-2 space-y-2"
                        >
                          <input
                            type="text"
                            placeholder="Word"
                            value={vocabForm.word}
                            onChange={(e) => setVocabForm({ ...vocabForm, word: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Meaning"
                            value={vocabForm.meaning}
                            onChange={(e) => setVocabForm({ ...vocabForm, meaning: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Romanization"
                            value={vocabForm.romanization}
                            onChange={(e) => setVocabForm({ ...vocabForm, romanization: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveVocab(lesson.id, lesson.lessonNumber)}
                              className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button onClick={() => setShowAddVocab(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1">
                      {vocabulary[lesson.id]?.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded p-2 flex items-center justify-between text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">{item.word}</span>
                            <span className="text-gray-600"> - {item.meaning}</span>
                            {item.romanization && <span className="text-gray-500 italic text-xs ml-2">{item.romanization}</span>}
                          </div>
                          <button
                            onClick={() => deleteVocabularyItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Sentences */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">Practice Sentences</div>
                      <button
                        onClick={() => setShowAddSentence(showAddSentence === lesson.id ? null : lesson.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Sentence
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddSentence === lesson.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 rounded-lg p-3 mb-2 space-y-2"
                        >
                          <textarea
                            placeholder="Sentence"
                            value={sentenceForm.sentence}
                            onChange={(e) => setSentenceForm({ ...sentenceForm, sentence: e.target.value })}
                            className="w-full p-2 border rounded text-sm min-h-16"
                          />
                          <input
                            type="text"
                            placeholder="Translation"
                            value={sentenceForm.translation}
                            onChange={(e) => setSentenceForm({ ...sentenceForm, translation: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Romanization"
                            value={sentenceForm.romanization}
                            onChange={(e) => setSentenceForm({ ...sentenceForm, romanization: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveSentence(lesson.id, lesson.lessonNumber)}
                              className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button onClick={() => setShowAddSentence(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1">
                      {sentences[lesson.id]?.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded p-2 text-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{item.sentence}</div>
                              <div className="text-gray-600 text-xs">{item.translation}</div>
                              {item.romanization && <div className="text-gray-500 italic text-xs">{item.romanization}</div>}
                            </div>
                            <button
                              onClick={() => deletePracticeSentence(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
