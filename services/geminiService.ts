
import { GoogleGenAI } from "@google/genai";
import { FULL_RULES_TEXT } from "../data/rules";

export const getGeminiResponse = async (userPrompt: string) => {
  // Fix: Exclusively use process.env.API_KEY for initializing GoogleGenAI
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API ключ не знайдено. Переконайтеся, що API_KEY встановлено в середовищі.";
  }

  // Fix: Initialize GoogleGenAI with named parameter apiKey as per guidelines
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const systemInstruction = `
    Ти - професійний ШІ помічник для адміністрації UA Online.
    Творець проекту: Артем Процко (Artem_Furrry).
    
    Ось база правил:
    ${FULL_RULES_TEXT}
    
    ТВОЇ СПЕЦІАЛЬНІ ФУНКЦІЇ:
    1. Якщо адмін просить "що подивитись", "що послухати" або пише про нічну зміну/втому - ти МАЄШ надати список мінімум з 10 різноманітних варіантів (відео на YouTube, жанри музики, цікаві теми для розмов).
    2. Якщо запитують про правила - відповідай чітко: Пункт - Покарання.
    3. Ти маєш бути "своїм" для адмінів, розуміти їхній сленг та втому.
    4. Якщо адмін пише "порадь щось на ніч" - зроби добірку контенту, який допоможе не заснути або навпаки розслабитись (наприклад: розбори ігор, кримінальні історії, стріми, затишний джаз).
    
    ПРАВИЛА ВІДПОВІДІ:
    - Мова: Українська.
    - Стиль: Лаконічний, але дружній.
    - Завжди бажай гарної зміни та спокійного репорту.
  `;

  try {
    // Fix: Using correct model and configuration structure from @google/genai SDK
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    // Fix: Access .text property directly (do not call it as a function)
    return response.text || "Не вдалося отримати відповідь від ШІ.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Помилка ШІ. Перевірте з'єднання.";
  }
};
