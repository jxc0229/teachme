import { Message, MultipleChoiceProblem } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key is present
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key is missing. Make sure VITE_GEMINI_API_KEY is set in your .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Configure model parameters for faster responses
const modelConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

export async function getAIResponse(messages: Message[]): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Convert the chat history to a single string for context
    const chatHistory = messages
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Detailed system prompt to guide AI behavior
    const systemPrompt = `
    You are a student who is learning programming. You're trying to understand the following problem:
    ${messages[0].content}

    Role and Behavior:
    - You are LEARNING from the user who is teaching you
    - You have the understanding level of a 15-year-old student
    - You should actively engage with the user's explanations
    - You should demonstrate your current understanding by:
      * Rephrasing concepts in your own words
      * Pointing out specific parts that confuse you
    - You don't have any prior knowledge of Python
    - You can only reason about the problem based on the information that the user taught you
    
    Guidelines:
    1. If you don't understand something, be specific about what confuses you
    2. Ask focused follow-up questions about unclear concepts
    3. When you understand something, explain it back in your own words
    4. Connect new information to what you've already learned
    5. Don't pretend to understand - be honest about your confusion
    6. ONLY respond as the student, wait for actual user responses
    7. If you cannot understand user's explanations, ask them to rephrase
    8. If user's explanations are unclear, ask them to give examples
    9. When you fully understand the concept, explicitly say:
       "I understand this now! I think I'm ready for the quiz. Here's what I learned: [summary]"
    
    Previous conversation:
    ${chatHistory}

    Remember: 
    - You are learning this for the first time. Show genuine curiosity and ask questions when needed.
    - DO NOT include hypothetical user responses or conversations in your output.
    - ONLY respond as the student, one message at a time.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: modelConfig,
    });

    const response = result.response;
    console.log('AI Response:', response.text());
    return response.text();
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw error;
  }
}

export async function evaluateQuizAnswer(
  problem: MultipleChoiceProblem,
  messages: Message[]
): Promise<{ selectedAnswers: string[]; explanation: string; thinkingProcess: string }> {
  try {
    const prompt = `You are a student learning programming concepts. Based on your learning conversation with your teacher, answer the following multiple choice question.

    Question: ${problem.question}

    Choices:
    ${problem.choices.map(choice => `${choice.id}. ${choice.text}`).join('\n')}

    Your learning conversation:
    ${messages.map(msg => `${msg.sender === 'user' ? 'Teacher' : 'Student'}: ${msg.content}`).join('\n')}

    Instructions:
    1. Think through the problem step by step.
    2. Consider ONLY what you learned from your teacher in the conversations above.
    3. Analyze each answer choice carefully one-by-one and explain your thoughts in bullet points.
    4. Select the answers you think are correct.
    5. Explain your reasoning clearly.
    6. Ensure your selected answers match your reasoning.
    7. If the user did not teach you anything, leave the answer blank.


    Respond with ONLY a JSON object in this exact format:
    {
      "selectedAnswers": [], // List the letter IDs you think are correct, or leave as empty array if unsure
      "explanation": "A clear explanation of why these specific answers are correct, or why you cannot answer yet",
      "thinkingProcess": "Your step-by-step thought process for selecting these specific answers or why you need more teaching"
    }`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { 
        ...modelConfig,
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();
    
    // Log the raw response for debugging
    console.log('AI Response:', text);

    try {
      // Clean up the response text by removing markdown code block syntax
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);
      
      // Ensure selectedAnswers is always an array
      if (!Array.isArray(parsedResponse.selectedAnswers)) {
        console.warn('Invalid selectedAnswers format:', parsedResponse.selectedAnswers);
        parsedResponse.selectedAnswers = [];
      }

      return {
        selectedAnswers: parsedResponse.selectedAnswers,
        explanation: parsedResponse.explanation || 'No explanation provided',
        thinkingProcess: parsedResponse.thinkingProcess || 'No thinking process provided'
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response that failed to parse:', text);
      return {
        selectedAnswers: [],
        explanation: 'I need more teaching to answer this question.',
        thinkingProcess: 'I could not form a proper answer based on the current teachings.'
      };
    }
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

export async function analyzeStudentAnswer(
  problem: MultipleChoiceProblem,
  studentAnswers: string[],
  messages: Message[]
): Promise<string> {
  try {
    const prompt = `
    As an experienced teacher, analyze the student's answer and provide constructive feedback.

    Problem: ${problem.question}

    Choices:
    ${problem.choices.map(choice => `${choice.id}. ${choice.text}`).join('\n')}

    Correct Answers: ${problem.correctAnswers.join(', ')}
    Student's Answers: ${studentAnswers.join(', ')}

    Previous learning conversation:
    ${messages.map(msg => `${msg.sender === 'user' ? 'Teacher' : 'Student'}: ${msg.content}`).join('\n')}

    Provide a detailed analysis that identifies misconceptions in a short and concise paragraph.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { ...modelConfig, temperature: 0.3 },
    });

    return result.response.text();
  } catch (error) {
    console.error('Error in analyzeStudentAnswer:', error);
    throw error;
  }
}