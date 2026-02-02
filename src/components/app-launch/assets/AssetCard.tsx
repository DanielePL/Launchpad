import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  Eye,
  Download,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectAsset } from "@/api/types/appLaunch";

interface AssetCardProps {
  asset: ProjectAsset;
  onPreview: (asset: ProjectAsset) => void;
  onDelete: (assetId: string) => void;
  onApprove?: (assetId: string, approved: boolean) => void;
  showApproval?: boolean;
  draggable?: boolean;
}

export function AssetCard({
  asset,
  onPreview,
  onDelete,
  onApprove,
  showApproval = false,
  draggable = false,
}: AssetCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    if (asset.file_url) {
      const link = document.createElement("a");
      link.href = asset.file_url;
      link.download = asset.name;
      link.click();
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-white/10 bg-background/50 overflow-hidden transition-all hover:border-primary/50",
        asset.is_approved && "ring-2 ring-green-500/50"
      )}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Image Preview */}
      <div
        className="relative aspect-video bg-muted cursor-pointer"
        onClick={() => onPreview(asset)}
      >
        {asset.file_url && !imageError ? (
          <img
            src={asset.file_url}
            alt={asset.name}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xs">No preview</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onPreview(asset)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Approval Badge */}
        {showApproval && (
          <div
            className={cn(
              "absolute top-2 right-2 p-1 rounded-full",
              asset.is_approved ? "bg-green-500" : "bg-muted"
            )}
          >
            {asset.is_approved ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate flex-1">{asset.name}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(asset)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {showApproval && onApprove && (
                <DropdownMenuItem onClick={() => onApprove(asset.id, !asset.is_approved)}>
                  {asset.is_approved ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Unapprove
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(asset.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {asset.width && asset.height && (
            <span>{asset.width} x {asset.height}</span>
          )}
          <span>{formatFileSize(asset.file_size)}</span>
        </div>
      </div>
    </div>
  );
}
