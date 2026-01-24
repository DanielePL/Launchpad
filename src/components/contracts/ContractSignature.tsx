import { useRef, useState, useEffect } from "react";
import { Eraser, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContractSignatureProps {
  onSignatureComplete: (signatureData: string) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ContractSignature({
  onSignatureComplete,
  onCancel,
  className,
  disabled = false,
}: ContractSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas with higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setLastPoint(coords);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !lastPoint) return;

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPoint(coords);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // Get signature as base64 PNG
    const signatureData = canvas.toDataURL("image/png");
    onSignatureComplete(signatureData);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm text-muted-foreground mb-2">
        Please sign in the box below using your mouse or finger
      </div>

      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed overflow-hidden",
          disabled ? "opacity-50 cursor-not-allowed" : "border-muted-foreground/30",
          hasSignature && "border-primary/50"
        )}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair"
          style={{ display: "block" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Signature line */}
        <div className="absolute bottom-8 left-8 right-8 border-b border-muted-foreground/30" />
        <div className="absolute bottom-2 left-8 text-xs text-muted-foreground">
          Signature
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature || disabled}
            className="rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={disabled}
              className="rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>

        <Button
          onClick={handleComplete}
          disabled={!hasSignature || disabled}
          className="rounded-xl glow-orange"
        >
          <Check className="w-4 h-4 mr-1" />
          Sign Contract
        </Button>
      </div>
    </div>
  );
}
