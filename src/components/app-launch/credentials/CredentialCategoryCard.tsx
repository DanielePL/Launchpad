import {
  Upload,
  BarChart3,
  Bell,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CredentialCategory } from "@/api/types/appLaunch";

const CATEGORY_ICONS: Record<CredentialCategory, React.ReactNode> = {
  store_publishing: <Upload className="h-6 w-6" />,
  analytics: <BarChart3 className="h-6 w-6" />,
  push_notifications: <Bell className="h-6 w-6" />,
  revenue_tracking: <DollarSign className="h-6 w-6" />,
};

interface CredentialCategoryCardProps {
  category: CredentialCategory;
  name: string;
  configuredCount: number;
  totalCount: number;
  required: boolean;
  onClick: () => void;
}

export function CredentialCategoryCard({
  category,
  name,
  configuredCount,
  totalCount,
  required,
  onClick,
}: CredentialCategoryCardProps) {
  const isComplete = totalCount > 0 && configuredCount === totalCount;
  const hasPartial = configuredCount > 0 && !isComplete;

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-6 text-left transition-all hover:scale-[1.02] hover:border-primary/30 w-full",
        isComplete && "border-green-500/30",
        hasPartial && "border-primary/20"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn(
            isComplete ? "text-green-500" : hasPartial ? "text-primary" : "text-muted-foreground"
          )}
        >
          {CATEGORY_ICONS[category]}
        </span>
        {required && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-orange-400">
            Required
          </span>
        )}
      </div>
      <h3 className="font-semibold mb-1">{name}</h3>
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete ? "bg-green-500" : "bg-primary"
            )}
            style={{
              width: totalCount > 0 ? `${(configuredCount / totalCount) * 100}%` : "0%",
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {configuredCount}/{totalCount}
        </span>
      </div>
    </button>
  );
}
