import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Github, FileQuestion, Send, ArrowLeft } from "lucide-react";
import type { CodeSource } from "@/api/types/appLaunch";

interface CodeSourcePickerProps {
  onSelect: (source: CodeSource) => void;
  isLoading?: boolean;
}

export function CodeSourcePicker({ onSelect, isLoading }: CodeSourcePickerProps) {
  const [mode, setMode] = useState<"buttons" | "github" | "local">("buttons");
  const [githubUrl, setGitHubUrl] = useState("");
  const [localPath, setLocalPath] = useState("");

  const handleGitHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    // Validate GitHub URL format
    if (!githubUrl.includes("github.com/")) {
      return;
    }

    onSelect({ type: "github", url: githubUrl.trim() });
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPath.trim()) return;
    onSelect({ type: "local", path: localPath.trim() });
  };

  if (mode === "github") {
    return (
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setMode("buttons")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Zurück
        </button>

        <p className="text-sm text-muted-foreground mb-3">
          Gib deine GitHub Repository URL ein:
        </p>

        <form onSubmit={handleGitHubSubmit} className="flex gap-2">
          <Input
            value={githubUrl}
            onChange={(e) => setGitHubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="flex-1"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={!githubUrl.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-2">
          Ich analysiere dann automatisch deinen Tech-Stack
        </p>
      </div>
    );
  }

  if (mode === "local") {
    return (
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setMode("buttons")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Zurück
        </button>

        <p className="text-sm text-muted-foreground mb-3">
          Beschreibe kurz deinen Tech-Stack:
        </p>

        <form onSubmit={handleLocalSubmit} className="flex gap-2">
          <Input
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="z.B. React Native mit TypeScript"
            className="flex-1"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={!localPath.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/10">
      <p className="text-sm text-muted-foreground mb-3">Wo ist dein App-Code?</p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-20 flex-col gap-2"
          onClick={() => setMode("local")}
          disabled={isLoading}
        >
          <Folder className="h-6 w-6" />
          <span className="text-sm">Auf meinem Computer</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 h-20 flex-col gap-2"
          onClick={() => setMode("github")}
          disabled={isLoading}
        >
          <Github className="h-6 w-6" />
          <span className="text-sm">GitHub Repository</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 h-20 flex-col gap-2"
          onClick={() => onSelect({ type: "none" })}
          disabled={isLoading}
        >
          <FileQuestion className="h-6 w-6" />
          <span className="text-sm">Noch keinen Code</span>
        </Button>
      </div>
    </div>
  );
}
