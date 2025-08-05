// types/auth.ts
export interface YearLevel {
  id: number;
  label: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: number;
  full_name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  course: string;
  gender: 'Male' | 'Female';
  year_level_id?: number;
  year_level?: YearLevel | string;
  role: 'Attendee' | 'SBO';
  position?: string | null;
  qr_code_path?: string | null;
  qr_code_url?: string | null;
  has_attended?: boolean | number;
  created_at?: string;
  updated_at?: string;
  message?: string;
  is_sbo?: boolean; // Added for SBO route guards
}

export interface AttendanceRecord {
  id: number;
  attendee_id: number;
  date: string;
  am_in: string | null;
  am_out: string | null;
  pm_in: string | null;
  pm_out: string | null;
  created_at: string;
  updated_at: string;
  attendee: User;
}

export interface AttendanceResponse {
  message?: string;
  data?: AttendanceRecord | AttendanceRecord[];
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;
  attendanceRecords: AttendanceRecord[];
  isFetchingAttendance: boolean;
}

export interface AuthResponse {
  message?: string;
  attendee?: User;
  token?: string;
  qr_generated?: boolean;
  user?: User;
  errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
}

// Additional types for attendance filtering
export interface AttendanceFilters {
  date?: string;
  attendee_name?: string;
  course?: string;
  role?: 'Attendee' | 'SBO';
  has_attended?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedAttendanceResponse {
  data: AttendanceRecord[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

// Added types for router meta fields
export interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  requiresSbo?: boolean;
  title?: string;
  [key: string]: any;
}