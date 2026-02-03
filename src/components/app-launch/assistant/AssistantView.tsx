import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ProtocolSidebar } from "./ProtocolSidebar";
import { ChatArea } from "./ChatArea";
import { QuickActions } from "./QuickActions";

import {
  usePauseSession,
  useSendAssistantMessage,
} from "@/hooks/useAssistantSession";
import { useConversation } from "@/hooks/useAppLaunch";

import type { AssistantSession, AIMessage } from "@/api/types/appLaunch";

interface AssistantViewProps {
  session: AssistantSession;
}

const INITIAL_MESSAGE = `Willkommen! Ich bin dein **Launch Assistant**. 🚀

Ich führe dich Schritt für Schritt durch den gesamten App-Launch-Prozess. Du siehst immer nur **eine Frage** - keine Sorge, ich kümmere mich um den Rest.

**Wie heißt deine App?**

---
📍 **Basics** | Schritt 1`;

export function AssistantView({ session }: AssistantViewProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<AIMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const pauseSession = usePauseSession();
  const sendMessage = useSendAssistantMessage();

  // Fetch conversation messages if session has a conversation
  const { data: conversationData, refetch: refetchConversation } = useConversation(
    session.conversation_id || ""
  );

  // Sync messages from conversation
  useEffect(() => {
    if (conversationData?.messages) {
      setLocalMessages(conversationData.messages);
      setIsInitialized(true);
    } else if (session.conversation_id) {
      // Conversation exists but no messages yet
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, [conversationData, session.conversation_id]);

  // Send initial message if this is a fresh session
  useEffect(() => {
    if (isInitialized && localMessages.length === 0 && session.current_phase === "discovery" && session.current_step === 0) {
      // This is a fresh session, the AI will respond with initial question
      // We could auto-send a "start" message, or just show the welcome
    }
  }, [isInitialized, localMessages.length, session.current_phase, session.current_step]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const messageText = inputValue.trim();
    setInputValue("");

    // Optimistically add user message
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      conversation_id: session.conversation_id || "",
      role: "user",
      content: messageText,
      attachments: [],
      suggested_actions: [],
      tool_calls: [],
      tool_results: [],
      tokens_used: null,
      model_used: null,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    try {
      const result = await sendMessage.mutateAsync({
        message: messageText,
        sessionId: session.id,
      });

      if (result) {
        // Add assistant response
        const assistantMessage: AIMessage = {
          id: crypto.randomUUID(),
          conversation_id: result.conversation_id,
          role: "assistant",
          content: result.message,
          attachments: [],
          suggested_actions: [],
          tool_calls: [],
          tool_results: [],
          tokens_used: result.usage?.input_tokens || null,
          model_used: "claude-sonnet-4-20250514",
          created_at: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, assistantMessage]);

        // Refetch to get any updates
        refetchConversation();
      }
    } catch (error) {
      // Remove optimistic message on error
      setLocalMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Senden der Nachricht"
      );
    }
  };

  const handlePauseSession = async () => {
    try {
      await pauseSession.mutateAsync(session.id);
      toast.success("Session pausiert");
      navigate("/app-launch");
    } catch (error) {
      toast.error("Fehler beim Pausieren");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with Protocol */}
      <ProtocolSidebar
        session={session}
        onPause={handlePauseSession}
        isPausing={pauseSession.isPending}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Launch Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Schritt für Schritt zum App Launch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Powered by Claude</span>
          </div>
        </div>

        {/* Messages */}
        <ChatArea
          messages={localMessages}
          isLoading={sendMessage.isPending}
          welcomeMessage={INITIAL_MESSAGE}
        />

        {/* Input Area */}
        <QuickActions
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSendMessage}
          placeholder="Deine Antwort..."
          isLoading={sendMessage.isPending}
        />
      </div>
    </div>
  );
}
