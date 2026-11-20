import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey !== 'your_supabase_anon_public_key_here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// LOCAL STORAGE DEMO MOCK STORE
// Ensures the app works smoothly in demo / offline mode before Supabase is connected
// ==============================================================================

const STORAGE_KEYS = {
  USER: 'studymate_demo_user',
  PROFILE: 'studymate_demo_profile',
  NOTES: 'studymate_demo_notes',
  TASKS: 'studymate_demo_tasks',
  CHAT: 'studymate_demo_chat',
  QUIZ: 'studymate_demo_quiz',
  FLASHCARDS: 'studymate_demo_flashcards',
  SESSIONS: 'studymate_demo_sessions',
};

const INITIAL_DEMO_DATA = {
  user: {
    id: 'demo-student-uuid',
    email: 'alex.chen@university.edu',
    user_metadata: { full_name: 'Alex Chen' }
  },
  profile: {
    id: 'demo-student-uuid',
    email: 'alex.chen@university.edu',
    full_name: 'Alex Chen',
    university: 'Stanford University / B.Tech CSE',
    major: 'Computer Science & Engineering',
    study_goal_hours: 4.0,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  notes: [
    {
      id: 'note-1',
      user_id: 'demo-student-uuid',
      title: 'Time & Space Complexity of Sorting Algorithms',
      subject: 'Data Structures & Algorithms',
      content: '### Quick Summary of Sorting Algorithms:\n- **Merge Sort**: $O(n \\log n)$ time in all cases, stable, requires $O(n)$ extra memory.\n- **Quick Sort**: Average $O(n \\log n)$, Worst $O(n^2)$ when pivot is poorly chosen. In-place.\n- **Heap Sort**: Guaranteed $O(n \\log n)$ time and $O(1)$ auxiliary space, not stable.\n\n*Key Tip:* Always mention the pivot selection strategy in exam viva questions!',
      tags: ['Algorithms', 'Sorting', 'Exam Prep'],
      is_pinned: true,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'note-2',
      user_id: 'demo-student-uuid',
      title: 'Operating Systems: Process Synchronization & Mutex',
      subject: 'Operating Systems',
      content: 'Critical Section Problem Requirements:\n1. **Mutual Exclusion**: No two processes can be in critical section simultaneously.\n2. **Progress**: Selection of next process cannot be postponed indefinitely.\n3. **Bounded Waiting**: Bound on number of times other processes are allowed to enter.\n\n*Peterson\'s Algorithm* solves for 2 processes using shared variables `flag` and `turn`.',
      tags: ['OS', 'Concurrency', 'Viva'],
      is_pinned: false,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      user_id: 'demo-student-uuid',
      title: 'Solve 5 Dynamic Programming LeetCode problems',
      subject: 'Data Structures & Algorithms',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:00',
      priority: 'high',
      is_completed: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'task-2',
      user_id: 'demo-student-uuid',
      title: 'Review Chapter 4: Database Normalization (3NF & BCNF)',
      subject: 'DBMS',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '17:30',
      priority: 'medium',
      is_completed: true,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'task-3',
      user_id: 'demo-student-uuid',
      title: 'Prepare Computer Networks Presentation slides',
      subject: 'Computer Networks',
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduled_time: '10:00',
      priority: 'high',
      is_completed: false,
      created_at: new Date().toISOString()
    }
  ],
  quiz: [
    {
      id: 'quiz-1',
      user_id: 'demo-student-uuid',
      subject: 'Data Structures & Algorithms',
      difficulty: 'Medium',
      score: 4,
      total_questions: 5,
      questions_data: [],
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'quiz-2',
      user_id: 'demo-student-uuid',
      subject: 'Operating Systems',
      difficulty: 'Hard',
      score: 5,
      total_questions: 5,
      questions_data: [],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  flashcards: [
    {
      id: 'fc-1',
      user_id: 'demo-student-uuid',
      deck_title: 'Database Systems Core',
      subject: 'DBMS',
      question: 'What is the purpose of Boyce-Codd Normal Form (BCNF)?',
      answer: 'BCNF is a stricter version of 3NF. A table is in BCNF if for every non-trivial functional dependency X -> Y, X is a superkey.',
      is_mastered: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fc-2',
      user_id: 'demo-student-uuid',
      deck_title: 'Database Systems Core',
      subject: 'DBMS',
      question: 'What is the difference between Clustered and Non-Clustered Indexes?',
      answer: 'A Clustered Index alters the physical storage order of rows in the table (only 1 per table). A Non-Clustered Index creates a separate structure pointing to the actual data rows (multiple allowed).',
      is_mastered: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'fc-3',
      user_id: 'demo-student-uuid',
      deck_title: 'Computer Networks',
      subject: 'Computer Networks',
      question: 'Explain the 3-Way Handshake in TCP connection establishment.',
      answer: '1. Client sends SYN (Synchronize)\n2. Server responds with SYN-ACK (Synchronize-Acknowledge)\n3. Client sends ACK (Acknowledge) to establish connection.',
      is_mastered: true,
      created_at: new Date().toISOString()
    }
  ],
  sessions: [
    {
      id: 'sess-1',
      user_id: 'demo-student-uuid',
      subject: 'Data Structures & Algorithms',
      duration_minutes: 90,
      notes: 'Graph algorithms: BFS, DFS, and topological sort',
      session_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: 'sess-2',
      user_id: 'demo-student-uuid',
      subject: 'Operating Systems',
      duration_minutes: 60,
      notes: 'Page replacement algorithms simulation and exercises',
      session_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'sess-3',
      user_id: 'demo-student-uuid',
      subject: 'DBMS',
      duration_minutes: 75,
      notes: 'SQL complex queries, window functions, and indexing',
      session_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ]
};

function getLocalData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ==============================================================================
// AUTHENTICATION API
// ==============================================================================

export const authService = {
  async signUp(email, password, fullName) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Local demo mode mock user
      const user = {
        id: 'user-' + Date.now(),
        email,
        user_metadata: { full_name: fullName }
      };
      const profile = {
        id: user.id,
        email,
        full_name: fullName,
        university: 'Engineering College',
        major: 'Computer Science',
        study_goal_hours: 4.0,
        created_at: new Date().toISOString()
      };
      setLocalData(STORAGE_KEYS.USER, user);
      setLocalData(STORAGE_KEYS.PROFILE, profile);
      return { user, session: { access_token: 'demo-token' } };
    }
  },

  async signIn(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } else {
      let user = getLocalData(STORAGE_KEYS.USER, INITIAL_DEMO_DATA.user);
      user.email = email;
      setLocalData(STORAGE_KEYS.USER, user);
      return { user, session: { access_token: 'demo-token' } };
    }
  },

  async signOut() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  async resetPassword(email) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login'
      });
      if (error) throw error;
      return data;
    } else {
      return { message: 'Demo password reset link simulated for ' + email };
    }
  },

  async getUser() {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } else {
      return getLocalData(STORAGE_KEYS.USER, INITIAL_DEMO_DATA.user);
    }
  },

  onAuthStateChange(callback) {
    if (isSupabaseConfigured) {
      return supabase.auth.onAuthStateChange(callback);
    } else {
      // Demo listener stub
      const user = getLocalData(STORAGE_KEYS.USER, INITIAL_DEMO_DATA.user);
      callback('SIGNED_IN', { user });
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  }
};

// ==============================================================================
// PROFILES API
// ==============================================================================

export const profileService = {
  async getProfile(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } else {
      return getLocalData(STORAGE_KEYS.PROFILE, INITIAL_DEMO_DATA.profile);
    }
  },

  async updateProfile(userId, updates) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const current = getLocalData(STORAGE_KEYS.PROFILE, INITIAL_DEMO_DATA.profile);
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      setLocalData(STORAGE_KEYS.PROFILE, updated);
      return updated;
    }
  }
};

// ==============================================================================
// NOTES API
// ==============================================================================

export const notesService = {
  async getNotes(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
    }
  },

  async createNote(userId, noteData) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...noteData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
      const newNote = {
        id: 'note-' + Date.now(),
        user_id: userId || 'demo-student-uuid',
        ...noteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      notes.unshift(newNote);
      setLocalData(STORAGE_KEYS.NOTES, notes);
      return newNote;
    }
  },

  async updateNote(noteId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
      const index = notes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates, updated_at: new Date().toISOString() };
        setLocalData(STORAGE_KEYS.NOTES, notes);
        return notes[index];
      }
      return null;
    }
  },

  async deleteNote(noteId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      if (error) throw error;
      return true;
    } else {
      const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
      const filtered = notes.filter(n => n.id !== noteId);
      setLocalData(STORAGE_KEYS.NOTES, filtered);
      return true;
    }
  }
};

// ==============================================================================
// STUDY TASKS API (PLANNER)
// ==============================================================================

export const tasksService = {
  async getTasks(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
    }
  },

  async createTask(userId, taskData) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('study_tasks')
        .insert([{ ...taskData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
      const newTask = {
        id: 'task-' + Date.now(),
        user_id: userId || 'demo-student-uuid',
        is_completed: false,
        ...taskData,
        created_at: new Date().toISOString()
      };
      tasks.push(newTask);
      setLocalData(STORAGE_KEYS.TASKS, tasks);
      return newTask;
    }
  },

  async updateTask(taskId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('study_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...updates };
        setLocalData(STORAGE_KEYS.TASKS, tasks);
        return tasks[idx];
      }
      return null;
    }
  },

  async toggleTaskCompleted(taskId, isCompleted) {
    return this.updateTask(taskId, {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    });
  },

  async deleteTask(taskId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('study_tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;
      return true;
    } else {
      const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
      const filtered = tasks.filter(t => t.id !== taskId);
      setLocalData(STORAGE_KEYS.TASKS, filtered);
      return true;
    }
  }
};

// ==============================================================================
// CHAT HISTORY API
// ==============================================================================

export const chatService = {
  async getChatHistory(userId, subject) {
    if (isSupabaseConfigured && userId) {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (subject) query = query.eq('subject', subject);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      const all = getLocalData(STORAGE_KEYS.CHAT, []);
      return subject ? all.filter(c => c.subject === subject) : all;
    }
  },

  async saveChatMessage(userId, messageData) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([{ ...messageData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const chat = getLocalData(STORAGE_KEYS.CHAT, []);
      const newMsg = {
        id: 'chat-' + Date.now(),
        user_id: userId || 'demo-student-uuid',
        ...messageData,
        created_at: new Date().toISOString()
      };
      chat.push(newMsg);
      setLocalData(STORAGE_KEYS.CHAT, chat);
      return newMsg;
    }
  },

  async clearChatHistory(userId, subject) {
    if (isSupabaseConfigured && userId) {
      let query = supabase.from('chat_history').delete().eq('user_id', userId);
      if (subject) query = query.eq('subject', subject);
      const { error } = await query;
      if (error) throw error;
      return true;
    } else {
      if (subject) {
        const chat = getLocalData(STORAGE_KEYS.CHAT, []);
        const filtered = chat.filter(c => c.subject !== subject);
        setLocalData(STORAGE_KEYS.CHAT, filtered);
      } else {
        setLocalData(STORAGE_KEYS.CHAT, []);
      }
      return true;
    }
  }
};

// ==============================================================================
// QUIZ HISTORY API
// ==============================================================================

export const quizService = {
  async getQuizHistory(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData(STORAGE_KEYS.QUIZ, INITIAL_DEMO_DATA.quiz);
    }
  },

  async saveQuizResult(userId, quizResult) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('quiz_history')
        .insert([{ ...quizResult, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const quizzes = getLocalData(STORAGE_KEYS.QUIZ, INITIAL_DEMO_DATA.quiz);
      const newRecord = {
        id: 'quiz-' + Date.now(),
        user_id: userId || 'demo-student-uuid',
        ...quizResult,
        created_at: new Date().toISOString()
      };
      quizzes.unshift(newRecord);
      setLocalData(STORAGE_KEYS.QUIZ, quizzes);
      return newRecord;
    }
  }
};

// ==============================================================================
// FLASHCARDS API
// ==============================================================================

export const flashcardsService = {
  async getFlashcards(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData(STORAGE_KEYS.FLASHCARDS, INITIAL_DEMO_DATA.flashcards);
    }
  },

  async saveFlashcards(userId, cardsArray) {
    if (isSupabaseConfigured && userId) {
      const records = cardsArray.map(card => ({
        ...card,
        user_id: userId
      }));
      const { data, error } = await supabase
        .from('flashcards')
        .insert(records)
        .select();
      if (error) throw error;
      return data;
    } else {
      const cards = getLocalData(STORAGE_KEYS.FLASHCARDS, INITIAL_DEMO_DATA.flashcards);
      const newCards = cardsArray.map((c, i) => ({
        id: 'fc-' + Date.now() + '-' + i,
        user_id: userId || 'demo-student-uuid',
        is_mastered: false,
        ...c,
        created_at: new Date().toISOString()
      }));
      const combined = [...newCards, ...cards];
      setLocalData(STORAGE_KEYS.FLASHCARDS, combined);
      return newCards;
    }
  },

  async toggleMastered(cardId, isMastered) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('flashcards')
        .update({ is_mastered: isMastered })
        .eq('id', cardId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const cards = getLocalData(STORAGE_KEYS.FLASHCARDS, INITIAL_DEMO_DATA.flashcards);
      const idx = cards.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        cards[idx].is_mastered = isMastered;
        setLocalData(STORAGE_KEYS.FLASHCARDS, cards);
        return cards[idx];
      }
      return null;
    }
  },

  async deleteFlashcard(cardId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
      return true;
    } else {
      const cards = getLocalData(STORAGE_KEYS.FLASHCARDS, INITIAL_DEMO_DATA.flashcards);
      const filtered = cards.filter(c => c.id !== cardId);
      setLocalData(STORAGE_KEYS.FLASHCARDS, filtered);
      return true;
    }
  }
};

// ==============================================================================
// STUDY SESSIONS API (LOGGED TIME)
// ==============================================================================

export const studySessionsService = {
  async getStudySessions(userId) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_DEMO_DATA.sessions);
    }
  },

  async logStudySession(userId, sessionData) {
    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert([{ ...sessionData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const sessions = getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_DEMO_DATA.sessions);
      const newSession = {
        id: 'sess-' + Date.now(),
        user_id: userId || 'demo-student-uuid',
        session_date: new Date().toISOString().split('T')[0],
        ...sessionData,
        created_at: new Date().toISOString()
      };
      sessions.unshift(newSession);
      setLocalData(STORAGE_KEYS.SESSIONS, sessions);
      return newSession;
    }
  }
};
