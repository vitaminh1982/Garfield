import React, { useState } from "react";
import { Database, X, Check } from "lucide-react";
import { ChatSession, KnowledgeDocument } from "../types";
import { cn } from "../utils/cn";

interface ChatHeaderProps {
  session: ChatSession;
  knowledgeDocs: KnowledgeDocument[];
  onUpdateLinkedDocs: (docIds: string[]) => void;
}

export function ChatHeader({ session, knowledgeDocs, onUpdateLinkedDocs }: ChatHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const linkedIds = session.linkedKnowledgeIds || [];

  const toggleLink = (docId: string) => {
    if (linkedIds.includes(docId)) {
      onUpdateLinkedDocs(linkedIds.filter(id => id !== docId));
    } else {
      onUpdateLinkedDocs([...linkedIds, docId]);
    }
  };

  return (
    <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10">
      <h2 className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[50%]">
        {session.title}
      </h2>
      
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
            linkedIds.length > 0
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Knowledge Base</span>
          {linkedIds.length > 0 && (
            <span className="bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md text-xs">
              {linkedIds.length}
            </span>
          )}
        </button>

        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Link Documents</h3>
                <button onClick={() => setIsDropdownOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {knowledgeDocs.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 p-2 text-center">
                    No documents in Knowledge Base.
                  </p>
                ) : (
                  knowledgeDocs.map(doc => {
                    const isLinked = linkedIds.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => toggleLink(doc.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left group"
                      >
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate pr-2">
                          {doc.name}
                        </span>
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isLinked 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-zinc-300 dark:border-zinc-600 text-transparent group-hover:border-emerald-500"
                        )}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
