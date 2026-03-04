import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { ChatHeader } from "./components/ChatHeader";
import { ChatSession, Message, UploadedFile, KnowledgeDocument } from "./types";
import { generateChatResponseStream } from "./services/geminiService";
import { Content } from "@google/genai";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [currentView, setCurrentView] = useState<'chat' | 'knowledge'>('chat');

  const handleNewSession = React.useCallback(() => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: "New Chat",
      messages: [],
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  // Load sessions and knowledge docs from localforage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const savedSessions = await localforage.getItem<ChatSession[]>("garfield_sessions");
        if (savedSessions && savedSessions.length > 0) {
          setSessions(savedSessions);
          setCurrentSessionId(savedSessions[0].id);
        } else {
          handleNewSession();
        }

        const savedDocs = await localforage.getItem<KnowledgeDocument[]>("garfield_knowledge");
        if (savedDocs) {
          setKnowledgeDocs(savedDocs);
        }
      } catch (e) {
        console.error("Failed to load data", e);
        handleNewSession();
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, [handleNewSession]);

  // Save sessions to localforage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localforage.setItem("garfield_sessions", sessions).catch(e => {
        console.error("Failed to save sessions", e);
      });
    }
  }, [sessions, isLoaded]);

  // Save knowledge docs to localforage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localforage.setItem("garfield_knowledge", knowledgeDocs).catch(e => {
        console.error("Failed to save knowledge docs", e);
      });
    }
  }, [knowledgeDocs, isLoaded]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions.length > 1 ? sessions.find(s => s.id !== id)?.id || null : null);
    }
  };

  const handleUpdateLinkedDocs = (docIds: string[]) => {
    if (!currentSessionId) return;
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, linkedKnowledgeIds: docIds } : s
    ));
  };

  const handleSendMessage = async (text: string, files: UploadedFile[]) => {
    if (!currentSessionId) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text,
      files,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMessage],
            title: s.messages.length === 0 ? (text.slice(0, 30) || "Document Analysis") : s.title,
            updatedAt: new Date(),
          };
        }
        return s;
      })
    );

    setIsStreaming(true);

    const modelMessageId = Math.random().toString(36).substring(7);
    const modelMessage: Message = {
      id: modelMessageId,
      role: "model",
      text: "",
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, modelMessage] };
        }
        return s;
      })
    );

    try {
      // Build history for Gemini
      const history: Content[] = currentSession?.messages.map((m) => {
        const parts: any[] = [];
        if (m.files && m.files.length > 0) {
          m.files.forEach(f => {
            parts.push({
              inlineData: {
                data: f.data,
                mimeType: f.type
              }
            });
          });
        }
        if (m.text) {
          parts.push({ text: m.text });
        }
        if (parts.length === 0) {
          parts.push({ text: " " });
        }
        return {
          role: m.role,
          parts,
        };
      }) || [];

      const linkedDocs = knowledgeDocs.filter(doc => currentSession?.linkedKnowledgeIds?.includes(doc.id));

      const stream = generateChatResponseStream(
        history,
        text,
        files.map((f) => ({ data: f.data, mimeType: f.type })),
        linkedDocs.map(doc => ({ data: doc.data, mimeType: doc.type, name: doc.name }))
      );

      let fullText = "";
      let groundingUrls: { uri: string; title: string }[] = [];

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
        }

        // Extract grounding URLs if available
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          chunks.forEach((c: any) => {
            if (c.web?.uri && !groundingUrls.some(u => u.uri === c.web.uri)) {
              groundingUrls.push({ uri: c.web.uri, title: c.web.title || c.web.uri });
            }
          });
        }

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === modelMessageId
                    ? { ...m, text: fullText, groundingUrls }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === modelMessageId
                  ? { ...m, text: "Sorry, I encountered an error processing your request." }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsStreaming(false);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === modelMessageId ? { ...m, isStreaming: false } : m
              ),
            };
          }
          return s;
        })
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        currentView={currentView}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onViewChange={setCurrentView}
      />
      <main className="flex-1 flex flex-col h-full relative">
        {currentView === 'knowledge' ? (
          <KnowledgeBase 
            documents={knowledgeDocs}
            onAddDocuments={(docs) => setKnowledgeDocs(prev => [...docs, ...prev])}
            onDeleteDocument={(id) => {
              setKnowledgeDocs(prev => prev.filter(d => d.id !== id));
              // Also remove from linked sessions
              setSessions(prev => prev.map(s => ({
                ...s,
                linkedKnowledgeIds: s.linkedKnowledgeIds?.filter(linkedId => linkedId !== id)
              })));
            }}
          />
        ) : (
          <>
            {currentSession && (
              <ChatHeader 
                session={currentSession}
                knowledgeDocs={knowledgeDocs}
                onUpdateLinkedDocs={handleUpdateLinkedDocs}
              />
            )}
            <ChatArea
              messages={currentSession?.messages || []}
              isStreaming={isStreaming}
            />
            <div className="bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 pt-6 pb-4 px-4">
              <MessageInput
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
