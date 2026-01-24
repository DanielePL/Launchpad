import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
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
  Users,
  Filter,
} from "lucide-react";
import { useContracts, useCreateContract, useUploadContractPdf, useSendContractForSignature, useDeleteContract } from "@/hooks/useContracts";
import { usePartners } from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractViewer } from "@/components/contracts/ContractViewer";
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
  const { data: contracts, isLoading: contractsLoading } = useContracts();
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const createContractMutation = useCreateContract();
  const uploadPdfMutation = useUploadContractPdf();
  const sendForSignatureMutation = useSendContractForSignature();
  const deleteContractMutation = useDeleteContract();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contracts</h1>
          <p className="text-muted-foreground text-lg">Manage creator contracts and signatures</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="rounded-xl glow-orange"
          disabled={creatorsWithoutContracts.length === 0}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{contracts?.length || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{statusCounts.signed}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{statusCounts.pending_signature}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-500/20 text-gray-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{statusCounts.draft}</p>
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
          <div className="glass rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No contracts found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all"
                ? "Upload your first contract to get started"
                : `No contracts with status "${STATUS_CONFIG[statusFilter as ContractStatus].label}"`}
            </p>
            {creatorsWithoutContracts.length > 0 && (
              <Button onClick={() => setShowUploadModal(true)} className="rounded-xl glow-orange">
                <Upload className="w-4 h-4 mr-2" />
                Upload Contract
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Contract Viewer Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">
                Contract - {selectedContract.creator_name || getCreatorName(selectedContract.creator_id)}
              </h3>
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
                title={`Contract - ${selectedContract.creator_name || getCreatorName(selectedContract.creator_id)}`}
                height="70vh"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Contract Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Upload Contract</h3>
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

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Creator</label>
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-input"
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
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
                  className="rounded-xl glow-orange"
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
    </div>
  );
}
