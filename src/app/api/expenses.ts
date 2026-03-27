import { apiDelete, apiGet, apiPost, apiPut } from './client';

export type Expense = {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  comment: string;
};

export type ExpenseCategory = {
  id: string;
  label: string;
  iconName: string;
  color: string;
};

export async function apiGetExpenses(params?: { dateFrom?: string; dateTo?: string }): Promise<Expense[]> {
  const query = new URLSearchParams();
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGet<Expense[]>(`/expenses${suffix}`);
}

export async function apiCreateExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
  return apiPost<Expense>('/expenses', data);
}

export async function apiDeleteExpense(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/expenses/${id}`);
}

export async function apiGetExpenseCategories(): Promise<ExpenseCategory[]> {
  return apiGet<ExpenseCategory[]>('/expenses/categories');
}

export async function apiCreateExpenseCategory(data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> {
  return apiPost<ExpenseCategory>('/expenses/categories', data);
}

export async function apiUpdateExpenseCategory(
  id: string,
  data: Partial<Omit<ExpenseCategory, 'id'>>,
): Promise<ExpenseCategory> {
  return apiPut<ExpenseCategory>(`/expenses/categories/${id}`, data);
}

export async function apiDeleteExpenseCategory(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/expenses/categories/${id}`);
}
