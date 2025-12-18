
import { GoogleGenAI } from "@google/genai";
import { FULL_RULES_TEXT } from "../data/rules";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (userPrompt: string) => {
  if (!API_KEY) {
    return "API ключ не знайдено. Будь ласка, зверніться до розробника.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    Ти - професійний ШІ помічник для адміністрації UA Online.
    Творець проекту: Артем Процко (Artem_Furrry).
    Твоє завдання: допомагати адміністраторам швидко знаходити пункти правил та визначати покарання.
    Ось офіційні правила проекту:
    ${FULL_RULES_TEXT}
    
    Відповідай українською мовою. Будь ввічливим. Якщо запитують про покарання, пиши номер пункту, опис та саме покарання.
    Якщо гравець питає щось не по темі правил, нагадуй що ти - адмін-помічник.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Не вдалося отримати відповідь від ШІ.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Сталася помилка при зверненні до ШІ. Спробуйте пізніше.";
  }
};
