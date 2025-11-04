"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable } from '@/components/ui/glass'
import { AdminAPI } from '@/lib/adminApi'
import { 
  Utensils, 
  CircleDot, 
  CheckCircle2, 
  Users, 
  ClipboardList, 
  IndianRupee, 
  Clock,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  ChefHat,
  Trophy
} from 'lucide-react'

interface DashboardStats {
  tables: {
    total: number
    occupied: number
    available: number
    reserved: number
    occupancyRate: string
  }
  orders: {
    today: number
    pending: number
    preparing: number
    ready: number
    served: number
    total: number
  }
  revenue: {
    today: number
    weekly: number
    monthly: number
    avgOrderValue: number
  }
  employees: {
    total: number
    active: number
  }
  recentOrders: RecentOrder[]
}

interface RecentOrder {
  orderid: string
  tableNumber: string
  status: string
  totalAmount: number
  orderDate: string
  items: number
  paymentStatus: string
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await AdminAPI.getDashboardStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-50'
      case 'preparing': return 'text-blue-500 bg-blue-50'
      case 'ready': return 'text-green-500 bg-green-50'
      case 'served': return 'text-gray-500 bg-gray-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <GlassButton onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </GlassButton>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Real-time overview of your restaurant</p>
        </div>
        <GlassButton 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </GlassButton>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.today)}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: {formatCurrency(stats.revenue.avgOrderValue)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders.today}</p>
              <p className="text-sm text-gray-500 mt-1">Total: {stats.orders.total}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Table Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tables.occupancyRate}%</p>
              <p className="text-sm text-gray-500 mt-1">{stats.tables.occupied}/{stats.tables.total} occupied</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.employees.active}</p>
              <p className="text-sm text-gray-500 mt-1">Total: {stats.employees.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tables & Orders Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Status */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Table Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.tables.available}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <CircleDot className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.tables.occupied}</p>
              <p className="text-sm text-gray-600">Occupied</p>
            </div>
          </div>
          {stats.tables.reserved > 0 && (
            <div className="mt-4 text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-600">{stats.tables.reserved}</p>
              <p className="text-sm text-gray-600">Reserved</p>
            </div>
          )}
        </GlassCard>

        {/* Order Status */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Order Pipeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.orders.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Preparing</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.orders.preparing}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Ready</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.orders.ready}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Revenue Analytics */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Revenue Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <IndianRupee className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue.today)}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <IndianRupee className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue.weekly)}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <IndianRupee className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.revenue.monthly)}</p>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
        </div>
      </GlassCard>

      {/* Recent Orders */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Recent Orders
          </h3>
          <GlassButton 
            variant="secondary" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/admin/orders'}
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </div>

        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Table</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.orderid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      #{order.orderid.slice(-6)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Table {order.tableNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {order.items} items
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatTime(order.orderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">No recent orders</p>
            <p className="text-gray-500 text-sm">Orders will appear here when customers place them</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

export default AdminDashboard