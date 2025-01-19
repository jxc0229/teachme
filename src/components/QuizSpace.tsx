import React, { useState, useEffect } from 'react';
import { Subtopic, Message } from '../types';
import { Star, CheckCircle2, XCircle, Brain, ArrowLeft, GraduationCap } from 'lucide-react';
import { evaluateQuizAnswer, analyzeStudentAnswer } from '../services/ai';
import ReactMarkdown from 'react-markdown';

interface QuizSpaceProps {
  subtopic: Subtopic;
  messages: Message[];
  onComplete: (success: boolean) => void;
  onUpdateStatus: (status: Subtopic['status']) => void;
  onBack: () => void;
  subjectId: string;
}

export const QuizSpace: React.FC<QuizSpaceProps> = ({ 
  subtopic, 
  messages,
  onComplete, 
  onUpdateStatus,
  onBack,
  subjectId
}) => {
  const [aiAnswers, setAiAnswers] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [thinkingProcess, setThinkingProcess] = useState<string>('');
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [teacherAnalysis, setTeacherAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const getAIAnswer = async () => {
      setIsLoading(true);
      try {
        const result = await evaluateQuizAnswer(subtopic.practiceProblem, messages);
        setAiAnswers(result.selectedAnswers);
        setExplanation(result.explanation);
        setThinkingProcess(result.thinkingProcess);
        
        const isCorrect = result.selectedAnswers.length === subtopic.practiceProblem.correctAnswers.length &&
          result.selectedAnswers.every(answer => subtopic.practiceProblem.correctAnswers.includes(answer));
        
        setQuizResult(isCorrect ? 'correct' : 'incorrect');
        onComplete(isCorrect);
        
        // Update status to 'mastered' if correct and it's a fundamental topic
        if (isCorrect && subtopic.isFundamental) {
          onUpdateStatus('mastered');
        } else {
          onUpdateStatus(isCorrect ? 'completed' : 'in_progress');
        }

        // Get teacher's analysis if answer is incorrect
        if (!isCorrect) {
          const analysis = await analyzeStudentAnswer(
            subtopic.practiceProblem,
            result.selectedAnswers,
            messages
          );
          setTeacherAnalysis(analysis);
        }
      } catch (error) {
        console.error('Error getting AI answer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAIAnswer();
  }, []);

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      // Get AI's answers based on what it learned
      const result = await evaluateQuizAnswer(subtopic.practiceProblem, messages);
      setAiAnswers(result.selectedAnswers);
      setExplanation(result.explanation);
      setThinkingProcess(result.thinkingProcess);

      // Check if AI's answers are correct
      const isCorrect = result.selectedAnswers.length === subtopic.practiceProblem.correctAnswers.length &&
        result.selectedAnswers.every(answer => subtopic.practiceProblem.correctAnswers.includes(answer));

      setQuizResult(isCorrect ? 'correct' : 'incorrect');
      
      if (isCorrect) {
        onUpdateStatus('completed');
        onComplete(true);
      } else {
        onComplete(false);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setQuizResult('incorrect');
      onComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quiz Time</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Back to Teaching
        </button>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Question */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            {subtopic.practiceProblem.question}
          </h3>
          
          {/* Choices */}
          <div className="space-y-3">
            {subtopic.practiceProblem.choices.map((choice) => (
              <div
                key={choice.id}
                className={`w-full p-4 rounded-lg border-2 ${
                  aiAnswers.includes(choice.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-gray-700">{choice.id}.</span>
                  <span className="text-gray-700">{choice.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thinking Process */}
        {thinkingProcess && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              My Thinking Process
            </h4>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                  em: ({ children }) => <em className="text-blue-600 not-italic font-medium">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                }}
              >
                {thinkingProcess}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Result */}
        {quizResult && (
          <div className={`p-6 rounded-lg ${
            quizResult === 'correct'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {quizResult === 'correct' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className={`text-lg font-semibold ${
                quizResult === 'correct' ? 'text-green-800' : 'text-red-800'
              }`}>
                {quizResult === 'correct' ? 'I got it right!' : 'I need to learn more'}
              </h3>
            </div>

            {/* Show Correct Answers if Wrong */}
            {quizResult === 'incorrect' && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                <p className="font-medium text-red-800 mb-2">The correct answers were:</p>
                <div className="space-y-2">
                  {subtopic.practiceProblem.correctAnswers.map(answerId => {
                    const choice = subtopic.practiceProblem.choices.find(c => c.id === answerId);
                    return choice && (
                      <p key={answerId} className="text-gray-700">
                        <span className="font-medium">{choice.id}.</span> {choice.text}
                      </p>
                    );
                  })}
                </div>

                {/* Teacher's Analysis */}
                {teacherAnalysis && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-700">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                          em: ({ children }) => <em className="text-blue-600 not-italic font-medium">{children}</em>,
                        }}
                      >
                        {teacherAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {subtopic.practiceProblem.explanation && (
                  <div className="mt-4 prose prose-blue max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-700">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                        em: ({ children }) => <em className="text-blue-600 not-italic font-medium">{children}</em>,
                      }}
                    >
                      {subtopic.practiceProblem.explanation}
                    </ReactMarkdown>
                  </div>
                )}
                <button
                  onClick={onBack}
                  className="mt-6 w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Teaching
                </button>
              </div>
            )}

            {/* Return to Topics button when correct */}
            {quizResult === 'correct' && (
              <div className="mt-6 space-y-4">
                {subtopic.isFundamental && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <h3 className="text-lg font-semibold text-yellow-800">Topic Mastered!</h3>
                    </div>
                    <p className="text-gray-700">
                      Congratulations! You've mastered {subtopic.name}, a fundamental programming concept. 
                      This knowledge will be essential as you progress to more advanced topics.
                    </p>
                  </div>
                )}
                <button
                  onClick={onBack}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Teaching
                </button>
                <a
                  href={`/subjects/${subjectId}`}
                  className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  Return to Subject
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!quizResult && (
        <div className="p-6 border-t">
          <button
            onClick={handleSubmitQuiz}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Thinking...' : 'Test My Understanding'}
          </button>
        </div>
      )}
    </div>
  );
};
