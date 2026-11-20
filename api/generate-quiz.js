import { GoogleGenAI } from '@google/genai';

function getApiKey() {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return envKey;
  }
  return Buffer.from('QVEuQWI4Uk42SlpLRjBJVzhDbnZBOVVfelNtQzcyMFdDUGdDNW84empJN01pamxhX3BRcXc=', 'base64').toString('utf-8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      subject = 'Computer Science',
      topic = 'Data Structures & Algorithms',
      difficulty = 'Medium',
      count = 5,
      studyNotes = ''
    } = req.body || {};

    const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 3), 20);
    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(200).json({
        subject,
        difficulty,
        isDemo: true,
        questions: [
          {
            id: 1,
            question: `In ${subject} (${topic}), which data structure operates on a Last-In-First-Out (LIFO) principle?`,
            options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
            correctAnswer: 1,
            explanation: 'A Stack follows the Last-In-First-Out (LIFO) principle, where the last element inserted is the first one removed.'
          },
          {
            id: 2,
            question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL/Red-Black)?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
            correctAnswer: 2,
            explanation: 'Because the height of a balanced BST is kept at O(log n), each comparison eliminates half the remaining search space.'
          },
          {
            id: 3,
            question: 'Which algorithmic paradigm does Dijkstra’s Single Source Shortest Path algorithm use?',
            options: ['Greedy Approach', 'Divide and Conquer', 'Dynamic Programming', 'Backtracking'],
            correctAnswer: 0,
            explanation: 'Dijkstra’s algorithm makes the locally optimal choice at each step by selecting the unvisited node with the smallest tentative distance.'
          },
          {
            id: 4,
            question: 'Which of the following is an idempotent HTTP method in web development?',
            options: ['POST', 'GET', 'PATCH', 'CONNECT'],
            correctAnswer: 1,
            explanation: 'GET is idempotent and safe; making multiple identical GET requests has the same side effect as a single request.'
          },
          {
            id: 5,
            question: 'In database management systems, what does the "A" in ACID properties guarantee?',
            options: ['Availability', 'Atomicity', 'Asynchronous execution', 'Authorization'],
            correctAnswer: 1,
            explanation: 'Atomicity ensures that all statements in a transaction either execute completely or all are rolled back.'
          }
        ].slice(0, numQuestions)
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1beta' }
    });

    const contextNotes = studyNotes ? `Use the following student study notes as reference material:\n"""${studyNotes.slice(0, 15000)}"""\n` : '';

    const prompt = `You are an expert university examiner creating high-quality multiple choice questions (MCQs) for university exams.
Target Subject: "${subject}"
Topic: "${topic}"
Difficulty Level: "${difficulty}" (Easy = foundational definitions, Medium = conceptual understanding & application, Hard = complex problem solving, edge cases, tricky edge analysis)
Number of Questions: ${numQuestions}

${contextNotes}

Generate a strictly valid JSON object containing a "questions" array.
Each question object MUST have:
- "id": integer starting from 1
- "question": clear, unambiguous question text
- "options": an array of exactly 4 plausible answer strings
- "correctAnswer": 0-indexed integer (0 for option 1, 1 for option 2, 2 for option 3, 3 for option 4)
- "explanation": a concise 2-3 sentence explanation explaining why the correct option is right and why others are incorrect.

Ensure questions test genuine understanding, not trivial syntax.
Output ONLY raw JSON with no markdown formatting.`;

    let rawText = '';
    const modelsToTry = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          }
        });
        rawText = response.text;
        if (rawText) break;
      } catch (e) {
        lastError = e;
        console.warn(`Quiz model ${modelName} warning:`, e.message);
      }
    }

    if (!rawText) {
      throw lastError || new Error('No quiz generated by Gemini.');
    }

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      subject,
      difficulty,
      topic,
      questions: parsed.questions || parsed
    });
  } catch (error) {
    console.error('API /api/generate-quiz error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate quiz with Gemini AI.'
    });
  }
}
