/**
 * StudyMate AI API Service
 * Handles communication with backend serverless API endpoints
 */

export const apiService = {
  /**
   * Send a query to the AI Study Chatbot
   */
  async sendChatMessage(message, subject = 'General Academic', conversationHistory = []) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject, conversationHistory })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
      throw error;
    }
  },

  /**
   * Summarize notes or extracted PDF text
   */
  async summarizeDocument(text, fileName = 'Notes Document', subject = 'General Study') {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileName, subject })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in summarizeDocument:', error);
      throw error;
    }
  },

  /**
   * Generate MCQs / Quiz for a subject/topic
   */
  async generateQuiz({ subject, topic, difficulty = 'Medium', count = 5, studyNotes = '' }) {
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, difficulty, count, studyNotes })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateQuiz:', error);
      throw error;
    }
  },

  /**
   * Generate Flashcards for spaced repetition
   */
  async generateFlashcards({ topic, subject = 'General Study', count = 6, notes = '' }) {
    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject, count, notes })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateFlashcards:', error);
      throw error;
    }
  }
};
