import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetType, Platform } from "@/api/types/appLaunch";

interface AssetUploaderProps {
  projectId: string;
  assetType: AssetType;
  platform: Platform | "both";
  deviceType?: string;
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  requirements?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: number;
  };
}

interface FileWithPreview extends File {
  preview?: string;
  dimensions?: { width: number; height: number };
  error?: string;
}

export function AssetUploader({
  assetType,
  platform,
  deviceType,
  onUpload,
  isUploading = false,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  requirements,
}: AssetUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateImage = useCallback(
    async (file: File): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
      return new Promise((resolve) => {
        if (!file.type.startsWith("image/")) {
          resolve({ valid: true });
          return;
        }

        const img = new Image();
        img.onload = () => {
          const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
          URL.revokeObjectURL(img.src);

          if (requirements) {
            if (requirements.minWidth && img.naturalWidth < requirements.minWidth) {
              resolve({
                valid: false,
                error: `Width must be at least ${requirements.minWidth}px`,
                dimensions,
              });
              return;
            }
            if (requirements.minHeight && img.naturalHeight < requirements.minHeight) {
              resolve({
                valid: false,
                error: `Height must be at least ${requirements.minHeight}px`,
                dimensions,
              });
              return;
            }
            if (requirements.maxWidth && img.naturalWidth > requirements.maxWidth) {
              resolve({
                valid: false,
                error: `Width must not exceed ${requirements.maxWidth}px`,
                dimensions,
              });
              return;
            }
            if (requirements.maxHeight && img.naturalHeight > requirements.maxHeight) {
              resolve({
                valid: false,
                error: `Height must not exceed ${requirements.maxHeight}px`,
                dimensions,
              });
              return;
            }
          }

          resolve({ valid: true, dimensions });
        };
        img.onerror = () => resolve({ valid: false, error: "Failed to load image" });
        img.src = URL.createObjectURL(file);
      });
    },
    [requirements]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const errors: string[] = [];
      const validatedFiles: FileWithPreview[] = [];

      for (const file of acceptedFiles) {
        const result = await validateImage(file);

        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          dimensions: result.dimensions,
          error: result.error,
        });

        if (!result.valid) {
          errors.push(`${file.name}: ${result.error}`);
        }

        validatedFiles.push(fileWithPreview);
      }

      setFiles((prev) => [...prev, ...validatedFiles]);
      setValidationErrors(errors);
    },
    [validateImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const handleUpload = () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length > 0) {
      onUpload(validFiles);
      // Clear files after upload
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setFiles([]);
      setValidationErrors([]);
    }
  };

  const getUploadLabel = () => {
    switch (assetType) {
      case "screenshot":
        return `Upload ${deviceType ? deviceType + " " : ""}Screenshots`;
      case "icon":
        return "Upload App Icon";
      case "feature_graphic":
        return "Upload Feature Graphic";
      default:
        return "Upload Assets";
    }
  };

  const getPlatformLabel = () => {
    if (platform === "both") return "Android & iOS";
    return platform === "android" ? "Android" : "iOS";
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-white/20 hover:border-primary/50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{getUploadLabel()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isDragActive
                ? "Drop files here..."
                : `Drag & drop or click to select (${getPlatformLabel()})`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, or WebP up to {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
            <AlertCircle className="h-4 w-4" />
            Validation Issues
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {validationErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.filter((f) => !f.error).length} file(s) ready
            </p>
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.filter((f) => !f.error).length === 0}
              size="sm"
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className={cn(
                  "relative rounded-lg overflow-hidden border",
                  file.error ? "border-destructive" : "border-white/10"
                )}
              >
                <div className="aspect-video bg-muted">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="p-2">
                  <p className="text-xs truncate">{file.name}</p>
                  {file.dimensions && (
                    <p className="text-xs text-muted-foreground">
                      {file.dimensions.width} x {file.dimensions.height}
                    </p>
                  )}
                  {file.error && (
                    <p className="text-xs text-destructive">{file.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
