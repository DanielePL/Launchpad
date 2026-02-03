import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Edit2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface GeneratedContentPreviewProps {
  title: string;
  content: string;
  maxPreviewLines?: number;
  onAccept: () => void;
  onEdit: (newContent: string) => void;
  isLoading?: boolean;
}

export function GeneratedContentPreview({
  title,
  content,
  maxPreviewLines = 5,
  onAccept,
  onEdit,
  isLoading,
}: GeneratedContentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const lines = content.split("\n");
  const needsExpand = lines.length > maxPreviewLines;
  const displayContent = isExpanded ? content : lines.slice(0, maxPreviewLines).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("In Zwischenablage kopiert");
  };

  const handleSaveEdit = () => {
    onEdit(editedContent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 border-t border-white/10">
        <div className="bg-background/50 rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{title} bearbeiten</h4>
          </div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[200px] bg-transparent border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-primary resize-y"
          />
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEditedContent(content);
                setIsEditing(false);
              }}
            >
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={handleSaveEdit}>
              Speichern
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/10">
      <div className="bg-background/50 rounded-lg border border-white/10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{title}</h4>
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Kopieren"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm font-sans bg-transparent p-0 m-0">
            {displayContent}
            {needsExpand && !isExpanded && "..."}
          </pre>
        </div>

        {/* Expand Button */}
        {needsExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Mehr anzeigen
              </>
            )}
          </button>
        )}
      </div>

      {/* Accept Button */}
      <div className="mt-3">
        <Button
          className="w-full gap-2"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
          Übernehmen
        </Button>
      </div>
    </div>
  );
}
