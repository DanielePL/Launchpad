import { CheckCircle, Package, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepoAnalysis {
  detected_stack?: string;
  framework?: string;
  dependencies?: string[];
  platforms?: string[];
  has_android?: boolean;
  has_ios?: boolean;
}

interface RepoAnalysisResultProps {
  analysis: RepoAnalysis;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

const STACK_LABELS: Record<string, string> = {
  react_native: "React Native",
  expo: "Expo (React Native)",
  flutter: "Flutter",
  swift: "Swift/SwiftUI",
  kotlin: "Kotlin",
  unknown: "Unbekannt",
};

export function RepoAnalysisResult({
  analysis,
  onConfirm,
  onEdit,
  isLoading,
}: RepoAnalysisResultProps) {
  const stackLabel = STACK_LABELS[analysis.detected_stack || "unknown"] || analysis.framework || "Unbekannt";
  const hasValidStack = analysis.detected_stack && analysis.detected_stack !== "unknown";

  return (
    <div className="p-4 border-t border-white/10">
      <div className="bg-background/50 rounded-lg border border-white/10 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {hasValidStack ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-medium">
            {hasValidStack ? "Tech-Stack erkannt" : "Konnte Tech-Stack nicht erkennen"}
          </span>
        </div>

        {/* Stack Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="text-muted-foreground">Framework:</span>{" "}
              <span className="font-medium">{stackLabel}</span>
            </span>
          </div>

          {/* Platforms */}
          {(analysis.has_android || analysis.has_ios) && (
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Plattformen:</span>{" "}
                <span className="font-medium">
                  {[
                    analysis.has_android && "Android",
                    analysis.has_ios && "iOS",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </span>
            </div>
          )}

          {/* Dependencies Preview */}
          {analysis.dependencies && analysis.dependencies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-muted-foreground mb-2">
                Erkannte Dependencies ({analysis.dependencies.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {analysis.dependencies.slice(0, 8).map((dep) => (
                  <span
                    key={dep}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                  >
                    {dep}
                  </span>
                ))}
                {analysis.dependencies.length > 8 && (
                  <span className="px-2 py-0.5 text-muted-foreground text-xs">
                    +{analysis.dependencies.length - 8} mehr
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onEdit}
          disabled={isLoading}
        >
          Korrigieren
        </Button>
        <Button
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {hasValidStack ? "Stimmt so!" : "Weiter"}
        </Button>
      </div>
    </div>
  );
}
