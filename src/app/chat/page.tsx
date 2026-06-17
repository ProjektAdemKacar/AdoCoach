"use client";

import { useState, useRef, useEffect } from "react";
import { useStore, type ChatMessage } from "@/store/useStore";
import { generateCoachResponse } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Bot,
  User,
} from "lucide-react";

const QUICK_PROMPTS = [
  "Was kann ich als Snack essen?",
  "Motiviere mich!",
  "Wie verbessere ich meinen Schlaf?",
  "Alternative zu meinem Workout?",
];

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  async function sendMessage(text?: string) {
    const message = text ?? input.trim();
    if (!message || !profile || !geminiApiKey || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    };
    addChatMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateCoachResponse(profile, geminiApiKey, message);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      };
      addChatMessage(assistantMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: err instanceof Error ? err.message : "Fehler bei der Antwort.",
        timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      };
      addChatMessage(errorMsg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="gradient-primary rounded-xl p-2">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AdoCoach</h1>
            <p className="text-xs text-muted-foreground">Dein KI-LifeCoach</p>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="gradient-primary rounded-2xl p-5 glow-primary mb-5">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <p className="text-lg font-semibold">Frag deinen Coach</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Frage mich alles über Ernährung, Sport, Motivation oder deinen Tagesablauf
            </p>
            <div className="grid grid-cols-2 gap-2 mt-6 w-full">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="glass rounded-xl p-3 text-xs text-left hover:bg-white/5 transition-all"
                  onClick={() => sendMessage(prompt)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary mb-1.5" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 gradient-primary rounded-lg p-1.5 h-7 w-7 flex items-center justify-center mt-0.5">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "gradient-primary text-white rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-muted-foreground/60"}`}>
                {msg.timestamp}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="shrink-0 rounded-lg bg-white/10 p-1.5 h-7 w-7 flex items-center justify-center mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="shrink-0 gradient-primary rounded-lg p-1.5 h-7 w-7 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-2 glass rounded-xl p-1.5">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreib eine Nachricht..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="gradient-primary text-white border-0 rounded-lg h-9 w-9 shrink-0 hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
