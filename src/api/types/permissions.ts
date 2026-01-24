// Fixed admin email accounts
export const ADMIN_EMAILS = {
  SUPER_ADMIN: "management@prometheus.coach",
  ADMIN: "admin@prometheus.coach",
  CAMPUS: "campus@prometheus.coach",
  PARTNER_MANAGER: "partners@prometheus.coach",
} as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[keyof typeof ADMIN_EMAILS];

// All valid admin emails
export const VALID_ADMIN_EMAILS: AdminEmail[] = [
  ADMIN_EMAILS.SUPER_ADMIN,
  ADMIN_EMAILS.ADMIN,
  ADMIN_EMAILS.CAMPUS,
  ADMIN_EMAILS.PARTNER_MANAGER,
];

// Admin account credentials and metadata
export interface AdminAccount {
  email: AdminEmail;
  name: string;
  password: string;
  role: "super_admin" | "admin" | "campus" | "partner_manager";
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: ADMIN_EMAILS.SUPER_ADMIN,
    name: "Daniele",
    password: "Ichiban_11",
    role: "super_admin",
  },
  {
    email: ADMIN_EMAILS.ADMIN,
    name: "Karin",
    password: "karin2026",
    role: "admin",
  },
  {
    email: ADMIN_EMAILS.CAMPUS,
    name: "Sjoerd",
    password: "sjoerd2026",
    role: "campus",
  },
  {
    email: ADMIN_EMAILS.PARTNER_MANAGER,
    name: "Valerie",
    password: "valerie2026",
    role: "partner_manager",
  },
];

// Standard permissions (areas in the admin portal)
export type Permission =
  | "dashboard"
  | "costs"
  | "costs:fixed"
  | "costs:services"
  | "costs:users"
  | "revenue"
  | "analytics"
  | "analytics:break-even"
  | "analytics:trends"
  | "partners"
  | "partners:payouts"
  | "partners:create"
  | "employees"
  | "performance"
  | "users"
  | "sales"
  | "sales:demo"
  | "sales:crm"
  | "influencers"
  | "settings";

// Predefined permissions for each role
export const ROLE_PERMISSIONS: Record<AdminAccount["role"], Permission[]> = {
  super_admin: [
    "dashboard", "costs", "revenue", "analytics", "partners", "partners:create",
    "employees", "performance", "users", "sales", "influencers", "settings",
  ],
  admin: [
    "dashboard", "costs", "revenue", "analytics", "partners",
    "users", "sales", "influencers", "settings",
  ],
  campus: [
    "dashboard", "costs", "revenue", "analytics", "partners",
    "users", "sales", "influencers", "settings",
  ],
  partner_manager: [
    "partners", "influencers",
  ],
};

// Sensitive permissions (compensation data)
export type SensitivePermission =
  | "compensation:view"    // View salaries, bonuses, revenue shares
  | "compensation:edit";   // Edit compensation (super admin only)

// Permission configuration for UI
export interface PermissionConfig {
  id: Permission;
  label: string;
  description?: string;
  children?: Permission[];
}

export const PERMISSION_CONFIG: PermissionConfig[] = [
  { id: "dashboard", label: "Dashboard" },
  {
    id: "costs",
    label: "Costs",
    children: ["costs:fixed", "costs:services", "costs:users"],
  },
  { id: "costs:fixed", label: "Fixed Costs" },
  { id: "costs:services", label: "Service Costs" },
  { id: "costs:users", label: "User Costs" },
  { id: "revenue", label: "Revenue" },
  {
    id: "analytics",
    label: "Analytics",
    children: ["analytics:break-even", "analytics:trends"],
  },
  { id: "analytics:break-even", label: "Break-Even" },
  { id: "analytics:trends", label: "Trends" },
  {
    id: "partners",
    label: "Partners",
    children: ["partners:payouts", "partners:create"],
  },
  { id: "partners:payouts", label: "Payouts" },
  { id: "partners:create", label: "Create Partners" },
  { id: "employees", label: "Employees" },
  { id: "performance", label: "Performance" },
  { id: "users", label: "Users" },
  {
    id: "sales",
    label: "Sales",
    children: ["sales:demo", "sales:crm"],
  },
  { id: "sales:demo", label: "Demo Wizard" },
  { id: "sales:crm", label: "Pipeline / CRM" },
  { id: "influencers", label: "Influencers" },
  { id: "settings", label: "Settings" },
];

// Top-level permissions for the UI checkboxes
export const TOP_LEVEL_PERMISSIONS: PermissionConfig[] = PERMISSION_CONFIG.filter(
  (p) => !p.id.includes(":")
);

// Admin permissions stored in database
export interface AdminPermissions {
  email: AdminEmail;
  permissions: Permission[];
  sensitive_permissions: SensitivePermission[];
  updated_at: string;
  updated_by: string;
}

// Helper to check if email is super admin
export function isSuperAdmin(email: string): boolean {
  return email === ADMIN_EMAILS.SUPER_ADMIN;
}

// Helper to check if email is valid admin
export function isValidAdminEmail(email: string): email is AdminEmail {
  return VALID_ADMIN_EMAILS.includes(email as AdminEmail);
}

// Helper to check if user has a specific permission
export function hasPermission(
  userPermissions: Permission[],
  required: Permission,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;

  // Check exact match
  if (userPermissions.includes(required)) return true;

  // Check parent permission (e.g., "costs" grants access to "costs:fixed")
  const parent = required.split(":")[0] as Permission;
  if (parent !== required && userPermissions.includes(parent)) return true;

  return false;
}

// Helper to check sensitive permission
export function hasSensitivePermission(
  sensitivePermissions: SensitivePermission[],
  required: SensitivePermission,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  return sensitivePermissions.includes(required);
}
