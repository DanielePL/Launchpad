import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  Eye,
  X,
  Filter,
  Flame,
  Shield,
  Sparkles,
} from "lucide-react";
import { useContracts, useCreateContract, useUploadContractPdf, useSendContractForSignature, useDeleteContract, contractKeys } from "@/hooks/useContracts";
import { usePartners } from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractViewer } from "@/components/contracts/ContractViewer";
import { GenerateContractModal } from "@/components/contracts/GenerateContractModal";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { ContractStatus } from "@/api/types/contracts";

type FilterStatus = "all" | ContractStatus;

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-500/20", Icon: FileText },
  pending_signature: { label: "Pending Signature", color: "text-yellow-500", bg: "bg-yellow-500/20", Icon: Clock },
  signed: { label: "Signed", color: "text-green-500", bg: "bg-green-500/20", Icon: CheckCircle },
  expired: { label: "Expired", color: "text-red-500", bg: "bg-red-500/20", Icon: AlertCircle },
};

export function ContractsPage() {
  const queryClient = useQueryClient();
  const { data: contracts, isLoading: contractsLoading } = useContracts();
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const createContractMutation = useCreateContract();
  const uploadPdfMutation = useUploadContractPdf();
  const sendForSignatureMutation = useSendContractForSignature();
  const deleteContractMutation = useDeleteContract();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh contracts when a new one is generated
  const handleContractGenerated = () => {
    queryClient.invalidateQueries({ queryKey: contractKeys.all });
  };

  const isLoading = contractsLoading || partnersLoading;

  // Filter contracts by status
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    if (statusFilter === "all") return contracts;
    return contracts.filter((c) => c.status === statusFilter);
  }, [contracts, statusFilter]);

  // Count by status
  const statusCounts = useMemo(() => {
    if (!contracts) return { draft: 0, pending_signature: 0, signed: 0, expired: 0 };
    return contracts.reduce(
      (acc, c) => {
        acc[c.status]++;
        return acc;
      },
      { draft: 0, pending_signature: 0, signed: 0, expired: 0 } as Record<ContractStatus, number>
    );
  }, [contracts]);

  // Get creator names for display
  const getCreatorName = (creatorId: string) => {
    const creator = partners?.find((p) => p.id === creatorId);
    return creator?.name || "Unknown Creator";
  };

  // Get selected contract
  const selectedContract = contracts?.find((c) => c.id === selectedContractId);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedCreatorId || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    try {
      const { contract } = await createContractMutation.mutateAsync({ creator_id: selectedCreatorId });
      await uploadPdfMutation.mutateAsync({ contractId: contract.id, file });
      setShowUploadModal(false);
      setSelectedCreatorId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to upload contract:", error);
    }
  };

  // Creators without contracts
  const creatorsWithoutContracts = useMemo(() => {
    if (!partners || !contracts) return [];
    const creatorsWithContracts = new Set(contracts.map((c) => c.creator_id));
    return partners.filter((p) => !creatorsWithContracts.has(p.id));
  }, [partners, contracts]);

  return (
    <div className="space-y-6">
      {/* Header - Prometheus Branded */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Creator Agreements</h1>
            <p className="text-muted-foreground">Manage Prometheus creator contracts and signatures</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowGenerateModal(true)}
            variant="outline"
            className="rounded-xl border-primary/30 hover:border-primary hover:bg-primary/5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Contract
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
            disabled={creatorsWithoutContracts.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Contract
          </Button>
        </div>
      </div>

      {/* Summary Cards - Prometheus Branded */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-500/10 text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Contracts</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{contracts?.length || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-green-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed & Verified</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-green-500">{statusCounts.signed}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 text-yellow-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Awaiting Signature</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-yellow-500">{statusCounts.pending_signature}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Contracts</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{statusCounts.draft}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          All
        </button>
        {(Object.keys(STATUS_CONFIG) as ContractStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-card/80 text-muted-foreground"
              )}
            >
              <config.Icon className="w-3.5 h-3.5" />
              {config.label}
              <span className="px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
                {statusCounts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => {
            const config = STATUS_CONFIG[contract.status];
            return (
              <div
                key={contract.id}
                className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                      <config.Icon className={cn("w-6 h-6", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/partners/${contract.creator_id}`}
                          className="font-bold text-lg hover:text-primary transition-colors"
                        >
                          {contract.creator_name || getCreatorName(contract.creator_id)}
                        </Link>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bg, config.color)}>
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created {format(parseISO(contract.created_at), "MMM d, yyyy")}</span>
                        {contract.signed_at && (
                          <span className="text-green-500">
                            Signed {format(parseISO(contract.signed_at), "MMM d, yyyy")}
                          </span>
                        )}
                        {contract.template_name && (
                          <span>Template: {contract.template_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {contract.pdf_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setSelectedContractId(contract.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}

                    {contract.status === "draft" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => sendForSignatureMutation.mutate(contract.id)}
                          disabled={sendForSignatureMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this contract?")) {
                              deleteContractMutation.mutate(contract.id);
                            }
                          }}
                          disabled={deleteContractMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    <Link to={`/partners/${contract.creator_id}`}>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass rounded-2xl p-12 text-center border border-primary/10">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Flame className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Contracts Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {statusFilter === "all"
                ? "Upload your first Prometheus Creator Agreement to get started with your creators."
                : `No contracts with status "${STATUS_CONFIG[statusFilter as ContractStatus].label}"`}
            </p>
            {creatorsWithoutContracts.length > 0 && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Contract
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Contract Viewer Modal - Prometheus Branded */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-primary/10">
            {/* Branded Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">
                    {selectedContract.creator_name || getCreatorName(selectedContract.creator_id)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Prometheus Creator Agreement
                    {selectedContract.status === "signed" && " (Signed)"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setSelectedContractId(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <ContractViewer
                pdfUrl={selectedContract.signed_pdf_url || selectedContract.pdf_url}
                title="Prometheus Creator Agreement"
                height="70vh"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Contract Modal - Prometheus Branded */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-primary/10">
            {/* Branded Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">New Creator Agreement</h3>
                  <p className="text-sm text-muted-foreground">Upload a Prometheus contract</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedCreatorId("");
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Creator</label>
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Choose a creator...</option>
                  {creatorsWithoutContracts.map((creator) => (
                    <option key={creator.id} value={creator.id}>
                      {creator.name} ({creator.creator_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contract PDF</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-primary file:to-orange-600 file:text-white file:font-medium hover:file:from-primary/90 hover:file:to-orange-600/90 file:shadow-lg file:shadow-primary/25 file:cursor-pointer cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Upload the Prometheus Creator Agreement PDF for this creator
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-muted/20">
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedCreatorId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
                  onClick={handleUpload}
                  disabled={!selectedCreatorId || createContractMutation.isPending || uploadPdfMutation.isPending}
                >
                  {createContractMutation.isPending || uploadPdfMutation.isPending
                    ? "Uploading..."
                    : "Upload Contract"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Contract Modal */}
      <GenerateContractModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        creators={partners || []}
        onContractGenerated={handleContractGenerated}
      />
    </div>
  );
}
