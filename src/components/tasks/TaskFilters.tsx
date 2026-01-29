import { Filter, Search, LayoutGrid, List } from "lucide-react";
import { useProjects } from "@/hooks/useTasks";
import type { TaskFilters as TaskFiltersType } from "@/api/types/tasks";
import { TASK_ASSIGNEES, TASK_PRIORITIES } from "@/api/types/tasks";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "kanban" | "list";
  onViewModeChange: (mode: "kanban" | "list") => void;
}

export function TaskFilters({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: TaskFiltersProps) {
  const { data: projects } = useProjects();

  const updateFilter = (key: keyof TaskFiltersType, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value) {
      (newFilters as Record<string, string | undefined>)[key] = value;
    } else {
      delete (newFilters as Record<string, string | undefined>)[key];
    }
    onFiltersChange(newFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="w-4 h-4 text-muted-foreground" />

      {/* Project Filter */}
      <select
        value={filters.project_id || ""}
        onChange={(e) => updateFilter("project_id", e.target.value || undefined)}
        className="h-9 px-3 rounded-xl bg-card border border-muted/20 text-sm text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
      >
        <option value="">All Projects</option>
        {projects?.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority || ""}
        onChange={(e) => updateFilter("priority", e.target.value || undefined)}
        className="h-9 px-3 rounded-xl bg-card border border-muted/20 text-sm text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
      >
        <option value="">All Priorities</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* Assignee Filter */}
      <select
        value={filters.assignee || ""}
        onChange={(e) => updateFilter("assignee", e.target.value || undefined)}
        className="h-9 px-3 rounded-xl bg-card border border-muted/20 text-sm text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
      >
        <option value="">All Assignees</option>
        {TASK_ASSIGNEES.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* Quick Filters */}
      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            onFiltersChange(
              filters.overdue ? { ...filters, overdue: undefined } : { ...filters, overdue: true }
            )
          }
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
            filters.overdue
              ? "bg-red-500 text-white"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          Overdue
        </button>
        <button
          onClick={() =>
            onFiltersChange(
              filters.due_soon
                ? { ...filters, due_soon: undefined }
                : { ...filters, due_soon: true }
            )
          }
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
            filters.due_soon
              ? "bg-orange-500 text-white"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          Due Soon
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-card rounded-xl p-1">
        <button
          onClick={() => onViewModeChange("kanban")}
          className={cn(
            "p-2 rounded-lg transition-colors",
            viewMode === "kanban"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Kanban View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-2 rounded-lg transition-colors",
            viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 pr-3 w-56 rounded-xl bg-card border border-muted/20 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
    </div>
  );
}
