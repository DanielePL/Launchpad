import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Bug,
  Smartphone,
  Apple,
  Clock,
  Users,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ExternalLink,
  XCircle,
  AlertCircle,
  Zap,
  CheckCircle2,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { CrashIssue, CrashFilters, CrashStats } from "@/api/types";
import { format, subDays } from "date-fns";
import { useCrashStats, useCrashIssues, useUpdateCrashIssueStatus } from "@/hooks/useCrashes";

// =====================================================
// Mock Data (wird durch BigQuery ersetzt)
// =====================================================

const mockCrashStats: CrashStats = {
  total_crashes_today: 12,
  total_crashes_week: 47,
  affected_users_today: 8,
  affected_users_week: 31,
  crash_free_users_percent: 98.2,
  top_issues: [],
  crashes_by_version: [
    { version: "1.8", count: 23 },
    { version: "1.7", count: 18 },
    { version: "1.6", count: 6 },
  ],
  crashes_by_day: Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), "yyyy-MM-dd"),
    crashes: Math.floor(Math.random() * 10) + 2,
    non_fatals: Math.floor(Math.random() * 20) + 5,
    anrs: Math.floor(Math.random() * 3),
  })),
};

const mockIssues: CrashIssue[] = [
  {
    issue_id: "crash_001",
    issue_title: "NullPointerException",
    issue_subtitle: "WorkoutViewModel.loadSets",
    blame_frame: "com.prometheus.coach.viewmodel.WorkoutViewModel.loadSets(WorkoutViewModel.kt:142)",
    crash_type: "crash",
    first_seen: "2025-01-20T10:30:00Z",
    last_seen: "2025-01-24T08:15:00Z",
    event_count: 23,
    user_count: 12,
    app_versions: ["1.8", "1.7"],
    status: "open",
    platform: "android",
  },
  {
    issue_id: "crash_002",
    issue_title: "IllegalStateException",
    issue_subtitle: "CameraPreview.startCapture",
    blame_frame: "com.prometheus.coach.camera.CameraPreview.startCapture(CameraPreview.kt:89)",
    crash_type: "crash",
    first_seen: "2025-01-22T14:20:00Z",
    last_seen: "2025-01-24T07:45:00Z",
    event_count: 8,
    user_count: 6,
    app_versions: ["1.8"],
    status: "open",
    platform: "android",
  },
  {
    issue_id: "crash_003",
    issue_title: "OutOfMemoryError",
    issue_subtitle: "VBTAnalyzer.processFrame",
    blame_frame: "com.prometheus.coach.vbt.VBTAnalyzer.processFrame(VBTAnalyzer.kt:234)",
    crash_type: "crash",
    first_seen: "2025-01-18T09:00:00Z",
    last_seen: "2025-01-23T16:30:00Z",
    event_count: 15,
    user_count: 9,
    app_versions: ["1.8", "1.7", "1.6"],
    status: "open",
    platform: "android",
  },
  {
    issue_id: "anr_001",
    issue_title: "ANR: Input dispatching timed out",
    issue_subtitle: "MainActivity",
    blame_frame: "com.prometheus.coach.MainActivity.onCreate(MainActivity.kt:45)",
    crash_type: "anr",
    first_seen: "2025-01-21T11:00:00Z",
    last_seen: "2025-01-24T06:20:00Z",
    event_count: 5,
    user_count: 4,
    app_versions: ["1.8"],
    status: "open",
    platform: "android",
  },
  {
    issue_id: "nonfatal_001",
    issue_title: "NetworkException",
    issue_subtitle: "SupabaseClient.fetchData",
    blame_frame: "com.prometheus.coach.network.SupabaseClient.fetchData(SupabaseClient.kt:78)",
    crash_type: "non_fatal",
    first_seen: "2025-01-19T08:00:00Z",
    last_seen: "2025-01-24T09:00:00Z",
    event_count: 156,
    user_count: 45,
    app_versions: ["1.8", "1.7"],
    status: "muted",
    platform: "android",
  },
];

// =====================================================
// Helper Components
// =====================================================

const crashTypeConfig = {
  crash: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/20", label: "Crash" },
  non_fatal: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Non-Fatal" },
  anr: { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/20", label: "ANR" },
};

const statusConfig = {
  open: { color: "text-destructive", bg: "bg-destructive/20" },
  closed: { color: "text-green-500", bg: "bg-green-500/20" },
  muted: { color: "text-muted-foreground", bg: "bg-muted" },
};

// =====================================================
// Issue Row Component
// =====================================================

interface IssueRowProps {
  issue: CrashIssue;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus?: (issueId: string, status: "open" | "closed" | "muted") => void;
}

function IssueRow({ issue, expanded, onToggle, onUpdateStatus }: IssueRowProps) {
  const typeConfig = crashTypeConfig[issue.crash_type];
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[issue.status];

  return (
    <div className="glass rounded-2xl overflow-hidden transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                  {issue.status}
                </span>
                {issue.platform === "android" ? (
                  <Smartphone className="w-3 h-3 text-green-500" />
                ) : (
                  <Apple className="w-3 h-3 text-blue-500" />
                )}
              </div>
              <p className="font-bold truncate">{issue.issue_title}</p>
              <p className="text-sm text-muted-foreground truncate">{issue.issue_subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xl font-bold">{issue.event_count}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div>
              <p className="text-xl font-bold">{issue.user_count}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-4 bg-background/30 space-y-4">
          {/* Blame Frame */}
          <div>
            <h4 className="text-sm font-medium mb-2">Stack Trace</h4>
            <code className="block p-3 rounded-xl bg-background text-xs font-mono overflow-x-auto">
              {issue.blame_frame}
            </code>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">First Seen</p>
              <p className="text-sm font-medium">{format(new Date(issue.first_seen), "MMM d, HH:mm")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Seen</p>
              <p className="text-sm font-medium">{format(new Date(issue.last_seen), "MMM d, HH:mm")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versions</p>
              <p className="text-sm font-medium">{issue.app_versions.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="text-sm font-medium capitalize">{issue.platform}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-xl" asChild>
              <a href={`https://console.firebase.google.com/project/prometheusv1-c9310/crashlytics/app/android:com.prometheus.coach/issues/${issue.issue_id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Firebase
              </a>
            </Button>
            {issue.status === "open" && onUpdateStatus && (
              <>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onUpdateStatus(issue.issue_id, "closed")}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Close
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onUpdateStatus(issue.issue_id, "muted")}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Mute
                </Button>
              </>
            )}
            {issue.status !== "open" && onUpdateStatus && (
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onUpdateStatus(issue.issue_id, "open")}>
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Mini Chart Component
// =====================================================

function MiniChart({ data }: { data: { date: string; crashes: number }[] }) {
  const max = Math.max(...data.map((d) => d.crashes), 1);

  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-destructive/60 rounded-t"
          style={{ height: `${(d.crashes / max) * 100}%`, minHeight: "4px" }}
          title={`${d.date}: ${d.crashes} crashes`}
        />
      ))}
    </div>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export function CrashesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CrashFilters>({});

  // Fetch real data from BigQuery via backend
  const { data: realStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useCrashStats(filters.platform);
  const { data: realIssues, isLoading: issuesLoading, error: issuesError, refetch: refetchIssues } = useCrashIssues(filters);
  const updateStatusMutation = useUpdateCrashIssueStatus();

  // Use real data if available, fallback to mock data
  const isLoading = statsLoading || issuesLoading;
  const hasRealData = !statsError && !issuesError && (realStats || realIssues);
  const stats = realStats || mockCrashStats;
  const issues = realIssues || mockIssues;

  const handleRefresh = () => {
    refetchStats();
    refetchIssues();
  };

  const handleUpdateStatus = (issueId: string, status: "open" | "closed" | "muted") => {
    updateStatusMutation.mutate({ issueId, status });
  };

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filters.crash_type && issue.crash_type !== filters.crash_type) return false;
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.platform && issue.platform !== filters.platform) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          issue.issue_title.toLowerCase().includes(q) ||
          issue.issue_subtitle?.toLowerCase().includes(q) ||
          issue.blame_frame?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issues, filters, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Crashes</h1>
          <p className="text-muted-foreground text-lg">
            Firebase Crashlytics Overview
            {hasRealData && <span className="ml-2 text-green-500 text-sm">(Live)</span>}
            {!hasRealData && !isLoading && <span className="ml-2 text-yellow-500 text-sm">(Demo)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Firebase Console
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats.total_crashes_today}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/20 text-orange-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats.total_crashes_week}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Affected Users</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats.affected_users_week}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Crash-Free</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats.crash_free_users_percent}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">7-Day Trend</p>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <MiniChart data={stats.crashes_by_day} />
          </div>
        </div>
      </div>

      {/* Version Breakdown */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold mb-4">Crashes by Version</h3>
        <div className="flex gap-4 flex-wrap">
          {stats.crashes_by_version.map((v) => (
            <div key={v.version} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background/50">
              <span className="font-medium">v{v.version}</span>
              <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive text-sm font-bold">
                {v.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crashes..."
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={filters.crash_type || ""}
                onChange={(e) => setFilters({ ...filters, crash_type: e.target.value as CrashFilters["crash_type"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Types</option>
                <option value="crash">Crashes</option>
                <option value="non_fatal">Non-Fatal</option>
                <option value="anr">ANRs</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as CrashFilters["status"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="muted">Muted</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={filters.platform || ""}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value as CrashFilters["platform"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Platforms</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Issues ({filteredIssues.length})</h3>
        </div>

        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueRow
              key={issue.issue_id}
              issue={issue}
              expanded={expandedIssue === issue.issue_id}
              onToggle={() => setExpandedIssue(expandedIssue === issue.issue_id ? null : issue.issue_id)}
              onUpdateStatus={hasRealData ? handleUpdateStatus : undefined}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
            <h3 className="text-xl font-bold mb-2">No Crashes</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No matches for this search" : "Everything is running stable!"}
            </p>
          </div>
        )}
      </div>

      {/* Status Notice */}
      {hasRealData ? (
        <div className="glass rounded-2xl p-4 border border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-500">BigQuery connected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Data is loaded live from BigQuery. Project: prometheusv1-c9310
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">Demo Mode</p>
              <p className="text-sm text-muted-foreground mt-1">
                Backend endpoint missing. Add the /crashes endpoint to your Render backend to load real BigQuery data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
