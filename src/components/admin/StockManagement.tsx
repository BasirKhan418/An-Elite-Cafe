"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassModal, GlassInput } from '@/components/ui/glass'
import { InventoryCategoryValues, INVENTORY_CATEGORY_LABELS } from '@/constants/inventory'
import { 
  Package, 
  Plus, 
  Edit2,
  RefreshCw,
  Search,
  AlertTriangle,
  ShoppingCart,
  Minus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChefHat
} from 'lucide-react'

// Create category options from enum
const categoryOptions = InventoryCategoryValues.map((value) => ({
  id: value,
  name: INVENTORY_CATEGORY_LABELS[value],
  type: value,
}))

// Helper function to get category display name
const getCategoryDisplayName = (categoryValue: string) => {
  const option = categoryOptions.find(opt => opt.id === categoryValue)
  return option ? option.name : categoryValue
}

interface InventoryItem {
  _id: string
  itemid: string
  name: string
  description?: string
  category: string // Now stores enum value directly
  unit: string
  currentStock: number
  minimumStock: number
  maximumStock?: number
  averageCostPerUnit: number
  totalValue: number
  status: string
  isPerishable: boolean
  storageLocation?: string
  tags: string[]
  createdAt: string
}

interface StockTransaction {
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
  previousStock: number
  newStock: number
  reference?: string
  notes?: string
  performedBy: string
  createdAt: string
}

interface ItemFormData {
  itemid: string
  name: string
  description: string
  category: string
  unit: string
  currentStock: string
  minimumStock: string
  maximumStock: string
  averageCostPerUnit: string
  isPerishable: boolean
  storageLocation: string
  tags: string
}

interface TransactionFormData {
  transactionid: string
  item: string
  type: string
  quantity: string
  unitCost: string
  reference: string
  notes: string
}

const StockManagement: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'transactions'>('items')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showLowStock, setShowLowStock] = useState(false)

  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    itemid: '',
    name: '',
    description: '',
    category: '',
    unit: 'units',
    currentStock: '0',
    minimumStock: '0',
    maximumStock: '',
    averageCostPerUnit: '0',
    isPerishable: false,
    storageLocation: '',
    tags: ''
  })

  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    transactionid: '',
    item: '',
    type: 'purchase',
    quantity: '',
    unitCost: '0',
    reference: '',
    notes: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchItems()
    fetchTransactions()
  }, [])

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      let url = '/api/inventory/items'
      if (showLowStock) {
        url += '?lowStock=true'
      } else if (filterCategory !== 'all') {
        url += `?category=${filterCategory}`
      }
      if (searchTerm) {
        url += `${url.includes('?') ? '&' : '?'}search=${encodeURIComponent(searchTerm)}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setItems(data.items)
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      const response = await fetch('/api/inventory/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTransactions(data.transactions)
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      const toNum = (v: string, def = 0) => {
        const n = parseFloat(v)
        return Number.isFinite(n) ? n : def
      }

      const payload = {
        ...itemFormData,
        currentStock: toNum(itemFormData.currentStock, 0),
        minimumStock: toNum(itemFormData.minimumStock, 0),
        maximumStock: itemFormData.maximumStock ? toNum(itemFormData.maximumStock, 0) : undefined,
        averageCostPerUnit: toNum(itemFormData.averageCostPerUnit, 0),
        totalValue: toNum(itemFormData.currentStock, 0) * toNum(itemFormData.averageCostPerUnit, 0),
        status: 'active',
        isActive: true,
        tags: itemFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const url = editingItem ? '/api/inventory/items' : '/api/inventory/items'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setShowItemModal(false)
        setEditingItem(null)
        resetItemForm()
        fetchItems()
      } else {
        if (result.details) {
          const errorObj: {[key: string]: string} = {}
          result.details.forEach((detail: any) => {
            if (detail.path) {
              errorObj[detail.path[0]] = detail.message
            }
          })
          setErrors(errorObj)
        }
      }
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')

      const payload = {
        ...transactionFormData,
        transactionid: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: parseFloat(transactionFormData.quantity),
        unitCost: parseFloat(transactionFormData.unitCost),
        performedBy: adminData.adminid || 'admin'
      }

      const response = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setShowTransactionModal(false)
        resetTransactionForm()
        fetchItems()
        fetchTransactions()
      } else {
        if (result.details) {
          const errorObj: {[key: string]: string} = {}
          result.details.forEach((detail: any) => {
            if (detail.path) {
              errorObj[detail.path[0]] = detail.message
            }
          })
          setErrors(errorObj)
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const resetItemForm = () => {
    setItemFormData({
      itemid: '',
      name: '',
      description: '',
      category: '',
      unit: 'units',
      currentStock: '0',
      minimumStock: '0',
      maximumStock: '',
      averageCostPerUnit: '0',
      isPerishable: false,
      storageLocation: '',
      tags: ''
    })
    setErrors({})
  }

  const resetTransactionForm = () => {
    setTransactionFormData({
      transactionid: '',
      item: '',
      type: 'purchase',
      quantity: '',
      unitCost: '0',
      reference: '',
      notes: ''
    })
    setErrors({})
  }

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item)
    setItemFormData({
      itemid: item.itemid,
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minimumStock: item.minimumStock.toString(),
      maximumStock: item.maximumStock?.toString() || '',
      averageCostPerUnit: item.averageCostPerUnit.toString(),
      isPerishable: item.isPerishable,
      storageLocation: item.storageLocation || '',
      tags: item.tags.join(', ')
    })
    setShowItemModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minimumStock) {
      return { status: 'Low Stock', color: 'text-red-500', icon: AlertTriangle }
    } else if (item.maximumStock && item.currentStock >= item.maximumStock) {
      return { status: 'Overstocked', color: 'text-orange-500', icon: TrendingUp }
    }
    return { status: 'Normal', color: 'text-green-500', icon: Package }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return ShoppingCart
      case 'usage': return Minus
      case 'waste': return TrendingDown
      case 'adjustment': return BarChart3
      default: return Package
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600'
      case 'usage': return 'text-red-600'
      case 'waste': return 'text-orange-600'
      case 'adjustment': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return { bg: 'bg-green-100', text: 'text-green-700', color: 'text-green-600' }
      case 'usage': return { bg: 'bg-red-100', text: 'text-red-700', color: 'text-red-600' }
      case 'waste': return { bg: 'bg-orange-100', text: 'text-orange-700', color: 'text-orange-600' }
      case 'adjustment': return { bg: 'bg-blue-100', text: 'text-blue-700', color: 'text-blue-600' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', color: 'text-gray-600' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-7 h-7 sm:w-8 sm:h-8" />
            Stock Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage inventory items and track stock transactions</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <GlassButton
            onClick={() => setActiveTab('items')}
            className={`flex-1 sm:flex-initial ${activeTab === 'items' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600'}`}
          >
            Items
          </GlassButton>
          <GlassButton
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 sm:flex-initial ${activeTab === 'transactions' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600'}`}
          >
            Transactions
          </GlassButton>
        </div>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Items</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{items.length}</p>
                  <p className="text-blue-600 text-xs mt-1">Active items</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Low Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {items.filter(i => i.currentStock <= i.minimumStock).length}
                  </p>
                  <p className="text-orange-600 text-xs mt-1">Need restocking</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(items.reduce((sum, item) => sum + item.totalValue, 0))}
                  </p>
                  <p className="text-green-600 text-xs mt-1">Inventory value</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Categories</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{categoryOptions.length}</p>
                  <p className="text-purple-600 text-xs mt-1">Item categories</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Filters and Search */}
          <GlassCard className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <GlassButton
                  onClick={() => setShowLowStock(!showLowStock)}
                  variant={showLowStock ? "primary" : "secondary"}
                  className="flex items-center justify-center gap-2 sm:w-auto"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Low Stock Filter</span>
                </GlassButton>
                <GlassButton 
                  onClick={fetchItems}
                  variant="secondary"
                  className="flex items-center justify-center gap-2 sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Data</span>
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    resetItemForm()
                    setShowItemModal(true)
                  }}
                  variant="primary"
                  className="flex items-center justify-center gap-2 sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-semibold">Add Item</span>
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    resetTransactionForm()
                    setShowTransactionModal(true)
                  }}
                  variant="secondary"
                  className="flex items-center justify-center gap-2 sm:w-auto border-green-300 text-green-700 bg-green-50/90 hover:bg-green-100/90"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-semibold">Add Transaction</span>
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Items Table */}
          <GlassCard className="overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-3 text-sm">Loading items...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Item</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Category</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Stock</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Unit Cost</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Total Value</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Status</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const stockStatus = getStockStatus(item)
                      const StatusIcon = stockStatus.icon
                      return (
                        <tr key={item._id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 sm:px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                              <p className="text-gray-600 text-xs mt-1">{item.description || 'No description'}</p>
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                      {tag}
                                    </span>
                                  ))}
                                  {item.tags.length > 2 && (
                                    <span className="text-xs text-gray-600">+{item.tags.length - 2} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-gray-700 text-sm">{getCategoryDisplayName(item.category)}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div>
                              <p className="text-gray-900 font-semibold text-sm">
                                {item.currentStock} {item.unit}
                              </p>
                              <p className="text-gray-600 text-xs">
                                Min: {item.minimumStock}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-gray-700 text-sm">{formatCurrency(item.averageCostPerUnit)}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-gray-900 font-semibold text-sm">{formatCurrency(item.totalValue)}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className={`flex items-center gap-1 text-sm font-medium ${stockStatus.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">{stockStatus.status}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <GlassButton
                              onClick={() => openEditModal(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </GlassButton>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No items found</p>
              </div>
            )}
          </GlassCard>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          </div>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Date & Time</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Item Details</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Transaction Type</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Quantity Change</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Cost Details</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-gray-700 text-xs sm:text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => {
                    const TransactionIcon = getTransactionIcon(transaction.type)
                    const typeColors = getTransactionTypeColor(transaction.type)
                    return (
                      <tr key={transaction._id} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-gray-900 font-medium text-sm">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.createdAt).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-gray-900 font-semibold text-sm">{transaction.item.name}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600">
                                Stock: {transaction.previousStock} → {transaction.newStock} {transaction.item.unit}
                              </span>
                              {transaction.type === 'usage' && transaction.notes && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                                  {transaction.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className={`flex items-center gap-2 text-sm font-medium ${typeColors.color}`}>
                            <TransactionIcon className="w-4 h-4" />
                            <div className="flex flex-col">
                              <span className="capitalize">{transaction.type}</span>
                              {transaction.reference && (
                                <span className="text-xs text-gray-500 font-normal">Ref: {transaction.reference}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1">
                            {transaction.type === 'purchase' || transaction.type === 'adjustment' && transaction.quantity > 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-600" />
                            )}
                            <span className={`font-semibold text-sm ${
                              transaction.type === 'purchase' || (transaction.type === 'adjustment' && transaction.quantity > 0)
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.item.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-gray-900 font-semibold text-sm">{formatCurrency(transaction.totalCost)}</p>
                            <p className="text-gray-500 text-xs">
                              @ {formatCurrency(transaction.unitCost)}/{transaction.item.unit}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No transactions found</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <GlassModal
          isOpen={showItemModal}
          onClose={() => {
            setShowItemModal(false)
            setEditingItem(null)
            resetItemForm()
          }}
          title={editingItem ? "Edit Item" : "Add New Item"}
        >
          <form onSubmit={handleItemSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item ID *
                </label>
                <input
                  type="text"
                  value={itemFormData.itemid}
                  onChange={(e) => setItemFormData({...itemFormData, itemid: e.target.value})}
                  placeholder="Enter item ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.itemid && <p className="text-red-600 text-xs mt-1">{errors.itemid}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                  placeholder="Enter item name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={itemFormData.description}
                onChange={(e) => setItemFormData({...itemFormData, description: e.target.value})}
                placeholder="Enter description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={itemFormData.category}
                  onChange={(e) => setItemFormData({...itemFormData, category: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={itemFormData.unit}
                  onChange={(e) => setItemFormData({...itemFormData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="packets">Packets</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                  <option value="cans">Cans</option>
                  <option value="units">Units</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  value={itemFormData.currentStock}
                  onChange={(e) => setItemFormData({...itemFormData, currentStock: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  value={itemFormData.minimumStock}
                  onChange={(e) => setItemFormData({...itemFormData, minimumStock: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock
                </label>
                <input
                  type="number"
                  value={itemFormData.maximumStock}
                  onChange={(e) => setItemFormData({...itemFormData, maximumStock: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Cost Per Unit (₹) *
                </label>
                <input
                  type="number"
                  value={itemFormData.averageCostPerUnit}
                  onChange={(e) => setItemFormData({...itemFormData, averageCostPerUnit: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={itemFormData.storageLocation}
                  onChange={(e) => setItemFormData({...itemFormData, storageLocation: e.target.value})}
                  placeholder="e.g., Pantry, Freezer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={itemFormData.tags}
                onChange={(e) => setItemFormData({...itemFormData, tags: e.target.value})}
                placeholder="e.g., organic, imported, seasonal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPerishable"
                checked={itemFormData.isPerishable}
                onChange={(e) => setItemFormData({...itemFormData, isPerishable: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isPerishable" className="ml-2 text-sm text-gray-700">
                This is a perishable item
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <GlassButton
                type="button"
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItem(null)
                  resetItemForm()
                }}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
              >
                {editingItem ? 'Update' : 'Create'} Item
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <GlassModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false)
            resetTransactionForm()
          }}
          title="Add Stock Transaction"
        >
          <form onSubmit={handleTransactionSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item *
              </label>
              <select
                value={transactionFormData.item}
                onChange={(e) => setTransactionFormData({...transactionFormData, item: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} (Current: {item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
              {errors.item && <p className="text-red-600 text-xs mt-1">{errors.item}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type *
                </label>
                <select
                  value={transactionFormData.type}
                  onChange={(e) => setTransactionFormData({...transactionFormData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="purchase">Purchase</option>
                  <option value="usage">Usage</option>
                  <option value="waste">Waste</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={transactionFormData.quantity}
                  onChange={(e) => setTransactionFormData({...transactionFormData, quantity: e.target.value})}
                  placeholder="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost (₹)
              </label>
              <input
                type="number"
                value={transactionFormData.unitCost}
                onChange={(e) => setTransactionFormData({...transactionFormData, unitCost: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference
              </label>
              <input
                type="text"
                value={transactionFormData.reference}
                onChange={(e) => setTransactionFormData({...transactionFormData, reference: e.target.value})}
                placeholder="e.g., Invoice #, Order #"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={transactionFormData.notes}
                onChange={(e) => setTransactionFormData({...transactionFormData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <GlassButton
                type="button"
                onClick={() => {
                  setShowTransactionModal(false)
                  resetTransactionForm()
                }}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
              >
                Add Transaction
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  )
}

export default StockManagement