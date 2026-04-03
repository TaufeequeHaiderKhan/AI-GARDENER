import { GoogleGenAI, Type } from "@google/genai";
import { PlantInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyPlant(base64Image: string, lang: 'en' | 'ur' = 'en'): Promise<PlantInfo> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Identify this plant and provide care instructions in JSON format. 
            Include: scientific_name, common_name, category (house/veg/fruit/tree), 
            care (watering, light, soil, fertilizer, pruning, pests), 
            fruit (produced, edible, safety_note, nutrition).
            Provide ALL descriptions in ${lang === 'en' ? 'English' : 'Urdu'}.
            Keep descriptions concise and senior-friendly.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scientific_name: { type: Type.STRING },
          common_name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["house", "veg", "fruit", "tree"] },
          care: {
            type: Type.OBJECT,
            properties: {
              watering: { type: Type.STRING },
              light: { type: Type.STRING },
              soil: { type: Type.STRING },
              fertilizer: { type: Type.STRING },
              pruning: { type: Type.STRING },
              pests: { type: Type.STRING },
            },
            required: ["watering", "light", "soil", "fertilizer", "pruning", "pests"],
          },
          fruit: {
            type: Type.OBJECT,
            properties: {
              produced: { type: Type.BOOLEAN },
              edible: { type: Type.BOOLEAN },
              safety_note: { type: Type.STRING },
              nutrition: { type: Type.STRING },
            },
            required: ["produced", "edible", "safety_note", "nutrition"],
          },
        },
        required: ["scientific_name", "common_name", "category", "care", "fruit"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  return { ...result, confidence: 0.95 }; // Mock confidence for now
}

export async function askQuestion(question: string, plantContext: string, lang: 'en' | 'ur' = 'en'): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is asking about a plant: "${plantContext}". 
    Question: "${question}". 
    Provide a concise, senior-friendly answer in ${lang === 'en' ? 'English' : 'Urdu'}.`,
  });
  return response.text || "I'm sorry, I couldn't understand that.";
}
