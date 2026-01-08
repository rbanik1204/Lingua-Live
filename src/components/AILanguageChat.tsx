import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles, Lock } from 'lucide-react';
import { sendChatMessage, type ChatMessage, type ChatLanguage } from '../lib/ai';
import { useAuth } from '../context/AuthContext';
import { hasPremiumAccess } from '../lib/userProfile';

interface AILanguageChatProps {
  defaultLanguage?: ChatLanguage;
  onUpgradeClick?: () => void;
}

export function AILanguageChat({ defaultLanguage = 'Bengali', onUpgradeClick }: AILanguageChatProps) {
  const { user, role } = useAuth();
  const isTeacher = role === 'teacher' || role === 'admin';
  const [hasAccess, setHasAccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check premium access for students
  useEffect(() => {
    if (isTeacher) {
      setHasAccess(true);
      return;
    }
    if (!user) {
      setHasAccess(false);
      return;
    }
    // Check if student has premium access
    void hasPremiumAccess(user.uid).then(setHasAccess);
  }, [user, isTeacher]);

  // Debug log
  console.log('🤖 AI Chat component rendered! Access:', hasAccess, 'Role:', role);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendChatMessage({
        message: userMessage.content,
        language,
        conversationHistory: messages,
      });

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (!hasAccess && !isTeacher) {
            if (onUpgradeClick) {
              onUpgradeClick();
            } else {
              alert('🔒 AI Language Assistant is a premium feature!\n\nUpgrade to Premium for $10 to unlock:\n✨ AI-powered conversation practice\n✨ Grammar explanations\n✨ Cultural insights\n✨ And more!');
            }
            return;
          }
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        title={hasAccess || isTeacher ? 'AI Language Assistant' : '🔒 AI Assistant (Premium)'}
      >
        {hasAccess || isTeacher ? (
          <MessageCircle className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5" />
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-indigo-100">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <div>
            <div className="font-semibold">AI Language Assistant</div>
            <div className="text-xs text-indigo-100">Practice & Learn</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Language Selector */}
      <div className="p-3 border-b border-gray-200 flex gap-2">
        {(['Bengali', 'Hindi', 'English'] as ChatLanguage[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              language === lang
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang}
          </button>
        ))}
        <button
          onClick={clearChat}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-indigo-300" />
            <p className="text-sm">Start a conversation!</p>
            <p className="text-xs mt-1">Ask me anything about {language}</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${language}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
