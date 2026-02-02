import { useState } from "react";
import { AssetUploader } from "./AssetUploader";
import { AssetPreviewModal } from "./AssetPreviewModal";
import { Button } from "@/components/ui/button";
import { Play, Apple, Upload, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useProjectAssets,
  useUploadAsset,
  useDeleteAsset,
} from "@/hooks/useAppLaunch";
import {
  ICON_REQUIREMENTS,
  type Platform,
  type ProjectAsset,
} from "@/api/types/appLaunch";

interface IconManagerProps {
  projectId: string;
  platforms: Platform[];
}

export function IconManager({ projectId, platforms }: IconManagerProps) {
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);
  const [uploadingFor, setUploadingFor] = useState<Platform | null>(null);

  const { data: assets = [], isLoading } = useProjectAssets(projectId, {
    asset_type: "icon",
  });

  const uploadAsset = useUploadAsset();
  const deleteAsset = useDeleteAsset();

  const getIconForPlatform = (platform: Platform) =>
    assets.find((a) => a.platform === platform || a.platform === "both");

  const handleUpload = async (files: File[], platform: Platform) => {
    const file = files[0];
    if (!file) return;

    const requirements = ICON_REQUIREMENTS[platform][0];

    try {
      await uploadAsset.mutateAsync({
        project_id: projectId,
        asset_type: "icon",
        name: `${platform}_icon`,
        platform,
        file,
        metadata: {
          size: requirements.size,
        },
      });
      toast.success(`${platform === "android" ? "Android" : "iOS"} icon uploaded`);
      setUploadingFor(null);
    } catch {
      toast.error("Failed to upload icon");
    }
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this icon?")) {
      try {
        await deleteAsset.mutateAsync({ assetId, projectId });
        toast.success("Icon deleted");
      } catch {
        toast.error("Failed to delete icon");
      }
    }
  };

  const renderPlatformIcon = (platform: Platform) => {
    const icon = getIconForPlatform(platform);
    const requirements = ICON_REQUIREMENTS[platform][0];
    const isUploading = uploadAsset.isPending && uploadingFor === platform;

    return (
      <div
        key={platform}
        className={cn(
          "glass rounded-xl p-6 space-y-4",
          icon && "ring-2 ring-green-500/30"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {platform === "android" ? (
              <div className="p-2 rounded-lg bg-green-500/20">
                <Play className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Apple className="h-5 w-5 text-blue-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">
                {platform === "android" ? "Android" : "iOS"} Icon
              </h3>
              <p className="text-sm text-muted-foreground">
                {requirements.size}x{requirements.size} px ({requirements.name})
              </p>
            </div>
          </div>
          {icon ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Icon Preview or Upload */}
        {icon ? (
          <div className="space-y-4">
            <div
              className="relative mx-auto w-32 h-32 rounded-2xl overflow-hidden bg-muted cursor-pointer group"
              onClick={() => setPreviewAsset(icon)}
            >
              {icon.file_url ? (
                <img
                  src={icon.file_url}
                  alt={`${platform} icon`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No preview
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Preview</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadingFor(platform)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(icon.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ) : uploadingFor === platform ? (
          <div className="space-y-4">
            <AssetUploader
              projectId={projectId}
              assetType="icon"
              platform={platform}
              onUpload={(files) => handleUpload(files, platform)}
              isUploading={isUploading}
              maxFiles={1}
              requirements={{
                minWidth: requirements.size,
                minHeight: requirements.size,
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setUploadingFor(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setUploadingFor(platform)}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Icon
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass rounded-lg p-4 text-sm text-muted-foreground">
        App icons are required for both app stores. Upload a high-resolution square
        image (PNG recommended) for each platform.
      </div>

      {/* Platform Icons */}
      <div
        className={cn(
          "grid gap-6",
          platforms.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md"
        )}
      >
        {platforms.includes("android") && renderPlatformIcon("android")}
        {platforms.includes("ios") && renderPlatformIcon("ios")}
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
