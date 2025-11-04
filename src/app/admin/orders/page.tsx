"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import { GlassCard, GlassButton, GlassTable } from '@/components/ui/glass'
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Utensils, 
  XCircle, 
  DollarSign,
  RefreshCw,
  Eye,
  Edit,
  CreditCard,
  ClipboardList
} from 'lucide-react'

interface Order {
  _id: string
  orderid: string
  tableid: string
  tableNumber: string
  customerName?: string
  items: Array<{
    itemName: string
    quantity: number
    price: number
    totalPrice: number
  }>
  totalAmount: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  orderDate: string
  employeeName?: string
  estimatedTime?: number
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const queryParams = new URLSearchParams()
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus)
      }
      
      const response = await fetch(`/api/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders || [])
      } else {
        console.error('Error fetching orders:', data.message)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'preparing': return 'text-blue-600'
      case 'ready': return 'text-green-600'
      case 'served': return 'text-gray-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'preparing': return <ChefHat className="w-4 h-4" />
      case 'ready': return <CheckCircle2 className="w-4 h-4" />
      case 'served': return <Utensils className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'paid': return 'text-green-600'
      case 'partially_paid': return 'text-orange-600'
      case 'refunded': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleOrderAction = async (order: Order, action: string) => {
    switch (action) {
      case 'view':
        alert(`Viewing order ${order.orderid}\nTotal: $${order.totalAmount}\nStatus: ${order.status}`)
        break
      case 'update_status':
        const newStatus = prompt(`Current status: ${order.status}\nEnter new status (pending/preparing/ready/served):`, order.status)
        if (newStatus && ['pending', 'preparing', 'ready', 'served'].includes(newStatus)) {
          try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch('/api/orders', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderid: order.orderid,
                status: newStatus
              })
            })

            const data = await response.json()
            if (data.success) {
              setOrders(orders.map(o => 
                o.orderid === order.orderid 
                  ? { ...o, status: newStatus as any }
                  : o
              ))
            } else {
              alert(data.message || 'Error updating order status')
            }
          } catch (error) {
            console.error('Error updating order:', error)
            alert('Error updating order status')
          }
        }
        break
      case 'payment':
        const newPaymentStatus = prompt(`Current payment: ${order.paymentStatus}\nEnter new payment status (pending/paid/partially_paid):`, order.paymentStatus)
        if (newPaymentStatus && ['pending', 'paid', 'partially_paid'].includes(newPaymentStatus)) {
          try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch('/api/orders', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderid: order.orderid,
                paymentStatus: newPaymentStatus
              })
            })

            const data = await response.json()
            if (data.success) {
              setOrders(orders.map(o => 
                o.orderid === order.orderid 
                  ? { ...o, paymentStatus: newPaymentStatus as any }
                  : o
              ))
            } else {
              alert(data.message || 'Error updating payment status')
            }
          } catch (error) {
            console.error('Error updating payment:', error)
            alert('Error updating payment status')
          }
        }
        break
    }
  }

  const getOrderStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const ready = orders.filter(o => o.status === 'ready').length
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    return { pending, preparing, ready, totalAmount }
  }

  const stats = getOrderStats()

  if (loading) {
    return (
      <AdminAuthProvider>
        <AdminLayout currentPage="orders">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
            <p className="text-gray-600 font-medium">Loading orders...</p>
          </div>
        </AdminLayout>
      </AdminAuthProvider>
    )
  }

  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="orders">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
            <p className="text-gray-600">Monitor and manage all restaurant orders</p>
          </div>
          <GlassButton variant="secondary" onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </GlassButton>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Preparing</p>
                <p className="text-3xl font-bold text-blue-600">{stats.preparing}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Ready</p>
                <p className="text-3xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'preparing', 'ready', 'served'].map((status) => (
            <GlassButton
              key={status}
              variant={filterStatus === status ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus(status)}
              size="sm"
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
            </GlassButton>
          ))}
        </div>

        {/* Orders List */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Current Orders</h3>
          
          {orders.length > 0 ? (
            <GlassTable
              headers={['Order ID', 'Table', 'Customer', 'Items', 'Amount', 'Status', 'Payment', 'Time', 'Actions']}
              data={orders.map(order => ({
                'Order ID': order.orderid,
                'Table': order.tableNumber,
                'Customer': order.customerName || 'Walk-in',
                'Items': `${order.items.length} items`,
                'Amount': `$${order.totalAmount.toFixed(2)}`,
                'Status': (
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(order.status)}>{getStatusIcon(order.status)}</span>
                    <span className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                ),
                'Payment': (
                  <span className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.replace('_', ' ').toUpperCase()}
                  </span>
                ),
                'Time': new Date(order.orderDate).toLocaleTimeString(),
                _originalData: order
              }))}
              actions={[
                { label: 'View Details', key: 'view', variant: 'secondary' },
                { label: 'Update Status', key: 'update_status', variant: 'primary' },
                { label: 'Payment', key: 'payment', variant: 'primary' }
              ]}
              onRowAction={(row, action) => handleOrderAction(row._originalData, action)}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? 'No orders have been placed yet'
                  : `No ${filterStatus} orders at the moment`
                }
              </p>
            </div>
          )}
        </GlassCard>
      </div>
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default OrdersPage