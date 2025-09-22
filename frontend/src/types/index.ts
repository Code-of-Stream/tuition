// Base types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  data: T[];
}

// User types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
}

// Batch types
export interface Batch extends BaseEntity {
  name: string;
  description?: string;
  subject: string;
  teacher: string | User;
  students: string[] | User[];
  startDate: string;
  endDate?: string;
  schedule: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    startTime: string;
    endTime: string;
  };
  fee: number;
  maxStudents?: number;
  isActive: boolean;
}

// Attendance types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance extends BaseEntity {
  student: string | User;
  batch: string | Batch;
  date: string;
  status: AttendanceStatus;
  markedBy: string | User;
  notes?: string;
}

// Assignment types
export interface AssignmentFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface Submission extends BaseEntity {
  student: string | User;
  files: AssignmentFile[];
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
  gradedBy?: string | User;
  gradedAt?: string;
  status: 'submitted' | 'graded' | 'late' | 'resubmitted';
  notes?: string;
}

export interface Assignment extends BaseEntity {
  title: string;
  description: string;
  batch: string | Batch;
  assignedBy: string | User;
  dueDate: string;
  totalMarks: number;
  attachments: AssignmentFile[];
  submissions: Submission[];
  isActive: boolean;
}

// Material types
export interface Material extends BaseEntity {
  title: string;
  description?: string;
  batch: string | Batch;
  file: AssignmentFile;
  uploadedBy: string | User;
  tags?: string[];
  isActive: boolean;
}

// Payment types
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'razorpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment extends BaseEntity {
  student: string | User;
  batch: string | Batch;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  month: string; // Format: YYYY-MM
  status: PaymentStatus;
  recordedBy: string | User;
  notes?: string;
  razorpay?: {
    orderId: string;
    paymentId?: string;
    signature?: string;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// UI types
export type Theme = 'light' | 'dark';

export interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children?: SidebarItem[];
}

// Table types
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

// Chart types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type ValueOf<T> = T[keyof T];
