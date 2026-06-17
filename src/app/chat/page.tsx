"use client";

import { useState, useRef, useEffect } from "react";
import { useStore, type ChatMessage } from "@/store/useStore";
import { generateCoachResponse } from "@/lib/ai";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, Sparkles, Trash2, Bot, User } from "lucide-react";

const PROMPTS = ["Was kann ich snacken?", "Motiviere mich!", "Schlaftipps?", "Workout-Alternative?"];

export default function ChatPage() {
  const profile = useStore((s) => s.profile);
  const geminiApiKey = useStore((s) => s.geminiApiKey);
  const chatMessages = useStore((s) => s.chatMessages);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const clearChat = useStore((s) => s.clearChat);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [chatMessages]);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || !profile || !geminiApiKey || isLoading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: msg, timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
    addChatMessage(userMsg); setInput(""); setIsLoading(true);
    try {
      const response = await generateCoachResponse(profile, geminiApiKey, msg);
      addChatMessage({ id: crypto.randomUUID(), role: "assistant", content: response, timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) });
    } catch (err) {
      addChatMessage({ id: crypto.randomUUID(), role: "assistant", content: err instanceof Error ? err.message : "Fehler.", timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) });
    } finally { setIsLoading(false); inputRef.current?.focus(); }
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col h-[calc(100dvh-5rem)]">
      <div className="flex items-center justify-between px-4 py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="gradient-neon rounded-xl p-2 glow-neon-sm"><Bot className="h-5 w-5 text-black" /></div>
          <div>
            <h1 className="text-lg font-bold">AI Coach</h1>
            <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" /><span className="text-[10px] text-muted-foreground">Online</span></div>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <button onClick={clearChat} className="card-dark rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="gradient-neon rounded-2xl p-6 glow-neon mb-5"><MessageCircle className="h-10 w-10 text-black" /></div>
            <p className="text-lg font-bold">Frag deinen Coach</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Ernährung, Sport, Motivation — frag mich alles</p>
            <div className="grid grid-cols-2 gap-2 mt-6 w-full">
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)} className="card-dark rounded-xl p-3 text-xs text-left hover:bg-white/[0.03] transition-all">
                  <Sparkles className="h-3.5 w-3.5 text-neon mb-1.5" />{p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <div className="shrink-0 gradient-neon rounded-lg p-1 h-6 w-6 flex items-center justify-center mt-0.5"><Bot className="h-3.5 w-3.5 text-black" /></div>}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user" ? "gradient-neon text-black rounded-br-md font-medium" : "card-dark rounded-bl-md"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[9px] mt-1 ${msg.role === "user" ? "text-black/40" : "text-muted-foreground/40"}`}>{msg.timestamp}</p>
            </div>
            {msg.role === "user" && <div className="shrink-0 card-dark rounded-lg p-1 h-6 w-6 flex items-center justify-center mt-0.5"><User className="h-3.5 w-3.5" /></div>}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 animate-fade-in">
            <div className="shrink-0 gradient-neon rounded-lg p-1 h-6 w-6 flex items-center justify-center"><Bot className="h-3.5 w-3.5 text-black" /></div>
            <div className="card-dark rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => <div key={d} className="h-2 w-2 rounded-full bg-neon animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-2 card-dark rounded-xl p-1.5">
          <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nachricht..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            onKeyDown={(e) => e.key === "Enter" && send()} disabled={isLoading} />
          <button onClick={() => send()} disabled={isLoading || !input.trim()}
            className="gradient-neon rounded-lg h-9 w-9 shrink-0 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Send className="h-4 w-4 text-black" />}
          </button>
        </div>
      </div>
    </div>
  );
}
