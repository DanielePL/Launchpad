import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { CreatorProtectedRoute } from "./CreatorProtectedRoute";
import { PermissionGuard } from "./RoleGuard";
import { Rocket } from "lucide-react";

// Lazy loading wrapper
const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Rocket className="h-8 w-8 text-primary animate-pulse" />
      </div>
    }
  >
    {children}
  </Suspense>
);

// Auth Pages - loaded immediately (critical path)
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { CreateOrganizationPage } from "@/pages/onboarding/CreateOrganizationPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Lazy loaded pages - only load when needed
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const CostsOverviewPage = lazy(() => import("@/pages/costs/CostsOverviewPage").then(m => ({ default: m.CostsOverviewPage })));
const FixedCostsPage = lazy(() => import("@/pages/costs/FixedCostsPage").then(m => ({ default: m.FixedCostsPage })));
const RevenueOverviewPage = lazy(() => import("@/pages/revenue/RevenueOverviewPage").then(m => ({ default: m.RevenueOverviewPage })));
const BreakEvenPage = lazy(() => import("@/pages/analytics/BreakEvenPage").then(m => ({ default: m.BreakEvenPage })));
const PartnersListPage = lazy(() => import("@/pages/partners/PartnersListPage").then(m => ({ default: m.PartnersListPage })));
const PartnerDetailPage = lazy(() => import("@/pages/partners/PartnerDetailPage").then(m => ({ default: m.PartnerDetailPage })));
const PayoutsPage = lazy(() => import("@/pages/partners/PayoutsPage").then(m => ({ default: m.PayoutsPage })));
const EmployeesPage = lazy(() => import("@/pages/employees/EmployeesPage").then(m => ({ default: m.EmployeesPage })));
const UsersListPage = lazy(() => import("@/pages/users/UsersListPage").then(m => ({ default: m.UsersListPage })));
const SalesDemoPage = lazy(() => import("@/pages/sales/SalesDemoPage").then(m => ({ default: m.SalesDemoPage })));
const SalesCRMPage = lazy(() => import("@/pages/sales/SalesCRMPage").then(m => ({ default: m.SalesCRMPage })));
const AdminPermissionsPage = lazy(() => import("@/pages/settings/AdminPermissionsPage").then(m => ({ default: m.AdminPermissionsPage })));
const PerformanceDashboard = lazy(() => import("@/pages/performance/PerformanceDashboard").then(m => ({ default: m.PerformanceDashboard })));
const BetaManagementPage = lazy(() => import("@/pages/beta/BetaManagementPage").then(m => ({ default: m.BetaManagementPage })));
const CrashesPage = lazy(() => import("@/pages/crashes/CrashesPage").then(m => ({ default: m.CrashesPage })));
const ContractsPage = lazy(() => import("@/pages/contracts/ContractsPage").then(m => ({ default: m.ContractsPage })));
const DealsPage = lazy(() => import("@/pages/deals/DealsPage").then(m => ({ default: m.DealsPage })));
const AmbassadorControlPage = lazy(() => import("@/pages/ambassadors/AmbassadorControlPage").then(m => ({ default: m.AmbassadorControlPage })));
const SupabaseHealthPage = lazy(() => import("@/pages/health/SupabaseHealthPage").then(m => ({ default: m.SupabaseHealthPage })));
const TeamStoragePage = lazy(() => import("@/pages/storage/TeamStoragePage").then(m => ({ default: m.TeamStoragePage })));
const TasksPage = lazy(() => import("@/pages/tasks/TasksPage").then(m => ({ default: m.TasksPage })));
const ProjectsPage = lazy(() => import("@/pages/tasks/ProjectsPage").then(m => ({ default: m.ProjectsPage })));
const LabDashboardPage = lazy(() => import("@/pages/lab/LabDashboardPage").then(m => ({ default: m.LabDashboardPage })));
const AthletesListPage = lazy(() => import("@/pages/lab/AthletesListPage").then(m => ({ default: m.AthletesListPage })));
const AthleteDetailPage = lazy(() => import("@/pages/lab/AthleteDetailPage").then(m => ({ default: m.AthleteDetailPage })));
const LoginAuditPage = lazy(() => import("@/pages/security/LoginAuditPage").then(m => ({ default: m.LoginAuditPage })));
const ActivityLogPage = lazy(() => import("@/pages/security/ActivityLogPage").then(m => ({ default: m.ActivityLogPage })));
const InfluencerTermsPage = lazy(() => import("@/pages/legal/InfluencerTermsPage").then(m => ({ default: m.InfluencerTermsPage })));
const TeamMembersPage = lazy(() => import("@/pages/organization/TeamMembersPage").then(m => ({ default: m.TeamMembersPage })));
const OrganizationSettingsPage = lazy(() => import("@/pages/organization/OrganizationSettingsPage").then(m => ({ default: m.OrganizationSettingsPage })));
const BillingPage = lazy(() => import("@/pages/billing/BillingPage").then(m => ({ default: m.BillingPage })));
const PlansPage = lazy(() => import("@/pages/billing/PlansPage").then(m => ({ default: m.PlansPage })));
const AppLaunchDashboard = lazy(() => import("@/pages/app-launch/AppLaunchDashboard").then(m => ({ default: m.AppLaunchDashboard })));
const AppProjectPage = lazy(() => import("@/pages/app-launch/AppProjectPage").then(m => ({ default: m.AppProjectPage })));
const AIAssistantPage = lazy(() => import("@/pages/app-launch/AIAssistantPage").then(m => ({ default: m.AIAssistantPage })));
const AssetStudioPage = lazy(() => import("@/pages/app-launch/AssetStudioPage").then(m => ({ default: m.AssetStudioPage })));
const LaunchAssistantPage = lazy(() => import("@/pages/app-launch/LaunchAssistantPage").then(m => ({ default: m.LaunchAssistantPage })));
const CredentialsPage = lazy(() => import("@/pages/app-launch/CredentialsPage").then(m => ({ default: m.CredentialsPage })));
const StoreListingPage = lazy(() => import("@/pages/app-launch/StoreListingPage").then(m => ({ default: m.StoreListingPage })));

// Creator Portal - lazy loaded
const CreatorLayout = lazy(() => import("@/components/creator-portal/CreatorLayout").then(m => ({ default: m.CreatorLayout })));
const CreatorLogin = lazy(() => import("@/pages/creator-portal/CreatorLogin"));
const CreatorDashboard = lazy(() => import("@/pages/creator-portal/CreatorDashboard"));
const ReferralsPage = lazy(() => import("@/pages/creator-portal/ReferralsPage"));
const CreatorPayoutsPage = lazy(() => import("@/pages/creator-portal/PayoutsPage"));
const CreatorSettings = lazy(() => import("@/pages/creator-portal/CreatorSettings"));

export const router = createBrowserRouter([
  // Auth Routes (public) - NOT lazy loaded for instant access
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
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },

  // Legal Routes (public)
  {
    path: "/legal/influencer-terms",
    element: <LazyLoad><InfluencerTermsPage /></LazyLoad>,
  },

  // Onboarding Routes
  {
    path: "/onboarding/create-organization",
    element: <CreateOrganizationPage />,
  },

  // Main App Routes (protected + lazy)
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
            <LazyLoad><DashboardPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Costs
      {
        path: "costs",
        element: (
          <PermissionGuard permission="costs">
            <LazyLoad><CostsOverviewPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "costs/fixed",
        element: (
          <PermissionGuard permission="costs">
            <LazyLoad><FixedCostsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "costs/services",
        element: (
          <PermissionGuard permission="costs">
            <LazyLoad><CostsOverviewPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "costs/users",
        element: (
          <PermissionGuard permission="costs">
            <LazyLoad><CostsOverviewPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Revenue
      {
        path: "revenue",
        element: (
          <PermissionGuard permission="revenue">
            <LazyLoad><RevenueOverviewPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Analytics
      {
        path: "analytics/break-even",
        element: (
          <PermissionGuard permission="analytics">
            <LazyLoad><BreakEvenPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "analytics/trends",
        element: (
          <PermissionGuard permission="analytics">
            <LazyLoad><DashboardPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Creators (formerly Partners)
      {
        path: "partners",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><PartnersListPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "partners/:id",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><PartnerDetailPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "payouts",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><PayoutsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "contracts",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><ContractsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "deals",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><DealsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Ambassadors
      {
        path: "ambassadors",
        element: (
          <PermissionGuard permission="creators">
            <LazyLoad><AmbassadorControlPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Employees (Owner/Admin only)
      {
        path: "employees",
        element: (
          <PermissionGuard permission="employees" adminOnly>
            <LazyLoad><EmployeesPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Performance (Owner only)
      {
        path: "performance",
        element: (
          <PermissionGuard permission="performance" ownerOnly>
            <LazyLoad><PerformanceDashboard /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Beta Management
      {
        path: "beta",
        element: (
          <PermissionGuard permission="users">
            <LazyLoad><BetaManagementPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Crashes
      {
        path: "crashes",
        element: (
          <PermissionGuard permission="users">
            <LazyLoad><CrashesPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Supabase Health
      {
        path: "health",
        element: (
          <PermissionGuard adminOnly>
            <LazyLoad><SupabaseHealthPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Team Storage
      {
        path: "storage",
        element: (
          <PermissionGuard permission="storage">
            <LazyLoad><TeamStoragePage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Tasks
      {
        path: "tasks",
        element: (
          <PermissionGuard permission="tasks">
            <LazyLoad><TasksPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "tasks/projects",
        element: (
          <PermissionGuard permission="tasks">
            <LazyLoad><ProjectsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Users
      {
        path: "users",
        element: (
          <PermissionGuard permission="users">
            <LazyLoad><UsersListPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Settings
      {
        path: "settings/notifications",
        element: <LazyLoad><DashboardPage /></LazyLoad>,
      },
      {
        path: "settings/permissions",
        element: (
          <PermissionGuard ownerOnly>
            <LazyLoad><AdminPermissionsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Organization Settings
      {
        path: "settings/organization",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <LazyLoad><OrganizationSettingsPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "settings/team",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <LazyLoad><TeamMembersPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Billing
      {
        path: "settings/billing",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <LazyLoad><BillingPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "billing/plans",
        element: (
          <PermissionGuard permission="settings" adminOnly>
            <LazyLoad><PlansPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Sales
      {
        path: "sales/demo",
        element: (
          <PermissionGuard permission="sales">
            <LazyLoad><SalesDemoPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "sales/crm",
        element: (
          <PermissionGuard permission="sales">
            <LazyLoad><SalesCRMPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // Prometheus Lab
      {
        path: "lab",
        element: (
          <PermissionGuard permission="lab">
            <LazyLoad><LabDashboardPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "lab/athletes",
        element: (
          <PermissionGuard permission="lab">
            <LazyLoad><AthletesListPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "lab/athletes/:userId",
        element: (
          <PermissionGuard permission="lab">
            <LazyLoad><AthleteDetailPage /></LazyLoad>
          </PermissionGuard>
        ),
      },

      // App Launch
      {
        path: "app-launch",
        element: <LazyLoad><AppLaunchDashboard /></LazyLoad>,
      },
      {
        path: "app-launch/new",
        element: <LazyLoad><LaunchAssistantPage /></LazyLoad>,
      },
      {
        path: "app-launch/project/:id",
        element: <LazyLoad><AppProjectPage /></LazyLoad>,
      },
      {
        path: "app-launch/project/:id/assets",
        element: <LazyLoad><AssetStudioPage /></LazyLoad>,
      },
      {
        path: "app-launch/project/:id/store-listing",
        element: <LazyLoad><StoreListingPage /></LazyLoad>,
      },
      {
        path: "app-launch/project/:id/credentials",
        element: <LazyLoad><CredentialsPage /></LazyLoad>,
      },
      {
        path: "app-launch/assistant",
        element: <LazyLoad><AIAssistantPage /></LazyLoad>,
      },

      // Security (Owner/Admin only)
      {
        path: "security/login-audit",
        element: (
          <PermissionGuard ownerOnly>
            <LazyLoad><LoginAuditPage /></LazyLoad>
          </PermissionGuard>
        ),
      },
      {
        path: "security/activity-log",
        element: (
          <PermissionGuard adminOnly>
            <LazyLoad><ActivityLogPage /></LazyLoad>
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
    element: <LazyLoad><CreatorLogin /></LazyLoad>,
  },
  {
    path: "/creator",
    element: (
      <CreatorProtectedRoute>
        <LazyLoad><CreatorLayout /></LazyLoad>
      </CreatorProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyLoad><CreatorDashboard /></LazyLoad> },
      { path: "referrals", element: <LazyLoad><ReferralsPage /></LazyLoad> },
      { path: "payouts", element: <LazyLoad><CreatorPayoutsPage /></LazyLoad> },
      { path: "settings", element: <LazyLoad><CreatorSettings /></LazyLoad> },
    ],
  },

  // Legacy redirects
  { path: "/partner/login", element: <Navigate to="/creator/login" replace /> },
  { path: "/partner/*", element: <Navigate to="/creator" replace /> },
  { path: "/influencer/login", element: <Navigate to="/creator/login" replace /> },
  { path: "/influencer/*", element: <Navigate to="/creator" replace /> },

  { path: "*", element: <NotFoundPage /> },
]);
