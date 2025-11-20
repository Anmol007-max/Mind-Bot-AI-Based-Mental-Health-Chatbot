"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function TherapyPage() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatPaused, setIsChatPaused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Reserved for future use */}
      <div className="hidden lg:block w-64 border-r">
        {/* Future content will go here */}
      </div>

      {/* Main Chat Area - Centered */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Centered */}
        <div className="flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">AI Therapist</h2>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <div className="relative flex flex-col items-center justify-center mx-auto">
                  <motion.div
                    className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                    initial="initial"
                    animate="animate"
                    variants={glowAnimation as any}
                  />
                  <div className="relative flex items-center justify-center gap-2 text-2xl font-semibold">
                    <div className="relative">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <motion.div
                        className="absolute inset-0 text-primary"
                        initial="initial"
                        animate="animate"
                        variants={glowAnimation as any}
                      >
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                    </div>
                    <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                      MIND-BOT
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    I am here for you. Feel free to talk to me on any topic you need consultant 🤗💫
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-6 py-8",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center ring-1 ring-primary/20">
                              <Bot className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-background text-secondayy flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {msg.role === "assistant" ? "AI Therapist" : "You"}
                            </p>
                          </div>
                          <div className="prose prose-sm dark:prose-invert leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-8 flex gap-4 bg-muted/30"
                  >
                    <div className="w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">AI Therapist</p>
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4">
            <form action="" onSubmit={() => {}} className="max-w-3xl mx-auto flex gap-4 items-end relative">
              <div className="flex-1 relative group">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Complete the activity to continue..."
                      : "Ask me anything..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background",
                    "p-3 pr-12 min-h-[48px] max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      //handleSubmit(e);
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-full shrink-0"
                disabled={isTyping || isChatPaused || !message.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}