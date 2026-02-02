import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  useConversations,
  useConversation,
  useSendAIMessage,
  useAppProject,
} from "@/hooks/useAppLaunch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Send,
  Plus,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Smartphone,
  User,
  Loader2,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const WELCOME_MESSAGE = `Hi! I'm your **Launch Assistant**. 🚀

I'm here to help you publish your app to Google Play and the App Store. I know all the guidelines, requirements, and best practices.

**What I can help you with:**
- Setting up your developer accounts
- Creating store listings that convert
- Generating screenshots and assets
- Writing privacy policies and compliance docs
- Managing beta testing
- Handling review rejections
- Optimizing for search (ASO)

What would you like to work on today?`;

const QUICK_ACTIONS = [
  { label: "Start new project", action: "I want to launch a new app. Can you guide me through the process?" },
  { label: "Fix rejection", action: "My app was rejected from the app store. Can you help me understand why and fix it?" },
  { label: "Create screenshots", action: "I need help creating screenshots for my app store listing. What are the requirements?" },
  { label: "Privacy policy", action: "I need to create a privacy policy for my app. Can you help me generate one?" },
  { label: "Data Safety form", action: "Help me fill out the Google Play Data Safety form correctly." },
  { label: "ASO keywords", action: "Help me find the best keywords for App Store Optimization." },
];

export function AIAssistantPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");

  const { data: project } = useAppProject(projectId || "");
  const { data: conversations, refetch: refetchConversations } = useConversations(projectId || undefined);
  const sendAIMessage = useSendAIMessage();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { data: activeConversation, refetch: refetchConversation } = useConversation(activeConversationId || "");

  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isWaitingForResponse]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isWaitingForResponse) return;

    const messageToSend = inputValue.trim();
    setInputValue("");
    setIsWaitingForResponse(true);

    try {
      const result = await sendAIMessage.mutateAsync({
        message: messageToSend,
        conversationId: activeConversationId || undefined,
        projectId: projectId || undefined,
      });

      if (result) {
        // Set the active conversation if this was a new one
        if (!activeConversationId) {
          setActiveConversationId(result.conversation_id);
        }

        // Refetch to get updated messages
        await refetchConversation();
        await refetchConversations();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
    } finally {
      setIsWaitingForResponse(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const retryLastMessage = async () => {
    if (!activeConversation?.messages.length) return;

    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      setInputValue(lastUserMessage.content);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Conversation History */}
      <div className="w-72 border-r border-white/10 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/app-launch">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="font-semibold">Launch AI</h2>
          </div>
          <Button
            onClick={handleNewConversation}
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Project Context */}
        {project && (
          <div className="p-3 mx-3 mt-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate">{project.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {project.platforms.join(" & ")} • {project.completion_percentage}% complete
            </p>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors",
                activeConversationId === conv.id
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-background/80"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {conv.title || "New conversation"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {conv.message_count} messages
              </p>
            </button>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start chatting to create one</p>
            </div>
          )}
        </div>
      </div>

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
                AI expert for Google Play & App Store
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Powered by Claude</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message (shown when no active conversation or no messages) */}
          {(!activeConversationId || !activeConversation?.messages?.length) && !isWaitingForResponse && (
            <>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-background/50 rounded-2xl rounded-tl-sm p-4 max-w-2xl border border-white/10">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{WELCOME_MESSAGE}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 ml-11">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.action)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-sm text-primary transition-colors border border-primary/20"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Conversation Messages */}
          {activeConversation?.messages?.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
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
              <div className="flex-1 max-w-2xl">
                <div
                  className={cn(
                    "rounded-2xl p-4 relative group",
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

                  {/* Copy button for assistant messages */}
                  {message.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/10"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isWaitingForResponse && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-background/50 rounded-2xl rounded-tl-sm p-4 border border-white/10">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          {/* Error retry button */}
          {sendAIMessage.isError && (
            <div className="flex items-center justify-center gap-2 mb-3 text-sm text-destructive">
              <span>Failed to get response</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={retryLastMessage}
                className="gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about app publishing..."
              className="flex-1"
              disabled={isWaitingForResponse}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isWaitingForResponse}
            >
              {isWaitingForResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Launch AI knows Google Play & App Store guidelines inside out
          </p>
        </div>
      </div>
    </div>
  );
}
