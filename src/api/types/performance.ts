// Employee Performance Types

export interface PerformanceMetrics {
  // Task metrics (from Asana)
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
  onTimeRate: number; // percentage 0-100
  avgTasksPerWeek: number;

  // Revenue metrics
  revenueGenerated: number;
  dealsWon: number;
  clientsManaged: number;

  // Calculated scores
  performanceScore: number; // 1-5 stars
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

export interface EmployeePerformance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  avatarUrl?: string;

  // Compensation info
  baseSalary: number;
  revenueSharePercent: number;

  // Current period metrics
  currentPeriod: PerformanceMetrics;

  // Previous period for comparison
  previousPeriod?: PerformanceMetrics;

  // Flags
  isTopPerformer: boolean;
  needsAttention: boolean;

  // Asana connection
  asanaUserId?: string;
  lastSyncedAt?: string;
}

export interface TeamPerformanceSummary {
  period: {
    start: string;
    end: string;
    type: "week" | "month" | "quarter";
  };

  // Aggregates
  totalTasksCompleted: number;
  totalRevenue: number;
  avgOnTimeRate: number;
  avgPerformanceScore: number;

  // Employee breakdown
  employees: EmployeePerformance[];

  // Alerts
  topPerformers: EmployeePerformance[];
  needsAttention: EmployeePerformance[];
}

export interface TaskActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  taskName: string;
  projectName: string;
  completedAt: string;
  wasOnTime: boolean;
  daysLate?: number;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  type: "tasks" | "revenue" | "on_time_rate";
  target: number;
  current: number;
  period: "week" | "month" | "quarter";
  startDate: string;
  endDate: string;
}

// Filter options
export type PerformancePeriod = "this_week" | "last_week" | "this_month" | "last_month" | "this_quarter";

export interface PerformanceFilters {
  period: PerformancePeriod;
  employeeId?: string;
  sortBy: "score" | "tasks" | "revenue" | "on_time";
  sortOrder: "asc" | "desc";
}
