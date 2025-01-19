import React, { useState, useRef, useEffect } from 'react';
import { Subtopic, Message } from '../types';
import { HelpCircle, Send, Loader, Brain, RefreshCw, Mic, MicOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAIResponse } from '../services/ai';
import { QuizSpace } from './QuizSpace';
import { voiceService } from '../services/voiceService';
import ReactMarkdown from 'react-markdown';

interface TeachingSpaceProps {
  subtopic: Subtopic;
  onComplete: (success: boolean) => void;
  onUpdateStatus: (status: Subtopic['status']) => void;
  subjectId: string;
}

export const TeachingSpace: React.FC<TeachingSpaceProps> = ({ 
  subtopic, 
  onComplete, 
  onUpdateStatus,
  subjectId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Initialize chat with problem statement
    const initialMessage: Message = {
      id: Date.now().toString(),
      content: `I need help understanding this problem:\n\n${subtopic.practiceProblem.question}\n\nHere are the possible answers:\n${subtopic.practiceProblem.choices.map(choice => `${choice.id}. ${choice.text}`).join('\n')}\n\nCan you help me understand how to solve this?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [subtopic.practiceProblem]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsAiTyping(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse([...messages, userMessage]);
      
      // Check if AI indicates understanding and readiness for quiz
      const readyForQuiz = aiResponse.toLowerCase().includes("i understand") && 
                          aiResponse.toLowerCase().includes("ready for") && 
                          aiResponse.toLowerCase().includes("quiz");

      // If AI demonstrates understanding, update status to in_progress
      if (readyForQuiz) {
        onUpdateStatus('in_progress');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble thinking right now. Could you try rephrasing that?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      voiceService.startListening(
        (text) => {
          // Append text with proper spacing
          setNewMessage((prev) => {
            const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + text;
          });
        },
        (error) => {
          console.error('Voice recognition error:', error);
          setIsListening(false);
        }
      );
      setIsListening(true);
    }
  };

  // Clean up voice recognition on unmount
  useEffect(() => {
    return () => {
      voiceService.stopListening();
    };
  }, []);

  if (showQuiz) {
    return (
      <QuizSpace
        subtopic={subtopic}
        messages={messages}
        onComplete={onComplete}
        onUpdateStatus={onUpdateStatus}
        onBack={() => setShowQuiz(false)}
        subjectId={subjectId}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Teaching Mode</h2>
        </div>
        <button
          className="group relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <HelpCircle className="w-5 h-5 text-white hover:text-blue-100" />
          {showTooltip && (
            <div className="absolute right-0 w-80 p-4 bg-white rounded-lg shadow-lg text-gray-700 text-sm -bottom-2 transform translate-y-full z-10">
              You are the teacher! Explain concepts to your AI student who has the understanding level of a 15-year-old.
              The student will ask questions when confused and demonstrate their understanding.
            </div>
          )}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto" ref={chatContainerRef}>
        {/* Problem Statement */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Problem to Solve
          </h3>
          <div className="space-y-4">
            <p className="text-blue-900 text-lg">{subtopic.practiceProblem.question}</p>
            
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="font-medium text-gray-700 mb-2">Available options:</p>
              {subtopic.practiceProblem.choices.map((choice) => (
                <div key={choice.id} className="flex items-start gap-3 p-2 rounded bg-blue-50">
                  <span className="font-semibold text-blue-700">{choice.id}.</span>
                  <span className="text-gray-700">{choice.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className={`mb-2 last:mb-0 ${message.sender === 'user' ? 'text-white' : 'text-gray-700'}`}>
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className={`font-semibold ${
                        message.sender === 'user' ? 'text-white' : 'text-blue-700'
                      }`}>
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className={`not-italic font-medium ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-blue-600'
                      }`}>
                        {children}
                      </em>
                    ),
                    code: ({ children }) => (
                      <code className={`px-1.5 py-0.5 rounded ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => (
                      <ul className={`list-disc pl-6 mb-2 space-y-1 ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className={`list-decimal pl-6 mb-2 space-y-1 ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className={message.sender === 'user' ? 'text-white' : 'text-gray-700'}>
                        {children}
                      </li>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2 text-gray-500">
              <Loader className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 space-y-4">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your explanation here..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] max-h-[200px] resize-y"
          />
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            disabled={!voiceService.isSupported() || isAiTyping}
            title={
              !voiceService.isSupported() 
                ? 'Voice input not supported in this browser' 
                : isListening
                  ? 'Click to stop recording'
                  : isAiTyping 
                    ? 'Please wait for AI to respond'
                    : 'Click to start recording'
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-red-500" />
            ) : (
              <Mic className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isAiTyping}
            className={`p-3 rounded-lg ${
              !newMessage.trim() || isAiTyping
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Send className={`w-5 h-5 ${!newMessage.trim() || isAiTyping ? 'text-gray-500' : 'text-white'}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowQuiz(true)}
            className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Take Quiz
          </button>
          <button
            onClick={() => {
              // Reset all state
              setMessages([{
                id: Date.now().toString(),
                content: `I need help understanding this problem:\n\n${subtopic.practiceProblem.question}\n\nHere are the possible answers:\n${subtopic.practiceProblem.choices.map(choice => `${choice.id}. ${choice.text}`).join('\n')}\n\nCan you help me understand how to solve this?`,
                sender: 'ai',
                timestamp: new Date()
              }]);
              setNewMessage('');
              setShowQuiz(false);
              onUpdateStatus('not_started');
            }}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};