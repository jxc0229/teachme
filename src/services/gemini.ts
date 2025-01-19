import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Create a reusable model instance
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}

// For handling images (using gemini-pro-vision model)
export async function analyzeImage(imageData: string, prompt: string): Promise<string> {
  try {
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await visionModel.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/jpeg' } }]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw error;
  }
}
