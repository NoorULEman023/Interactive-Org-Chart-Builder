export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  parentId: string | null;
  email: string;
  phone: string;
  location: string;
  avatarColor: string; // Tailwind background color class, e.g., 'bg-blue-500'
  salary: number;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Remote' | 'Hybrid';
  bio?: string;
}

export type ActiveTab = 'chart' | 'employees' | 'departments' | 'statistics';

export interface OrgChartState {
  employees: Employee[];
}
