export interface PopulatedMenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface OrderItem {
  _id?: string;
  menuid: string | PopulatedMenuItem;
  notes?: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderid: string;
  tableid: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  sgst?: number;
  cgst?: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'done';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  paymentMethod?: string;
  employeeId?: string;
  employeeName?: string;
  orderDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  name: string;
  couponcode: string;
  discountPercentage: number;
  description?: string;
  totalUsageLimit: number | null;
  usageCount?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}
