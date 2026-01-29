import { useMemo } from "react";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus, TaskFilters } from "@/api/types/tasks";
import { TASK_STATUSES } from "@/api/types/tasks";
import { cn } from "@/lib/utils";

interface TaskKanbanBoardProps {
  filters?: TaskFilters;
  searchQuery: string;
}

export function TaskKanbanBoard({ filters, searchQuery }: TaskKanbanBoardProps) {
  const { data: tasks, isLoading } = useTasks(filters);
  const updateStatus = useUpdateTaskStatus();

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatus.mutate({ id: taskId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {TASK_STATUSES.map((col) => (
          <div key={col.value} className="space-y-3">
            <div className="h-10 rounded-lg bg-card animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
      {TASK_STATUSES.map((column) => {
        const columnTasks = getTasksByStatus(column.value);

        return (
          <div key={column.value} className="min-w-[250px]">
            {/* Column Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", column.color)} />
              <span className="font-semibold">{column.label}</span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(status) => handleStatusChange(task.id, status)}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-muted p-4 text-center text-sm text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
