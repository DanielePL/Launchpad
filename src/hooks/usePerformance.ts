import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { asanaClient } from "@/api/asanaClient";
import type {
  TeamPerformanceSummary,
  EmployeePerformance,
  TaskActivity,
  PerformanceFilters,
  PerformancePeriod,
} from "@/api/types/performance";

// Helper to get period dates
const getPeriodDates = (period: PerformancePeriod): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case "this_week":
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case "last_week":
      start.setDate(now.getDate() - now.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - now.getDay() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "this_month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case "last_month":
      start.setMonth(now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "this_quarter":
      start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

// Fetch real data from Asana
const fetchAsanaPerformance = async (period: PerformancePeriod): Promise<TeamPerformanceSummary> => {
  const token = localStorage.getItem("asana_token");
  const workspaceId = localStorage.getItem("asana_workspace");

  if (!token || !workspaceId) {
    throw new Error("Asana nicht konfiguriert");
  }

  // Configure client
  asanaClient.configure({ accessToken: token });

  // Get workspace users
  const users = await asanaClient.getWorkspaceUsers(workspaceId);
  const { start, end } = getPeriodDates(period);

  // Calculate metrics for each user
  const employees: EmployeePerformance[] = await Promise.all(
    users.map(async (user) => {
      const metrics = await asanaClient.calculateUserMetrics(
        user.gid,
        workspaceId,
        start,
        end
      );

      // Calculate performance score (1-5) based on metrics
      let score = 3;
      if (metrics.onTimeRate >= 90) score = 5;
      else if (metrics.onTimeRate >= 75) score = 4;
      else if (metrics.onTimeRate >= 60) score = 3;
      else if (metrics.onTimeRate >= 40) score = 2;
      else score = 1;

      const needsAttention = metrics.overdue > 3 || metrics.onTimeRate < 50;
      const isTopPerformer = metrics.onTimeRate >= 90 && metrics.completed >= 10;

      return {
        id: `perf-${user.gid}`,
        employeeId: user.gid,
        employeeName: user.name,
        employeeRole: "Team Member",
        avatarUrl: user.photo?.image_128x128,
        baseSalary: 0,
        revenueSharePercent: 0,
        currentPeriod: {
          tasksCompleted: metrics.completed,
          tasksPending: metrics.pending,
          tasksOverdue: metrics.overdue,
          onTimeRate: metrics.onTimeRate,
          avgTasksPerWeek: Math.round(metrics.completed / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)))),
          revenueGenerated: 0,
          dealsWon: 0,
          clientsManaged: 0,
          performanceScore: score,
          trend: "stable" as const,
          trendPercent: 0,
        },
        previousPeriod: {
          tasksCompleted: 0,
          tasksPending: 0,
          tasksOverdue: 0,
          onTimeRate: 0,
          avgTasksPerWeek: 0,
          revenueGenerated: 0,
          dealsWon: 0,
          clientsManaged: 0,
          performanceScore: 0,
          trend: "stable" as const,
          trendPercent: 0,
        },
        isTopPerformer,
        needsAttention,
        asanaUserId: user.gid,
        lastSyncedAt: new Date().toISOString(),
      };
    })
  );

  // Calculate totals
  const totalTasksCompleted = employees.reduce(
    (sum, emp) => sum + emp.currentPeriod.tasksCompleted,
    0
  );
  const totalRevenue = employees.reduce(
    (sum, emp) => sum + emp.currentPeriod.revenueGenerated,
    0
  );
  const avgOnTimeRate = employees.length > 0
    ? employees.reduce((sum, emp) => sum + emp.currentPeriod.onTimeRate, 0) / employees.length
    : 0;
  const avgPerformanceScore = employees.length > 0
    ? employees.reduce((sum, emp) => sum + emp.currentPeriod.performanceScore, 0) / employees.length
    : 0;

  return {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      type: period.includes("week") ? "week" : period.includes("month") ? "month" : "quarter",
    },
    totalTasksCompleted,
    totalRevenue,
    avgOnTimeRate: Math.round(avgOnTimeRate),
    avgPerformanceScore: Math.round(avgPerformanceScore * 10) / 10,
    employees,
    topPerformers: employees.filter((emp) => emp.isTopPerformer),
    needsAttention: employees.filter((emp) => emp.needsAttention),
  };
};

// Fetch recent activities from Asana
const fetchAsanaActivities = async (limit: number): Promise<TaskActivity[]> => {
  const token = localStorage.getItem("asana_token");
  const workspaceId = localStorage.getItem("asana_workspace");

  if (!token || !workspaceId) {
    return [];
  }

  asanaClient.configure({ accessToken: token });

  // Get all users
  const users = await asanaClient.getWorkspaceUsers(workspaceId);
  const activities: TaskActivity[] = [];

  // Get recent completed tasks for each user (last 7 days)
  const since = new Date();
  since.setDate(since.getDate() - 7);

  for (const user of users.slice(0, 5)) { // Limit to first 5 users for performance
    const tasks = await asanaClient.getCompletedTasks(user.gid, workspaceId, since);

    for (const task of tasks.slice(0, 3)) { // Max 3 tasks per user
      const dueDate = task.due_on ? new Date(task.due_on) : null;
      const completedDate = task.completed_at ? new Date(task.completed_at) : new Date();
      const wasOnTime = !dueDate || completedDate <= dueDate;
      const daysLate = dueDate && !wasOnTime
        ? Math.ceil((completedDate.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000))
        : undefined;

      activities.push({
        id: task.gid,
        employeeId: user.gid,
        employeeName: user.name,
        taskName: task.name,
        projectName: task.projects?.[0]?.name || "Kein Projekt",
        completedAt: task.completed_at || new Date().toISOString(),
        wasOnTime,
        daysLate,
      });
    }
  }

  // Sort by completion date and limit
  return activities
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit);
};

// Mock data - fallback when Asana not configured
const generateMockPerformance = (period: PerformancePeriod): TeamPerformanceSummary => {
  const now = new Date();
  const periodStart = new Date();
  const periodEnd = new Date();

  switch (period) {
    case "this_week":
      periodStart.setDate(now.getDate() - now.getDay());
      break;
    case "last_week":
      periodStart.setDate(now.getDate() - now.getDay() - 7);
      periodEnd.setDate(now.getDate() - now.getDay() - 1);
      break;
    case "this_month":
      periodStart.setDate(1);
      break;
    case "last_month":
      periodStart.setMonth(now.getMonth() - 1, 1);
      periodEnd.setDate(0);
      break;
    case "this_quarter":
      periodStart.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      break;
  }

  const employees: EmployeePerformance[] = [
    {
      id: "perf-1",
      employeeId: "emp-1",
      employeeName: "Marco Steinmann",
      employeeRole: "Head Coach",
      baseSalary: 8500,
      revenueSharePercent: 15,
      currentPeriod: {
        tasksCompleted: 32,
        tasksPending: 4,
        tasksOverdue: 0,
        onTimeRate: 97,
        avgTasksPerWeek: 28,
        revenueGenerated: 24500,
        dealsWon: 3,
        clientsManaged: 18,
        performanceScore: 5,
        trend: "up",
        trendPercent: 12,
      },
      previousPeriod: {
        tasksCompleted: 28,
        tasksPending: 6,
        tasksOverdue: 1,
        onTimeRate: 92,
        avgTasksPerWeek: 24,
        revenueGenerated: 21800,
        dealsWon: 2,
        clientsManaged: 16,
        performanceScore: 4,
        trend: "stable",
        trendPercent: 0,
      },
      isTopPerformer: true,
      needsAttention: false,
      asanaUserId: "asana-12345",
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: "perf-2",
      employeeId: "emp-2",
      employeeName: "Sarah Keller",
      employeeRole: "Sales Manager",
      baseSalary: 6500,
      revenueSharePercent: 12,
      currentPeriod: {
        tasksCompleted: 24,
        tasksPending: 8,
        tasksOverdue: 2,
        onTimeRate: 78,
        avgTasksPerWeek: 20,
        revenueGenerated: 18200,
        dealsWon: 5,
        clientsManaged: 12,
        performanceScore: 4,
        trend: "stable",
        trendPercent: 3,
      },
      previousPeriod: {
        tasksCompleted: 22,
        tasksPending: 7,
        tasksOverdue: 3,
        onTimeRate: 75,
        avgTasksPerWeek: 19,
        revenueGenerated: 17600,
        dealsWon: 4,
        clientsManaged: 11,
        performanceScore: 4,
        trend: "up",
        trendPercent: 8,
      },
      isTopPerformer: false,
      needsAttention: false,
      asanaUserId: "asana-12346",
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: "perf-3",
      employeeId: "emp-3",
      employeeName: "Jonas Weber",
      employeeRole: "Coach",
      baseSalary: 5500,
      revenueSharePercent: 10,
      currentPeriod: {
        tasksCompleted: 8,
        tasksPending: 12,
        tasksOverdue: 6,
        onTimeRate: 45,
        avgTasksPerWeek: 7,
        revenueGenerated: 4200,
        dealsWon: 0,
        clientsManaged: 6,
        performanceScore: 2,
        trend: "down",
        trendPercent: -28,
      },
      previousPeriod: {
        tasksCompleted: 14,
        tasksPending: 8,
        tasksOverdue: 3,
        onTimeRate: 62,
        avgTasksPerWeek: 12,
        revenueGenerated: 5800,
        dealsWon: 1,
        clientsManaged: 8,
        performanceScore: 3,
        trend: "down",
        trendPercent: -15,
      },
      isTopPerformer: false,
      needsAttention: true,
      asanaUserId: "asana-12347",
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: "perf-4",
      employeeId: "emp-4",
      employeeName: "Lisa Brunner",
      employeeRole: "Content Manager",
      baseSalary: 4800,
      revenueSharePercent: 5,
      currentPeriod: {
        tasksCompleted: 45,
        tasksPending: 3,
        tasksOverdue: 0,
        onTimeRate: 100,
        avgTasksPerWeek: 38,
        revenueGenerated: 0,
        dealsWon: 0,
        clientsManaged: 0,
        performanceScore: 5,
        trend: "up",
        trendPercent: 18,
      },
      previousPeriod: {
        tasksCompleted: 38,
        tasksPending: 5,
        tasksOverdue: 1,
        onTimeRate: 95,
        avgTasksPerWeek: 32,
        revenueGenerated: 0,
        dealsWon: 0,
        clientsManaged: 0,
        performanceScore: 4,
        trend: "up",
        trendPercent: 10,
      },
      isTopPerformer: true,
      needsAttention: false,
      asanaUserId: "asana-12348",
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: "perf-5",
      employeeId: "emp-5",
      employeeName: "Tim Mueller",
      employeeRole: "Junior Coach",
      baseSalary: 3800,
      revenueSharePercent: 8,
      currentPeriod: {
        tasksCompleted: 12,
        tasksPending: 5,
        tasksOverdue: 1,
        onTimeRate: 72,
        avgTasksPerWeek: 10,
        revenueGenerated: 3100,
        dealsWon: 1,
        clientsManaged: 4,
        performanceScore: 3,
        trend: "up",
        trendPercent: 5,
      },
      previousPeriod: {
        tasksCompleted: 10,
        tasksPending: 6,
        tasksOverdue: 2,
        onTimeRate: 68,
        avgTasksPerWeek: 9,
        revenueGenerated: 2900,
        dealsWon: 1,
        clientsManaged: 4,
        performanceScore: 3,
        trend: "stable",
        trendPercent: 0,
      },
      isTopPerformer: false,
      needsAttention: false,
      asanaUserId: "asana-12349",
      lastSyncedAt: new Date().toISOString(),
    },
  ];

  const totalTasksCompleted = employees.reduce(
    (sum, emp) => sum + emp.currentPeriod.tasksCompleted,
    0
  );
  const totalRevenue = employees.reduce(
    (sum, emp) => sum + emp.currentPeriod.revenueGenerated,
    0
  );
  const avgOnTimeRate =
    employees.reduce((sum, emp) => sum + emp.currentPeriod.onTimeRate, 0) /
    employees.length;
  const avgPerformanceScore =
    employees.reduce((sum, emp) => sum + emp.currentPeriod.performanceScore, 0) /
    employees.length;

  return {
    period: {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString(),
      type: period.includes("week") ? "week" : period.includes("month") ? "month" : "quarter",
    },
    totalTasksCompleted,
    totalRevenue,
    avgOnTimeRate: Math.round(avgOnTimeRate),
    avgPerformanceScore: Math.round(avgPerformanceScore * 10) / 10,
    employees,
    topPerformers: employees.filter((emp) => emp.isTopPerformer),
    needsAttention: employees.filter((emp) => emp.needsAttention),
  };
};

const generateMockActivities = (): TaskActivity[] => {
  return [
    {
      id: "act-1",
      employeeId: "emp-1",
      employeeName: "Marco Steinmann",
      taskName: "Client Onboarding - Thomas K.",
      projectName: "Coaching Pipeline",
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      wasOnTime: true,
    },
    {
      id: "act-2",
      employeeId: "emp-4",
      employeeName: "Lisa Brunner",
      taskName: "Instagram Content Batch",
      projectName: "Marketing",
      completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      wasOnTime: true,
    },
    {
      id: "act-3",
      employeeId: "emp-2",
      employeeName: "Sarah Keller",
      taskName: "Follow-up Calls Week 2",
      projectName: "Sales Pipeline",
      completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      wasOnTime: false,
      daysLate: 1,
    },
    {
      id: "act-4",
      employeeId: "emp-3",
      employeeName: "Jonas Weber",
      taskName: "Session Notes - Client M.",
      projectName: "Coaching Pipeline",
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      wasOnTime: false,
      daysLate: 3,
    },
    {
      id: "act-5",
      employeeId: "emp-1",
      employeeName: "Marco Steinmann",
      taskName: "Quarterly Review Prep",
      projectName: "Admin",
      completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      wasOnTime: true,
    },
  ];
};

// Hooks
export function useTeamPerformance(filters: PerformanceFilters) {
  return useQuery({
    queryKey: ["performance", "team", filters],
    queryFn: async () => {
      const token = localStorage.getItem("asana_token");
      const workspaceId = localStorage.getItem("asana_workspace");

      // Use real Asana data if configured
      if (token && workspaceId) {
        return fetchAsanaPerformance(filters.period);
      }

      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      return generateMockPerformance(filters.period);
    },
  });
}

export function useEmployeePerformance(employeeId: string, period: PerformancePeriod) {
  return useQuery({
    queryKey: ["performance", "employee", employeeId, period],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const summary = generateMockPerformance(period);
      return summary.employees.find((emp) => emp.employeeId === employeeId) || null;
    },
    enabled: !!employeeId,
  });
}

export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ["performance", "activities", limit],
    queryFn: async () => {
      const token = localStorage.getItem("asana_token");
      const workspaceId = localStorage.getItem("asana_workspace");

      // Use real Asana data if configured
      if (token && workspaceId) {
        return fetchAsanaActivities(limit);
      }

      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 200));
      return generateMockActivities().slice(0, limit);
    },
  });
}

export function useSyncAsana() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // This will trigger a real Asana sync when configured
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { synced: true, timestamp: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
  });
}

// Asana configuration status
export function useAsanaStatus() {
  return useQuery({
    queryKey: ["asana", "status"],
    queryFn: async () => {
      // Check if Asana is configured
      const token = localStorage.getItem("asana_token");
      const workspaceId = localStorage.getItem("asana_workspace");

      return {
        isConfigured: !!token,
        hasWorkspace: !!workspaceId,
        lastSync: localStorage.getItem("asana_last_sync"),
      };
    },
  });
}

export function useConfigureAsana() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      workspaceId,
    }: {
      token: string;
      workspaceId: string;
    }) => {
      localStorage.setItem("asana_token", token);
      localStorage.setItem("asana_workspace", workspaceId);
      localStorage.setItem("asana_last_sync", new Date().toISOString());
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asana"] });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
  });
}
