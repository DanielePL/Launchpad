import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages
import { LoginPage } from "@/pages/auth/LoginPage";
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

      // Users
      { path: "users", element: <UsersListPage /> },

      // Settings
      { path: "settings/notifications", element: <DashboardPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
