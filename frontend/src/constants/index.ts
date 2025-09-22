// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || '';

// Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

// Routes
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Main
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Admin
  USERS: '/users',
  
  // Teacher & Admin
  BATCHES: '/batches',
  
  // Shared
  ATTENDANCE: '/attendance',
  ASSIGNMENTS: '/assignments',
  MATERIALS: '/materials',
  PAYMENTS: '/payments',
  
  // Error
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  REDUX_STATE: 'reduxState',
} as const;

// Date & Time Formats
export const DATE_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATE_TIME: 'dd/MM/yyyy hh:mm a',
  TIME: 'hh:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_DATE_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 25, 50, 100],
} as const;

// Validation Messages
export const VALIDATION = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
} as const;

// Notification Messages
export const NOTIFICATIONS = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  ERROR_OCCURRED: 'An error occurred',
  SESSION_EXPIRED: 'Session expired. Please log in again.',
} as const;

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
