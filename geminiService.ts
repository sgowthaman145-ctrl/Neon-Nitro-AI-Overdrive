
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAICommentary = async (
  event: 'start' | 'crash' | 'high_speed' | 'milestone',
  score: number,
  speed: number
): Promise<string> => {
  try {
    const prompt = `
      Context: A fast-paced neon cyberpunk car racing game called "Neon Nitro".
      Event: ${event}
      Current Score: ${score}
      Current Speed: ${speed} km/h
      
      Task: Provide a short, energetic, one-sentence commentary snippet as a futuristic AI announcer. 
      Keep it under 15 words. Be punchy and thematic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.8,
      }
    });

    return response.text?.trim() || "Drive like your life depends on it!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error in the matrix! Keep driving!";
  }
};
