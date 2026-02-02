import { useState } from "react";
import { useActivityLogs, useActivityStats, getActionLabel, getEntityTypeLabel } from "@/hooks/useActivityLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Users,
  Mail,
  Building2,
  CheckSquare,
  FileText,
  Handshake,
  Settings,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EntityType } from "@/api/types/activityLog";

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  member: Users,
  invitation: Mail,
  organization: Building2,
  creator: Handshake,
  task: CheckSquare,
  contract: FileText,
  deal: Handshake,
  settings: Settings,
};

export function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: logs, isLoading, refetch } = useActivityLogs({
    entity_type: entityTypeFilter !== "all" ? (entityTypeFilter as EntityType) : undefined,
    days: daysFilter,
    limit: 200,
  });

  const { data: stats } = useActivityStats(daysFilter);

  const filteredLogs = logs?.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(query) ||
      log.entity_name?.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query)
    );
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all actions and changes within your organization
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Activities</p>
          <p className="text-2xl font-bold">{stats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Last {daysFilter} days</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Team Changes</p>
          <p className="text-2xl font-bold">
            {(stats?.byEntityType?.member || 0) + (stats?.byEntityType?.invitation || 0)}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Creator Updates</p>
          <p className="text-2xl font-bold">{stats?.byEntityType?.creator || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold">{stats?.recentUsers?.length || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, entity, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="member">Team Members</SelectItem>
              <SelectItem value="invitation">Invitations</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="creator">Creators</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="deal">Deals</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={daysFilter.toString()}
            onValueChange={(v) => setDaysFilter(parseInt(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity List */}
      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading activity logs...
          </div>
        ) : !filteredLogs?.length ? (
          <div className="p-8 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity found</p>
            <p className="text-sm">Actions will appear here as they happen</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredLogs.map((log) => {
              const Icon = ENTITY_ICONS[log.entity_type] || Activity;
              const isExpanded = expandedRows.has(log.id);
              const hasDetails = Object.keys(log.details || {}).length > 0;

              return (
                <div key={log.id} className="hover:bg-background/50 transition-colors">
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4",
                      hasDetails && "cursor-pointer"
                    )}
                    onClick={() => hasDetails && toggleExpanded(log.id)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        log.action.includes("deleted") || log.action.includes("removed")
                          ? "bg-destructive/20 text-destructive"
                          : log.action.includes("created") || log.action.includes("added")
                            ? "bg-green-500/20 text-green-500"
                            : "bg-primary/20 text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{getActionLabel(log.action)}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.entity_name && (
                          <span className="text-foreground">{log.entity_name}</span>
                        )}
                        {log.entity_name && " • "}
                        {getEntityTypeLabel(log.entity_type)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {log.user_email || "System"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </p>
                    </div>

                    {hasDetails && (
                      <div className="text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && hasDetails && (
                    <div className="px-4 pb-4 pl-18">
                      <div className="ml-14 p-3 rounded-lg bg-background/50 text-sm">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                          Details
                        </p>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredLogs?.length || 0} of {logs?.length || 0} activities
      </div>
    </div>
  );
}
