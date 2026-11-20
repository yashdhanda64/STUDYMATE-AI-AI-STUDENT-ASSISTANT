import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { text, fileName = 'Document', subject = 'General Study' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'No readable text content provided for summarization.' });
    }

    // Input size management: handle up to ~80k characters (approx 20k tokens)
    // Truncate or chunk if excessively large
    const safeText = text.slice(0, 75000);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        summary: `### 📄 Summary: ${fileName}\n*(Demo Mode: Set GEMINI_API_KEY in .env for full AI analysis)*\n\nThis study material covers key principles of **${subject}**. It outlines foundational concepts, standard definitions, and theoretical structures.\n\n### 🔑 Key Bullet Points\n* Foundational theories and formal definitions\n* Architectural layers, mechanics, and workflows\n* Practical applications and edge case considerations\n* Comparative performance and optimization guidelines\n\n### ❓ Important Exam & Viva Questions\n1. **What is the core distinction between the primary approaches described?**\n   *Answer:* Focus on time vs space tradeoffs and implementation complexity.\n2. **How does this system behave under high-stress edge conditions?**\n   *Answer:* Graceful degradation through fallback routines and validation checks.`,
        keyPoints: [
          'Core architectural definitions and theoretical foundations',
          'Step-by-step methodologies and design patterns',
          'Common pitfalls and recommended best practices',
          'Standard exam and interview discussion points'
        ],
        questions: [
          { q: 'Explain the primary mechanism in your own words.', a: 'It coordinates components hierarchically to maintain consistency.' },
          { q: 'What are the main performance tradeoffs?', a: 'Memory overhead vs execution latency.' }
        ],
        isDemo: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a high-level university professor and academic note analyzer.
Analyze the following study material extracted from a student's notes / PDF (${fileName}, Subject: ${subject}).

Extracted Text:
"""
${safeText}
"""

Please produce a comprehensive, structured JSON response with the following exact keys:
1. "summary": A well-structured Markdown summary (3-5 paragraphs) with headings, bold terminology, and clear explanations.
2. "keyPoints": An array of 6 to 10 concise, punchy bullet points capturing the most essential concepts for revision.
3. "questions": An array of 5 important exam/viva questions with model answers in the format: [{"q": "Question here?", "a": "Concise high-scoring answer here."}].
4. "examTips": A list of 3 actionable tips for scoring high in exams on this topic.

Return ONLY raw JSON, with no enclosing markdown backticks or commentary.`;

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });
      rawText = response.text;
    } catch (e) {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });
      rawText = fallbackResponse.text;
    }

    // Clean JSON if needed
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('API /api/summarize error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate summary with Gemini AI.'
    });
  }
}
