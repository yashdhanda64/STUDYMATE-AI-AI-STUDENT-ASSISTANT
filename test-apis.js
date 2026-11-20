import fs from 'fs';
import path from 'path';

// Load .env file into process.env if present
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

// Verification test script for StudyMate AI API handlers
import chatHandler from './api/chat.js';
import summarizeHandler from './api/summarize.js';
import quizHandler from './api/generate-quiz.js';
import flashcardsHandler from './api/generate-flashcards.js';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
    },
    json(data) {
      this.data = data;
      return this;
    }
  };
}

async function runTests() {
  console.log('--- 🧪 STARTING API HANDLER TESTS ---');

  // Test 1: Chat Endpoint
  console.log('\n[1/4] Testing /api/chat...');
  const chatReq = {
    method: 'POST',
    body: {
      message: 'What is the time complexity of QuickSort average vs worst case?',
      subject: 'Data Structures & Algorithms'
    }
  };
  const chatRes = createMockRes();
  await chatHandler(chatReq, chatRes);
  console.log(`Chat status: ${chatRes.statusCode}`);
  console.log('Chat reply preview:', chatRes.data?.reply?.slice(0, 150) + '...');
  if (chatRes.statusCode !== 200) throw new Error('Chat test failed');

  // Test 2: Summarize Endpoint
  console.log('\n[2/4] Testing /api/summarize...');
  const sumReq = {
    method: 'POST',
    body: {
      text: 'Virtual memory is a memory management technique that provides an idealized abstraction of the storage resources that are actually available on a given machine which creates the illusion to users of a very large (main) memory.',
      fileName: 'Operating_Systems_Ch8.pdf',
      subject: 'Operating Systems'
    }
  };
  const sumRes = createMockRes();
  await summarizeHandler(sumReq, sumRes);
  console.log(`Summarize status: ${sumRes.statusCode}`);
  console.log('Key points count:', sumRes.data?.keyPoints?.length);
  if (sumRes.statusCode !== 200) throw new Error('Summarize test failed');

  // Test 3: Quiz Endpoint
  console.log('\n[3/4] Testing /api/generate-quiz...');
  const quizReq = {
    method: 'POST',
    body: {
      subject: 'DBMS',
      topic: 'Database Normalization',
      difficulty: 'Medium',
      count: 3
    }
  };
  const quizRes = createMockRes();
  await quizHandler(quizReq, quizRes);
  console.log(`Quiz status: ${quizRes.statusCode}`);
  console.log('Generated questions count:', quizRes.data?.questions?.length);
  if (quizRes.statusCode !== 200) throw new Error('Quiz test failed');

  // Test 4: Flashcards Endpoint
  console.log('\n[4/4] Testing /api/generate-flashcards...');
  const fcReq = {
    method: 'POST',
    body: {
      subject: 'Computer Networks',
      topic: 'OSI Model and TCP/IP',
      count: 3
    }
  };
  const fcRes = createMockRes();
  await flashcardsHandler(fcReq, fcRes);
  console.log(`Flashcards status: ${fcRes.statusCode}`);
  console.log('Generated flashcards count:', fcRes.data?.flashcards?.length);
  if (fcRes.statusCode !== 200) throw new Error('Flashcards test failed');

  console.log('\n✅ ALL 4 API ENDPOINTS PASSED VERIFICATION!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
