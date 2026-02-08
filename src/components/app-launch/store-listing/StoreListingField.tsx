import { Check, Circle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FieldStatus } from "@/hooks/useStoreListingForm";
import type { ReactNode } from "react";

interface StoreListingFieldProps {
  label: string;
  description: string;
  status: FieldStatus;
  onSave: () => void;
  platformBadge?: ReactNode;
  maxLength?: number;
  currentLength?: number;
  children: ReactNode;
}

export function StoreListingField({
  label,
  description,
  status,
  onSave,
  platformBadge,
  maxLength,
  currentLength,
  children,
}: StoreListingFieldProps) {
  const charRatio = maxLength && currentLength !== undefined ? currentLength / maxLength : 0;

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "filled" ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="font-semibold">{label}</h3>
          {platformBadge}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Input */}
      {children}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          {maxLength && currentLength !== undefined && (
            <span
              className={cn(
                "text-xs",
                charRatio > 0.95
                  ? "text-red-500"
                  : charRatio > 0.8
                    ? "text-yellow-500"
                    : "text-muted-foreground"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onSave}
          disabled={status === "saving"}
          className="gap-2"
        >
          {status === "saving" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          Speichern
        </Button>
      </div>
    </div>
  );
}
