import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface QuickAction {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface QuickActionsProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onQuickAction?: (value: string, label: string) => void;
  quickActions?: QuickAction[];
  placeholder?: string;
  isLoading?: boolean;
  showInput?: boolean;
}

export function QuickActions({
  inputValue,
  onInputChange,
  onSend,
  onQuickAction,
  quickActions,
  placeholder = "Deine Antwort...",
  isLoading,
  showInput = true,
}: QuickActionsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts or when showInput changes
  useEffect(() => {
    if (showInput && !quickActions?.length) {
      inputRef.current?.focus();
    }
  }, [showInput, quickActions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  // If we have quick actions, show them as buttons
  if (quickActions && quickActions.length > 0) {
    return (
      <div className="p-4 border-t border-white/10">
        <p className="text-sm text-muted-foreground mb-3">Wähle eine Option:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.value}
              variant="outline"
              className="h-auto py-2 px-4 flex items-center gap-2"
              onClick={() => onQuickAction?.(action.value, action.label)}
              disabled={isLoading}
            >
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                {action.description && (
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Default text input
  if (!showInput) return null;

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
