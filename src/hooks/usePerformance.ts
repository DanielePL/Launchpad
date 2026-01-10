import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TeamPerformanceSummary,
  EmployeePerformance,
  TaskActivity,
  PerformanceFilters,
  PerformancePeriod,
} from "@/api/types/performance";

// Mock data - will be replaced with real Asana integration
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
      // Simulate API delay
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
