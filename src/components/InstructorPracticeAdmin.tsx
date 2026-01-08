import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Award,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createPronunciationItem,
  updatePronunciationItem,
  deletePronunciationItem,
  subscribePronunciationItems,
  createDailyQuiz,
  updateDailyQuiz,
  deleteDailyQuiz,
  subscribeDailyQuizzes,
  subscribeQuizAnswers,
  createShoutout,
  deleteShoutout,
  subscribeShoutouts,
  type PronunciationItem,
  type PronunciationLanguage,
  type PronunciationItemType,
  type DailyQuiz,
  type QuizAnswer,
  type Shoutout,
} from '../lib/pronunciation';
import { LessonContentEditor } from './LessonContentEditor';

interface InstructorPracticeAdminProps {
  language: PronunciationLanguage;
  type: PronunciationItemType;
}

export function InstructorPracticeAdmin({ language, type }: InstructorPracticeAdminProps) {
  const { user, role } = useAuth();
  const isInstructor = role === 'teacher' || role === 'admin';

  // Practice Items Management
  const [items, setItems] = useState<PronunciationItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ targetText: '', english: '', romanization: '' });
  const [newItemForm, setNewItemForm] = useState({ targetText: '', english: '', romanization: '' });
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemLoading, setItemLoading] = useState<string | null>(null);

  // Daily Quiz Management
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    question: '',
    correctAnswer: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    hint: '',
  });
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);

  // Shoutout Management
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [showShoutoutForm, setShowShoutoutForm] = useState(false);
  const [shoutoutForm, setShoutoutForm] = useState({
    studentName: '',
    userId: '',
    message: '',
    category: 'general' as 'quiz' | 'pronunciation' | 'achievement' | 'general',
  });

  const [activeTab, setActiveTab] = useState<'items' | 'lessons' | 'quizzes' | 'shoutouts'>('items');

  // Subscribe to items
  useEffect(() => {
    if (!isInstructor) return;
    const unsub = subscribePronunciationItems({ language, type }, setItems);
    return () => unsub();
  }, [language, type, isInstructor]);

  // Subscribe to today's quizzes
  useEffect(() => {
    if (!isInstructor) return;
    const today = new Date().toISOString().split('T')[0];
    const unsub = subscribeDailyQuizzes(today, setQuizzes);
    return () => unsub();
  }, [isInstructor]);

  // Subscribe to shoutouts
  useEffect(() => {
    if (!isInstructor) return;
    const unsub = subscribeShoutouts(setShoutouts);
    return () => unsub();
  }, [isInstructor]);

  // Subscribe to quiz answers when a quiz is selected
  useEffect(() => {
    if (!selectedQuizId) return;
    const unsub = subscribeQuizAnswers(selectedQuizId, setQuizAnswers);
    return () => unsub();
  }, [selectedQuizId]);

  if (!isInstructor) {
    return null;
  }

  const handleAddItem = async () => {
    if (!user || !newItemForm.targetText.trim()) return;
    setItemLoading('adding');
    try {
      await createPronunciationItem({
        language,
        type,
        targetText: newItemForm.targetText,
        english: newItemForm.english,
        romanization: newItemForm.romanization,
        createdByUid: user.uid,
      });
      setNewItemForm({ targetText: '', english: '', romanization: '' });
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setItemLoading(null);
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    setItemLoading(itemId);
    try {
      await updatePronunciationItem(itemId, editForm);
      setEditingItemId(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setItemLoading(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setItemLoading(itemId);
    try {
      await deletePronunciationItem(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setItemLoading(null);
    }
  };

  const handleCreateQuiz = async () => {
    if (!user || !quizForm.question.trim() || !quizForm.correctAnswer.trim()) return;
    
    const options = [
      quizForm.option1,
      quizForm.option2,
      quizForm.option3,
      quizForm.option4,
    ].filter(opt => opt.trim());

    if (options.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await createDailyQuiz({
        language,
        type,
        question: quizForm.question,
        correctAnswer: quizForm.correctAnswer,
        options,
        hint: quizForm.hint,
        date: today,
        createdByUid: user.uid,
      });
      setQuizForm({
        question: '',
        correctAnswer: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        hint: '',
      });
      setShowQuizForm(false);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await deleteDailyQuiz(quizId);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const handleCreateShoutout = async () => {
    if (!user || !shoutoutForm.studentName.trim() || !shoutoutForm.message.trim()) return;
    
    try {
      await createShoutout({
        studentName: shoutoutForm.studentName,
        userId: shoutoutForm.userId || 'unknown',
        message: shoutoutForm.message,
        category: shoutoutForm.category,
        createdByUid: user.uid,
      });
      setShoutoutForm({
        studentName: '',
        userId: '',
        message: '',
        category: 'general',
      });
      setShowShoutoutForm(false);
    } catch (error) {
      console.error('Error creating shoutout:', error);
      alert('Failed to create shoutout');
    }
  };

  const handleDeleteShoutout = async (shoutoutId: string) => {
    if (!confirm('Delete this shoutout?')) return;
    try {
      await deleteShoutout(shoutoutId);
    } catch (error) {
      console.error('Error deleting shoutout:', error);
      alert('Failed to delete shoutout');
    }
  };

  const handleAutoShoutoutFirstCorrect = () => {
    const firstCorrect = quizAnswers.find(a => a.isCorrect);
    if (firstCorrect && user) {
      setShoutoutForm({
        studentName: firstCorrect.studentName,
        userId: firstCorrect.userId,
        message: `🎉 First to answer today's quiz correctly! Amazing work!`,
        category: 'quiz',
      });
      setShowShoutoutForm(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border-2 border-purple-200 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Instructor Admin Panel
        </h3>
        <div className="text-xs text-purple-600 font-semibold px-3 py-1 bg-purple-100 rounded-full">
          {language} • {type}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'items'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-600 hover:bg-purple-100'
          }`}
        >
          Practice Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'lessons'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-600 hover:bg-purple-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Lessons & Content
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'quizzes'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-600 hover:bg-purple-100'
          }`}
        >
          Daily Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('shoutouts')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'shoutouts'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-600 hover:bg-purple-100'
          }`}
        >
          Shoutouts ({shoutouts.length})
        </button>
      </div>

      {/* Practice Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </button>

          <AnimatePresence>
            {showAddItem && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg p-4 space-y-3"
              >
                <input
                  type="text"
                  placeholder={`${type} in ${language}`}
                  value={newItemForm.targetText}
                  onChange={(e) => setNewItemForm({ ...newItemForm, targetText: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="English translation"
                  value={newItemForm.english}
                  onChange={(e) => setNewItemForm({ ...newItemForm, english: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Romanization (optional)"
                  value={newItemForm.romanization}
                  onChange={(e) => setNewItemForm({ ...newItemForm, romanization: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={itemLoading === 'adding'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {itemLoading === 'adding' ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-3 flex items-start justify-between gap-3"
              >
                {editingItemId === item.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editForm.targetText}
                      onChange={(e) => setEditForm({ ...editForm, targetText: e.target.value })}
                      className="w-full p-2 border-2 border-purple-200 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={editForm.english}
                      onChange={(e) => setEditForm({ ...editForm, english: e.target.value })}
                      className="w-full p-2 border-2 border-purple-200 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={editForm.romanization}
                      onChange={(e) => setEditForm({ ...editForm, romanization: e.target.value })}
                      className="w-full p-2 border-2 border-purple-200 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateItem(item.id)}
                        disabled={itemLoading === item.id}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-semibold"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-900">{item.targetText}</div>
                      {item.english && (
                        <div className="text-sm text-gray-600">{item.english}</div>
                      )}
                      {item.romanization && (
                        <div className="text-xs text-gray-500 italic">{item.romanization}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditForm({
                            targetText: item.targetText,
                            english: item.english || '',
                            romanization: item.romanization || '',
                          });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={itemLoading === item.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items yet. Add your first practice item!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowQuizForm(!showQuizForm)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Daily Quiz
          </button>

          <AnimatePresence>
            {showQuizForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg p-4 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Question"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={quizForm.correctAnswer}
                  onChange={(e) => setQuizForm({ ...quizForm, correctAnswer: e.target.value })}
                  className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Option 1"
                    value={quizForm.option1}
                    onChange={(e) => setQuizForm({ ...quizForm, option1: e.target.value })}
                    className="p-2 border-2 border-blue-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Option 2"
                    value={quizForm.option2}
                    onChange={(e) => setQuizForm({ ...quizForm, option2: e.target.value })}
                    className="p-2 border-2 border-blue-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Option 3 (optional)"
                    value={quizForm.option3}
                    onChange={(e) => setQuizForm({ ...quizForm, option3: e.target.value })}
                    className="p-2 border-2 border-blue-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Option 4 (optional)"
                    value={quizForm.option4}
                    onChange={(e) => setQuizForm({ ...quizForm, option4: e.target.value })}
                    className="p-2 border-2 border-blue-200 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Hint (optional)"
                  value={quizForm.hint}
                  onChange={(e) => setQuizForm({ ...quizForm, hint: e.target.value })}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateQuiz}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Create Quiz
                  </button>
                  <button
                    onClick={() => setShowQuizForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-900 mb-1">{quiz.question}</div>
                    <div className="text-sm text-green-600 font-medium">✓ {quiz.correctAnswer}</div>
                    {quiz.hint && (
                      <div className="text-xs text-gray-500 italic mt-1">Hint: {quiz.hint}</div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quiz.options.map((opt, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedQuizId(selectedQuizId === quiz.id ? null : quiz.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-semibold hover:bg-blue-200"
                    >
                      {selectedQuizId === quiz.id ? 'Hide' : 'Answers'}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedQuizId === quiz.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-3 space-y-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm">Answers ({quizAnswers.length})</div>
                        <button
                          onClick={handleAutoShoutoutFirstCorrect}
                          className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded text-xs font-semibold hover:opacity-90"
                        >
                          Shoutout First Correct
                        </button>
                      </div>
                      {quizAnswers.map((answer, i) => (
                        <div
                          key={answer.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-500">#{i + 1}</span>
                            <span className="font-medium text-sm">{answer.studentName}</span>
                            <span className="text-xs text-gray-600">→ {answer.answer}</span>
                          </div>
                          {answer.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ))}
                      {quizAnswers.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No answers yet
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No quizzes today. Create one to engage students!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shoutouts Tab */}
      {activeTab === 'shoutouts' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowShoutoutForm(!showShoutoutForm)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Trophy className="w-5 h-5" />
            Create Shoutout
          </button>

          <AnimatePresence>
            {showShoutoutForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg p-4 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Student Name"
                  value={shoutoutForm.studentName}
                  onChange={(e) => setShoutoutForm({ ...shoutoutForm, studentName: e.target.value })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 outline-none"
                />
                <textarea
                  placeholder="Shoutout Message"
                  value={shoutoutForm.message}
                  onChange={(e) => setShoutoutForm({ ...shoutoutForm, message: e.target.value })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 outline-none min-h-24"
                />
                <select
                  value={shoutoutForm.category}
                  onChange={(e) => setShoutoutForm({ ...shoutoutForm, category: e.target.value as any })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 outline-none"
                >
                  <option value="general">General</option>
                  <option value="quiz">Quiz Achievement</option>
                  <option value="pronunciation">Pronunciation Excellence</option>
                  <option value="achievement">Special Achievement</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateShoutout}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
                  >
                    Post Shoutout
                  </button>
                  <button
                    onClick={() => setShowShoutoutForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {shoutouts.map((shoutout) => (
              <div
                key={shoutout.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-purple-900">{shoutout.studentName}</span>
                      <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">
                        {shoutout.category}
                      </span>
                    </div>
                    <p className="text-gray-700">{shoutout.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteShoutout(shoutout.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {shoutouts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No shoutouts yet. Celebrate student achievements!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && <LessonContentEditor language={language} />}
    </div>
  );
}
