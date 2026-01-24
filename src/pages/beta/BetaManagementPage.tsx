import { useState } from "react";
import {
  Users,
  Apple,
  Smartphone,
  Search,
  Plus,
  Bug,
  MessageSquare,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Trash2,
  UserPlus,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBetaTesters,
  useBetaOverview,
  useCreateBetaTester,
  useCreateBetaTesters,
  useDeleteBetaTester,
  useInviteBetaTester,
  useActivateBetaTester,
  useBetaFeedback,
  useIosBetaFeedback,
  useUpdateBetaFeedback,
  useUpdateIosBetaFeedback,
} from "@/hooks/useBeta";
import type {
  BetaTester,
  BetaTesterCreate,
  BetaTesterFilters,
  BetaFeedback,
  BetaFeedbackFilters,
  BetaPlatform,
  BetaTesterStatus,
  BetaFeedbackStatus,
} from "@/api/types";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// =====================================================
// Helper Functions
// =====================================================

const platformIcons = {
  ios: Apple,
  android: Smartphone,
};

const platformColors = {
  ios: { bg: "bg-blue-500/20", text: "text-blue-500" },
  android: { bg: "bg-green-500/20", text: "text-green-500" },
};

const statusColors: Record<BetaTesterStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-500" },
  invited: { bg: "bg-blue-500/20", text: "text-blue-500" },
  active: { bg: "bg-green-500/20", text: "text-green-500" },
  inactive: { bg: "bg-muted", text: "text-muted-foreground" },
};

const feedbackStatusColors: Record<BetaFeedbackStatus, { bg: string; text: string; icon: typeof Clock }> = {
  open: { bg: "bg-yellow-500/20", text: "text-yellow-500", icon: Clock },
  in_progress: { bg: "bg-blue-500/20", text: "text-blue-500", icon: AlertCircle },
  fixed: { bg: "bg-green-500/20", text: "text-green-500", icon: CheckCircle2 },
  wont_fix: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle },
};

const feedbackTypeIcons = {
  bug: Bug,
  feedback: MessageSquare,
  idea: Lightbulb,
};

const feedbackTypeColors = {
  bug: { bg: "bg-destructive/20", text: "text-destructive" },
  feedback: { bg: "bg-blue-500/20", text: "text-blue-500" },
  idea: { bg: "bg-yellow-500/20", text: "text-yellow-500" },
};

// =====================================================
// Add Tester Modal
// =====================================================

interface AddTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, email: string, platform: BetaPlatform) => void;
}

function AddTesterModal({ isOpen, onClose, onAdd }: AddTesterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<BetaPlatform>("ios");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onAdd(name, email, platform);
      setName("");
      setEmail("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Add Beta Tester</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={platform === "ios" ? "default" : "outline"}
                onClick={() => setPlatform("ios")}
                className="flex-1 rounded-xl"
              >
                <Apple className="w-4 h-4 mr-2" />
                iOS
              </Button>
              <Button
                type="button"
                variant={platform === "android" ? "default" : "outline"}
                onClick={() => setPlatform("android")}
                className="flex-1 rounded-xl"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Android
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              Add Tester
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// CSV Import Modal
// =====================================================

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (testers: BetaTesterCreate[]) => void;
}

function CsvImportModal({ isOpen, onClose, onImport }: CsvImportModalProps) {
  const [csvData, setCsvData] = useState("");
  const [preview, setPreview] = useState<BetaTesterCreate[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseCSV = (text: string): BetaTesterCreate[] => {
    const lines = text.trim().split("\n");
    const testers: BetaTesterCreate[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header row if detected
      if (i === 0 && (line.toLowerCase().includes("name") || line.toLowerCase().includes("email"))) {
        continue;
      }

      // Support both comma and semicolon as delimiter
      const delimiter = line.includes(";") ? ";" : ",";
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ""));

      if (parts.length < 3) {
        throw new Error(`Row ${i + 1}: At least 3 columns required (name, email, platform)`);
      }

      const [name, email, platformRaw] = parts;
      const platform = platformRaw.toLowerCase() as BetaPlatform;

      if (!name || !email) {
        throw new Error(`Row ${i + 1}: Name and email are required`);
      }

      if (platform !== "ios" && platform !== "android") {
        throw new Error(`Row ${i + 1}: Platform must be "ios" or "android", not "${platformRaw}"`);
      }

      // Basic email validation
      if (!email.includes("@")) {
        throw new Error(`Row ${i + 1}: Invalid email "${email}"`);
      }

      testers.push({ name, email, platform });
    }

    return testers;
  };

  const handleTextChange = (text: string) => {
    setCsvData(text);
    setError(null);
    setPreview([]);

    if (text.trim()) {
      try {
        const parsed = parseCSV(text);
        setPreview(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Parsing error");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleTextChange(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setCsvData("");
      setPreview([]);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = "name,email,platform\nMax Mustermann,max@example.com,ios\nErika Muster,erika@example.com,android";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beta_testers_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">CSV Import</h2>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Upload CSV file</p>
              <p className="text-sm text-muted-foreground mt-1">or paste text below</p>
            </label>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">CSV data (name, email, platform)</label>
            <textarea
              value={csvData}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Max Mustermann,max@example.com,ios&#10;Erika Muster,erika@example.com,android"
              className="w-full h-32 px-3 py-2 rounded-xl bg-background border border-input text-sm font-mono resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{preview.length} testers detected:</p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {preview.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-background/50 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      t.platform === "ios" ? "bg-blue-500/20 text-blue-500" : "bg-green-500/20 text-green-500"
                    }`}>
                      {t.platform}
                    </span>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">{t.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="flex-1 rounded-xl"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import {preview.length} testers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Tester Row Component
// =====================================================

interface TesterRowProps {
  tester: BetaTester;
  onInvite: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function TesterRow({ tester, onInvite, onActivate, onDelete }: TesterRowProps) {
  const PlatformIcon = platformIcons[tester.platform];
  const platformStyle = platformColors[tester.platform];
  const statusStyle = statusColors[tester.status];

  return (
    <div className="glass rounded-2xl p-4 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${platformStyle.bg} ${platformStyle.text} flex items-center justify-center flex-shrink-0`}>
            <PlatformIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{tester.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{tester.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            {tester.status}
          </span>

          {tester.status === "pending" && (
            <Button size="sm" variant="outline" onClick={() => onInvite(tester.id)} className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-1" />
              Invite
            </Button>
          )}
          {tester.status === "invited" && (
            <Button size="sm" variant="outline" onClick={() => onActivate(tester.id)} className="rounded-xl">
              <UserCheck className="w-4 h-4 mr-1" />
              Activate
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDelete(tester.id)} className="rounded-xl text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {(tester.device_model || tester.os_version || tester.notes) && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {tester.device_model && <span>Device: {tester.device_model}</span>}
          {tester.os_version && <span>OS: {tester.os_version}</span>}
          {tester.notes && <span className="text-primary">{tester.notes}</span>}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Feedback Row Component
// =====================================================

interface FeedbackRowProps {
  feedback: BetaFeedback;
  onUpdateStatus: (id: string, status: BetaFeedbackStatus) => void;
  expanded: boolean;
  onToggle: () => void;
}

function FeedbackRow({ feedback, onUpdateStatus, expanded, onToggle }: FeedbackRowProps) {
  const TypeIcon = feedbackTypeIcons[feedback.feedback_type];
  const typeStyle = feedbackTypeColors[feedback.feedback_type];
  const statusStyle = feedbackStatusColors[feedback.status];
  const StatusIcon = statusStyle.icon;

  return (
    <div className="glass rounded-2xl overflow-hidden transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${typeStyle.bg} ${typeStyle.text} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                  {feedback.feedback_type}
                </span>
                <span className="text-sm text-muted-foreground">{feedback.screen_name}</span>
              </div>
              <p className="text-sm line-clamp-2">{feedback.message}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {feedback.username && <span>@{feedback.username}</span>}
                <span>{format(parseISO(feedback.created_at), "MMM d, yyyy HH:mm")}</span>
                {feedback.app_version && <span>v{feedback.app_version}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{feedback.status.replace("_", " ")}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-4 bg-background/30">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Full Message</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.message}</p>
          </div>

          {feedback.device_info && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Device Info</h4>
              <p className="text-sm text-muted-foreground">{feedback.device_info}</p>
            </div>
          )}

          {feedback.internal_comment && (
            <div className="mb-4 p-3 rounded-xl bg-primary/10">
              <h4 className="text-sm font-medium mb-1">Internal Comment</h4>
              <p className="text-sm">{feedback.internal_comment}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium mr-2">Set Status:</span>
            {(["open", "in_progress", "fixed", "wont_fix"] as BetaFeedbackStatus[]).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={feedback.status === status ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(feedback.id, status);
                }}
                className="rounded-xl text-xs"
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Page Component
// =====================================================

type TabType = "testers" | "android-feedback" | "ios-feedback";

export function BetaManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("testers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [testerFilters, setTesterFilters] = useState<BetaTesterFilters>({});
  const [feedbackFilters, setFeedbackFilters] = useState<BetaFeedbackFilters>({});

  // Queries
  const { data: overview, isLoading: overviewLoading } = useBetaOverview();
  const { data: testers, isLoading: testersLoading } = useBetaTesters(testerFilters);
  const { data: androidFeedback, isLoading: androidLoading } = useBetaFeedback(feedbackFilters);
  const { data: iosFeedback, isLoading: iosLoading } = useIosBetaFeedback(feedbackFilters);

  // Mutations
  const createTester = useCreateBetaTester();
  const createTesters = useCreateBetaTesters();
  const deleteTester = useDeleteBetaTester();
  const inviteTester = useInviteBetaTester();
  const activateTester = useActivateBetaTester();
  const updateAndroidFeedback = useUpdateBetaFeedback();
  const updateIosFeedback = useUpdateIosBetaFeedback();

  // Handlers
  const handleAddTester = (name: string, email: string, platform: BetaPlatform) => {
    createTester.mutate(
      { name, email, platform },
      {
        onSuccess: () => toast.success("Tester added successfully"),
        onError: (error) => toast.error(`Failed to add tester: ${error.message}`),
      }
    );
  };

  const handleImportTesters = (testers: BetaTesterCreate[]) => {
    createTesters.mutate(testers, {
      onSuccess: (data) => toast.success(`${data.length} testers imported successfully`),
      onError: (error) => toast.error(`Import failed: ${error.message}`),
    });
  };

  const handleDeleteTester = (id: string) => {
    if (confirm("Are you sure you want to delete this tester?")) {
      deleteTester.mutate(id, {
        onSuccess: () => toast.success("Tester deleted"),
        onError: (error) => toast.error(`Failed to delete: ${error.message}`),
      });
    }
  };

  const handleInviteTester = (id: string) => {
    inviteTester.mutate(id, {
      onSuccess: () => toast.success("Invitation sent"),
      onError: (error) => toast.error(`Failed to invite: ${error.message}`),
    });
  };

  const handleActivateTester = (id: string) => {
    activateTester.mutate(id, {
      onSuccess: () => toast.success("Tester activated"),
      onError: (error) => toast.error(`Failed to activate: ${error.message}`),
    });
  };

  const handleUpdateAndroidFeedback = (id: string, status: BetaFeedbackStatus) => {
    updateAndroidFeedback.mutate(
      { id, update: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (error) => toast.error(`Failed to update: ${error.message}`),
      }
    );
  };

  const handleUpdateIosFeedback = (id: string, status: BetaFeedbackStatus) => {
    updateIosFeedback.mutate(
      { id, update: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (error) => toast.error(`Failed to update: ${error.message}`),
      }
    );
  };

  // Filter testers by search
  const filteredTesters = testers?.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter feedback by search
  const filteredAndroidFeedback = androidFeedback?.filter(
    (f) =>
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.screen_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredIosFeedback = iosFeedback?.filter(
    (f) =>
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.screen_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Count unique testers from feedback (by user_id or username)
  const uniqueAndroidTesters = new Set(
    androidFeedback?.map((f) => f.user_id || f.username).filter(Boolean) || []
  ).size;

  const uniqueIosTesters = new Set(
    iosFeedback?.map((f) => f.user_id || f.username).filter(Boolean) || []
  ).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Beta Management</h1>
          <p className="text-muted-foreground text-lg">Manage beta testers and feedback</p>
        </div>
        {activeTab === "testers" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)} className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" />
              CSV Import
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Tester
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">iOS Testers</p>
              {iosLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{uniqueIosTesters} <span className="text-sm font-normal text-muted-foreground">active</span></p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Android Testers</p>
              {androidLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{uniqueAndroidTesters} <span className="text-sm font-normal text-muted-foreground">active</span></p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Bugs</p>
              {overviewLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">
                  {(overview?.feedback.ios.by_type.bug || 0) + (overview?.feedback.android.by_type.bug || 0)}
                </p>
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
              <p className="text-sm text-muted-foreground">Pending Feedback</p>
              {overviewLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">
                  {(overview?.feedback.ios.open || 0) + (overview?.feedback.android.open || 0)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl p-1 inline-flex">
        <button
          onClick={() => setActiveTab("testers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "testers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Testers ({testers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("android-feedback")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "android-feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4 inline mr-2" />
          Android ({androidFeedback?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("ios-feedback")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "ios-feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Apple className="w-4 h-4 inline mr-2" />
          iOS ({iosFeedback?.length || 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "testers" ? "Search by name or email..." : "Search feedback..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {showFilters && activeTab === "testers" && (
          <div className="mt-4 pt-4 border-t border-border grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={testerFilters.platform || ""}
                onChange={(e) => setTesterFilters({ ...testerFilters, platform: e.target.value as BetaPlatform || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={testerFilters.status || ""}
                onChange={(e) => setTesterFilters({ ...testerFilters, status: e.target.value as BetaTesterStatus || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {showFilters && activeTab !== "testers" && (
          <div className="mt-4 pt-4 border-t border-border grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={feedbackFilters.feedback_type || ""}
                onChange={(e) => setFeedbackFilters({ ...feedbackFilters, feedback_type: e.target.value as "bug" | "feedback" | "idea" || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Types</option>
                <option value="bug">Bug</option>
                <option value="feedback">Feedback</option>
                <option value="idea">Idea</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={feedbackFilters.status || ""}
                onChange={(e) => setFeedbackFilters({ ...feedbackFilters, status: e.target.value as BetaFeedbackStatus || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="fixed">Fixed</option>
                <option value="wont_fix">Won't Fix</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Testers Tab */}
        {activeTab === "testers" && (
          testersLoading ? (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </>
          ) : filteredTesters.length > 0 ? (
            filteredTesters.map((tester) => (
              <TesterRow
                key={tester.id}
                tester={tester}
                onInvite={handleInviteTester}
                onActivate={handleActivateTester}
                onDelete={handleDeleteTester}
              />
            ))
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No testers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Add your first beta tester to get started"}
              </p>
              <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Tester
              </Button>
            </div>
          )
        )}

        {/* Android Feedback Tab */}
        {activeTab === "android-feedback" && (
          androidLoading ? (
            <>
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : filteredAndroidFeedback.length > 0 ? (
            filteredAndroidFeedback.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                onUpdateStatus={handleUpdateAndroidFeedback}
                expanded={expandedFeedback === feedback.id}
                onToggle={() => setExpandedFeedback(expandedFeedback === feedback.id ? null : feedback.id)}
              />
            ))
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No Android feedback</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No feedback from Android beta testers yet"}
              </p>
            </div>
          )
        )}

        {/* iOS Feedback Tab */}
        {activeTab === "ios-feedback" && (
          iosLoading ? (
            <>
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : filteredIosFeedback.length > 0 ? (
            filteredIosFeedback.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                onUpdateStatus={handleUpdateIosFeedback}
                expanded={expandedFeedback === feedback.id}
                onToggle={() => setExpandedFeedback(expandedFeedback === feedback.id ? null : feedback.id)}
              />
            ))
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Apple className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No iOS feedback</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No feedback from iOS beta testers yet"}
              </p>
            </div>
          )
        )}
      </div>

      {/* Add Tester Modal */}
      <AddTesterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTester}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTesters}
      />
    </div>
  );
}
