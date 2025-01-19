export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Choice {
  id: string;
  text: string;
}

export interface MultipleChoiceProblem {
  question: string;
  choices: Choice[];
  correctAnswers: string[]; // Array of correct choice IDs
  explanation?: string;
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  practiceProblem: MultipleChoiceProblem;
  completed: boolean;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed';
  isFundamental?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  subtopics: Subtopic[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}
