import { useMemo, useState } from "react";
import { Calendar, CheckSquare, MessageSquare, Paperclip } from "lucide-react";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { TaskDetailModal } from "./TaskDetailModal";
import type { Task, TaskStatus, TaskFilters } from "@/api/types/tasks";
import {
  TASK_STATUSES,
  PRIORITY_COLORS,
  DEADLINE_COLORS,
  getDeadlineUrgency,
  formatDeadline,
  getSubtaskProgress,
  getAssigneeInitials,
  getAssigneeColor,
} from "@/api/types/tasks";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListViewProps {
  filters?: TaskFilters;
  searchQuery: string;
}

export function TaskListView({ filters, searchQuery }: TaskListViewProps) {
  const { data: tasks, isLoading } = useTasks(filters);
  const updateStatus = useUpdateTaskStatus();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatus.mutate({ id: taskId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-muted p-8 text-center">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted text-left text-sm text-muted-foreground">
              <th className="p-4 font-medium">Task</th>
              <th className="p-4 font-medium w-32">Status</th>
              <th className="p-4 font-medium w-24">Priority</th>
              <th className="p-4 font-medium w-28">Assignee</th>
              <th className="p-4 font-medium w-36">Deadline</th>
              <th className="p-4 font-medium w-32">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onRowClick={() => setSelectedTaskId(task.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={true}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </>
  );
}

interface TaskRowProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onRowClick: () => void;
}

function TaskRow({ task, onStatusChange, onRowClick }: TaskRowProps) {
  const { urgency } = getDeadlineUrgency(task.deadline);
  const deadlineColors = DEADLINE_COLORS[urgency];
  const priorityColors = PRIORITY_COLORS[task.priority];
  const subtaskProgress = getSubtaskProgress(task.subtasks);

  return (
    <tr
      onClick={onRowClick}
      className="border-b border-muted/50 hover:bg-muted/20 cursor-pointer transition-colors"
    >
      {/* Task Title + Project + Meta */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm line-clamp-1">{task.title}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.project && (
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${task.project.color}20`,
                  color: task.project.color,
                }}
              >
                {task.project.name}
              </span>
            )}
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.comments.length}
              </span>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task.attachments.length}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Status Dropdown */}
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="h-8 px-2 rounded-lg bg-card border border-muted text-sm focus:border-primary transition-all cursor-pointer"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </td>

      {/* Priority */}
      <td className="p-4">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium capitalize",
            priorityColors.bg,
            priorityColors.text
          )}
        >
          {task.priority}
        </span>
      </td>

      {/* Assignee */}
      <td className="p-4">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                getAssigneeColor(task.assignee)
              )}
            >
              {getAssigneeInitials(task.assignee)}
            </div>
            <span className="text-sm">{task.assignee}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </td>

      {/* Deadline */}
      <td className="p-4">
        {task.deadline ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
              deadlineColors.bg,
              deadlineColors.text
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDeadline(task.deadline)}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No deadline</span>
        )}
      </td>

      {/* Subtask Progress */}
      <td className="p-4">
        {subtaskProgress.total > 0 ? (
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {subtaskProgress.completed}/{subtaskProgress.total}
                </span>
                <span>{subtaskProgress.percent}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${subtaskProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>
    </tr>
  );
}
