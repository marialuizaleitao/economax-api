export interface User {
  id?: number;
  name: string;
  email: string;
  birth_date: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Expense {
  id?: number;
  user_id: number;
  description: string;
  amount: number;
  reference_month: string; // YYYY-MM format
  created_at?: Date;
  updated_at?: Date;
}

export interface Limit {
  id?: number;
  user_id: number;
  amount: number;
  reference_month: string; // YYYY-MM format
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthRequest extends Request {
  userId?: number;
}
