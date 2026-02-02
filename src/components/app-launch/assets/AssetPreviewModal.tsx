import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectAsset } from "@/api/types/appLaunch";

interface AssetPreviewModalProps {
  asset: ProjectAsset | null;
  assets?: ProjectAsset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (direction: "prev" | "next") => void;
}

export function AssetPreviewModal({
  asset,
  assets = [],
  open,
  onOpenChange,
  onNavigate,
}: AssetPreviewModalProps) {
  if (!asset) return null;

  const handleDownload = () => {
    if (asset.file_url) {
      const link = document.createElement("a");
      link.href = asset.file_url;
      link.download = asset.name;
      link.click();
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentIndex = assets.findIndex((a) => a.id === asset.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{asset.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden bg-black/50">
          {/* Navigation Arrows */}
          {onNavigate && assets.length > 1 && (
            <>
              <button
                onClick={() => onNavigate("prev")}
                disabled={!hasPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => onNavigate("next")}
                disabled={!hasNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="flex items-center justify-center p-4 min-h-[400px]">
            {asset.file_url ? (
              <img
                src={asset.file_url}
                alt={asset.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="text-muted-foreground">No preview available</div>
            )}
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="p-4 border-t border-white/10 bg-background/50">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {asset.width && asset.height && (
              <div>
                <span className="font-medium text-foreground">Dimensions:</span>{" "}
                {asset.width} x {asset.height}
              </div>
            )}
            <div>
              <span className="font-medium text-foreground">Size:</span>{" "}
              {formatFileSize(asset.file_size)}
            </div>
            <div>
              <span className="font-medium text-foreground">Type:</span>{" "}
              {asset.mime_type || "Unknown"}
            </div>
            <div>
              <span className="font-medium text-foreground">Platform:</span>{" "}
              {asset.platform === "both" ? "Android & iOS" : asset.platform}
            </div>
            {asset.device_type && (
              <div>
                <span className="font-medium text-foreground">Device:</span>{" "}
                {asset.device_type}
              </div>
            )}
            {assets.length > 1 && (
              <div className="ml-auto">
                {currentIndex + 1} / {assets.length}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
