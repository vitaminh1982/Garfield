import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X, File, Loader2 } from "lucide-react";
import { UploadedFile } from "../types";
import { fileToBase64, formatFileSize } from "../utils/fileUtils";
import { cn } from "../utils/cn";

interface MessageInputProps {
  onSendMessage: (text: string, files: UploadedFile[]) => void;
  isStreaming: boolean;
}

export function MessageInput({ onSendMessage, isStreaming }: MessageInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (file.type === "application/pdf" || file.type.includes("wordprocessingml")) {
        if (file.size > 20 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 20MB.`);
          continue;
        }
        try {
          const base64 = await fileToBase64(file);
          newFiles.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64,
          });
        } catch (error) {
          console.error("Error reading file:", error);
        }
      } else {
        alert("Only PDF and DOCX files are supported.");
      }
    }
    
    setFiles((prev) => [...prev, ...newFiles]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && files.length === 0) || isStreaming) return;
    
    onSendMessage(text, files);
    setText("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-[200px]"
            >
              <File className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-300">
                  {file.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-zinc-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || isUploading}
          className="p-3 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Garfield about your documents..."
          className="w-full max-h-[200px] py-3 px-2 bg-transparent border-none focus:ring-0 resize-none outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          rows={1}
        />

        <button
          onClick={handleSubmit}
          disabled={(!text.trim() && files.length === 0) || isStreaming}
          className={cn(
            "p-3 rounded-xl transition-all flex items-center justify-center",
            text.trim() || files.length > 0
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
          )}
        >
          {isStreaming ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="text-center mt-2 text-xs text-zinc-500">
        Garfield can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
