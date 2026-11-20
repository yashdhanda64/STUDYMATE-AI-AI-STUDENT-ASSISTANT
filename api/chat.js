import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, subject = 'General Academic', conversationHistory = [] } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    // Input length protection
    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message exceeds 5,000 character limit.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        reply: `> ⚠️ **Gemini API Key Required**\n\nTo unlock live AI responses powered by Google Gemini:\n1. Open your \`.env\` file in the project root.\n2. Add your free Gemini API key: \`GEMINI_API_KEY=your_key_here\`\n3. Restart the dev server.\n\n*(You can get a free key instantly from [Google AI Studio](https://aistudio.google.com/app/apikey))*.\n\n---\n\n### Quick Demo Answer for "${subject}":\nHere is how StudyMate AI answers: Break complex problems into smaller subproblems, write clean pseudocode or equations, and verify with edge cases!`,
        isDemo: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format system prompt for academic excellence
    const systemInstruction = `You are StudyMate AI, an expert, encouraging, and academically rigorous AI tutor for university students (especially Engineering, Computer Science, IT, Mathematics, and Sciences).
Current Subject Focus: "${subject}".
Guidelines:
1. Provide accurate, clear, pedagogical explanations with intuitive analogies and real-world examples.
2. Structure answers with Markdown: use headers, bold terms, bullet points, clean tables, and KaTeX-friendly math notations (like $O(n \\log n)$) where suitable.
3. If code is requested, provide clean, well-commented, modern code with time & space complexity analysis.
4. For difficult concepts, provide a concise high-level summary first, followed by a step-by-step breakdown.
5. End with a helpful revision tip, follow-up practice question, or viva/exam tip.`;

    // Build context
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((item) => {
        if (item && item.role && item.content) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
          });
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let resultText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      resultText = response.text;
    } catch (modelError) {
      // Fallback to gemini-1.5-flash if gemini-2.5-flash is not available in region
      console.warn('Gemini 2.5 flash attempt failed, falling back to gemini-1.5-flash:', modelError.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      resultText = fallbackResponse.text;
    }

    return res.status(200).json({
      reply: resultText,
      subject
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message with Gemini AI.'
    });
  }
}
