import React from 'react';
import { Topic } from '../types';
import { Trophy, Star } from 'lucide-react';

interface ProgressTrackerProps {
  topics: Topic[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ topics }) => {
  const completedTopics = topics.filter(topic => topic.completed).length;
  const progressPercentage = (completedTopics / topics.length) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-200">
      <div className="flex items-center space-x-4 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-800">Your Learning Adventure</h3>
      </div>
      <div className="relative">
        <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-8 rounded-full overflow-hidden">
          {Array.from({ length: topics.length }).map((_, i) => (
            <Star
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 ${
                i < completedTopics ? 'text-white' : 'text-gray-300'
              }`}
              style={{ left: `${(i / (topics.length - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-4 text-xl text-center font-bold text-indigo-600">
        {completedTopics} of {topics.length} stars collected!
      </p>
    </div>
  );
};