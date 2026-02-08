import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CredentialStatus = "configured" | "missing" | "invalid";

interface CredentialStatusBadgeProps {
  status: CredentialStatus;
  className?: string;
}

export function CredentialStatusBadge({ status, className }: CredentialStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
        status === "configured" && "bg-green-500/20 text-green-500",
        status === "missing" && "bg-muted text-muted-foreground",
        status === "invalid" && "bg-red-500/20 text-red-500",
        className
      )}
    >
      {status === "configured" && <Check className="h-3 w-3" />}
      {status === "missing" && <Minus className="h-3 w-3" />}
      {status === "invalid" && <X className="h-3 w-3" />}
      {status === "configured" ? "Konfiguriert" : status === "missing" ? "Fehlt" : "Ungültig"}
    </span>
  );
}
