export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'service_admin' | 'service_technician' | 'service_sales_admin';
  staff_id?: string; // Link to service_staff
  avatar_url?: string;
  designation?: string;
}

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  QC_REQUESTED = 'qc_requested',
  QC_PASSED = 'qc_passed',
  QC_FAILED = 'qc_failed',
  VERIFIED = 'verified'
}

export enum PartRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ISSUED = 'issued'
}

export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ServiceCondition {
  OK = 'ok',
  FAIR = 'fair',
  BAD = 'bad',
  NA = 'na'
}

export interface ServiceTask {
  id: string;
  vehicleModel: string;
  licensePlate: string;
  customerName: string;
  status: JobStatus;
  issueDescription: string;
  date: string;
}

export enum RoutePath {
  SPLASH = '/splash',
  WELCOME = '/welcome',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/',
  SETTINGS = '/settings',
  ASSISTANT = '/assistant',
  JOB_CARD = '/job/:id',
  SCANNER = '/scanner',
  MY_JOBS = '/my-jobs',
  ACTIVE_WORK = '/active-work',
  PARTS_REQUEST = '/parts-request',
  PROFILE = '/profile',
  NOTIFICATIONS = '/notifications',
  ATTENDANCE = '/attendance',
  PERFORMANCE = '/performance',
  WORK_HISTORY = '/work-history',

  ISSUE_REPORT = '/issue-report',
  HELP = '/help'
}

export interface BikeModel {
  id: string;
  name: string;
  code: string;
  image_url?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  category_id: string;
}

export interface PartVariant {
  id: string;
  part_id: string;
  brand: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface JobCard {
  id: string;
  ticket_id: string;
  technician_id: string;
  status: JobStatus;
  notes?: string;
  service_start_time?: string;
  service_end_time?: string;
  created_at: string;
  service_number?: string;
  vehicle?: {
    model_name: string;
    license_plate: string;
    customer_name: string;
    issue_description: string;
    color?: string;
    engine_number?: string;
    chassis_number?: string;
    mileage?: number;
  };
  tasks?: ServiceTaskItem[];
  parts?: PartUsageItem[];
  photos?: JobPhoto[];
  checklist?: ChecklistItem[];
  time_logs?: TimeLog[];
  ticket?: {
    id: string;
    ticket_number: string;
    status: string;
  };
}

export interface ServiceTaskItem {
  id: string;
  name: string;
  status: 'pending' | 'completed';
}

export interface PartUsageItem {
  id: string;
  variant_id: string;
  quantity: number;
  part_name?: string;
  price?: number;
}

export interface TechnicianProfile {
  id: string;
  user_id: string;
  staff_id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  avatar_url?: string;
  status: string;
  stats?: DashboardStats;
}

export interface DashboardStats {
  pending: number;
  active: number;
  completed: number;
  total: number;
  efficiency_score?: number;
  hours_worked?: number;
  earnings?: number;
  daily_performance?: { day: string; jobs: number; efficiency: number }[];
  weekly_earnings?: { week: string; amount: number }[];
}

export interface TechnicianAttendance {
  id: string;
  clockIn: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'leave';
  duration_hours?: number;
}

export interface TimeLog {
  id: string;
  event_type: 'start' | 'pause' | 'resume' | 'complete';
  timestamp: string;
  duration_from_last?: number;
}

export interface JobPhoto {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  tag: 'before' | 'during' | 'after';
  caption?: string;
  metadata?: any;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  category?: string;
  is_completed: boolean;
  condition: ServiceCondition;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'part' | 'admin' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  data?: any;
  timestamp?: Date;
}

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  brand: string;
  base_price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  category_id: string;
}

export interface RequisitionGroup {
  id: string; // This is the requisition_group_id
  job_card_id: string;
  status: PartRequestStatus;
  created_at: string;
  items: PartsRequest[];
}

export interface PartsRequest {
  id: string;
  status: PartRequestStatus;
  job_card_id: string;
  ticket_id: string;
  staff_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  requisition_group_id: string;
  created_at: string;
  productName?: string; // Virtual field from API join
  part_name?: string;   // Product name from API group response
  sku?: string;         // Product SKU from API group response
  brand?: string;       // Product brand from API group response
}