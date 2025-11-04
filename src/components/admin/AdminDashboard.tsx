"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable } from '@/components/ui/glass'
import { 
  Utensils, 
  CircleDot, 
  CheckCircle2, 
  Users, 
  ClipboardList, 
  IndianRupee, 
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  totalTables: number
  occupiedTables: number
  availableTables: number
  totalEmployees: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
}

interface RecentOrder {
  orderid: string
  tableNumber: string
  status: string
  totalAmount: number
  orderDate: string
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTables: 0,
    occupiedTables: 0,
    availableTables: 0,
    totalEmployees: 0,
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0
  })
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      // Fetch data from multiple endpoints
      const [tablesResponse, ordersResponse, employeesResponse] = await Promise.all([
        fetch('/api/tables/manage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      const tablesData = await tablesResponse.json()
      const ordersData = await ordersResponse.json()
      const employeesData = await employeesResponse.json()

      if (tablesData.success && ordersData.success) {
        const tables = tablesData.data || []
        const orders = ordersData.data?.orders || []
        const employees = employeesData.success ? (employeesData.data || []) : []
        
        // Calculate stats
        const totalTables = tables.length
        const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length
        const availableTables = tables.filter((t: any) => t.status === 'available').length
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayOrders = orders.filter((o: any) => new Date(o.orderDate) >= today)
        const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length

        setStats({
          totalTables,
          occupiedTables,
          availableTables,
          totalEmployees: employees.length,
          todayOrders: todayOrders.length,
          todayRevenue,
          pendingOrders
        })

        // Set recent orders (last 5)
        const recentOrdersData = orders
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            orderid: order.orderid,
            tableNumber: order.tableNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            orderDate: order.orderDate
          }))

        setRecentOrders(recentOrdersData)
      } else {
        // No data available - set empty state
        setStats({
          totalTables: 0,
          occupiedTables: 0,
          availableTables: 0,
          totalEmployees: 0,
          todayOrders: 0,
          todayRevenue: 0,
          pendingOrders: 0
        })
        setRecentOrders([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Empty state when API fails
      setStats({
        totalTables: 0,
        occupiedTables: 0,
        availableTables: 0,
        totalEmployees: 0,
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0
      })
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'preparing': return 'text-blue-400'
      case 'ready': return 'text-green-400'
      case 'served': return 'text-gray-400'
      default: return 'text-white'
    }
  }

  const handleOrderAction = (order: RecentOrder, action: string) => {
    console.log(`${action} order:`, order)
    // Implement order actions
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Tables</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTables}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Occupied</p>
              <p className="text-3xl font-bold text-red-600">{stats.occupiedTables}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{stats.availableTables}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Revenue and Orders Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Today's Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{stats.todayRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </GlassCard>
      </div>

        {/* Recent Orders */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
            <GlassButton variant="secondary" size="sm" className="flex items-center gap-2">
              <span>View All Orders</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>

          {recentOrders.length > 0 ? (
            <GlassTable
              headers={['Order ID', 'Table', 'Status', 'Amount', 'Time', 'Actions']}
              data={recentOrders.map(order => ({
                'Order ID': order.orderid,
                'Table': order.tableNumber,
                'Status': (
                  <span className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                ),
                'Amount': `₹${order.totalAmount.toFixed(2)}`,
                'Time': new Date(order.orderDate).toLocaleTimeString(),
                _originalData: order
              }))}
              actions={[
                { label: 'View', key: 'view', variant: 'secondary' },
                { label: 'Update', key: 'update', variant: 'primary' }
              ]}
              onRowAction={handleOrderAction}
            />
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