import { useState } from "react";
import { Folder, Plus, MoreVertical, Archive, Trash2, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProjects, useUpdateProject, useDeleteProject, useTasks } from "@/hooks/useTasks";
import { NewProjectModal } from "@/components/tasks/NewProjectModal";
import type { TaskProject } from "@/api/types/tasks";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export function ProjectsPage() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { data: projects, isLoading } = useProjects(showArchived);
  const { data: allTasks } = useTasks();

  // Calculate task counts per project
  const getProjectStats = (projectId: string) => {
    if (!allTasks) return { total: 0, completed: 0 };
    const projectTasks = allTasks.filter((t) => t.project_id === projectId);
    const completed = projectTasks.filter((t) => t.status === "done").length;
    return { total: projectTasks.length, completed };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Folder className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Projects</h1>
            <p className="text-muted-foreground">
              Organize your tasks into projects
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              showArchived
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-card/80 text-muted-foreground"
            )}
          >
            <Archive className="w-4 h-4 inline mr-2" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              stats={getProjectStats(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center border border-primary/10">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <Folder className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first project to start organizing your tasks.
          </p>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />
    </div>
  );
}

interface ProjectCardProps {
  project: TaskProject;
  stats: { total: number; completed: number };
}

function ProjectCard({ project, stats }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleArchive = () => {
    updateProject.mutate({ id: project.id, data: { archived: !project.archived } });
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete project "${project.name}"? Tasks will be unassigned but not deleted.`)) {
      deleteProject.mutate(project.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl overflow-hidden transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]",
        project.archived && "opacity-60"
      )}
    >
      {/* Color Header */}
      <div
        className="h-2"
        style={{ backgroundColor: project.color }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <Folder className="h-5 w-5" style={{ color: project.color }} />
            </div>
            <div>
              <h3 className="font-bold">{project.name}</h3>
              {project.archived && (
                <span className="text-xs text-muted-foreground">Archived</span>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-lg bg-card border border-muted p-1 shadow-lg">
                <Link
                  to={`/tasks?project_id=${project.id}`}
                  className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => setShowMenu(false)}
                >
                  <CheckSquare className="h-4 w-4" />
                  View Tasks
                </Link>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <Archive className="h-4 w-4" />
                  {project.archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks</span>
            <span className="font-medium">
              {stats.completed} / {stats.total} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: project.color,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-muted/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Created by {project.created_by}</span>
          <span>{format(parseISO(project.created_at), "MMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
}
