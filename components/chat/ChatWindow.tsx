"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  User as UserIcon,
  Loader2,
  Phone,
  MessageSquare,
  ChevronLeft,
  ShieldCheck,
  Paperclip,
  X,
  Image as ImageIcon,
  PlayCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ChatWindowProps {
  lead: any;
  messages: any[];
  onSendMessage: (text: string, mediaUrl?: string) => Promise<void>;
  isLoading: boolean;
  onBack?: () => void;
  platform?: string;
}

export default function ChatWindow({
  lead,
  messages,
  onSendMessage,
  isLoading,
  onBack,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lead?.id]);

  // 1. Logic: File Selection (Image & Video)
  const handleFileSelection = (file: File) => {
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Only images and videos are supported.");
      return;
    }

    // 16MB Limit for WhatsApp compliance
    if (file.size > 16 * 1024 * 1024) {
      alert("File size must be under 16MB.");
      return;
    }

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  };

  const clearPreview = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 2. Logic: Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  // 3. Logic: Final Send
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !pendingFile) || isSending) return;

    setIsSending(true);
    let uploadedUrl = "";

    try {
      if (pendingFile) {
        setIsUploading(true);
        const fileExt = pendingFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `chat-media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-media")
          .upload(filePath, pendingFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("chat-media")
          .getPublicUrl(filePath);
        
        uploadedUrl = publicUrl;
      }

      await onSendMessage(inputText, uploadedUrl);
      
      setInputText("");
      clearPreview();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const isWhatsAppSource = lead?.source === "whatsapp";
  const canReply = isWhatsAppSource || !!lead?.meta_identities?.messenger_psid || !!lead?.meta_identities?.whatsapp_number;

  // Helper to check if URL is a video
  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|m4v)/i);
  };

  if (!lead) return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950 text-slate-400">
      <MessageSquare size={32} className="opacity-20 text-primary-btn" />
      <p className="text-sm font-bold uppercase mt-4">Select a lead to chat</p>
    </div>
  );

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay UI */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm pointer-events-none border-4 border-dashed border-primary-btn m-4 rounded-3xl transition-all">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-primary-btn/10 rounded-full">
              <ImageIcon size={48} className="text-primary-btn animate-bounce" />
            </div>
            <p className="text-lg font-bold text-primary-btn uppercase tracking-widest">Drop Media to Preview</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className={`w-11 h-11 rounded-full ${isWhatsAppSource ? "bg-emerald-600" : "bg-primary-btn"} text-white flex items-center justify-center text-lg font-black`}>
            {lead.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50">{lead.full_name}</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-btn" /></div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                msg.sender === "user" ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                : `${isWhatsAppSource ? "bg-emerald-600" : "bg-primary-btn"} text-white`
              }`}>
                {msg.metadata?.media_url && (
                  <div className="mb-2">
                    {isVideoUrl(msg.metadata.media_url) ? (
                      <video 
                        src={msg.metadata.media_url} 
                        controls 
                        className="rounded-lg max-h-64 w-full bg-black shadow-inner"
                      />
                    ) : (
                      <img 
                        src={msg.metadata.media_url} 
                        className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-95" 
                        onClick={() => window.open(msg.metadata.media_url, '_blank')} 
                      />
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/50">
        {canReply ? (
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            
            {/* Image/Video Preview Box */}
            {previewUrl && (
              <div className="flex items-end gap-2 px-2">
                <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-primary-btn shadow-xl bg-slate-900 flex items-center justify-center">
                  {pendingFile?.type.startsWith("video/") ? (
                    <>
                      <video src={previewUrl} className="h-full w-full object-cover opacity-60" />
                      <PlayCircle className="absolute text-white opacity-80" size={32} />
                    </>
                  ) : (
                    <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={20} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={clearPreview}
                  className="mb-1 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-3 items-center">
              <input 
                type="file" 
                accept="image/*,video/*" 
                hidden 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                <Paperclip size={20} />
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-btn/30 rounded-2xl px-5 py-3.5 outline-none text-sm dark:text-white"
                  placeholder={previewUrl ? "Add a caption..." : "Write a message..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                />
              </div>
              
              <button
                type="submit"
                disabled={(!inputText.trim() && !pendingFile) || isSending}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50 ${
                  isWhatsAppSource ? "bg-emerald-600 shadow-emerald-500/20" : "bg-primary-btn shadow-primary-btn/20"
                }`}
              >
                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-2 text-center text-[10px] font-bold text-orange-600 bg-orange-50 rounded-lg">
            Direct replies restricted for this platform
          </div>
        )}
      </div>
    </div>
  );
}