import { Content } from "@google/genai";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64
}

export interface KnowledgeDocument extends UploadedFile {
  createdAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  files?: UploadedFile[];
  isStreaming?: boolean;
  groundingUrls?: { uri: string; title: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  linkedKnowledgeIds?: string[];
}

