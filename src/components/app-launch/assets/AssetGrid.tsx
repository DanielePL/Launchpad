import { AssetCard } from "./AssetCard";
import type { ProjectAsset } from "@/api/types/appLaunch";

interface AssetGridProps {
  assets: ProjectAsset[];
  onPreview: (asset: ProjectAsset) => void;
  onDelete: (assetId: string) => void;
  onApprove?: (assetId: string, approved: boolean) => void;
  showApproval?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function AssetGrid({
  assets,
  onPreview,
  onDelete,
  onApprove,
  showApproval = false,
  emptyMessage = "No assets uploaded yet",
  isLoading = false,
}: AssetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-background/50 overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onPreview={onPreview}
          onDelete={onDelete}
          onApprove={onApprove}
          showApproval={showApproval}
        />
      ))}
    </div>
  );
}
