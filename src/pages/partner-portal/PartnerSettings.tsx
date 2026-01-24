import { useState } from "react";
import { User, Mail, Link, CreditCard, Building, Check, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartnerProfile, useUpdatePayoutDetails } from "@/hooks/usePartnerPortal";
import { useCreatorContracts, useSignContract } from "@/hooks/useContracts";
import { ContractViewer } from "@/components/contracts/ContractViewer";
import { ContractSignature } from "@/components/contracts/ContractSignature";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export default function PartnerSettings() {
  const { data: profile, isLoading } = usePartnerProfile();
  const updatePayoutDetails = useUpdatePayoutDetails();
  const { data: contracts } = useCreatorContracts(profile?.id || "");
  const signContractMutation = useSignContract();

  const [payoutMethod, setPayoutMethod] = useState<"revolut" | "bank_transfer">(
    profile?.payout_method || "revolut"
  );
  const [revolutEmail, setRevolutEmail] = useState(
    profile?.payout_details?.revolut_email || ""
  );
  const [iban, setIban] = useState(profile?.payout_details?.iban || "");
  const [bic, setBic] = useState(profile?.payout_details?.bic || "");
  const [saved, setSaved] = useState(false);
  const [showContractViewer, setShowContractViewer] = useState(false);
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);

  const pendingContract = contracts?.find((c) => c.status === "pending_signature");
  const signedContract = contracts?.find((c) => c.status === "signed");
  const latestContract = pendingContract || signedContract || contracts?.[0];

  const handleSignContract = async (signatureData: string) => {
    if (!pendingContract) return;
    try {
      await signContractMutation.mutateAsync({
        contract_id: pendingContract.id,
        signature_data: signatureData,
      });
      setShowSignaturePanel(false);
    } catch (error) {
      console.error("Failed to sign contract:", error);
    }
  };

  const handleSavePayoutDetails = () => {
    updatePayoutDetails.mutate(
      {
        payout_method: payoutMethod,
        revolut_email: payoutMethod === "revolut" ? revolutEmail : undefined,
        iban: payoutMethod === "bank_transfer" ? iban : undefined,
        bic: payoutMethod === "bank_transfer" ? bic : undefined,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-card animate-pulse rounded" />
        <div className="h-64 bg-card animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-xl bg-card p-6">
        <h3 className="font-semibold mb-4">Profile Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.email}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Referral Code</label>
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <Link className="h-4 w-4 text-muted-foreground" />
              <code className="font-mono">{profile?.referral_code}</code>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Commission Rate</label>
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <span className="text-primary font-semibold">
                {profile?.commission_percent}%
              </span>
              <span className="text-muted-foreground">per referral</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="rounded-xl bg-card p-6">
        <h3 className="font-semibold mb-4">Payment Settings</h3>

        {/* Method Selection */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <button
            onClick={() => setPayoutMethod("revolut")}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors text-left",
              payoutMethod === "revolut"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                payoutMethod === "revolut" ? "bg-primary" : "bg-muted"
              )}
            >
              <CreditCard
                className={cn(
                  "h-5 w-5",
                  payoutMethod === "revolut" ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="font-medium">Revolut</p>
              <p className="text-xs text-muted-foreground">Instant transfer</p>
            </div>
          </button>

          <button
            onClick={() => setPayoutMethod("bank_transfer")}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors text-left",
              payoutMethod === "bank_transfer"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                payoutMethod === "bank_transfer" ? "bg-primary" : "bg-muted"
              )}
            >
              <Building
                className={cn(
                  "h-5 w-5",
                  payoutMethod === "bank_transfer" ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="font-medium">Bank Transfer</p>
              <p className="text-xs text-muted-foreground">1-3 business days</p>
            </div>
          </button>
        </div>

        {/* Method Details */}
        {payoutMethod === "revolut" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Revolut Email / Tag</label>
              <Input
                placeholder="@yourtag or email@example.com"
                value={revolutEmail}
                onChange={(e) => setRevolutEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">IBAN</label>
              <Input
                placeholder="CH93 0076 2011 6238 5295 7"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">BIC/SWIFT</label>
              <Input
                placeholder="UBSWCHZH80A"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={handleSavePayoutDetails}
            disabled={updatePayoutDetails.isPending}
          >
            {updatePayoutDetails.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Contract Section */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Contract</h3>
              <p className="text-sm text-muted-foreground">
                {signedContract
                  ? `Signed on ${format(parseISO(signedContract.signed_at!), "MMM d, yyyy")}`
                  : pendingContract
                  ? "Awaiting your signature"
                  : "No contract available"}
              </p>
            </div>
          </div>

          {signedContract && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/20 text-green-500 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Signed
            </span>
          )}
          {pendingContract && !signedContract && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Pending
            </span>
          )}
        </div>

        {latestContract?.pdf_url ? (
          <div className="space-y-4">
            {/* Contract Preview */}
            <div
              className="h-40 rounded-lg border-2 border-dashed border-muted overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowContractViewer(true)}
            >
              <iframe
                src={`${latestContract.signed_pdf_url || latestContract.pdf_url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0 pointer-events-none"
                title="Contract Preview"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowContractViewer(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Contract
              </Button>

              {pendingContract && !signedContract && (
                <Button
                  onClick={() => setShowSignaturePanel(true)}
                  className="bg-primary text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Sign Contract
                </Button>
              )}
            </div>

            {/* Signature Panel */}
            {showSignaturePanel && pendingContract && (
              <div className="mt-4 p-4 rounded-xl border bg-muted/30">
                <h4 className="font-medium mb-4">Sign Your Contract</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  By signing below, you agree to the terms and conditions outlined in the contract.
                </p>
                <ContractSignature
                  onSignatureComplete={handleSignContract}
                  onCancel={() => setShowSignaturePanel(false)}
                  disabled={signContractMutation.isPending}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No contract has been assigned to your account yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact your partner manager if you believe this is an error.
            </p>
          </div>
        )}
      </div>

      {/* Full Contract Viewer Modal */}
      {showContractViewer && latestContract && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">Your Contract</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContractViewer(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-4">
              <ContractViewer
                pdfUrl={latestContract.signed_pdf_url || latestContract.pdf_url}
                title="Partner Contract"
                height="70vh"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
