import { useState } from "react";
import { MoreVertical, Calendar, CheckSquare, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TaskDetailModal } from "./TaskDetailModal";
import type { Task, TaskStatus } from "@/api/types/tasks";
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

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { urgency } = getDeadlineUrgency(task.deadline);
  const deadlineColors = DEADLINE_COLORS[urgency];
  const priorityColors = PRIORITY_COLORS[task.priority];
  const subtaskProgress = getSubtaskProgress(task.subtasks);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={cn(
          "cursor-pointer rounded-xl bg-card p-4 transition-all hover:bg-card/80 hover:shadow-lg",
          task.priority === "urgent" && "border-l-4 border-red-500",
          task.priority === "high" && "border-l-4 border-orange-500"
        )}
      >
        {/* Header: Title + Menu */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-2 flex-1">{task.title}</h4>
          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-10 min-w-[140px] rounded-lg bg-card border border-muted p-1 shadow-lg">
                {TASK_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(status.value);
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted",
                      task.status === status.value && "bg-muted"
                    )}
                  >
                    <div className={cn("h-2 w-2 rounded-full", status.color)} />
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
              priorityColors.bg,
              priorityColors.text
            )}
          >
            {task.priority}
          </span>
          {task.project && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-[100px]"
              style={{
                backgroundColor: `${task.project.color}20`,
                color: task.project.color,
              }}
            >
              {task.project.name}
            </span>
          )}
        </div>

        {/* Meta Row: Assignee, Deadline, Subtasks, Comments, Attachments */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                getAssigneeColor(task.assignee)
              )}
              title={task.assignee}
            >
              {getAssigneeInitials(task.assignee)}
            </div>
          )}

          {/* Deadline */}
          {task.deadline && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full",
                deadlineColors.bg,
                deadlineColors.text
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDeadline(task.deadline)}</span>
            </div>
          )}

          {/* Subtasks Progress */}
          {subtaskProgress.total > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              <span>
                {subtaskProgress.completed}/{subtaskProgress.total}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments Count */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TaskDetailModal
        taskId={task.id}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}
