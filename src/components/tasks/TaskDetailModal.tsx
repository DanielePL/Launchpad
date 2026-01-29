import { useState } from "react";
import {
  X,
  Calendar,
  User,
  Flag,
  Folder,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  Paperclip,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useCreateSubtask,
  useToggleSubtask,
  useDeleteSubtask,
  useAddComment,
  useDeleteComment,
  useProjects,
} from "@/hooks/useTasks";
import { AttachFileModal } from "./AttachFileModal";
import type { TaskStatus, TaskPriority, TaskAssignee } from "@/api/types/tasks";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_ASSIGNEES,
  STATUS_COLORS,
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
import { format, parseISO } from "date-fns";
import { useDetachFile } from "@/hooks/useTasks";

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  const { data: task, isLoading } = useTask(taskId);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createSubtask = useCreateSubtask();
  const toggleSubtask = useToggleSubtask();
  const deleteSubtask = useDeleteSubtask();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const detachFile = useDetachFile();

  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState<TaskAssignee | "">("");
  const [showAttachModal, setShowAttachModal] = useState(false);

  if (!isOpen) return null;

  if (isLoading || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-background p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const { urgency } = getDeadlineUrgency(task.deadline);
  const deadlineColors = DEADLINE_COLORS[urgency];
  const subtaskProgress = getSubtaskProgress(task.subtasks);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    createSubtask.mutate(
      { task_id: taskId, title: newSubtask.trim() },
      { onSuccess: () => setNewSubtask("") }
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !commentAuthor) return;
    addComment.mutate(
      { task_id: taskId, content: newComment.trim(), created_by: commentAuthor },
      { onSuccess: () => setNewComment("") }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      deleteTask.mutate(taskId, { onSuccess: onClose });
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy 'at' HH:mm");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-muted p-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              {/* Status Badge */}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  STATUS_COLORS[task.status].bg,
                  STATUS_COLORS[task.status].text
                )}
              >
                {TASK_STATUSES.find((s) => s.value === task.status)?.label}
              </span>
              {/* Priority Badge */}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  PRIORITY_COLORS[task.priority].bg,
                  PRIORITY_COLORS[task.priority].text
                )}
              >
                {task.priority}
              </span>
              {/* Project Badge */}
              {task.project && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${task.project.color}20`,
                    color: task.project.color,
                  }}
                >
                  {task.project.name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold">{task.title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Properties Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Flag className="h-4 w-4" /> Status
              </label>
              <select
                value={task.status}
                onChange={(e) =>
                  updateTask.mutate({ id: taskId, data: { status: e.target.value as TaskStatus } })
                }
                className="w-full h-10 px-3 rounded-xl bg-card border border-muted text-sm"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Flag className="h-4 w-4" /> Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) =>
                  updateTask.mutate({
                    id: taskId,
                    data: { priority: e.target.value as TaskPriority },
                  })
                }
                className="w-full h-10 px-3 rounded-xl bg-card border border-muted text-sm"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Assignee
              </label>
              <select
                value={task.assignee || ""}
                onChange={(e) =>
                  updateTask.mutate({
                    id: taskId,
                    data: { assignee: (e.target.value as TaskAssignee) || null },
                  })
                }
                className="w-full h-10 px-3 rounded-xl bg-card border border-muted text-sm"
              >
                <option value="">Unassigned</option>
                {TASK_ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Folder className="h-4 w-4" /> Project
              </label>
              <select
                value={task.project_id || ""}
                onChange={(e) =>
                  updateTask.mutate({
                    id: taskId,
                    data: { project_id: e.target.value || null },
                  })
                }
                className="w-full h-10 px-3 rounded-xl bg-card border border-muted text-sm"
              >
                <option value="">No Project</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Deadline
                {task.deadline && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium ml-2",
                      deadlineColors.bg,
                      deadlineColors.text
                    )}
                  >
                    {formatDeadline(task.deadline)}
                  </span>
                )}
              </label>
              <Input
                type="date"
                value={task.deadline ? task.deadline.split("T")[0] : ""}
                onChange={(e) =>
                  updateTask.mutate({
                    id: taskId,
                    data: { deadline: e.target.value || null },
                  })
                }
                className="bg-card rounded-xl"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Subtasks
                {subtaskProgress.total > 0 && (
                  <span className="text-xs">
                    ({subtaskProgress.completed}/{subtaskProgress.total})
                  </span>
                )}
              </h3>
            </div>

            {/* Subtask Progress Bar */}
            {subtaskProgress.total > 0 && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${subtaskProgress.percent}%` }}
                />
              </div>
            )}

            {/* Subtask List */}
            <div className="space-y-2">
              {task.subtasks?.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-card/80 group"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) =>
                      toggleSubtask.mutate({
                        id: subtask.id,
                        completed: e.target.checked,
                        taskId,
                      })
                    }
                    className="h-4 w-4 rounded border-muted"
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask.mutate({ id: subtask.id, taskId })}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                className="bg-card rounded-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddSubtask}
                disabled={createSubtask.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Paperclip className="h-4 w-4" /> Attachments
                {task.attachments && task.attachments.length > 0 && (
                  <span className="text-xs">({task.attachments.length})</span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachModal(true)}
                className="text-primary"
              >
                <Plus className="h-4 w-4 mr-1" /> Attach File
              </Button>
            </div>

            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card group"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.file?.original_name || "Unknown file"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Attached by {attachment.attached_by}
                      </p>
                    </div>
                    {attachment.file?.public_url && (
                      <>
                        <a
                          href={attachment.file.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={attachment.file.public_url}
                          download={attachment.file.original_name}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() =>
                        detachFile.mutate({ taskId, fileId: attachment.file_id })
                      }
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Comments ({task.comments?.length || 0})
            </h3>

            {/* Comment List */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="group relative rounded-lg bg-card p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                          getAssigneeColor(comment.created_by as TaskAssignee)
                        )}
                      >
                        {getAssigneeInitials(comment.created_by as TaskAssignee)}
                      </div>
                      <span className="font-medium text-sm">{comment.created_by}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm pl-8 pr-8">{comment.content}</p>
                    <button
                      onClick={() => deleteComment.mutate({ id: comment.id, taskId })}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value as TaskAssignee)}
                  className="h-10 px-3 rounded-xl bg-card border border-muted text-sm w-32"
                >
                  <option value="">Who?</option>
                  {TASK_ASSIGNEES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="bg-card rounded-xl flex-1"
                />
                <Button onClick={handleAddComment} disabled={addComment.isPending || !commentAuthor}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-muted">
            <p>Created by {task.created_by} on {formatDate(task.created_at)}</p>
            {task.completed_at && <p>Completed on {formatDate(task.completed_at)}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-muted p-4 flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Attach File Modal */}
      {showAttachModal && (
        <AttachFileModal
          taskId={taskId}
          onClose={() => setShowAttachModal(false)}
        />
      )}
    </div>
  );
}
