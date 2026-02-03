import { useRef, useEffect } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { AIMessage } from "@/api/types/appLaunch";

interface ChatAreaProps {
  messages: AIMessage[];
  isLoading?: boolean;
  welcomeMessage?: string;
}

const DEFAULT_WELCOME = `Willkommen! Ich bin dein **Launch Assistant**. 🚀

Ich führe dich Schritt für Schritt durch den gesamten App-Launch-Prozess. Du siehst immer nur **eine Frage** - keine Sorge, ich kümmere mich um alles andere.

Lass uns starten!`;

export function ChatArea({ messages, isLoading, welcomeMessage = DEFAULT_WELCOME }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Welcome Message (shown when no messages) */}
      {messages.length === 0 && !isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-background/50 rounded-2xl rounded-tl-sm p-4 max-w-2xl border border-white/10">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Messages */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" && "flex-row-reverse"
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              message.role === "user"
                ? "bg-primary"
                : "bg-gradient-to-br from-primary to-purple-500"
            )}
          >
            {message.role === "user" ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 max-w-2xl">
            <div
              className={cn(
                "rounded-2xl p-4",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm ml-auto"
                  : "bg-background/50 rounded-tl-sm border border-white/10"
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="bg-background/50 rounded-2xl rounded-tl-sm p-4 border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Denke nach...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
