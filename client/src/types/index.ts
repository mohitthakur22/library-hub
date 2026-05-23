export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  phone: string;
  collegeId?: string;
  photo?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: string;
  price: number;
  durationDays: number;
  description?: string;
  features: string[];
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: string;
  displayStatus?: string;
  assignedTo?: { id: string; name: string; photo?: string };
  fixedHolder?: { id: string; name: string; photo?: string };
  todayBooking?: { user: { id: string; name: string; photo?: string } };
  planType?: string;
}

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  plan: Plan;
  seat?: { id: string; number: string };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt?: string;
  invoiceNumber: string;
  subscription?: Subscription;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardData {
  activeSubscription?: Subscription;
  upcomingPayment?: Payment;
  notifications: Notification[];
  recentCheckIns: { id: string; checkedAt: string }[];
  streak: number;
  todayBooking?: { seat: { number: string } };
}
