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
} from "lucide-react";

interface ChatWindowProps {
  lead: any;
  messages: any[];
  onSendMessage: (text: string) => Promise<void>;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lead?.id]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(inputText);
      setInputText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const hasMessenger = !!lead?.meta_identities?.messenger_psid;
  const hasWhatsApp = !!lead?.meta_identities?.whatsapp_number;
  const isWhatsAppSource = lead?.source === "whatsapp";
  const canReply = isWhatsAppSource || hasMessenger || hasWhatsApp;

  if (!lead) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950 text-slate-400">
        <div className="w-20 h-20 bg-primary-btn/5 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={32} className="opacity-20 text-primary-btn" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          Select a lead to chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 relative">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft
              size={24}
              className="text-slate-600 dark:text-slate-300"
            />
          </button>

          <div className="relative">
            <div
              className={`w-11 h-11 rounded-full ${
                isWhatsAppSource ? "bg-emerald-600" : "bg-primary-btn"
              } text-white flex items-center justify-center text-lg font-black shadow-md`}
            >
              {lead.full_name?.[0]?.toUpperCase() || <UserIcon size={20} />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
              {isWhatsAppSource ? (
                <Phone size={10} className="text-emerald-500" />
              ) : (
                <MessageSquare size={10} className="text-primary-btn" />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50  capitalize leading-none text-base">
              {lead.full_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isWhatsAppSource ? "text-emerald-500" : "text-primary-btn"
                }`}
              >
                {isWhatsAppSource ? "WhatsApp Business" : "Messenger"}
              </span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {lead.phone && (
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${lead.phone.replace(/\D/g, "")}`,
                "_blank"
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all  shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
        ref={scrollRef}
      >
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary-btn" />
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all ${
                  msg.sender === "user"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800"
                    : `${
                        isWhatsAppSource ? "bg-emerald-600" : "bg-primary-btn"
                      } text-white rounded-br-none shadow-primary-btn/10`
                }`}
              >
                <p className="whitespace-pre-wrap break-words font-medium">
                  {msg.message_text}
                </p>
                <div
                  className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 ${
                    msg.sender === "user" ? "justify-start" : "justify-end"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.sender !== "user" && <ShieldCheck size={10} />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/50 transition-colors">
        {canReply ? (
          <form
            onSubmit={handleSend}
            className="flex gap-3 items-center max-w-5xl mx-auto"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-btn/30 rounded-2xl px-5 py-3.5 outline-none text-sm font-medium dark:text-white placeholder:text-slate-500 transition-all focus:ring-4 focus:ring-primary-btn/5"
                placeholder={`Reply via ${
                  isWhatsAppSource ? "WhatsApp" : "Messenger"
                }...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all  disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:shadow-none ${
                isWhatsAppSource
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  : "bg-primary-btn hover:bg-indigo-700 shadow-primary-btn/20"
              }`}
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        ) : (
          <div className="py-3 px-4 text-center text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200/50 dark:border-orange-500/20">
            Platform restrictions: direct replies not available for{" "}
            {lead.source}
          </div>
        )}
      </div>
    </div>
  );
}
