import { useState } from "react";
import { X, FileText, Download, Loader2, Flame, Sparkles, Cloud, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateContractPdf, downloadContractPdf, type ContractData } from "./ContractPdfGenerator";
import { uploadContractPdf } from "@/api/services/contractStorage";
import type { Partner } from "@/api/types/partners";

interface GenerateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  creators: Partner[];
  onContractGenerated?: (creatorId: string, contractId: string) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function GenerateContractModal({
  isOpen,
  onClose,
  creators,
  onContractGenerated,
}: GenerateContractModalProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFor, setGeneratedFor] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(null);

  // Fixed commission rate - no selection
  const commissionRate = 20;

  const selectedCreator = creators.find((c) => c.id === selectedCreatorId);

  const handleGenerate = async () => {
    if (!selectedCreator) return;

    setIsGenerating(true);
    setGeneratedFor(null);
    setUploadStatus("idle");
    setUploadError(null);

    const contractId = `PCA-${Date.now().toString(36).toUpperCase()}`;

    try {
      const contractData: ContractData = {
        contractId,
        contractDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        creatorName: selectedCreator.name,
        creatorLegalName: selectedCreator.name,
        creatorHandle: selectedCreator.tiktok_handle || selectedCreator.youtube_handle || `@${selectedCreator.name.toLowerCase().replace(/\s+/g, "")}`,
        creatorEmail: selectedCreator.email,
        commissionRate: commissionRate,
      };

      // Generate PDF blob
      const pdfBlob = await generateContractPdf(contractData);

      // Download locally
      await downloadContractPdf(contractData);
      setGeneratedFor(selectedCreator.name);
      setGeneratedContractId(contractId);

      // Upload to Supabase Storage
      setUploadStatus("uploading");

      const uploadResult = await uploadContractPdf(
        selectedCreator.id,
        contractId,
        selectedCreator.name,
        pdfBlob
      );

      if (uploadResult.success) {
        setUploadStatus("success");
        onContractGenerated?.(selectedCreator.id, contractId);
      } else {
        setUploadStatus("error");
        setUploadError(uploadResult.error || "Upload failed");
      }
    } catch (error) {
      console.error("Failed to generate contract:", error);
      setUploadStatus("error");
      setUploadError(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedCreatorId("");
    setGeneratedFor(null);
    setUploadStatus("idle");
    setUploadError(null);
    setGeneratedContractId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-primary/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Generate Contract</h3>
              <p className="text-sm text-muted-foreground">
                Create a Prometheus Creator Agreement
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {/* Success/Status Messages */}
          {generatedFor && (
            <div className="space-y-3">
              {/* Download Success */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="font-medium">Contract Downloaded!</p>
                  <p className="text-sm opacity-80">
                    {generatedFor} • {generatedContractId}
                  </p>
                </div>
              </div>

              {/* Upload Status */}
              {uploadStatus === "uploading" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div>
                    <p className="font-medium">Uploading to Cloud...</p>
                    <p className="text-sm opacity-80">Saving contract to storage</p>
                  </div>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Cloud className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-medium">Saved to Cloud Storage</p>
                    <p className="text-sm opacity-80">Contract is now accessible in the admin panel</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Cloud Upload Failed</p>
                    <p className="text-sm opacity-80">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Creator Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Creator
            </label>
            <select
              value={selectedCreatorId}
              onChange={(e) => {
                setSelectedCreatorId(e.target.value);
                setGeneratedFor(null);
              }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Choose a creator...</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name} ({creator.creator_type})
                  {creator.tiktok_handle && ` - ${creator.tiktok_handle}`}
                </option>
              ))}
            </select>
          </div>

          {/* Creator Preview */}
          {selectedCreator && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold">
                  {selectedCreator.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{selectedCreator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCreator.tiktok_handle || selectedCreator.youtube_handle || selectedCreator.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="capitalize">{selectedCreator.creator_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="capitalize">{selectedCreator.status}</span>
                </div>
              </div>
            </div>
          )}


          {/* Contract Preview Info */}
          <div className="rounded-xl bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Flame className="w-4 h-4 text-primary" />
              Contract will include:
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• <span className="text-primary font-medium">20% recurring commission</span></li>
              <li>• Payment terms ($50 minimum, monthly payouts)</li>
              <li>• Creator obligations & brand guidelines</li>
              <li>• Intellectual property clauses</li>
              <li>• 12-month term with auto-renewal</li>
              <li>• Signature fields for both parties</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-muted/20">
            <Button variant="ghost" className="rounded-xl" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!selectedCreatorId || isGenerating}
              className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
