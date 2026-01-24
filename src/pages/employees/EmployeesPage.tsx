import { useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  Calculator,
  Calendar,
  Percent,
  Lock,
} from "lucide-react";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useCalculateMonth,
} from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee, CreateEmployeeInput } from "@/api/types/employees";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Masked value for restricted access
const MASKED_VALUE = "•••••";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [formData, setFormData] = useState<CreateEmployeeInput>({
    name: employee?.name || "",
    role: employee?.role || "",
    base_salary: employee?.base_salary || 0,
    revenue_share_percent: employee?.revenue_share_percent || 0,
    notes: employee?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">{employee ? "Edit Employee" : "Add Employee"}</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Employee name"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Developer, Designer"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Base Salary ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.base_salary}
            onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Revenue Share %</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.revenue_share_percent}
            onChange={(e) => setFormData({ ...formData, revenue_share_percent: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes..."
          className="rounded-xl"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="rounded-xl glow-orange">
          {isLoading ? "Saving..." : employee ? "Update" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}

export function EmployeesPage() {
  const { data: summary, isLoading } = useEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const calculateMutation = useCalculateMonth();
  const { hasSensitivePermission } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  // Check if user can view compensation data
  const canViewCompensation = hasSensitivePermission("compensation:view");

  const handleCreate = async (data: CreateEmployeeInput) => {
    await createMutation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreateEmployeeInput) => {
    if (!editingEmployee) return;
    await updateMutation.mutateAsync({ id: editingEmployee.id, data });
    setEditingEmployee(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCalculate = async () => {
    try {
      await calculateMutation.mutateAsync({ month_year: selectedMonth, save_to_history: true });
      alert("Salaries calculated and saved!");
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const employees = summary?.employees || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Employees</h1>
          <p className="text-muted-foreground text-lg">Manage salaries and revenue sharing</p>
        </div>
        {canViewCompensation && (
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl glow-orange"
            disabled={showForm || !!editingEmployee}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(summary?.gross_revenue || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operating Costs</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(summary?.operating_costs || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reserve ({summary?.reserve_percent || 0}%)</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(summary?.reserve_amount || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Available</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(summary?.net_available || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary glow-orange text-primary-foreground">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Salaries</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : canViewCompensation ? (
                <p className="text-xl font-bold">{formatCurrency(summary?.total_salaries || 0)}</p>
              ) : (
                <p className="text-xl font-bold text-muted-foreground">{MASKED_VALUE}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Access Restriction Warning */}
      {!canViewCompensation && (
        <div className="glass rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-500">Restricted Access</p>
              <p className="text-sm text-muted-foreground">
                Salary data is only visible with special permission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Month - Only visible with compensation permission */}
      {canViewCompensation && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Calculate Salaries</h2>
              <p className="text-sm text-muted-foreground">Based on revenue and share percentages</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl w-48"
              />
            </div>
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="rounded-xl glow-orange"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {calculateMutation.isPending ? "Calculating..." : "Calculate & Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleUpdate}
          onCancel={() => setEditingEmployee(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Employees List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : employees.length > 0 ? (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{employee.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          employee.is_active
                            ? "bg-green-500/20 text-green-500"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {employee.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                    {employee.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{employee.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="grid grid-cols-3 gap-4 text-sm text-right">
                    <div>
                      <p className="text-muted-foreground">Base</p>
                      {canViewCompensation ? (
                        <p className="font-bold">{formatCurrency(employee.base_salary)}</p>
                      ) : (
                        <p className="font-bold text-muted-foreground">{MASKED_VALUE}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Share</p>
                      {canViewCompensation ? (
                        <p className="font-bold">{employee.revenue_share_percent}%</p>
                      ) : (
                        <p className="font-bold text-muted-foreground">{MASKED_VALUE}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calculated</p>
                      {canViewCompensation ? (
                        <p className="font-bold text-primary">{formatCurrency(employee.calculated_salary)}</p>
                      ) : (
                        <p className="font-bold text-muted-foreground">{MASKED_VALUE}</p>
                      )}
                    </div>
                  </div>

                  {canViewCompensation && (
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-8 w-8"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No employees yet</h3>
            <p className="text-muted-foreground mb-4">
              Add employees to manage salaries and revenue sharing
            </p>
            {canViewCompensation && (
              <Button onClick={() => setShowForm(true)} className="rounded-xl glow-orange">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Employee
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
