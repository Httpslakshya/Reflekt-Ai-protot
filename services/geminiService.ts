import { GoogleGenAI } from "@google/genai";
import { PromptMode, ToneType } from "../types";

declare var process: any;

export const enhancePrompt = async (
  text: string,
  mode: PromptMode,
  flavors: string[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key must be set in process.env.API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });

  let instruction = "";

  switch (mode) {
    case PromptMode.LIGHT:
      instruction = "Fix grammar and clarity. Keep it concise (1-2 sentences). Output ONLY the refined text. Do not add any preamble, conversational filler, or bold headers.";
      break;
    case PromptMode.NORMAL:
      instruction = "Rewrite this into a clear, structured prompt. Provide sufficient context but keep it to one paragraph. Output ONLY the refined prompt text. Do not add labels like '**Prompt:**' or '**Refined Output**'.";
      break;
    case PromptMode.DETAILED:
      instruction = "Convert this into a fully detailed, high-quality AI prompt. Include 'Role', 'Task', 'Requirements', and 'Output Format' sections. Output ONLY the refined prompt content. Do not add conversational text or labels like 'Here is the prompt'.";
      break;
  }

  if (flavors.length > 0) {
    instruction += ` Additional requirements: ${flavors.join(", ")}.`;
  }

  const prompt = `System: You are a specialized text refinement engine. Your only job is to output the transformed text. Do not converse. Do not label the output.
Task: ${instruction}

Input Text: "${text}"

Output:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let result = response.text || "Failed to generate text.";

    // cleanup common unwanted prefixes if the model hallucinates a header
    result = result
      .replace(/^\*\*Prompt:?\*\*[\s\n]*/i, '')
      .replace(/^\*\*Refined Output:?\*\*[\s\n]*/i, '')
      .replace(/^Here is (the|your) prompt:?[\s\n]*/i, '')
      .replace(/^Prompt:?[\s\n]*/i, '');

    return result.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTones = async (text: string): Promise<Record<ToneType, string>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key must be set in process.env.API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });

  // Generating all tones in one go to save tokens and time
  const prompt = `
    Rewrite the following text into 5 distinct tones: Professional, Casual, Polite, Funny, and Social Media Style.
    Return the result strictly as a JSON object with keys: "professional", "casual", "polite", "funny", "social".
    Do not use Markdown formatting (like \`\`\`json). Just the raw JSON string.
    
    Input Text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonStr = response.text || "{}";
    // Clean potential markdown blocks if the model ignores instruction
    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(cleanJson);

    return {
      [ToneType.PROFESSIONAL]: data.professional || "Error generating",
      [ToneType.CASUAL]: data.casual || "Error generating",
      [ToneType.POLITE]: data.polite || "Error generating",
      [ToneType.FUNNY]: data.funny || "Error generating",
      [ToneType.SOCIAL]: data.social || "Error generating",
    };
  } catch (error) {
    console.error("Gemini Tone Gen Error:", error);
    throw error;
  }
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Test',
    });
    return true;
  } catch (e) {
    return false;
  }
};