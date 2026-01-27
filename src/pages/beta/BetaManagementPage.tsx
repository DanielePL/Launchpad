import { useState } from "react";
import {
  Apple,
  Smartphone,
  Search,
  Bug,
  MessageSquare,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  X,
  Mail,
  Trash2,
  Send,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBetaOverview,
  useBetaTesters,
  useBetaFeedback,
  useIosBetaFeedback,
  useUpdateBetaFeedback,
  useUpdateIosBetaFeedback,
  useCreateBetaTester,
  useDeleteBetaTester,
  useInviteBetaTester,
  useActivateBetaTester,
} from "@/hooks/useBeta";
import type {
  BetaTester,
  BetaTesterCreate,
  BetaTesterFilters,
  BetaTesterStatus,
  BetaFeedback,
  BetaFeedbackFilters,
  BetaPlatform,
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

const testerStatusColors: Record<BetaTesterStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-500" },
  invited: { bg: "bg-blue-500/20", text: "text-blue-500" },
  active: { bg: "bg-green-500/20", text: "text-green-500" },
  inactive: { bg: "bg-muted", text: "text-muted-foreground" },
};

// =====================================================
// Tester Row Component (from beta_testers table)
// =====================================================

interface TesterRowProps {
  tester: BetaTester;
  onInvite: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  isActioning: boolean;
}

function TesterRow({ tester, onInvite, onActivate, onDelete, isActioning }: TesterRowProps) {
  const PlatformIcon = platformIcons[tester.platform];
  const platformStyle = platformColors[tester.platform];
  const statusStyle = testerStatusColors[tester.status];

  return (
    <div className="glass rounded-2xl p-4 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${platformStyle.bg} ${platformStyle.text} flex items-center justify-center flex-shrink-0`}>
            <PlatformIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{tester.name}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {tester.email}
              </span>
              {tester.device_model && <span className="truncate">{tester.device_model}</span>}
              {tester.os_version && <span>OS {tester.os_version}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {tester.status}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {format(parseISO(tester.created_at), "MMM d, yyyy")}
            </p>
          </div>

          {tester.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => onInvite(tester.id)}
              disabled={isActioning}
            >
              <Send className="w-3 h-3 mr-1" />
              Invite
            </Button>
          )}
          {tester.status === "invited" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => onActivate(tester.id)}
              disabled={isActioning}
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Activate
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(tester.id)}
            disabled={isActioning}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Add Tester Modal
// =====================================================

interface AddTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform: BetaPlatform;
}

function AddTesterModal({ isOpen, onClose, defaultPlatform }: AddTesterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<BetaPlatform>(defaultPlatform);
  const [notes, setNotes] = useState("");

  const createTester = useCreateBetaTester();

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;

    const testerData: BetaTesterCreate = {
      name: name.trim(),
      email: email.trim(),
      platform,
      notes: notes.trim() || undefined,
    };

    createTester.mutate(testerData, {
      onSuccess: () => {
        toast.success(`Tester "${name}" added`);
        handleClose();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to add tester");
      },
    });
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPlatform(defaultPlatform);
    setNotes("");
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
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add Beta Tester</h3>
              <p className="text-sm text-muted-foreground">
                Add a new tester to the {platform === "ios" ? "iOS" : "Android"} beta list
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Name *</label>
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email *</label>
            <Input
              type="email"
              placeholder="tester@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm font-medium mb-2 block">Platform</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPlatform("android")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth border ${
                  platform === "android"
                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Android
              </button>
              <button
                onClick={() => setPlatform("ios")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth border ${
                  platform === "ios"
                    ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Apple className="w-4 h-4" />
                iOS
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <Input
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-muted/20">
            <Button variant="ghost" className="rounded-xl" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !email.trim() || createTester.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
            >
              {createTester.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tester
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
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

type TabType = "android-testers" | "ios-testers" | "android-feedback" | "ios-feedback";

export function BetaManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("android-testers");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [testerFilters, setTesterFilters] = useState<BetaTesterFilters>({});
  const [feedbackFilters, setFeedbackFilters] = useState<BetaFeedbackFilters>({});

  // Tester queries
  const { data: androidTesters, isLoading: androidTestersLoading } = useBetaTesters({ platform: "android" });
  const { data: iosTesters, isLoading: iosTestersLoading } = useBetaTesters({ platform: "ios" });

  // Feedback queries
  const { data: overview, isLoading: overviewLoading } = useBetaOverview();
  const { data: androidFeedback, isLoading: androidLoading } = useBetaFeedback(feedbackFilters);
  const { data: iosFeedback, isLoading: iosLoading } = useIosBetaFeedback(feedbackFilters);

  // Mutations
  const updateAndroidFeedback = useUpdateBetaFeedback();
  const updateIosFeedback = useUpdateIosBetaFeedback();
  const deleteTester = useDeleteBetaTester();
  const inviteTester = useInviteBetaTester();
  const activateTester = useActivateBetaTester();

  const isActioning = deleteTester.isPending || inviteTester.isPending || activateTester.isPending;

  // Handlers
  const handleUpdateAndroidFeedback = (id: string, status: BetaFeedbackStatus) => {
    updateAndroidFeedback.mutate(
      { id, update: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const handleUpdateIosFeedback = (id: string, status: BetaFeedbackStatus) => {
    updateIosFeedback.mutate(
      { id, update: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const handleInvite = (id: string) => {
    inviteTester.mutate(id, {
      onSuccess: () => toast.success("Tester invited"),
      onError: () => toast.error("Failed to invite tester"),
    });
  };

  const handleActivate = (id: string) => {
    activateTester.mutate(id, {
      onSuccess: () => toast.success("Tester activated"),
      onError: () => toast.error("Failed to activate tester"),
    });
  };

  const handleDelete = (id: string) => {
    deleteTester.mutate(id, {
      onSuccess: () => toast.success("Tester removed"),
      onError: () => toast.error("Failed to remove tester"),
    });
  };

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

  // Filter testers by search and status
  const filteredAndroidTesters = (androidTesters || []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !testerFilters.status || t.status === testerFilters.status;
    return matchesSearch && matchesStatus;
  });

  const filteredIosTesters = (iosTesters || []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !testerFilters.status || t.status === testerFilters.status;
    return matchesSearch && matchesStatus;
  });

  const isTesterTab = activeTab === "android-testers" || activeTab === "ios-testers";
  const defaultPlatform: BetaPlatform = activeTab === "ios-testers" ? "ios" : "android";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Beta Management</h1>
          <p className="text-muted-foreground text-lg">Manage beta testers and feedback</p>
        </div>
        {isTesterTab && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tester
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Android Testers</p>
              {androidTestersLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{androidTesters?.length || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">iOS Testers</p>
              {iosTestersLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{iosTesters?.length || 0}</p>
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
      <div className="glass rounded-2xl p-1 inline-flex flex-wrap">
        <button
          onClick={() => setActiveTab("android-testers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "android-testers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4 inline mr-2" />
          Android Testers ({androidTesters?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("ios-testers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "ios-testers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Apple className="w-4 h-4 inline mr-2" />
          iOS Testers ({iosTesters?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("android-feedback")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "android-feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4 inline mr-2" />
          Android Feedback ({androidFeedback?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("ios-feedback")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
            activeTab === "ios-feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Apple className="w-4 h-4 inline mr-2" />
          iOS Feedback ({iosFeedback?.length || 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isTesterTab ? "Search by name or email..." : "Search feedback..."}
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

        {showFilters && isTesterTab && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-2 max-w-xs">
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

        {showFilters && !isTesterTab && (
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
        {/* Android Testers Tab */}
        {activeTab === "android-testers" && (
          androidTestersLoading ? (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </>
          ) : filteredAndroidTesters.length > 0 ? (
            filteredAndroidTesters.map((tester) => (
              <TesterRow
                key={tester.id}
                tester={tester}
                onInvite={handleInvite}
                onActivate={handleActivate}
                onDelete={handleDelete}
                isActioning={isActioning}
              />
            ))
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No Android testers</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Add testers to your Android beta list"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-xl bg-gradient-to-r from-primary to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Android Tester
                </Button>
              )}
            </div>
          )
        )}

        {/* iOS Testers Tab */}
        {activeTab === "ios-testers" && (
          iosTestersLoading ? (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </>
          ) : filteredIosTesters.length > 0 ? (
            filteredIosTesters.map((tester) => (
              <TesterRow
                key={tester.id}
                tester={tester}
                onInvite={handleInvite}
                onActivate={handleActivate}
                onDelete={handleDelete}
                isActioning={isActioning}
              />
            ))
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Apple className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No iOS testers</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Add testers to your iOS beta list"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-xl bg-gradient-to-r from-primary to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add iOS Tester
                </Button>
              )}
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
        defaultPlatform={defaultPlatform}
      />
    </div>
  );
}
