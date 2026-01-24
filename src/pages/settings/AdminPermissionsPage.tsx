import { useState } from "react";
import { Shield, Check, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Permission,
  type SensitivePermission,
  ADMIN_EMAILS,
  TOP_LEVEL_PERMISSIONS,
} from "@/api/types/permissions";
import { cn } from "@/lib/utils";

interface EditModalProps {
  email: string;
  currentPermissions: Permission[];
  currentSensitivePermissions: SensitivePermission[];
  onSave: (permissions: Permission[], sensitivePermissions: SensitivePermission[]) => void;
  onClose: () => void;
}

function EditPermissionsModal({
  email,
  currentPermissions,
  currentSensitivePermissions,
  onSave,
  onClose,
}: EditModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>(currentPermissions);
  const [sensitivePermissions, setSensitivePermissions] = useState<SensitivePermission[]>(
    currentSensitivePermissions
  );

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleSensitivePermission = (permission: SensitivePermission) => {
    setSensitivePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    onSave(permissions, sensitivePermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Permissions: {email}</h2>
        </div>

        {/* Standard Permissions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            STANDARD AREAS
          </h3>
          <div className="space-y-2">
            {TOP_LEVEL_PERMISSIONS.map((config) => (
              <label
                key={config.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(config.id)}
                  onChange={() => togglePermission(config.id)}
                  className="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                />
                <span className="text-sm">{config.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sensitive Permissions */}
        <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-medium text-red-500">
              HIGHLY CONFIDENTIAL
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Access to salaries, bonuses and revenue shares
          </p>
          <label className="flex items-center gap-3 rounded-lg p-2 hover:bg-red-500/10 cursor-pointer">
            <input
              type="checkbox"
              checked={sensitivePermissions.includes("compensation:view")}
              onChange={() => toggleSensitivePermission("compensation:view")}
              className="h-4 w-4 rounded border-red-500/30 text-red-500 focus:ring-red-500"
            />
            <span className="text-sm">View compensation</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminPermissionsPage() {
  const { isSuperAdmin, getAllAdminPermissions, updateAdminPermissions } = useAuth();
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  const adminPermissions = getAllAdminPermissions();

  const handleSave = (
    email: string,
    permissions: Permission[],
    sensitivePermissions: SensitivePermission[]
  ) => {
    updateAdminPermissions(email, permissions, sensitivePermissions);
    setEditingEmail(null);
  };

  // Only super admin can access this page
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="text-muted-foreground mt-2">
          Only Super Admin can manage permissions.
        </p>
      </div>
    );
  }

  const editingAdmin = adminPermissions.find((a) => a.email === editingEmail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Permissions</h1>
        <p className="text-muted-foreground">
          Manage access rights for admin accounts
        </p>
      </div>

      {/* Admin List */}
      <div className="space-y-4">
        {adminPermissions.map((admin) => {
          const isSuperAdminAccount = admin.email === ADMIN_EMAILS.SUPER_ADMIN;
          const permissionCount = admin.permissions.length;
          const hasSensitive = admin.sensitive_permissions.length > 0;

          return (
            <div
              key={admin.email}
              className={cn(
                "rounded-xl bg-card p-6",
                isSuperAdminAccount && "border-2 border-primary/20"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{admin.email}</h3>
                    {isSuperAdminAccount && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Super Admin
                      </span>
                    )}
                    {hasSensitive && !isSuperAdminAccount && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                        Compensation
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    {isSuperAdminAccount ? (
                      <span>Full access (not editable)</span>
                    ) : (
                      <span>
                        Areas:{" "}
                        {permissionCount === 0
                          ? "None"
                          : admin.permissions
                              .filter((p) => !p.includes(":"))
                              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                              .join(", ")}
                      </span>
                    )}
                  </div>

                  {admin.updated_at && !isSuperAdminAccount && (
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Last updated:{" "}
                      {new Date(admin.updated_at).toLocaleDateString("en-US")}
                    </p>
                  )}
                </div>

                {!isSuperAdminAccount && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEmail(admin.email)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Security notice</p>
            <p className="mt-1">
              Permissions are stored locally. In production, these will be
              synced to the database.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEmail && editingAdmin && (
        <EditPermissionsModal
          email={editingEmail}
          currentPermissions={editingAdmin.permissions}
          currentSensitivePermissions={editingAdmin.sensitive_permissions}
          onSave={(perms, sensitive) => handleSave(editingEmail, perms, sensitive)}
          onClose={() => setEditingEmail(null)}
        />
      )}
    </div>
  );
}
