import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Users,
  Handshake,
  Building2,
  Bell,
  ChevronDown,
  BarChart3,
  Flame,
  Target,
  Instagram,
  ExternalLink,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/api/types/permissions";

interface NavChild {
  label: string;
  href: string;
  permission?: Permission;
  superAdminOnly?: boolean;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
  permission?: Permission; // Required permission for this nav item
  superAdminOnly?: boolean; // Only show for super admin
}

const allNavigation: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    permission: "dashboard",
  },
  {
    label: "Costs",
    icon: DollarSign,
    permission: "costs",
    children: [
      { label: "Overview", href: "/costs" },
      { label: "Fixed Costs", href: "/costs/fixed" },
      { label: "Service Costs", href: "/costs/services" },
      { label: "User Costs", href: "/costs/users" },
    ],
  },
  {
    label: "Revenue",
    icon: TrendingUp,
    href: "/revenue",
    permission: "revenue",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    permission: "analytics",
    children: [
      { label: "Break-Even", href: "/analytics/break-even" },
      { label: "Trends", href: "/analytics/trends" },
    ],
  },
  {
    label: "Partners",
    icon: Handshake,
    permission: "partners",
    children: [
      { label: "All Partners", href: "/partners" },
      { label: "Payouts", href: "/payouts" },
    ],
  },
  {
    label: "Employees",
    icon: Building2,
    href: "/employees",
    permission: "employees",
  },
  {
    label: "Performance",
    icon: Activity,
    href: "/performance",
    permission: "performance",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    permission: "users",
  },
  {
    label: "Sales",
    icon: Target,
    permission: "sales",
    children: [
      { label: "Demo Wizard", href: "/sales/demo" },
      { label: "Pipeline / CRM", href: "/sales/crm" },
    ],
  },
  {
    label: "Influencers",
    icon: Instagram,
    href: "/influencers",
    permission: "influencers",
  },
  {
    label: "Settings",
    icon: Bell,
    permission: "settings",
    children: [
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Admin Permissions", href: "/settings/permissions", superAdminOnly: true },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { hasPermission, isSuperAdmin, canAccessCRM } = useAuth();

  // Filter navigation based on user permissions
  const navigation = useMemo(() => {
    return allNavigation
      .filter((item) => {
        // If item requires a permission, check it
        if (item.permission && !hasPermission(item.permission)) {
          return false;
        }
        // If super admin only
        if (item.superAdminOnly && !isSuperAdmin) {
          return false;
        }
        return true;
      })
      .map((item) => {
        // Filter children based on permissions too
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => {
              if (child.superAdminOnly && !isSuperAdmin) {
                return false;
              }
              if (child.permission && !hasPermission(child.permission)) {
                return false;
              }
              return true;
            }),
          };
        }
        return item;
      });
  }, [hasPermission, isSuperAdmin]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isChildActive = (children?: { href: string }[]) => {
    if (!children) return false;
    return children.some((child) => location.pathname === child.href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-orange">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Prometheus Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isExpanded =
              expandedItems.includes(item.label) || isChildActive(item.children);

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                      isChildActive(item.children)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-xl px-3 py-2 text-sm transition-smooth",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.href!}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* External Portal Links - Only for CRM users */}
        {canAccessCRM && (
          <div className="border-t border-white/10 p-4 space-y-1">
            <a
              href="/partner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background/50 hover:text-foreground transition-smooth"
            >
              <div className="flex items-center gap-3">
                <Handshake className="h-5 w-5" />
                Partner Portal
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="/influencer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background/50 hover:text-foreground transition-smooth"
            >
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5" />
                Creator Portal
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
