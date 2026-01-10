"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User as UserIcon, Loader2, Phone } from "lucide-react";

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

    // Auto-scroll to bottom on new messages
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

    const isMessenger = !!lead?.messenger_psid;

    if (!lead) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-400">
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0a0a0a] relative">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-[#080808] border-b border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-btn text-white flex items-center justify-center text-lg font-bold">
                        {lead.full_name?.[0]?.toUpperCase() || <UserIcon size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                            {lead.full_name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {isMessenger ? "via Facebook Messenger" : "via Lead Form"}
                        </p>
                    </div>
                </div>
                <div>
                    {/* WhatsApp Quick Action if phone exists */}
                    {lead.phone && (
                        <button
                            onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank")}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-200 transition-colors"
                        >
                            <Phone size={14} /> Open WhatsApp
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {/* Placeholder for 'Start of chat' */}
                <div className="text-center text-xs text-gray-400 my-4">
                    Conversation started {new Date(lead.created_at).toLocaleDateString()}
                </div>

                {/* MESSAGES LIST */}
                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-600 italic">
                        No messages yet. {isMessenger ? "Reply to start the conversation." : "This lead has not sent a message on Messenger."}
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === 'user'; // User = Customer
                        return (
                            <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isUser
                                        ? "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 shadow-sm rounded-bl-sm"
                                        : "bg-blue-600 text-white shadow-md rounded-br-sm"
                                    }`}>
                                    <p>{msg.message_text}</p>
                                    <span className="text-[10px] opacity-50 mt-1 block text-right">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            {isMessenger ? (
                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5 flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-gray-100 dark:bg-zinc-900 border-none rounded-full px-4 py-3 outline-none focus:ring-2 ring-primary-btn/20 transition-all dark:text-white"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="w-12 h-12 rounded-full bg-primary-btn text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-white/5 text-center text-sm text-gray-500">
                    Messaging unavailable. This lead does not have a linked Messenger account.
                </div>
            )}
        </div>
    );
}
