export type StaffAccessStatus =
  | "auth-unconfigured"
  | "signed-out"
  | "forbidden"
  | "storage-unavailable"
  | "authorized";

export type StaffAccess = {
  status: StaffAccessStatus;
  userId?: string;
};

export type AdminDashboardSummary = {
  products: { total: number; active: number; drafts: number };
  orders: { total: number; open: number; approvalPending: number; paidRevenuePaise: number };
  customers: { total: number };
  commissions: { total: number; open: number; awaitingApproval: number };
  notifications: { queued: number; failed: number };
  recentOrders: Array<{ orderNumber: string; status: string; paymentStatus: string; totalPaise: number; placedAt: number }>;
  recentCommissions: Array<{ commissionNumber: string; title: string; status: string; updatedAt: number }>;
};
