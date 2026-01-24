import { useState } from "react";
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContractViewerProps {
  pdfUrl?: string;
  title?: string;
  className?: string;
  showDownload?: boolean;
  height?: string;
}

export function ContractViewer({
  pdfUrl,
  title = "Contract",
  className,
  showDownload = true,
  height = "600px",
}: ContractViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleDownload = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  if (!pdfUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10",
          className
        )}
        style={{ height }}
      >
        <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-lg font-medium">No contract uploaded</p>
        <p className="text-muted-foreground/70 text-sm mt-1">
          Upload a PDF to view the contract
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col rounded-xl overflow-hidden border bg-card", className)}>
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="h-8 w-8 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="h-8 w-8 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {showDownload && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-8 w-8 rounded"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="rounded-lg"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="overflow-auto bg-muted/20"
        style={{ height }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            width: `${100 / (zoom / 100)}%`,
          }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full border-0"
            style={{ height: `calc(${height} * ${100 / zoom})` }}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

// Simpler inline viewer for previews
export function ContractPreview({
  pdfUrl,
  className,
}: {
  pdfUrl?: string;
  className?: string;
}) {
  if (!pdfUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10",
          className
        )}
      >
        <FileText className="w-8 h-8 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg overflow-hidden border", className)}>
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-32 border-0"
        title="Contract Preview"
      />
    </div>
  );
}
