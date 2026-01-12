"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User as UserIcon, Loader2, Phone, MessageSquare, ChevronLeft } from "lucide-react";

interface ChatWindowProps {
    lead: any;
    messages: any[];
    onSendMessage: (text: string) => Promise<void>;
    isLoading: boolean;
    onBack?: () => void; // Prop for back button
}

export default function ChatWindow({ lead, messages, onSendMessage, isLoading, onBack }: ChatWindowProps) {
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
        } catch (error) { console.error(error); } finally { setIsSending(false); }
    };

    const currentPsid = lead?.meta_identities?.messenger_psid;
    const isMessenger = lead?.source === "messenger" || !!currentPsid;

    if (!lead) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0a0a0a] relative">
            {/* Header with Back Icon */}
            <div className="p-3 md:p-4 bg-white dark:bg-[#080808] border-b border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-2 md:gap-3">
                    
                    {/* Back button only on Mobile */}
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-inner">
                        {lead.full_name?.[0]?.toUpperCase() || <UserIcon size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white capitalize leading-none text-sm md:text-base">
                            {lead.full_name}
                        </h3>
                        <p className="text-[10px] md:text-[11px] text-emerald-500 font-medium mt-0.5">Online</p>
                    </div>
                </div>
                
                {lead.phone && (
                    <button
                        onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank")}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] md:text-xs font-bold transition-all shadow-md"
                    >
                        <Phone size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 overflow-x-hidden" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-[14px] shadow-sm ${
                                msg.sender === 'user'
                                    ? "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                                    : "bg-blue-600 text-white rounded-br-none"
                            }`}>
                                <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                                <span className="text-[9px] mt-1 block opacity-60 text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5">
                {isMessenger ? (
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 dark:bg-zinc-900 border-none rounded-full px-4 py-2.5 outline-none text-sm dark:text-white disabled:opacity-50"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isSending}
                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-300"
                        >
                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                ) : (
                    <div className="py-2 text-center text-[11px] text-orange-500 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                        Facebook Messenger reply is only for chat leads.
                    </div>
                )}
            </div>
        </div>
    );
}