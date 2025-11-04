"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { AdminAPI } from '@/lib/adminApi'
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Utensils, 
  IndianRupee,
  RefreshCw,
  Eye,
  ArrowRight,
  Package,
  AlertCircle,
  XCircle,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'
interface MenuItem {
  _id: string
  menuid: {
    _id: string
    name: string
    price: number
    category: string
  }
  notes?: string
  quantity: number
}

interface Order {
  _id: string
  orderid: string
  tableid: string
  tableNumber: string
  customerName?: string
  customerPhone?: string
  items: MenuItem[]
  subtotal: number
  tax: number
  discount: number
  totalAmount: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'done'
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  paymentMethod?: string
  employeeId?: string
  employeeName?: string
  orderDate: string
  completedAt?: string
  isgeneratedBill?: boolean
  createdAt: string
  updatedAt: string
}

interface OrderManagementProps {
  onViewDetails: (order: Order) => void
  onGenerateBill: (order: Order) => void
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onViewDetails, onGenerateBill }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [groupByTable, setGroupByTable] = useState(true)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await AdminAPI.getOrders()
      if (response.success) {
        setOrders(response.orders || [])
      } else {
        console.error('Error fetching orders:', response.message)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderid: string, newStatus: string) => {
    try {
      const response = await AdminAPI.updateOrderStatus(orderid, newStatus)
      if (response.success) {
        setOrders(orders.map(o => 
          o.orderid === orderid ? { ...o, status: newStatus as any } : o
        ))
      } else {
        toast.error(response.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-yellow-500 bg-yellow-50'
      case 'preparing': return 'border-blue-500 bg-blue-50'
      case 'ready': return 'border-green-500 bg-green-50'
      case 'served': return 'border-purple-500 bg-purple-50'
      case 'done': return 'border-gray-500 bg-gray-50'
      case 'cancelled': return 'border-red-500 bg-red-50'
      default: return 'border-gray-300 bg-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'preparing': return <ChefHat className="w-5 h-5 text-blue-600" />
      case 'ready': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'served': return <Utensils className="w-5 h-5 text-purple-600" />
      case 'done': return <Package className="w-5 h-5 text-gray-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'served',
      'served': null // Will show Generate Bill instead
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || null
  }

  const filteredOrders = activeTab === 'all' 
    ? orders.filter(o => o.status !== 'done' && o.status !== 'cancelled')
    : orders.filter(o => o.status === activeTab)

  const groupOrdersByTable = () => {
    const grouped: { [key: string]: Order[] } = {}
    filteredOrders.forEach(order => {
      if (!grouped[order.tableNumber]) {
        grouped[order.tableNumber] = []
      }
      grouped[order.tableNumber].push(order)
    })
    return grouped
  }

  const getOrderStats = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      served: orders.filter(o => o.status === 'served').length,
      total: orders.filter(o => o.status !== 'done' && o.status !== 'cancelled').length
    }
  }

  const stats = getOrderStats()

  const tabs = [
    { id: 'all', label: 'All Active', count: stats.total, icon: Package },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: Clock },
    { id: 'preparing', label: 'Preparing', count: stats.preparing, icon: ChefHat },
    { id: 'ready', label: 'Ready', count: stats.ready, icon: CheckCircle2 },
    { id: 'served', label: 'Served', count: stats.served, icon: Utensils }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">Real-time order tracking and management</p>
        </div>
        <div className="flex gap-3">
          <GlassButton 
            variant={groupByTable ? 'primary' : 'secondary'} 
            onClick={() => setGroupByTable(!groupByTable)}
            size="sm"
          >
            {groupByTable ? 'Table View' : 'List View'}
          </GlassButton>
          <GlassButton variant="secondary" onClick={fetchOrders} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </GlassButton>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Orders Display */}
      {groupByTable ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupOrdersByTable()).map(([tableNumber, tableOrders]) => (
            <GlassCard key={tableNumber} className="p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Table {tableNumber}</h3>
                  <p className="text-sm text-gray-600">{tableOrders.length} order(s)</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {tableNumber}
                </div>
              </div>

              <div className="space-y-3">
                {tableOrders.map(order => (
                  <OrderCard 
                    key={order.orderid} 
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDetails={onViewDetails}
                    onGenerateBill={onGenerateBill}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getNextStatus={getNextStatus}
                  />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.orderid} 
              order={order}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={onViewDetails}
              onGenerateBill={onGenerateBill}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getNextStatus={getNextStatus}
            />
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'No active orders at the moment'
              : `No ${activeTab} orders currently`
            }
          </p>
        </div>
      )}
    </div>
  )
}

interface OrderCardProps {
  order: Order
  onStatusUpdate: (orderid: string, newStatus: string) => void
  onViewDetails: (order: Order) => void
  onGenerateBill: (order: Order) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  getNextStatus: (status: string) => string | null
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onStatusUpdate, 
  onViewDetails, 
  onGenerateBill,
  getStatusColor,
  getStatusIcon,
  getNextStatus
}) => {
  const nextStatus = getNextStatus(order.status)
  const canGenerateBill = order.status === 'served' && !order.isgeneratedBill
  const billAlreadyGenerated = order.isgeneratedBill && order.status !== 'done'

  return (
    <div className={`border-l-4 rounded-lg p-4 ${getStatusColor(order.status)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(order.status)}
            <span className="font-bold text-gray-800">#{order.orderid.slice(-8)}</span>
          </div>
          <p className="text-sm text-gray-600">
            {order.customerName || 'Walk-in Customer'}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.orderDate).toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-600">{order.items.length} items</p>
        </div>
      </div>

      <div className="flex gap-2">
        <GlassButton 
          variant="secondary" 
          size="sm"
          onClick={() => onViewDetails(order)}
          className="flex-1"
        >
          <Eye className="w-3 h-3 mr-1" />
          Details
        </GlassButton>
        
        {canGenerateBill ? (
          <GlassButton 
            variant="primary" 
            size="sm"
            onClick={() => onGenerateBill(order)}
            className="flex-1"
          >
            <IndianRupee className="w-3 h-3 mr-1" />
            Generate Bill
          </GlassButton>
        ) : billAlreadyGenerated ? (
          <GlassButton 
            variant="primary" 
            size="sm"
            onClick={() => onGenerateBill(order)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Receipt className="w-3 h-3 mr-1" />
            Print Bill
          </GlassButton>
        ) : nextStatus && (
          <GlassButton 
            variant="primary" 
            size="sm"
            onClick={() => onStatusUpdate(order.orderid, nextStatus)}
            className="flex-1"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            {nextStatus}
          </GlassButton>
        )}
      </div>
    </div>
  )
}

export default OrderManagement
