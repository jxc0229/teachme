export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
  completed: boolean;
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  practiceProblem: string;
  completed: boolean;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  lastAttempt: Date;
}