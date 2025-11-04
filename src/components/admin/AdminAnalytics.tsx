"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { AdminAPI } from '@/lib/adminApi'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart,
  Package,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  Utensils,
  IndianRupee,
  Activity,
  Target,
  Award,
  Zap,
  ChefHat,
  BarChart2,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  period: {
    type: string
    startDate: string
    endDate: string
    days: number
  }
  financial: {
    revenue: {
      total: number
      paid: number
      pending: number
      growth: number
    }
    expenditure: {
      total: number
      purchases: number
      waste: number
      cogs: number
      growth: number
    }
    profit: {
      gross: number
      net: number
      grossMargin: number
      netMargin: number
    }
  }
  orders: {
    total: number
    completed: number
    cancelled: number
    pending: number
    avgOrderValue: number
    fulfillmentRate: number
    growth: number
  }
  inventory: {
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    totalItems: number
    stockTransactions: Record<string, { count: number; totalCost: number; totalQuantity: number }>
  }
  trends: {
    daily: Array<{ date: string; revenue: number; orders: number }>
    peakHours: Array<{ hour: number; orders: number; revenue: number }>
    topSellingItems: Array<{ name: string; quantity: number; revenue: number; orders: number }>
    categoryAnalysis: Array<{ name: string; revenue: number; orders: number; avgOrderValue: number }>
    tableUtilization: Array<{ tableNumber: string; orders: number; revenue: number; avgRevenue: number }>
  }
  payments: {
    methods: Array<{ method: string; count: number; revenue: number; percentage: number }>
  }
  alerts: {
    lowStock: Array<{ name: string; currentStock: number; minimumStock: number; unit: string }>
    outOfStock: Array<{ name: string; unit: string }>
  }
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [period, useCustomRange, customDateRange])

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = useCustomRange && customDateRange.start && customDateRange.end
        ? { startDate: customDateRange.start, endDate: customDateRange.end }
        : { period }

      const response = await AdminAPI.getAnalytics(params)
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        setError(response.message || 'Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${period}`
  }

  const exportToCSV = () => {
    if (!analytics) return

    const csvData = [
      ['An Elite Cafe - Analytics Report'],
      [`Period: ${formatDate(analytics.period.startDate)} to ${formatDate(analytics.period.endDate)}`],
      [''],
      ['Financial Summary'],
      ['Metric', 'Value'],
      ['Total Revenue', formatCurrency(analytics.financial.revenue.total)],
      ['Total Expenditure', formatCurrency(analytics.financial.expenditure.total)],
      ['Gross Profit', formatCurrency(analytics.financial.profit.gross)],
      ['Net Profit', formatCurrency(analytics.financial.profit.net)],
      ['Gross Margin', `${analytics.financial.profit.grossMargin}%`],
      ['Net Margin', `${analytics.financial.profit.netMargin}%`],
      [''],
      ['Order Summary'],
      ['Total Orders', analytics.orders.total],
      ['Completed Orders', analytics.orders.completed],
      ['Average Order Value', formatCurrency(analytics.orders.avgOrderValue)],
      ['Fulfillment Rate', `${analytics.orders.fulfillmentRate}%`]
    ]

    const csv = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading analytics...</p>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <GlassButton onClick={() => fetchAnalytics()} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </GlassButton>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {formatDate(analytics.period.startDate)} - {formatDate(analytics.period.endDate)} ({analytics.period.days} days)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <GlassButton
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </GlassButton>
          <GlassButton onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </GlassButton>
        </div>
      </div>

      {/* Period Selector */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Select Period
            </label>
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as const).map((p) => (
                <GlassButton
                  key={p}
                  onClick={() => {
                    setPeriod(p)
                    setUseCustomRange(false)
                  }}
                  variant={period === p && !useCustomRange ? 'primary' : 'secondary'}
                  size="sm"
                  className="capitalize"
                >
                  {p}
                </GlassButton>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <GlassButton
                onClick={() => setUseCustomRange(true)}
                disabled={!customDateRange.start || !customDateRange.end}
                size="sm"
              >
                Apply
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.financial.revenue.total)}
              </h3>
              <div className={`flex items-center mt-2 text-sm ${analytics.financial.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.financial.revenue.growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{Math.abs(analytics.financial.revenue.growth).toFixed(1)}% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Expenditure</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.financial.expenditure.total)}
              </h3>
              <div className={`flex items-center mt-2 text-sm ${analytics.financial.expenditure.growth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.financial.expenditure.growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{Math.abs(analytics.financial.expenditure.growth).toFixed(1)}% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Net Profit</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.financial.profit.net)}
              </h3>
              <div className="flex items-center mt-2 text-sm text-blue-600">
                <Target className="w-4 h-4 mr-1" />
                <span>{analytics.financial.profit.netMargin.toFixed(1)}% Margin</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {analytics.orders.total}
              </h3>
              <div className={`flex items-center mt-2 text-sm ${analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.orders.growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{Math.abs(analytics.orders.growth).toFixed(1)}% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Paid Revenue</span>
              </div>
              <span className="text-green-600 font-bold">{formatCurrency(analytics.financial.revenue.paid)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-700">Pending Revenue</span>
              </div>
              <span className="text-yellow-600 font-bold">{formatCurrency(analytics.financial.revenue.pending)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Average Order Value</span>
              </div>
              <span className="text-blue-600 font-bold">{formatCurrency(analytics.orders.avgOrderValue)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-red-600" />
            Expenditure Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-700">Purchases</span>
              </div>
              <span className="text-red-600 font-bold">{formatCurrency(analytics.financial.expenditure.purchases)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-700">Cost of Goods Sold</span>
              </div>
              <span className="text-orange-600 font-bold">{formatCurrency(analytics.financial.expenditure.cogs)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-700">Waste Cost</span>
              </div>
              <span className="text-yellow-600 font-bold">{formatCurrency(analytics.financial.expenditure.waste)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Profit Analysis */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Profit Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.financial.profit.gross)}</p>
            <p className="text-sm text-green-700 mt-1">{analytics.financial.profit.grossMargin.toFixed(2)}% Margin</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.financial.profit.net)}</p>
            <p className="text-sm text-blue-700 mt-1">{analytics.financial.profit.netMargin.toFixed(2)}% Margin</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600 mb-1">Revenue per Day</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics.financial.revenue.total / analytics.period.days)}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-sm text-gray-600 mb-1">Profit per Order</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(analytics.orders.total > 0 ? analytics.financial.profit.net / analytics.orders.total : 0)}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Order Performance */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Order Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.orders.total}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-gray-600 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{analytics.orders.completed}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-gray-600 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{analytics.orders.pending}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-gray-600 text-sm mb-2">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{analytics.orders.cancelled}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-gray-600 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.orders.fulfillmentRate.toFixed(1)}%</p>
          </div>
        </div>
      </GlassCard>

      {/* Top Selling Items */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Top Selling Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Item Name</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity Sold</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.trends.topSellingItems.slice(0, 10).map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{item.orders}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-semibold">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Category Analysis */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-600" />
          Category Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.trends.categoryAnalysis.map((category, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-600" />
                {category.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="text-green-600 font-bold">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders:</span>
                  <span className="text-blue-600 font-semibold">{category.orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Order Value:</span>
                  <span className="text-purple-600 font-semibold">{formatCurrency(category.avgOrderValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Peak Hours */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Peak Hours Analysis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {analytics.trends.peakHours.slice(0, 12).map((hourData, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center hover:shadow-md transition-all">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">{formatHour(hourData.hour)}</p>
              <p className="text-2xl font-bold text-blue-600">{hourData.orders}</p>
              <p className="text-xs text-gray-600 mt-1">{formatCurrency(hourData.revenue)}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Table Utilization */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Table Utilization
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Table</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Total Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.trends.tableUtilization.slice(0, 15).map((table, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">Table {table.tableNumber}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{table.orders}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-semibold">{formatCurrency(table.revenue)}</td>
                  <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(table.avgRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Payment Methods */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Payment Methods Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.payments.methods.map((method, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">{method.method}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {method.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="text-gray-900 font-medium">{method.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="text-green-600 font-bold">{formatCurrency(method.revenue)}</span>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Inventory Status */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Inventory Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <IndianRupee className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(analytics.inventory.totalValue)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.inventory.totalItems}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{analytics.inventory.lowStockItems}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{analytics.inventory.outOfStockItems}</p>
          </div>
        </div>

        {/* Stock Alerts */}
        {(analytics.alerts.lowStock.length > 0 || analytics.alerts.outOfStock.length > 0) && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Stock Alerts
            </h3>
            
            {analytics.alerts.outOfStock.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-red-700 font-semibold mb-3">
                  Out of Stock ({analytics.alerts.outOfStock.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analytics.alerts.outOfStock.map((item, index) => (
                    <span key={index} className="px-3 py-1.5 bg-red-100 border border-red-200 rounded-full text-sm font-medium text-red-700">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analytics.alerts.lowStock.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-yellow-700 font-semibold mb-3">
                  Low Stock ({analytics.alerts.lowStock.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.alerts.lowStock.slice(0, 9).map((item, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-yellow-200">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Current: {item.currentStock} {item.unit} / Min: {item.minimumStock} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Daily Revenue Trend */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Daily Revenue Trend
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {analytics.trends.daily.slice().reverse().map((day, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 font-medium">{formatDate(day.date)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{day.orders}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-bold">{formatCurrency(day.revenue)}</td>
                  <td className="py-3 px-4 text-right text-blue-600">
                    {day.orders > 0 ? formatCurrency(day.revenue / day.orders) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

export default AdminAnalytics
