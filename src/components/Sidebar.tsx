import { MessageSquare, Plus, Trash2, Database } from "lucide-react";
import { ChatSession } from "../types";
import { cn } from "../utils/cn";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentView: 'chat' | 'knowledge';
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onViewChange: (view: 'chat' | 'knowledge') => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  currentView,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onViewChange,
}: SidebarProps) {
  return (
    <div className="w-64 bg-zinc-900 text-zinc-100 flex flex-col h-full border-r border-zinc-800 shrink-0">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
          G
        </div>
        <h1 className="font-semibold text-lg tracking-tight">Garfield</h1>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={() => {
            onViewChange('chat');
            onNewSession();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <button
          onClick={() => onViewChange('knowledge')}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium",
            currentView === 'knowledge' 
              ? "bg-zinc-800 text-white" 
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          )}
        >
          <Database className="w-4 h-4" />
          Knowledge Base
        </button>
      </div>

      <div className="px-4 pb-2 pt-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Chats</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
              currentView === 'chat' && currentSessionId === session.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            )}
            onClick={() => {
              onViewChange('chat');
              onSelectSession(session.id);
            }}
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
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
