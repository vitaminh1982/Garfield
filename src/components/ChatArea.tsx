import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, FileText, ExternalLink } from "lucide-react";
import { Message } from "../types";
import { cn } from "../utils/cn";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Bot className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
          Welcome to Garfield
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
          Upload your PDF or DOCX documents and ask questions. I can analyze them, summarize content, and even search the web for more context.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 md:gap-6",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                message.role === "user"
                  ? "bg-zinc-800 text-white"
                  : "bg-emerald-500 text-white"
              )}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>

            <div
              className={cn(
                "flex flex-col max-w-[85%] md:max-w-[75%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "px-5 py-4 rounded-2xl shadow-sm",
                  message.role === "user"
                    ? "bg-zinc-800 text-white rounded-tr-sm"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                )}
              >
                {message.files && message.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-2 rounded-lg"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100">
                  <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                </div>

                {message.groundingUrls && message.groundingUrls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.groundingUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{url.title || url.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-4 md:gap-6 flex-row">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-emerald-500 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-start">
              <div className="px-5 py-4 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
