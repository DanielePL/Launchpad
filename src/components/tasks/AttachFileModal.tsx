import { useState } from "react";
import { X, Paperclip, Search, Image, FileText, Table2, File, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeamFiles } from "@/hooks/useTeamStorage";
import { useAttachFile } from "@/hooks/useTasks";
import type { TaskAssignee } from "@/api/types/tasks";
import { TASK_ASSIGNEES } from "@/api/types/tasks";
import { isImageMime, formatFileSize } from "@/api/types/teamStorage";
import type { FileCategory } from "@/api/types/teamStorage";
import { cn } from "@/lib/utils";

interface AttachFileModalProps {
  taskId: string;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<
  FileCategory,
  { label: string; Icon: typeof FileText; color: string; bg: string }
> = {
  image: { label: "Images", Icon: Image, color: "text-blue-500", bg: "bg-blue-500/20" },
  document: { label: "Documents", Icon: FileText, color: "text-green-500", bg: "bg-green-500/20" },
  spreadsheet: { label: "Spreadsheets", Icon: Table2, color: "text-purple-500", bg: "bg-purple-500/20" },
  other: { label: "Other", Icon: File, color: "text-gray-500", bg: "bg-gray-500/20" },
};

export function AttachFileModal({ taskId, onClose }: AttachFileModalProps) {
  const { data: files, isLoading } = useTeamFiles();
  const attachFile = useAttachFile();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [attachedBy, setAttachedBy] = useState<TaskAssignee | "">("");

  const filteredFiles = files?.filter((file) =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttach = async () => {
    if (!selectedFileId || !attachedBy) return;

    try {
      await attachFile.mutateAsync({
        task_id: taskId,
        file_id: selectedFileId,
        attached_by: attachedBy,
      });
      onClose();
    } catch (error) {
      console.error("Failed to attach file:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Paperclip className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Attach File</h3>
              <p className="text-sm text-muted-foreground">Select from Team Storage</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search + Attached By */}
        <div className="p-4 border-b border-muted flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-3 w-full rounded-xl bg-card border border-muted/20 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <select
            value={attachedBy}
            onChange={(e) => setAttachedBy(e.target.value as TaskAssignee)}
            className="h-10 px-3 rounded-xl bg-card border border-muted/20 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          >
            <option value="">Attached by...</option>
            {TASK_ASSIGNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* File List */}
        <div className="overflow-y-auto max-h-[calc(80vh-240px)] p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredFiles && filteredFiles.length > 0 ? (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const catConfig = CATEGORY_CONFIG[file.file_category] || CATEGORY_CONFIG.other;
                const CatIcon = catConfig.Icon;
                const isSelected = selectedFileId === file.id;
                const isImage = isImageMime(file.mime_type);

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all",
                      isSelected
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card hover:bg-card/80 border-2 border-transparent"
                    )}
                  >
                    {/* Thumbnail / Icon */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {isImage && file.public_url ? (
                        <img
                          src={file.public_url}
                          alt={file.original_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center",
                            catConfig.bg
                          )}
                        >
                          <CatIcon className={cn("w-6 h-6", catConfig.color)} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.original_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            catConfig.bg,
                            catConfig.color
                          )}
                        >
                          {catConfig.label}
                        </span>
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>by {file.uploaded_by}</span>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No files match your search" : "No files in Team Storage"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-muted p-4 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
            onClick={handleAttach}
            disabled={!selectedFileId || !attachedBy || attachFile.isPending}
          >
            {attachFile.isPending ? "Attaching..." : "Attach File"}
          </Button>
        </div>
      </div>
    </div>
  );
}
