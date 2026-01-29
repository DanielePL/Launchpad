import { useState } from "react";
import { X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/hooks/useTasks";
import type { TaskAssignee, CreateProjectInput } from "@/api/types/tasks";
import { TASK_ASSIGNEES, PROJECT_COLORS } from "@/api/types/tasks";
import { cn } from "@/lib/utils";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [createdBy, setCreatedBy] = useState<TaskAssignee | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !createdBy) return;

    const input: CreateProjectInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      created_by: createdBy,
    };

    try {
      await createProject.mutateAsync(input);
      // Reset form
      setName("");
      setDescription("");
      setColor(PROJECT_COLORS[0]);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Folder className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">New Project</h3>
              <p className="text-sm text-muted-foreground">Create a project to group tasks</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
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
              placeholder="What's this project about?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-card border border-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-offset-background ring-white"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              disabled={!name.trim() || !createdBy || createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
