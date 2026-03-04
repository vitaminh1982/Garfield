import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* generateChatResponseStream(
  history: Content[],
  newMessage: string,
  files: { data: string; mimeType: string }[],
  knowledgeDocs: { data: string; mimeType: string; name: string }[] = []
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

  // Inject knowledge docs into the FIRST user message if available
  if (knowledgeDocs.length > 0) {
    const knowledgeParts: Part[] = knowledgeDocs.map(doc => ({
      inlineData: {
        data: doc.data,
        mimeType: doc.mimeType
      }
    }));
    
    knowledgeParts.push({ text: "The above documents are provided as a Knowledge Base for this conversation. Please use them to answer any related questions." });

    // Find the first user message
    const firstUserMessageIndex = contents.findIndex(c => c.role === "user");
    if (firstUserMessageIndex !== -1) {
      contents[firstUserMessageIndex] = {
        ...contents[firstUserMessageIndex],
        parts: [...knowledgeParts, ...contents[firstUserMessageIndex].parts]
      };
    }
  }

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
