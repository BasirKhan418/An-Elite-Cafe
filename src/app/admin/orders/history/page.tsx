'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthProvider from '@/components/admin/AdminAuthProvider';
import { AdminAPI } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  Receipt,
  IndianRupee,
  Search,
  Calendar,
  User,
  Phone,
  ArrowLeft,
  Filter
} from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import BillingModal from '@/components/admin/BillingModal';
import type { Order } from '@/types/order';
import Link from 'next/link';
const HISTORY_STATUSES = {
  served: { 
    label: 'Served', 
    icon: Utensils, 
    color: 'bg-purple-500', 
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  done: { 
    label: 'Completed', 
    icon: CheckCircle, 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200'
  },
};

function OrderHistoryContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getOrders();
      if (response.success) {
        // Filter only completed/historical orders
        const historicalOrders = (response.orders || []).filter((order: Order) => 
          ['served', 'done', 'cancelled'].includes(order.status)
        );
        setOrders(historicalOrders);
      } else {
        if (response.message === 'Invalid token' || response.error === 'Unauthorized Access') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          window.location.href = '/admin/login';
          return;
        }
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Error fetching orders. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = (order: Order) => {
    setBillingOrder(order);
    setShowBillingModal(true);
  };

  const filterOrdersByDate = (orders: Order[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (dateFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          return orderDate >= weekAgo;
        case 'month':
          return orderDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filterOrdersBySearch = (orders: Order[]) => {
    if (!searchTerm) return orders;
    
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.orderid?.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.customerPhone?.includes(term) ||
      order.tableNumber?.toString().includes(term)
    );
  };

  const filterOrdersByStatus = (status: string) => {
    let filtered = orders;
    
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }
    
    filtered = filterOrdersByDate(filtered);
    filtered = filterOrdersBySearch(filtered);
    
    return filtered;
  };

  const renderOrderCard = (order: Order) => {
    const statusInfo = HISTORY_STATUSES[order.status as keyof typeof HISTORY_STATUSES];
    if (!statusInfo) return null;
    
    const StatusIcon = statusInfo.icon;

    return (
      <div 
        key={order._id} 
        className={`bg-white border-l-4 ${statusInfo.borderColor} rounded-lg p-4 hover:shadow-md transition-shadow mb-3`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Order Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Badge className={`${statusInfo.color} text-white text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-sm">#{order.orderid?.slice(-8) || 'N/A'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-medium text-blue-600">
                  Table {order.tableNumber || 'N/A'}
                </span>
                {order.isgeneratedBill && order.status === 'served' && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-50 text-green-700 border-green-300"
                  >
                    <Receipt className="w-3 h-3 mr-1" />
                    Bill Generated
                  </Badge>
                )}
                {order.paymentStatus && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-300' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-300'
                    }`}
                  >
                    <IndianRupee className="w-3 h-3 mr-1" />
                    {order.paymentStatus}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {order.customerName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {order.customerName}
                  </span>
                )}
                {order.employeeName && (
                  <span>· Served by {order.employeeName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="hidden md:block flex-shrink-0 max-w-xs">
            <div className="text-xs text-gray-700">
              {order.items.slice(0, 2).map((item, idx) => {
                const menuItem = typeof item.menuid === 'object' ? item.menuid : null;
                const itemName = menuItem?.name || 'Unknown Item';
                return (
                  <div key={idx} className="truncate">
                    {item.quantity}x {itemName}
                  </div>
                );
              })}
              {order.items.length > 2 && (
                <span className="text-xs text-gray-500">+{order.items.length - 2} more items</span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-bold text-green-600">
              ₹{order.totalAmount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(order);
                setShowDetailsModal(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            {order.status === 'served' && !order.isgeneratedBill && (
              <Button
                size="sm"
                onClick={() => handleGenerateBill(order)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Receipt className="w-4 h-4 mr-1" />
                Bill
              </Button>
            )}

            {(order.status === 'served' && order.isgeneratedBill) && (
              <Button
                size="sm"
                onClick={() => handleGenerateBill(order)}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Receipt className="w-4 h-4 mr-1" />
                Print
              </Button>
            )}

            {order.status === 'done' && (
              <Button
                size="sm"
                onClick={() => handleGenerateBill(order)}
                variant="outline"
              >
                <Receipt className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = (status: string) => {
    const filteredOrders = filterOrdersByStatus(status);

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No orders found matching your filters</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredOrders.map(order => renderOrderCard(order))}
      </div>
    );
  };

  const getTabCount = (status: string) => {
    return filterOrdersByStatus(status).length;
  };

  if (loading) {
    return (
      <AdminLayout currentPage="orders-history">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading order history...</span>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status === 'done')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <AdminLayout currentPage="orders-history">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin/orders/active">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            </div>
            <p className="text-gray-600 mt-1">
              View completed orders and manage billing
            </p>
          </div>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-slate-700 to-slate-900 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{orders.length}</p>
                <p className="text-sm text-slate-300 mt-1">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <IndianRupee className="w-6 h-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-emerald-100 mt-1">Revenue</p>
              </div>
            </CardContent>
          </Card>
          {Object.entries(HISTORY_STATUSES).map(([status, info]) => {
            const count = orders.filter(o => o.status === status).length;
            const Icon = info.icon;
            return (
              <Card key={status} className={`${info.bgLight} border-2 ${info.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${info.textColor}`} />
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className={`text-sm ${info.textColor} mt-1 font-medium`}>{info.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name, phone, or table..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex gap-2">
                <Button
                  variant={dateFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('today')}
                  className="text-xs"
                >
                  Today
                </Button>
                <Button
                  variant={dateFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('week')}
                  className="text-xs"
                >
                  This Week
                </Button>
                <Button
                  variant={dateFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('month')}
                  className="text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant={dateFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('all')}
                  className="text-xs"
                >
                  All Time
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All
              <Badge variant="secondary" className="ml-1">{getTabCount('all')}</Badge>
            </TabsTrigger>
            {Object.entries(HISTORY_STATUSES).map(([status, info]) => {
              const Icon = info.icon;
              return (
                <TabsTrigger key={status} value={status} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {info.label}
                  <Badge variant="secondary" className="ml-1">{getTabCount(status)}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderTabContent('all')}
          </TabsContent>
          {Object.keys(HISTORY_STATUSES).map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {renderTabContent(status)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />

      <BillingModal
        order={billingOrder}
        isOpen={showBillingModal}
        onClose={() => {
          setShowBillingModal(false);
          setBillingOrder(null);
        }}
        onBillGenerated={() => {
          fetchOrders();
          // Don't close the modal - let user print or complete the bill
        }}
      />
    </AdminLayout>
  );
}

export default function OrderHistoryPage() {
  return (
    <AdminAuthProvider>
      <OrderHistoryContent />
    </AdminAuthProvider>
  );
}
