'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthProvider from '@/components/admin/AdminAuthProvider';
import { AdminAPI } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import type { Order } from '@/types/order';
import Link from 'next/link';
import { toast } from 'sonner';

const ACTIVE_STATUSES = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'bg-amber-500', 
    textColor: 'text-amber-700',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  preparing: { 
    label: 'Preparing', 
    icon: ChefHat, 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  ready: { 
    label: 'Ready', 
    icon: CheckCircle, 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200'
  },
};

function ActiveOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getOrders();
      if (response.success) {
        // Filter only active orders
        const activeOrders = (response.orders || []).filter((order: Order) => 
          ['pending', 'preparing', 'ready'].includes(order.status)
        );
        setOrders(activeOrders);
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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      setUpdatingStatus(orderId);
      const response = await AdminAPI.updateOrderStatus(orderId, newStatus);
      console.log('Update response:', response);
      if (response.success) {
        await fetchOrders();
      } else {
        console.error('Update failed:', response.message);
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: { [key: string]: string } = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'served',
    };
    return statusFlow[currentStatus] || null;
  };

  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getFilteredOrders = () => {
    if (selectedStatus === 'all') return orders;
    return orders.filter(order => order.status === selectedStatus);
  };

  const renderOrderRow = (order: Order) => {
    const statusInfo = ACTIVE_STATUSES[order.status as keyof typeof ACTIVE_STATUSES];
    const StatusIcon = statusInfo.icon;
    const nextStatus = getNextStatus(order.status);
    const isUpdating = updatingStatus === order.orderid;

    return (
      <div 
        key={order._id} 
        className={`bg-white border-l-4 ${statusInfo.borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Order Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Badge className={`${statusInfo.color} text-white`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-sm">#{order.orderid?.slice(-8) || 'N/A'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-medium text-blue-600">
                  Table {order.tableNumber || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {order.customerName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {order.customerName}
                  </span>
                )}
                {order.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.customerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="hidden md:block flex-shrink-0 max-w-xs">
            <div className="text-sm text-gray-700">
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
                <span className="text-xs text-gray-500">+{order.items.length - 2} more</span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-bold text-green-600">
              ₹{order.totalAmount.toFixed(2)}
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

            {nextStatus && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(order.orderid, nextStatus)}
                disabled={isUpdating}
                className={nextStatus === 'served' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-1" />
                    {ACTIVE_STATUSES[nextStatus as keyof typeof ACTIVE_STATUSES]?.label || 'Complete'}
                  </>
                )}
              </Button>
            )}

            {order.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusUpdate(order.orderid, 'cancelled')}
                disabled={isUpdating}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout currentPage="orders-active">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading active orders...</span>
        </div>
      </AdminLayout>
    );
  }

  const filteredOrders = getFilteredOrders();
  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  return (
    <AdminLayout currentPage="orders-active">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Orders</h1>
            <p className="text-gray-600 mt-1">
              Kitchen workflow - Track orders in real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders/history">
              <Button variant="outline" className="w-full md:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Order History
              </Button>
            </Link>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-700 to-slate-900 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalOrders}</p>
                <p className="text-sm text-slate-300 mt-1">Active Orders</p>
              </div>
            </CardContent>
          </Card>
          {Object.entries(ACTIVE_STATUSES).map(([status, info]) => {
            const count = status === 'pending' ? pendingCount : status === 'preparing' ? preparingCount : readyCount;
            const Icon = info.icon;
            return (
              <Card key={status} className={`${info.bgLight} border-2 ${info.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${info.textColor}`} />
                    <p className="text-3xl font-bold text-gray-900">{count}</p>
                    <p className={`text-sm ${info.textColor} mt-1 font-medium`}>{info.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            All ({totalOrders})
          </Button>
          {Object.entries(ACTIVE_STATUSES).map(([status, info]) => {
            const count = status === 'pending' ? pendingCount : status === 'preparing' ? preparingCount : readyCount;
            const Icon = info.icon;
            return (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {info.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Orders List */}
        {totalOrders === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No active orders at the moment</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No orders in this category
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map(order => renderOrderRow(order))
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />
    </AdminLayout>
  );
}

export default function ActiveOrdersPage() {
  return (
    <AdminAuthProvider>
      <ActiveOrdersContent />
    </AdminAuthProvider>
  );
}
