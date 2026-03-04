import { MessageSquare, Plus, Trash2, FileText } from "lucide-react";
import { ChatSession } from "../types";
import { cn } from "../utils/cn";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <div className="w-64 bg-zinc-900 text-zinc-100 flex flex-col h-full border-r border-zinc-800">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
          G
        </div>
        <h1 className="font-semibold text-lg tracking-tight">Garfield</h1>
      </div>

      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
              currentSessionId === session.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            )}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">{session.title || "New Chat"}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
