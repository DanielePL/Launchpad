import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  User,
  Send,
  Smartphone,
  Apple,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OnboardingAnswers,
  ExperienceLevel,
  Platform,
  AppType,
  TechStack,
  DevelopmentStatus,
} from "@/api/types/appLaunch";

interface DiscoveryChatProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: QuickReply[];
  inputType?: "text";
  inputPlaceholder?: string;
}

interface QuickReply {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

type QuestionKey =
  | "app_name"
  | "app_type"
  | "tech_stack"
  | "platforms"
  | "development_status"
  | "has_published_before"
  | "has_play_console"
  | "has_apple_dev";

const QUESTIONS: Record<QuestionKey, Omit<Message, "id" | "role">> = {
  app_name: {
    content: "Wie heißt deine App? Keine Sorge, du kannst den Namen später noch ändern.",
    inputType: "text",
    inputPlaceholder: "z.B. My Awesome App",
  },
  app_type: {
    content: "Cool! Was für eine App ist es?",
    options: [
      { value: "game", label: "Game", description: "Spiel oder interaktive Unterhaltung" },
      { value: "utility", label: "Utility", description: "Nützliche Werkzeuge & Tools" },
      { value: "social", label: "Social", description: "Kommunikation & Netzwerke" },
      { value: "business", label: "Business", description: "Produktivität & Arbeit" },
      { value: "health", label: "Health & Fitness", description: "Gesundheit & Sport" },
      { value: "education", label: "Education", description: "Lernen & Wissen" },
      { value: "entertainment", label: "Entertainment", description: "Medien & Unterhaltung" },
      { value: "other", label: "Andere", description: "Etwas anderes" },
    ],
  },
  tech_stack: {
    content: "Womit entwickelst du die App?",
    options: [
      { value: "react_native", label: "React Native", description: "JavaScript/TypeScript" },
      { value: "flutter", label: "Flutter", description: "Dart" },
      { value: "swift", label: "Swift/SwiftUI", description: "Nur iOS" },
      { value: "kotlin", label: "Kotlin/Java", description: "Nur Android" },
      { value: "native_both", label: "Native (beide)", description: "Swift + Kotlin" },
      { value: "other", label: "Andere", description: "Unity, Xamarin, etc." },
    ],
  },
  platforms: {
    content: "Auf welchen Plattformen soll deine App erscheinen?",
    options: [
      {
        value: "both",
        label: "Beide Plattformen",
        icon: <Smartphone className="h-5 w-5" />,
        description: "iOS & Android",
      },
      {
        value: "ios",
        label: "Nur iOS",
        icon: <Apple className="h-5 w-5" />,
        description: "App Store",
      },
      {
        value: "android",
        label: "Nur Android",
        icon: <Play className="h-5 w-5" />,
        description: "Google Play",
      },
    ],
  },
  development_status: {
    content: "Wie weit bist du mit der Entwicklung?",
    options: [
      { value: "idea", label: "Noch eine Idee", description: "Planung & Konzept" },
      { value: "development", label: "In Entwicklung", description: "Coding läuft" },
      { value: "ready", label: "Fertig zum Launch", description: "App ist bereit" },
    ],
  },
  has_published_before: {
    content: "Hast du schon mal eine App in einem Store veröffentlicht?",
    options: [
      { value: "yes", label: "Ja", description: "Ich kenne den Prozess" },
      { value: "no", label: "Nein", description: "Das ist mein erstes Mal" },
    ],
  },
  has_play_console: {
    content: "Hast du bereits einen Google Play Console Account?",
    options: [
      { value: "yes", label: "Ja", description: "Account existiert" },
      { value: "no", label: "Nein", description: "Muss ich noch erstellen" },
      { value: "unknown", label: "Was ist das?", description: "Brauche mehr Info" },
    ],
  },
  has_apple_dev: {
    content: "Und einen Apple Developer Account?",
    options: [
      { value: "yes", label: "Ja", description: "Account existiert" },
      { value: "no", label: "Nein", description: "Muss ich noch erstellen" },
      { value: "unknown", label: "Was ist das?", description: "Brauche mehr Info" },
    ],
  },
};

const QUESTION_ORDER: QuestionKey[] = [
  "app_name",
  "app_type",
  "tech_stack",
  "platforms",
  "development_status",
  "has_published_before",
  "has_play_console",
  "has_apple_dev",
];

function detectExperienceLevel(answers: Partial<OnboardingAnswers>): ExperienceLevel {
  let score = 0;

  if (answers.has_published_before) score += 3;
  if (answers.has_play_console === true) score += 1;
  if (answers.has_apple_dev === true) score += 1;
  if (answers.development_status === "ready") score += 1;

  // "Was ist das?" answers indicate beginner
  if (answers.has_play_console === null) score -= 2;
  if (answers.has_apple_dev === null) score -= 2;

  if (score >= 4) return "pro";
  if (score >= 1) return "intermediate";
  return "beginner";
}

export function DiscoveryChat({ onComplete }: DiscoveryChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [textInput, setTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start with first question
  useEffect(() => {
    const timer = setTimeout(() => {
      addAssistantMessage(QUESTIONS.app_name);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addAssistantMessage = (question: Omit<Message, "id" | "role">) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { ...question, id: crypto.randomUUID(), role: "assistant" },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
  };

  const handleAnswer = (value: string, label: string) => {
    addUserMessage(label);

    const questionKey = QUESTION_ORDER[currentQuestion];
    const newAnswers = { ...answers };

    // Process answer based on question
    switch (questionKey) {
      case "app_name":
        newAnswers.app_name = value;
        break;
      case "app_type":
        newAnswers.app_type = value as AppType;
        break;
      case "tech_stack":
        newAnswers.tech_stack = value as TechStack;
        break;
      case "platforms":
        if (value === "both") {
          newAnswers.platforms = ["android", "ios"];
        } else {
          newAnswers.platforms = [value as Platform];
        }
        break;
      case "development_status":
        newAnswers.development_status = value as DevelopmentStatus;
        break;
      case "has_published_before":
        newAnswers.has_published_before = value === "yes";
        break;
      case "has_play_console":
        newAnswers.has_play_console = value === "yes" ? true : value === "no" ? false : null;
        break;
      case "has_apple_dev":
        newAnswers.has_apple_dev = value === "yes" ? true : value === "no" ? false : null;
        break;
    }

    setAnswers(newAnswers);

    // Check if we need to skip platform-specific questions
    const nextQuestionIndex = currentQuestion + 1;
    let actualNextIndex = nextQuestionIndex;

    // Skip Play Console question if only iOS
    if (QUESTION_ORDER[nextQuestionIndex] === "has_play_console") {
      if (newAnswers.platforms && !newAnswers.platforms.includes("android")) {
        actualNextIndex++;
      }
    }

    // Skip Apple Dev question if only Android
    if (QUESTION_ORDER[actualNextIndex] === "has_apple_dev") {
      if (newAnswers.platforms && !newAnswers.platforms.includes("ios")) {
        actualNextIndex++;
      }
    }

    if (actualNextIndex < QUESTION_ORDER.length) {
      setCurrentQuestion(actualNextIndex);
      setTimeout(() => {
        addAssistantMessage(QUESTIONS[QUESTION_ORDER[actualNextIndex]]);
      }, 800);
    } else {
      // All questions answered - complete
      const experienceLevel = detectExperienceLevel(newAnswers);
      const finalAnswers: OnboardingAnswers = {
        app_name: newAnswers.app_name || "My App",
        app_type: newAnswers.app_type || "other",
        tech_stack: newAnswers.tech_stack || "other",
        platforms: newAnswers.platforms || ["android", "ios"],
        development_status: newAnswers.development_status || "development",
        has_published_before: newAnswers.has_published_before || false,
        has_play_console: newAnswers.has_play_console ?? null,
        has_apple_dev: newAnswers.has_apple_dev ?? null,
        experience_level: experienceLevel,
      };

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: getCompletionMessage(experienceLevel),
          },
        ]);
        setTimeout(() => {
          onComplete(finalAnswers);
        }, 1500);
      }, 800);
    }
  };

  const getCompletionMessage = (level: ExperienceLevel): string => {
    switch (level) {
      case "beginner":
        return "Super! Keine Sorge, ich führe dich durch jeden Schritt. Ich erstelle dir jetzt eine personalisierte Checklist mit allen nötigen Erklärungen.";
      case "intermediate":
        return "Sehr gut! Du kennst die Basics schon. Ich erstelle dir eine Checklist die auf deinen Stand zugeschnitten ist.";
      case "pro":
        return "Perfekt! Du weißt was du tust. Ich halte die Checklist kompakt und fokussiere auf das Wesentliche.";
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleAnswer(textInput.trim(), textInput.trim());
    setTextInput("");
  };

  const currentQuestionData = QUESTION_ORDER[currentQuestion]
    ? QUESTIONS[QUESTION_ORDER[currentQuestion]]
    : null;

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "assistant"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === "assistant"
                  ? "bg-muted rounded-tl-none"
                  : "bg-primary text-primary-foreground rounded-tr-none"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies / Input */}
      {!isTyping && currentQuestionData && (
        <div className="border-t border-white/10 p-4">
          {currentQuestionData.inputType === "text" ? (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={currentQuestionData.inputPlaceholder}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!textInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : currentQuestionData.options ? (
            <div className="flex flex-wrap gap-2">
              {currentQuestionData.options.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="h-auto py-2 px-4 flex items-center gap-2"
                  onClick={() => handleAnswer(option.value, option.label)}
                >
                  {option.icon}
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
