"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  IndianRupee,
  BarChart3,
  ShoppingCart,
  ChefHat,
  RefreshCw,
  Zap,
  Boxes,
  Clock,
  DollarSign,
  Activity,
  Archive
} from 'lucide-react'

interface InventoryStats {
  totalValue: number
  totalItems: number
  lowStockItems: number
  categoryBreakdown?: {
    category: string
    count: number
    value: number
  }[]
}

interface TransactionStats {
  _id: string
  count: number
  totalValue: number
}

interface RecentTransaction {
  _id: string
  transactionid: string
  item: {
    _id: string
    name: string
    unit: string
  }
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  status: string
  reference?: string
  notes?: string
  createdAt: string
}

const InventoryDashboard: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0
  })
  const [transactionStats, setTransactionStats] = useState<TransactionStats[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      // Fetch inventory stats
      const inventoryResponse = await fetch('/api/inventory/items?stats=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        if (inventoryData.success) {
          setStats(inventoryData.stats)
        }
      }

      // Fetch transaction stats (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const transactionResponse = await fetch(`/api/inventory/transactions?stats=true&dateFrom=${thirtyDaysAgo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json()
        if (transactionData.success) {
          setTransactionStats(transactionData.stats)
        }
      }

      // Fetch recent transactions (last 10)
      const recentTransactionsResponse = await fetch('/api/inventory/transactions?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (recentTransactionsResponse.ok) {
        const recentData = await recentTransactionsResponse.json()
        if (recentData.success) {
          setRecentTransactions(recentData.transactions || [])
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600' }
      case 'usage': return { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' }
      case 'waste': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-600' }
      case 'adjustment': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-600' }
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return TrendingUp
      case 'usage': return ChefHat
      case 'waste': return TrendingDown
      case 'adjustment': return BarChart3
      default: return Package
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-7 h-7 sm:w-8 sm:h-8" />
              Inventory Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Overview of your cafe's inventory and stock management</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-7 h-7 sm:w-8 sm:h-8" />
            Inventory Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Overview of inventory and stock management</p>
        </div>
        <GlassButton
          variant="secondary"
          onClick={fetchDashboardData}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </GlassButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Inventory Value */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        {/* Total Active Items */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        {/* Low Stock Alert */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Low Stock</p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stats.lowStockItems > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                {stats.lowStockItems}
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
              stats.lowStockItems > 0 ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${
                stats.lowStockItems > 0 ? 'text-orange-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
        </GlassCard>

        {/* Average Item Value */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Avg. Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalItems > 0 ? stats.totalValue / stats.totalItems : 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Transaction Summary */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Transaction Summary (Last 30 Days)</h2>
        
        {transactionStats.length > 0 ? (
          <div className="space-y-4">
            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Transaction Type</th>
                    <th className="text-center px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Total Count</th>
                    <th className="text-right px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Total Value</th>
                    <th className="text-right px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Average per Transaction</th>
                    <th className="text-center px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionStats.map((stat, index) => {
                    const IconComponent = getTransactionTypeIcon(stat._id)
                    const colors = getTransactionTypeColor(stat._id)
                    const totalTransactions = transactionStats.reduce((acc, s) => acc + s.count, 0)
                    const totalValue = transactionStats.reduce((acc, s) => acc + s.totalValue, 0)
                    const countPercentage = ((stat.count / totalTransactions) * 100).toFixed(1)
                    const valuePercentage = ((stat.totalValue / totalValue) * 100).toFixed(1)
                    
                    return (
                      <tr key={stat._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm capitalize ${colors.text}`}>
                                {stat._id.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stat._id === 'purchase' ? 'Stock additions' :
                                 stat._id === 'usage' ? 'Recipe usage' :
                                 stat._id === 'waste' ? 'Spoilage/Loss' :
                                 'Stock adjustments'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <p className="text-xl font-bold text-gray-900">{stat.count}</p>
                          <p className="text-xs text-gray-500 mt-0.5">transactions</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(stat.totalValue)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <p className="text-lg font-semibold text-gray-700">
                            {formatCurrency(stat.count > 0 ? stat.totalValue / stat.count : 0)}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  stat._id === 'purchase' ? 'bg-green-500' :
                                  stat._id === 'usage' ? 'bg-red-500' :
                                  stat._id === 'waste' ? 'bg-orange-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${countPercentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs font-medium text-gray-600">{countPercentage}%</p>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-100">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">Overall Total</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <p className="text-xl font-bold text-gray-900">
                        {transactionStats.reduce((acc, stat) => acc + stat.count, 0)}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(transactionStats.reduce((acc, stat) => acc + stat.totalValue, 0))}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <p className="text-lg font-semibold text-gray-700">
                        {formatCurrency(
                          transactionStats.reduce((acc, stat) => acc + stat.count, 0) > 0
                            ? transactionStats.reduce((acc, stat) => acc + stat.totalValue, 0) / 
                              transactionStats.reduce((acc, stat) => acc + stat.count, 0)
                            : 0
                        )}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <p className="text-xs font-semibold text-gray-600">100%</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Total Transactions</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {transactionStats.reduce((acc, stat) => acc + stat.count, 0)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Total Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">
                  {formatCurrency(transactionStats.reduce((acc, stat) => acc + stat.totalValue, 0))}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Daily Average</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                  {Math.round(transactionStats.reduce((acc, stat) => acc + stat.count, 0) / 30)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <p className="text-xs sm:text-sm text-orange-700 font-medium mb-1">Avg Transaction</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900">
                  {formatCurrency(
                    transactionStats.reduce((acc, stat) => acc + stat.count, 0) > 0
                      ? transactionStats.reduce((acc, stat) => acc + stat.totalValue, 0) / 
                        transactionStats.reduce((acc, stat) => acc + stat.count, 0)
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No transaction data available for the last 30 days</p>
          </div>
        )}
      </GlassCard>

      {/* Recent Transactions with Item Details */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Date</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Item Name</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Type</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Quantity</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Cost</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => {
                  const IconComponent = getTransactionTypeIcon(transaction.type)
                  const colors = getTransactionTypeColor(transaction.type)
                  
                  return (
                    <tr key={transaction._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{transaction.item.name}</p>
                        <p className="text-xs text-gray-500">{transaction.item.unit}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 ${colors.icon}`} />
                          </div>
                          <span className={`text-sm font-medium capitalize ${colors.text}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.totalCost)}</p>
                        <p className="text-xs text-gray-500">@ {formatCurrency(transaction.unitCost)}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <p className="text-xs text-gray-600 max-w-[200px] truncate">
                          {transaction.notes || transaction.reference || '-'}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent transactions available</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

export default InventoryDashboard