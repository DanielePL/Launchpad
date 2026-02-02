import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { CreatorProtectedRoute } from "./CreatorProtectedRoute";

import { PermissionGuard } from "./RoleGuard";
import { CreatorLayout } from "@/components/creator-portal/CreatorLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

// Onboarding Pages
import { CreateOrganizationPage } from "@/pages/onboarding/CreateOrganizationPage";

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

// Security Pages
import { LoginAuditPage } from "@/pages/security/LoginAuditPage";
import { ActivityLogPage } from "@/pages/security/ActivityLogPage";

// Legal Pages (public)
import { InfluencerTermsPage } from "@/pages/legal/InfluencerTermsPage";

// Organization Pages
import { TeamMembersPage } from "@/pages/organization/TeamMembersPage";
import { OrganizationSettingsPage } from "@/pages/organization/OrganizationSettingsPage";

// Billing Pages
import { BillingPage } from "@/pages/billing/BillingPage";
import { PlansPage } from "@/pages/billing/PlansPage";

// App Launch Pages
import { AppLaunchDashboard } from "@/pages/app-launch/AppLaunchDashboard";
import { AppProjectPage } from "@/pages/app-launch/AppProjectPage";
import { AIAssistantPage } from "@/pages/app-launch/AIAssistantPage";
import { AssetStudioPage } from "@/pages/app-launch/AssetStudioPage";

// Creator Portal Pages
import CreatorLogin from "@/pages/creator-portal/CreatorLogin";
import CreatorDashboard from "@/pages/creator-portal/CreatorDashboard";
import ReferralsPage from "@/pages/creator-portal/ReferralsPage";
import CreatorPayoutsPage from "@/pages/creator-portal/PayoutsPage";
import CreatorSettings from "@/pages/creator-portal/CreatorSettings";

export const router = createBrowserRouter([
  // Auth Routes (public)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  // Legal Routes (public - no login required)
  {
    path: "/legal/influencer-terms",
    element: <InfluencerTermsPage />,
  },

  // Onboarding Routes
  {
    path: "/onboarding/create-organization",
    element: <CreateOrganizationPage />,
  },

  // Main App Routes (protected)
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
      {
        path: "costs",
        element: (
          <PermissionGuard permission="costs">
            <CostsOverviewPage />
          </PermissionGuard>
        ),
      },
      {
        path: "costs/fixed",
        element: (
          <PermissionGuard permission="costs">
            <FixedCostsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "costs/services",
        element: (
          <PermissionGuard permission="costs">
            <CostsOverviewPage />
          </PermissionGuard>
        ),
      },
      {
        path: "costs/users",
        element: (
          <PermissionGuard permission="costs">
            <CostsOverviewPage />
          </PermissionGuard>
        ),
      },

      // Revenue
      {
        path: "revenue",
        element: (
          <PermissionGuard permission="revenue">
            <RevenueOverviewPage />
          </PermissionGuard>
        ),
      },

      // Analytics
      {
        path: "analytics/break-even",
        element: (
          <PermissionGuard permission="analytics">
            <BreakEvenPage />
          </PermissionGuard>
        ),
      },
      {
        path: "analytics/trends",
        element: (
          <PermissionGuard permission="analytics">
            <DashboardPage />
          </PermissionGuard>
        ),
      },

      // Creators (formerly Partners)
      {
        path: "partners",
        element: (
          <PermissionGuard permission="creators">
            <PartnersListPage />
          </PermissionGuard>
        ),
      },
      {
        path: "partners/:id",
        element: (
          <PermissionGuard permission="creators">
            <PartnerDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: "payouts",
        element: (
          <PermissionGuard permission="creators">
            <PayoutsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "contracts",
        element: (
          <PermissionGuard permission="creators">
            <ContractsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "deals",
        element: (
          <PermissionGuard permission="creators">
            <DealsPage />
          </PermissionGuard>
        ),
      },

      // Ambassadors
      {
        path: "ambassadors",
        element: (
          <PermissionGuard permission="creators">
            <AmbassadorControlPage />
          </PermissionGuard>
        ),
      },

      // Employees (Owner/Admin only)
      {
        path: "employees",
        element: (
          <PermissionGuard permission="employees" adminOnly>
            <EmployeesPage />
          </PermissionGuard>
        ),
      },

      // Performance (Owner only)
      {
        path: "performance",
        element: (
          <PermissionGuard permission="performance" ownerOnly>
            <PerformanceDashboard />
          </PermissionGuard>
        ),
      },

      // Beta Management
      {
        path: "beta",
        element: (
          <PermissionGuard permission="users">
            <BetaManagementPage />
          </PermissionGuard>
        ),
      },

      // Crashes
      {
        path: "crashes",
        element: (
          <PermissionGuard permission="users">
            <CrashesPage />
          </PermissionGuard>
        ),
      },

      // Supabase Health
      {
        path: "health",
        element: (
          <PermissionGuard adminOnly>
            <SupabaseHealthPage />
          </PermissionGuard>
        ),
      },

      // Team Storage
      {
        path: "storage",
        element: (
          <PermissionGuard permission="storage">
            <TeamStoragePage />
          </PermissionGuard>
        ),
      },

      // Tasks
      {
        path: "tasks",
        element: (
          <PermissionGuard permission="tasks">
            <TasksPage />
          </PermissionGuard>
        ),
      },
      {
        path: "tasks/projects",
        element: (
          <PermissionGuard permission="tasks">
            <ProjectsPage />
          </PermissionGuard>
        ),
      },

      // Users
      {
        path: "users",
        element: (
          <PermissionGuard permission="users">
            <UsersListPage />
          </PermissionGuard>
        ),
      },

      // Settings
      {
        path: "settings/notifications",
        element: <DashboardPage />,
      },
      {
        path: "settings/permissions",
        element: (
          <PermissionGuard ownerOnly>
            <AdminPermissionsPage />
          </PermissionGuard>
        ),
      },

      // Organization Settings (new)
      {
        path: "settings/organization",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <OrganizationSettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "settings/team",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <TeamMembersPage />
          </PermissionGuard>
        ),
      },

      // Billing
      {
        path: "settings/billing",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <BillingPage />
          </PermissionGuard>
        ),
      },
      {
        path: "billing/plans",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <PlansPage />
          </PermissionGuard>
        ),
      },

      // Sales
      {
        path: "sales/demo",
        element: (
          <PermissionGuard permission="sales">
            <SalesDemoPage />
          </PermissionGuard>
        ),
      },
      {
        path: "sales/crm",
        element: (
          <PermissionGuard permission="sales">
            <SalesCRMPage />
          </PermissionGuard>
        ),
      },

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

      // App Launch
      {
        path: "app-launch",
        element: <AppLaunchDashboard />,
      },
      {
        path: "app-launch/project/:id",
        element: <AppProjectPage />,
      },
      {
        path: "app-launch/project/:id/assets",
        element: <AssetStudioPage />,
      },
      {
        path: "app-launch/assistant",
        element: <AIAssistantPage />,
      },

      // Security (Owner/Admin only)
      {
        path: "security/login-audit",
        element: (
          <PermissionGuard ownerOnly>
            <LoginAuditPage />
          </PermissionGuard>
        ),
      },
      {
        path: "security/activity-log",
        element: (
          <PermissionGuard adminOnly>
            <ActivityLogPage />
          </PermissionGuard>
        ),
      },

      // Redirects for old routes
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
