import { useState } from "react";
import { AssetUploader } from "./AssetUploader";
import { AssetPreviewModal } from "./AssetPreviewModal";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Check, X, Play, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useProjectAssets,
  useUploadAsset,
  useDeleteAsset,
} from "@/hooks/useAppLaunch";
import {
  FEATURE_GRAPHIC_REQUIREMENTS,
  type ProjectAsset,
} from "@/api/types/appLaunch";

interface FeatureGraphicManagerProps {
  projectId: string;
}

export function FeatureGraphicManager({ projectId }: FeatureGraphicManagerProps) {
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: assets = [] } = useProjectAssets(projectId, {
    asset_type: "feature_graphic",
  });

  const uploadAsset = useUploadAsset();
  const deleteAsset = useDeleteAsset();

  const featureGraphic = assets[0];
  const { width, height } = FEATURE_GRAPHIC_REQUIREMENTS;

  const handleUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      await uploadAsset.mutateAsync({
        project_id: projectId,
        asset_type: "feature_graphic",
        name: "feature_graphic",
        platform: "android",
        file,
      });
      toast.success("Feature graphic uploaded");
      setIsUploading(false);
    } catch {
      toast.error("Failed to upload feature graphic");
    }
  };

  const handleDelete = async () => {
    if (!featureGraphic) return;
    if (confirm("Are you sure you want to delete the feature graphic?")) {
      try {
        await deleteAsset.mutateAsync({ assetId: featureGraphic.id, projectId });
        toast.success("Feature graphic deleted");
      } catch {
        toast.error("Failed to delete feature graphic");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Play className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Google Play Feature Graphic</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The feature graphic appears at the top of your Play Store listing and in
              promotional materials. Size: {width}x{height} pixels.
            </p>
          </div>
          {featureGraphic ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Feature Graphic Preview or Upload */}
      {featureGraphic ? (
        <div
          className={cn(
            "glass rounded-xl p-6 space-y-4",
            "ring-2 ring-green-500/30"
          )}
        >
          {/* Preview */}
          <div
            className="relative w-full aspect-[1024/500] rounded-lg overflow-hidden bg-muted cursor-pointer group"
            onClick={() => setPreviewAsset(featureGraphic)}
          >
            {featureGraphic.file_url ? (
              <img
                src={featureGraphic.file_url}
                alt="Feature graphic"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm">Click to preview</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {featureGraphic.width && featureGraphic.height && (
                <span>
                  {featureGraphic.width} x {featureGraphic.height}
                </span>
              )}
              {featureGraphic.file_size && (
                <span>
                  {(featureGraphic.file_size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploading(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : isUploading || !featureGraphic ? (
        <div className="glass rounded-xl p-6 space-y-4">
          <AssetUploader
            projectId={projectId}
            assetType="feature_graphic"
            platform="android"
            onUpload={handleUpload}
            isUploading={uploadAsset.isPending}
            maxFiles={1}
            requirements={{
              minWidth: width,
              minHeight: height,
              maxWidth: width + 100,
              maxHeight: height + 100,
            }}
          />
          {isUploading && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setIsUploading(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      ) : null}

      {/* Tips */}
      <div className="glass rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold">Feature Graphic Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            Use bright, eye-catching colors that stand out in the Play Store
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            Include your app name or logo prominently
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            Show key features or benefits of your app
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">4.</span>
            Avoid text in the bottom third (may be covered by buttons)
          </li>
        </ul>
      </div>

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        open={!!previewAsset}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
      />
    </div>
  );
}
