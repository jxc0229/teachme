import { Subject } from '../types';

export const subjects: Subject[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    icon: '💻',
    topics: [
      {
        id: 'programming-basics',
        name: 'Programming Basics',
        description: 'Fundamental concepts of programming',
        completed: false,
        subtopics: [
          {
            id: 'variables',
            name: 'Variables and Data Types',
            description: 'Understanding different types of data and how to store them',
            practiceProblem: {
              question: 'Which of the following are valid variable names in Python?',
              choices: [
                { id: 'A', text: '_count' },
                { id: 'B', text: '2names' },
                { id: 'C', text: 'my-variable' },
                { id: 'D', text: 'total_sum' }
              ],
              correctAnswers: ['A', 'D'],
              explanation: 'In Python, variable names can start with a letter or underscore, followed by letters, numbers, or underscores. They cannot start with numbers or contain special characters like hyphens.'
            },
            completed: false,
            attempts: 0,
            status: 'not_started',
            isFundamental: true
          },
          {
            id: 'loops',
            name: 'Loops',
            description: 'Different types of loops and their applications',
            practiceProblem: {
              question: 'Which for statements execute a loop 3 times?',
              choices: [
                { id: 'A', text: 'for x in range(3):' },
                { id: 'B', text: 'for x in range(3, 9, 3)' },
                { id: 'C', text: 'for x in range(20, 50, 10):' },
                { id: 'D', text: 'for x in range(1, 5)' }
              ],
              correctAnswers: ['A', 'C'],
              explanation: 'range(3) creates sequence [0,1,2], and range(20, 50, 10) creates sequence [20, 30, 40], both resulting in 3 iterations.'
            },
            completed: false,
            attempts: 0,
            status: 'not_started',
            isFundamental: true
          }
        ]
      }
    ]
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    topics: [
      {
        id: 'algebra',
        name: 'Algebra',
        description: 'Basic algebraic concepts',
        completed: false,
        subtopics: [
          {
            id: 'equations',
            name: 'Linear Equations',
            description: 'Solving linear equations and their applications',
            practiceProblem: {
              question: 'Which of these equations are linear?',
              choices: [
                { id: 'A', text: 'y = 2x + 3' },
                { id: 'B', text: 'y = x²' },
                { id: 'C', text: '3x - y = 6' },
                { id: 'D', text: 'y = √x' }
              ],
              correctAnswers: ['A', 'C'],
              explanation: 'Linear equations are first-degree equations where variables are only raised to the power of 1. They form straight lines when graphed.'
            },
            completed: false,
            attempts: 0,
            status: 'not_started'
          }
        ]
      }
    ]
  }
];