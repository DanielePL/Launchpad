import { useState } from "react";
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { useTaskStats } from "@/hooks/useTasks";
import type { TaskFilters as TaskFiltersType } from "@/api/types/tasks";
import { Skeleton } from "@/components/ui/skeleton";

export function TasksPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useTaskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckSquare className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your team's tasks and projects
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewTaskModal(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          label="Total"
          value={stats?.total}
          loading={statsLoading}
          color="bg-primary"
        />
        <StatCard
          label="To Do"
          value={stats?.by_status.todo}
          loading={statsLoading}
          color="bg-slate-500"
        />
        <StatCard
          label="In Progress"
          value={stats?.by_status.in_progress}
          loading={statsLoading}
          color="bg-blue-500"
        />
        <StatCard
          label="Overdue"
          value={stats?.overdue}
          loading={statsLoading}
          color="bg-red-500"
          highlight={stats?.overdue ? stats.overdue > 0 : false}
        />
        <StatCard
          label="Completed This Week"
          value={stats?.completed_this_week}
          loading={statsLoading}
          color="bg-green-500"
        />
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Task View */}
      {viewMode === "kanban" ? (
        <TaskKanbanBoard filters={filters} searchQuery={searchQuery} />
      ) : (
        <TaskListView filters={filters} searchQuery={searchQuery} />
      )}

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  color,
  highlight,
}: {
  label: string;
  value?: number;
  loading: boolean;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl p-4 border ${
        highlight ? "border-red-500/30 bg-red-500/5" : "border-muted/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${color}`}
        />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-6 w-8 mt-1" />
          ) : (
            <p className={`text-xl font-bold ${highlight ? "text-red-500" : ""}`}>
              {value ?? 0}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
