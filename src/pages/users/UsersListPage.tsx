import { useState } from "react";
import {
  Users,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Apple,
  Smartphone,
  Monitor,
  MessageSquare,
  Camera,
  Video,
  HardDrive,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Crown,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppUser, UserFilters } from "@/api/types/users";
import { format, parseISO } from "date-fns";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

const platformIcons = {
  ios: Apple,
  android: Smartphone,
  web: Monitor,
};

const platformColors = {
  ios: { bg: "bg-blue-500/20", text: "text-blue-500" },
  android: { bg: "bg-green-500/20", text: "text-green-500" },
  web: { bg: "bg-primary/20", text: "text-primary" },
};

const statusColors = {
  active: { bg: "bg-green-500/20", text: "text-green-500" },
  trial: { bg: "bg-blue-500/20", text: "text-blue-500" },
  expired: { bg: "bg-yellow-500/20", text: "text-yellow-500" },
  cancelled: { bg: "bg-destructive/20", text: "text-destructive" },
  none: { bg: "bg-muted", text: "text-muted-foreground" },
};

interface UserRowProps {
  user: AppUser;
  expanded: boolean;
  onToggle: () => void;
}

function UserRow({ user, expanded, onToggle }: UserRowProps) {
  const PlatformIcon = user.subscription.platform
    ? platformIcons[user.subscription.platform]
    : Users;
  const platformStyle = user.subscription.platform
    ? platformColors[user.subscription.platform]
    : { bg: "bg-muted", text: "text-muted-foreground" };
  const statusStyle = statusColors[user.subscription.status];

  return (
    <div className="glass rounded-2xl overflow-hidden transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
      <div
        className="p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl ${platformStyle.bg} ${platformStyle.text} flex items-center justify-center flex-shrink-0`}>
              <PlatformIcon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold truncate">{user.email}</p>
                {user.subscription.plan_type === "lifetime" && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {user.subscription.status}
                </span>
                {user.subscription.plan_type && (
                  <span className="capitalize">{user.subscription.plan_type}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(user.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-bold text-destructive">{formatCurrency(user.costs.total_cost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LTV</p>
                <p className={`font-bold ${user.is_profitable ? 'text-green-500' : 'text-destructive'}`}>
                  {formatCurrency(user.lifetime_value)}
                </p>
              </div>
            </div>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.is_profitable ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
              {user.is_profitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>

            <Button variant="ghost" size="icon" className="rounded-lg">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/50 p-5 bg-background/30">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subscription Details */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                Subscription Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium capitalize">{user.subscription.platform || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium capitalize">{user.subscription.plan_type || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium capitalize ${statusStyle.text}`}>{user.subscription.status}</span>
                </div>
                {user.subscription.started_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium">{format(parseISO(user.subscription.started_at), "MMM d, yyyy")}</span>
                  </div>
                )}
                {user.subscription.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">{format(parseISO(user.subscription.expires_at), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto Renew</span>
                  <span className={`font-medium ${user.subscription.auto_renew ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {user.subscription.auto_renew ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Cost Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm">AI Coach</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(user.costs.ai_coach_cost)}</p>
                    <p className="text-xs text-muted-foreground">{user.costs.ai_coach_messages} messages</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Photo Analysis</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(user.costs.photo_analysis_cost)}</p>
                    <p className="text-xs text-muted-foreground">{user.costs.photo_analysis_count} scans</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-500" />
                    <span className="text-sm">VBT Analysis</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(user.costs.vbt_analysis_cost)}</p>
                    <p className="text-xs text-muted-foreground">{user.costs.vbt_analysis_count} videos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(user.costs.storage_cost)}</p>
                    <p className="text-xs text-muted-foreground">{user.costs.storage_uploads} uploads</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2">
                  <span className="font-medium">Total Cost</span>
                  <span className="font-bold text-destructive">{formatCurrency(user.costs.total_cost)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <code className="px-1.5 py-0.5 bg-background rounded">{user.user_id}</code>
              {user.last_active && (
                <>
                  <span>•</span>
                  <span>Last active: {format(parseISO(user.last_active), "MMM d, yyyy 'at' h:mm a")}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UsersListPage() {
  const [filters, setFilters] = useState<UserFilters>({
    limit: 50,
    sort_by: "cost",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useUsers(filters);

  // Filter users by search query locally
  const filteredUsers = data?.users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground text-lg">User subscriptions and cost analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{data?.total_count || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(data?.total_cost || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(data?.total_revenue || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profitable</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{data?.profitable_users || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unprofitable</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{data?.unprofitable_users || 0}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or user ID..."
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
          <div className="mt-4 pt-4 border-t border-border grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as UserFilters["status"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="none">No Subscription</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={filters.platform || ""}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value as UserFilters["platform"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="web">Web</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Type</label>
              <select
                value={filters.plan_type || ""}
                onChange={(e) => setFilters({ ...filters, plan_type: e.target.value as UserFilters["plan_type"] || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">All Plans</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <select
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split("-") as [UserFilters["sort_by"], UserFilters["sort_order"]];
                  setFilters({ ...filters, sort_by, sort_order });
                }}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="cost-desc">Highest Cost</option>
                <option value="cost-asc">Lowest Cost</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="last_active-desc">Recently Active</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserRow
              key={user.user_id}
              user={user}
              expanded={expandedUser === user.user_id}
              onToggle={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "No users match the selected filters"}
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {data && filteredUsers.length < data.total_count && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setFilters({ ...filters, limit: (filters.limit || 50) + 50 })}
            className="rounded-xl"
          >
            Load More ({filteredUsers.length} of {data.total_count})
          </Button>
        </div>
      )}
    </div>
  );
}
