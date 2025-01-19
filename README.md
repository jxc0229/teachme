# AI Learning Student

With the development of large language models (LLMs), students can easily use generative AI to complete their homework without truly understanding the material. TeachMe! is designed to address this challenge. In TeachMe!, the only way to master a topic is by effectively explaining the concept to an AI learner. If the explanation is insufficient, the AI will be unable to pass a subsequent quiz, highlighting the need for a deeper understanding and encouraging students to improve their explanations. This ensures that students engage actively with the material and genuinely learn the concepts.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key from Google AI Studio

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`


## Key Components

## Features in Detail

### Voice Input
- Click the microphone icon to start recording
- Speak naturally to teach concepts
- Click again to stop recording
- Voice input is automatically converted to text

### AI Student
- Behaves like a 15-year-old student
- Learns only from your teachings
- Provides detailed explanations of its understanding
- Asks clarifying questions when needed

## Acknowledgments

- Google's Gemini AI for providing the AI capabilities
- bolt.new and windsurf for generating most of the front-end code
