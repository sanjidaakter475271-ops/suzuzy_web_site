export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'service_admin' | 'service_technician' | 'service_sales_admin';
}

export interface ServiceTask {
  id: string;
  vehicleModel: string;
  licensePlate: string;
  customerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  issueDescription: string;
  date: string;
}

export enum RoutePath {
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/',
  SETTINGS = '/settings',
  ASSISTANT = '/assistant',
  JOB_CARD = '/job/:id',
  SCANNER = '/scanner'
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
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  notes?: string;
  service_start_time?: string;
  service_end_time?: string;
  created_at: string;
  vehicle?: {
    model_name: string;
    license_plate: string;
    customer_name: string;
    issue_description: string;
  };
}