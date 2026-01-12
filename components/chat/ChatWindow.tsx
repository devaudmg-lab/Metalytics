"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User as UserIcon, Loader2, Phone, MessageSquare } from "lucide-react";

interface ChatWindowProps {
    lead: any;
    messages: any[];
    onSendMessage: (text: string) => Promise<void>;
    isLoading: boolean;
}

export default function ChatWindow({ lead, messages, onSendMessage, isLoading }: ChatWindowProps) {
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, lead?.id]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        setIsSending(true);
        await onSendMessage(inputText);
        setInputText("");
        setIsSending(false);
    };

    // 🎯 Logic Fix: Check PSID from the joined meta_identities table or source
    const currentPsid = lead?.meta_identities?.[0]?.messenger_psid;
    const isMessenger = lead?.source === "messenger" || !!currentPsid;

    if (!lead) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0a0a0a] relative">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-[#080808] border-b border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-inner">
                        {lead.full_name?.[0]?.toUpperCase() || <UserIcon size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white capitalize leading-none mb-1">
                            {lead.full_name}
                        </h3>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                            {isMessenger ? (
                                <span className="flex items-center gap-1 text-blue-500 font-medium">
                                    <MessageSquare size={12} /> Facebook Messenger
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-orange-500 font-medium">
                                    <Send size={12} /> Meta Lead Form
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {lead.phone && (
                        <button
                            onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank")}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                        >
                            <Phone size={14} /> WhatsApp
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                <div className="text-center text-[10px] text-gray-400 my-4 uppercase tracking-widest">
                    Conversation started {new Date(lead.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center p-12 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
                            {isMessenger 
                                ? "No messages yet. Send a message to start the conversation." 
                                : "This lead came from a form and hasn't messaged you yet."}
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                                    isUser
                                        ? "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-white/5 rounded-bl-none"
                                        : "bg-blue-600 text-white shadow-md rounded-br-none"
                                }`}>
                                    <p>{msg.message_text}</p>
                                    <span className={`text-[9px] mt-1.5 block ${isUser ? "text-gray-400" : "text-blue-100"} text-right font-medium`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5">
                {isMessenger ? (
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 dark:bg-zinc-900 border-none rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-blue-500/20 transition-all dark:text-white text-sm"
                            placeholder="Type your message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isSending}
                            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:text-gray-500 shadow-lg shadow-blue-600/20"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                        </button>
                    </form>
                ) : (
                    <div className="py-2 px-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl text-center">
                        <p className="text-[12px] text-orange-600 dark:text-orange-400 font-medium flex items-center justify-center gap-2">
                            <Send size={14} /> Direct Messenger reply is unavailable for Form leads.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}