import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { CreatorProtectedRoute } from "./CreatorProtectedRoute";

import { PermissionGuard } from "./RoleGuard";
import { CreatorLayout } from "@/components/creator-portal/CreatorLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";

// Admin Pages
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { CostsOverviewPage } from "@/pages/costs/CostsOverviewPage";
import { FixedCostsPage } from "@/pages/costs/FixedCostsPage";
import { RevenueOverviewPage } from "@/pages/revenue/RevenueOverviewPage";
import { BreakEvenPage } from "@/pages/analytics/BreakEvenPage";
import { PartnersListPage } from "@/pages/partners/PartnersListPage";
import { PartnerDetailPage } from "@/pages/partners/PartnerDetailPage";
import { PayoutsPage } from "@/pages/partners/PayoutsPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { UsersListPage } from "@/pages/users/UsersListPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SalesDemoPage } from "@/pages/sales/SalesDemoPage";
import { SalesCRMPage } from "@/pages/sales/SalesCRMPage";

import { AdminPermissionsPage } from "@/pages/settings/AdminPermissionsPage";
import { PerformanceDashboard } from "@/pages/performance/PerformanceDashboard";
import { BetaManagementPage } from "@/pages/beta/BetaManagementPage";
import { CrashesPage } from "@/pages/crashes/CrashesPage";
import { ContractsPage } from "@/pages/contracts/ContractsPage";
import { DealsPage } from "@/pages/deals/DealsPage";
import { AmbassadorControlPage } from "@/pages/ambassadors/AmbassadorControlPage";
import { SupabaseHealthPage } from "@/pages/health/SupabaseHealthPage";
import { TeamStoragePage } from "@/pages/storage/TeamStoragePage";

// Task Pages
import { TasksPage } from "@/pages/tasks/TasksPage";
import { ProjectsPage } from "@/pages/tasks/ProjectsPage";

// Lab Pages
import { LabDashboardPage } from "@/pages/lab/LabDashboardPage";
import { AthletesListPage } from "@/pages/lab/AthletesListPage";
import { AthleteDetailPage } from "@/pages/lab/AthleteDetailPage";

// Creator Portal Pages
import CreatorLogin from "@/pages/creator-portal/CreatorLogin";
import CreatorDashboard from "@/pages/creator-portal/CreatorDashboard";
import ReferralsPage from "@/pages/creator-portal/ReferralsPage";
import CreatorPayoutsPage from "@/pages/creator-portal/PayoutsPage";
import CreatorSettings from "@/pages/creator-portal/CreatorSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PermissionGuard permission="dashboard">
            <DashboardPage />
          </PermissionGuard>
        ),
      },

      // Costs
      { path: "costs", element: <CostsOverviewPage /> },
      { path: "costs/fixed", element: <FixedCostsPage /> },
      { path: "costs/services", element: <CostsOverviewPage /> },
      { path: "costs/users", element: <CostsOverviewPage /> },

      // Revenue
      { path: "revenue", element: <RevenueOverviewPage /> },

      // Analytics
      { path: "analytics/break-even", element: <BreakEvenPage /> },
      { path: "analytics/trends", element: <DashboardPage /> },

      // Creators (formerly Partners)
      { path: "partners", element: <PartnersListPage /> },
      { path: "partners/:id", element: <PartnerDetailPage /> },
      { path: "payouts", element: <PayoutsPage /> },
      { path: "contracts", element: <ContractsPage /> },
      { path: "deals", element: <DealsPage /> },

      // Ambassadors
      {
        path: "ambassadors",
        element: (
          <PermissionGuard permission="ambassadors">
            <AmbassadorControlPage />
          </PermissionGuard>
        ),
      },

      // Employees (Super Admin only)
      {
        path: "employees",
        element: (
          <PermissionGuard permission="employees" superAdminOnly>
            <EmployeesPage />
          </PermissionGuard>
        ),
      },

      // Performance (Super Admin only)
      {
        path: "performance",
        element: (
          <PermissionGuard permission="performance" superAdminOnly>
            <PerformanceDashboard />
          </PermissionGuard>
        ),
      },

      // Beta Management
      { path: "beta", element: <BetaManagementPage /> },

      // Crashes
      { path: "crashes", element: <CrashesPage /> },

      // Supabase Health
      { path: "health", element: <SupabaseHealthPage /> },

      // Team Storage
      { path: "storage", element: <TeamStoragePage /> },

      // Tasks
      { path: "tasks", element: <TasksPage /> },
      { path: "tasks/projects", element: <ProjectsPage /> },

      // Users
      { path: "users", element: <UsersListPage /> },

      // Settings
      { path: "settings/notifications", element: <DashboardPage /> },
      {
        path: "settings/permissions",
        element: (
          <PermissionGuard permission="settings" superAdminOnly>
            <AdminPermissionsPage />
          </PermissionGuard>
        ),
      },

      // Sales
      { path: "sales/demo", element: <SalesDemoPage /> },
      { path: "sales/crm", element: <SalesCRMPage /> },

      // Prometheus Lab
      {
        path: "lab",
        element: (
          <PermissionGuard permission="lab">
            <LabDashboardPage />
          </PermissionGuard>
        ),
      },
      {
        path: "lab/athletes",
        element: (
          <PermissionGuard permission="lab">
            <AthletesListPage />
          </PermissionGuard>
        ),
      },
      {
        path: "lab/athletes/:userId",
        element: (
          <PermissionGuard permission="lab">
            <AthleteDetailPage />
          </PermissionGuard>
        ),
      },

      // Influencers now live in the unified Creators system
      { path: "influencers", element: <Navigate to="/partners" replace /> },
    ],
  },

  // Creator Portal Routes
  {
    path: "/creator/login",
    element: <CreatorLogin />,
  },
  {
    path: "/creator",
    element: (
      <CreatorProtectedRoute>
        <CreatorLayout />
      </CreatorProtectedRoute>
    ),
    children: [
      { index: true, element: <CreatorDashboard /> },
      { path: "referrals", element: <ReferralsPage /> },
      { path: "payouts", element: <CreatorPayoutsPage /> },
      { path: "settings", element: <CreatorSettings /> },
    ],
  },

  // Legacy redirects (old /partner and /influencer routes)
  { path: "/partner/login", element: <Navigate to="/creator/login" replace /> },
  { path: "/partner/*", element: <Navigate to="/creator" replace /> },
  { path: "/influencer/login", element: <Navigate to="/creator/login" replace /> },
  { path: "/influencer/*", element: <Navigate to="/creator" replace /> },

  { path: "*", element: <NotFoundPage /> },
]);
