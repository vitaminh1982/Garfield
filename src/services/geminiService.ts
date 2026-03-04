import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* generateChatResponseStream(
  history: Content[],
  newMessage: string,
  files: { data: string; mimeType: string }[]
) {
  const parts: Part[] = [];
  
  for (const file of files) {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType,
      },
    });
  }
  
  if (newMessage) {
    parts.push({ text: newMessage });
  }

  if (parts.length === 0) {
    parts.push({ text: " " });
  }

  const newContent: Content = {
    role: "user",
    parts,
  };

  const contents = [...history, newContent];

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are Garfield, an intelligent AI assistant capable of analyzing documents and searching the web. Provide clear, concise, and helpful answers. Format your responses using markdown. If a user uploads a document, analyze it carefully and answer their questions based on its contents. If you need more information, use Google Search.",
    },
  });

  for await (const chunk of responseStream) {
    yield chunk as GenerateContentResponse;
  }
}
