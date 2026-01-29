import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ArrowRight, CheckSquare } from "lucide-react";
import { useDeadlineAlerts } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEADLINE_COLORS,
  PRIORITY_COLORS,
  getAssigneeInitials,
  getAssigneeColor,
} from "@/api/types/tasks";
import type { DeadlineAlert, TaskAssignee } from "@/api/types/tasks";
import { cn } from "@/lib/utils";

export function TaskDeadlineWidget() {
  const { data: alerts, isLoading } = useDeadlineAlerts();

  const overdueAlerts = alerts?.filter((a) => a.urgency === "overdue") || [];
  const upcomingAlerts = alerts?.filter((a) => a.urgency !== "overdue").slice(0, 5) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Overdue Tasks */}
      <OverdueWidget alerts={overdueAlerts} isLoading={isLoading} />

      {/* Due Soon */}
      <DueSoonWidget alerts={upcomingAlerts} isLoading={isLoading} />
    </div>
  );
}

function OverdueWidget({
  alerts,
  isLoading,
}: {
  alerts: DeadlineAlert[];
  isLoading: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5 border-2 border-red-500/20 bg-red-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold">Overdue Tasks</h3>
            <p className="text-xs text-muted-foreground">
              {alerts.length} task{alerts.length !== 1 ? "s" : ""} past deadline
            </p>
          </div>
        </div>
        <Link to="/tasks?overdue=true">
          <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => (
            <AlertItem key={alert.task.id} alert={alert} />
          ))}
          {alerts.length > 5 && (
            <Link
              to="/tasks?overdue=true"
              className="block text-center text-sm text-red-400 hover:text-red-300 py-2"
            >
              + {alerts.length - 5} more overdue
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <CheckSquare className="w-6 h-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No overdue tasks!</p>
        </div>
      )}
    </div>
  );
}

function DueSoonWidget({
  alerts,
  isLoading,
}: {
  alerts: DeadlineAlert[];
  isLoading: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5 border-2 border-orange-500/20 bg-orange-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold">Due Soon</h3>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </div>
        </div>
        <Link to="/tasks?due_soon=true">
          <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertItem key={alert.task.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert }: { alert: DeadlineAlert }) {
  const { task, urgency, days_remaining } = alert;
  const deadlineColors = DEADLINE_COLORS[urgency];
  const priorityColors = PRIORITY_COLORS[task.priority];

  const getDeadlineText = () => {
    if (days_remaining < 0) {
      return `${Math.abs(days_remaining)} day${Math.abs(days_remaining) !== 1 ? "s" : ""} overdue`;
    }
    if (days_remaining === 0) {
      return "Due today";
    }
    if (days_remaining === 1) {
      return "Due tomorrow";
    }
    return `${days_remaining} days left`;
  };

  return (
    <Link
      to={`/tasks`}
      className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {task.assignee && (
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
              getAssigneeColor(task.assignee as TaskAssignee)
            )}
          >
            {getAssigneeInitials(task.assignee as TaskAssignee)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{task.title}</p>
          <div className="flex items-center gap-2 text-xs">
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
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium capitalize",
                priorityColors.bg,
                priorityColors.text
              )}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2",
          deadlineColors.bg,
          deadlineColors.text
        )}
      >
        {getDeadlineText()}
      </span>
    </Link>
  );
}
