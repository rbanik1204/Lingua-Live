import { GoogleGenerativeAI } from '@google/generative-ai';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type ChatLanguage = 'Bengali' | 'Hindi' | 'English';

export async function sendChatMessage(params: {
  message: string;
  language: ChatLanguage;
  conversationHistory: ChatMessage[];
}): Promise<{ response: string; language: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash as it is the current supported model (Jan 2026)
  const modelName = 'gemini-2.5-flash';
  console.log('🤖 Initializing Gemini with model:', modelName);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Build system prompt for language learning
  const systemPrompt = `You are a friendly and patient language learning assistant helping students learn ${params.language}. 

Your role:
- Help students practice ${params.language} conversation
- Explain grammar concepts clearly
- Provide vocabulary help with examples
- Correct mistakes gently and explain why
- Share cultural insights about ${params.language === 'Bengali' ? 'Bengal/Bangladesh' : params.language === 'Hindi' ? 'India' : 'English-speaking countries'}
- Encourage students and celebrate their progress
- Provide romanization when helpful for ${params.language === 'Bengali' ? 'Bengali' : params.language === 'Hindi' ? 'Hindi' : 'English'} words

Keep responses:
- Encouraging and supportive
- Clear and concise (2-4 sentences usually)
- Practical and useful for real conversations
- Appropriate for language learners

Student is focusing on: ${params.language}`;

  // Build conversation context
  let fullPrompt = systemPrompt + '\n\n';
  
  // Add conversation history
  if (params.conversationHistory.length > 0) {
    fullPrompt += 'Previous conversation:\n';
    params.conversationHistory.slice(-6).forEach((msg) => {
      fullPrompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }

  fullPrompt += `Student: ${params.message.trim()}\nAssistant:`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('No response from AI');
  }

  return {
    response: text.trim(),
    language: params.language,
  };
}
