import React, { useRef, useState } from "react";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { KnowledgeDocument } from "../types";
import { fileToBase64, formatFileSize } from "../utils/fileUtils";

interface KnowledgeBaseProps {
  documents: KnowledgeDocument[];
  onAddDocuments: (docs: KnowledgeDocument[]) => void;
  onDeleteDocument: (id: string) => void;
}

export function KnowledgeBase({ documents, onAddDocuments, onDeleteDocument }: KnowledgeBaseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const newDocs: KnowledgeDocument[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (file.type === "application/pdf" || file.type.includes("wordprocessingml")) {
        if (file.size > 20 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 20MB.`);
          continue;
        }
        try {
          const base64 = await fileToBase64(file);
          newDocs.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Error reading file:", error);
        }
      } else {
        alert("Only PDF and DOCX files are supported.");
      }
    }
    
    if (newDocs.length > 0) {
      onAddDocuments(newDocs);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Knowledge Base</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload documents here to act as the main memory for your AI agent. You can link these documents to specific chats.
          </p>
        </div>

        <div 
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 md:p-12 text-center hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            {isUploading ? "Uploading..." : "Click or drag to upload"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            PDF or DOCX up to 20MB
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Your Documents</h3>
          {documents.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 italic">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
