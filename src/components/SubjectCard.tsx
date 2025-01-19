import React from 'react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onClick: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const bgColors = {
    'cs': 'bg-blue-500',
    'math': 'bg-green-500',
  };

  return (
    <div
      onClick={() => onClick(subject)}
      className="card-hover bg-white rounded-2xl shadow-lg p-8 cursor-pointer border-4 border-transparent hover:border-indigo-300"
    >
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className={`p-6 ${bgColors[subject.id] || 'bg-indigo-500'} rounded-2xl`}>
          <span className="text-white text-4xl">{subject.icon}</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{subject.name}</h3>
          <p className="text-lg text-indigo-600 mt-2">
            {subject.topics.length} exciting {subject.topics.length === 1 ? 'adventure' : 'adventures'} await!
          </p>
        </div>
      </div>
    </div>
  );
};