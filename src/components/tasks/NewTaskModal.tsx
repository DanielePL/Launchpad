import { useState } from "react";
import { X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useTasks";
import type { TaskPriority, TaskAssignee, CreateTaskInput } from "@/api/types/tasks";
import { TASK_ASSIGNEES, TASK_PRIORITIES } from "@/api/types/tasks";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export function NewTaskModal({ isOpen, onClose, defaultProjectId }: NewTaskModalProps) {
  const createTask = useCreateTask();
  const { data: projects } = useProjects();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<TaskAssignee | "">("");
  const [deadline, setDeadline] = useState("");
  const [createdBy, setCreatedBy] = useState<TaskAssignee | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !createdBy) return;

    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      project_id: projectId || undefined,
      priority,
      assignee: assignee || undefined,
      deadline: deadline || undefined,
      created_by: createdBy,
    };

    try {
      await createTask.mutateAsync(input);
      // Reset form
      setTitle("");
      setDescription("");
      setProjectId(defaultProjectId || "");
      setPriority("medium");
      setAssignee("");
      setDeadline("");
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">New Task</h3>
              <p className="text-sm text-muted-foreground">Create a new task</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-card rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Project + Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="">No Project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-11 px-4 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Deadline Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as TaskAssignee | "")}
                className="w-full h-11 px-4 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="">Unassigned</option>
                {TASK_ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Deadline</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-card rounded-xl"
              />
            </div>
          </div>

          {/* Created By */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Created By <span className="text-destructive">*</span>
            </label>
            <select
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value as TaskAssignee)}
              className="w-full h-11 px-4 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              required
            >
              <option value="">Select team member</option>
              {TASK_ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-muted/20">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
              disabled={!title.trim() || !createdBy || createTask.isPending}
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
