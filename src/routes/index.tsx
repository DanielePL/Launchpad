import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { PartnerProtectedRoute } from "./PartnerProtectedRoute";
import { InfluencerManagerProtectedRoute } from "./InfluencerManagerProtectedRoute";
import { InfluencerPortalProtectedRoute } from "./InfluencerPortalProtectedRoute";
import { PermissionGuard } from "./RoleGuard";
import { PartnerLayout } from "@/components/partner-portal/PartnerLayout";
import { InfluencerLayout } from "@/components/influencer-portal/InfluencerLayout";

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
import InfluencersPage from "@/pages/influencers/InfluencersPage";
import InfluencerManagerLogin from "@/pages/influencers/InfluencerManagerLogin";
import { AdminPermissionsPage } from "@/pages/settings/AdminPermissionsPage";
import { PerformanceDashboard } from "@/pages/performance/PerformanceDashboard";

// Partner Portal Pages
import PartnerLogin from "@/pages/partner-portal/PartnerLogin";
import PartnerDashboard from "@/pages/partner-portal/PartnerDashboard";
import ReferralsPage from "@/pages/partner-portal/ReferralsPage";
import PartnerPayoutsPage from "@/pages/partner-portal/PayoutsPage";
import PartnerSettings from "@/pages/partner-portal/PartnerSettings";

// Influencer Personal Portal Pages
import InfluencerLogin from "@/pages/influencer-portal/InfluencerLogin";
import InfluencerDashboard from "@/pages/influencer-portal/InfluencerDashboard";
import InfluencerCampaignsPage from "@/pages/influencer-portal/CampaignsPage";
import InfluencerEarningsPage from "@/pages/influencer-portal/EarningsPage";
import InfluencerSettings from "@/pages/influencer-portal/InfluencerSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },

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

      // Partners
      { path: "partners", element: <PartnersListPage /> },
      { path: "partners/:id", element: <PartnerDetailPage /> },
      { path: "payouts", element: <PayoutsPage /> },

      // Employees
      { path: "employees", element: <EmployeesPage /> },

      // Performance
      { path: "performance", element: <PerformanceDashboard /> },

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

      // Influencers - protected by InfluencerManagerProtectedRoute
      {
        path: "influencers",
        element: (
          <InfluencerManagerProtectedRoute>
            <InfluencersPage />
          </InfluencerManagerProtectedRoute>
        ),
      },
    ],
  },

  // Influencer Manager Login
  {
    path: "/influencers/login",
    element: <InfluencerManagerLogin />,
  },

  // Partner Portal Routes
  {
    path: "/partner/login",
    element: <PartnerLogin />,
  },
  {
    path: "/partner",
    element: (
      <PartnerProtectedRoute>
        <PartnerLayout />
      </PartnerProtectedRoute>
    ),
    children: [
      { index: true, element: <PartnerDashboard /> },
      { path: "referrals", element: <ReferralsPage /> },
      { path: "payouts", element: <PartnerPayoutsPage /> },
      { path: "settings", element: <PartnerSettings /> },
    ],
  },

  // Influencer Personal Portal Routes
  {
    path: "/influencer/login",
    element: <InfluencerLogin />,
  },
  {
    path: "/influencer",
    element: (
      <InfluencerPortalProtectedRoute>
        <InfluencerLayout />
      </InfluencerPortalProtectedRoute>
    ),
    children: [
      { index: true, element: <InfluencerDashboard /> },
      { path: "campaigns", element: <InfluencerCampaignsPage /> },
      { path: "earnings", element: <InfluencerEarningsPage /> },
      { path: "settings", element: <InfluencerSettings /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
