export interface Employee {
  id: string;
  name: string;
  role: string;
  base_salary: number;
  revenue_share_percent: number;
  calculated_salary: number;
  is_active: boolean;
  start_date: string;
  notes?: string;
  created_at: string;
}

export interface CreateEmployeeInput {
  name: string;
  role: string;
  base_salary: number;
  revenue_share_percent: number;
  notes?: string;
}

export interface EmployeeSummary {
  gross_revenue: number;
  operating_costs: number;
  reserve_percent: number;
  reserve_amount: number;
  net_available: number;
  total_salaries: number;
  month: string;
  employees: Employee[];
}

export interface SalaryCalculation {
  id: string;
  employee_id: string;
  employee_name: string;
  month_year: string;
  gross_revenue: number;
  operating_costs: number;
  net_available: number;
  revenue_share_percent: number;
  calculated_salary: number;
  base_salary: number;
  created_at: string;
}
