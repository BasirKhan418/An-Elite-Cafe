"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  UtensilsCrossed, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react'

interface Category {
  _id: string
  categoryid: string
  name: string
}

interface Menu {
  _id: string
  menuid: string
  name: string
  description?: string
  price: number
  category?: string
  img?: string
  icon?: string
  status: 'available' | 'unavailable'
  preparationTime?: number
  isActive: boolean
  isVegetarian: boolean
  isSpicy: boolean
  isGlutenFree: boolean
  createdAt?: string
}

interface MenuFormData {
  menuid: string
  name: string
  description: string
  price: string
  category: string
  img: string
  icon: string
  status: 'available' | 'unavailable'
  preparationTime: string
  isVegetarian: boolean
  isSpicy: boolean
  isGlutenFree: boolean
}

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState<MenuFormData>({
    menuid: '',
    name: '',
    description: '',
    price: '',
    category: '',
    img: '',
    icon: '',
    status: 'available',
    preparationTime: '',
    isVegetarian: false,
    isSpicy: false,
    isGlutenFree: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
    fetchMenus()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      const response = await fetch('/api/category', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories || [])
      } else if (data.message === 'Invalid token') {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminData')
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        window.location.href = '/admin/login'
        return
      }

      const response = await fetch('/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setMenus(data.menus || [])
      } else {
        console.error('Error fetching menus:', data.message)
        if (data.message === 'Invalid token') {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminData')
          window.location.href = '/admin/login'
        }
        setMenus([])
      }
    } catch (error) {
      console.error('Error fetching menus:', error)
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMenu = () => {
    setEditingMenu(null)
    setFormData({
      menuid: '',
      name: '',
      description: '',
      price: '',
      category: '',
      img: '',
      icon: '',
      status: 'available',
      preparationTime: '',
      isVegetarian: false,
      isSpicy: false,
      isGlutenFree: false
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu)
    setFormData({
      menuid: menu.menuid,
      name: menu.name,
      description: menu.description || '',
      price: menu.price.toString(),
      category: menu.category || '',
      img: menu.img || '',
      icon: menu.icon || '',
      status: menu.status,
      preparationTime: menu.preparationTime?.toString() || '',
      isVegetarian: menu.isVegetarian,
      isSpicy: menu.isSpicy,
      isGlutenFree: menu.isGlutenFree
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeleteMenu = async (menu: Menu) => {
    if (window.confirm(`Are you sure you want to delete ${menu.name}?`)) {
      try {
        const token = localStorage.getItem('adminToken')
        
        const response = await fetch('/api/menu', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ menuid: menu.menuid })
        })

        const data = await response.json()

        if (data.success) {
          setMenus(menus.filter(m => m._id !== menu._id))
        } else {
          console.error('Error deleting menu:', data.message)
          alert(data.message || 'Error deleting menu')
        }
      } catch (error) {
        console.error('Error deleting menu:', error)
        alert('Error deleting menu. Please try again.')
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.menuid.trim()) {
      newErrors.menuid = 'Menu ID is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Menu name is required'
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Valid price is required'
    }
    if (formData.preparationTime && (isNaN(Number(formData.preparationTime)) || Number(formData.preparationTime) < 0)) {
      newErrors.preparationTime = 'Preparation time must be a positive number'
    }
    if (formData.img && formData.img.trim() && !isValidUrl(formData.img)) {
      newErrors.img = 'Image must be a valid URL'
    }
    if (formData.icon && formData.icon.trim() && !isValidUrl(formData.icon)) {
      newErrors.icon = 'Icon must be a valid URL'
    }

    // Check for duplicate menu ID (only for new menus or different ID)
    const existingMenu = menus.find(m => m.menuid === formData.menuid)
    if (existingMenu && (!editingMenu || existingMenu._id !== editingMenu._id)) {
      newErrors.menuid = 'Menu ID already exists'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const method = editingMenu ? 'PUT' : 'POST'
      
      const payload: any = {
        menuid: formData.menuid,
        name: formData.name,
        price: Number(formData.price),
        status: formData.status,
        isActive: true,
        isVegetarian: formData.isVegetarian,
        isSpicy: formData.isSpicy,
        isGlutenFree: formData.isGlutenFree
      }

      if (formData.description.trim()) payload.description = formData.description
      if (formData.category.trim()) payload.category = formData.category
      if (formData.img.trim()) payload.img = formData.img
      if (formData.icon.trim()) payload.icon = formData.icon
      if (formData.preparationTime) payload.preparationTime = Number(formData.preparationTime)

      const response = await fetch('/api/menu', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        await fetchMenus()
        setShowModal(false)
        setFormData({
          menuid: '',
          name: '',
          description: '',
          price: '',
          category: '',
          img: '',
          icon: '',
          status: 'available',
          preparationTime: '',
          isVegetarian: false,
          isSpicy: false,
          isGlutenFree: false
        })
      } else {
        console.error('Error saving menu:', data.message)
        alert(data.message || 'Error saving menu')
      }
    } catch (error) {
      console.error('Error saving menu:', error)
      alert('Error saving menu. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'N/A'
    const category = categories.find(c => c._id === categoryId)
    return category?.name || 'Unknown'
  }

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || menu.category === filterCategory
    const matchesStatus = filterStatus === 'all' || menu.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const tableData = filteredMenus.map(menu => ({
    'Menu ID': menu.menuid,
    'Name': menu.name,
    'Category': getCategoryName(menu.category),
    'Price': `₹${menu.price.toFixed(2)}`,
    'Status': (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        menu.status === 'available' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {menu.status === 'available' ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {menu.status}
      </span>
    ),
    'Tags': (
      <div className="flex gap-1 flex-wrap">
        {menu.isVegetarian && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Veg</span>
        )}
        {menu.isSpicy && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Spicy</span>
        )}
        {menu.isGlutenFree && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">GF</span>
        )}
      </div>
    ),
    _original: menu
  }))

  const availableMenus = menus.filter(m => m.status === 'available').length
  const unavailableMenus = menus.filter(m => m.status === 'unavailable').length

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8" />
            Menu Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage menu items and pricing</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <GlassButton
            variant="secondary"
            onClick={fetchMenus}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleAddMenu}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{menus.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Available</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{availableMenus}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Unavailable</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{unavailableMenus}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Categories</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{categories.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-white/90 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/50 transition-all"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 text-sm sm:text-base bg-white/90 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/50 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm sm:text-base bg-white/90 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </GlassCard>

      {/* Menu Table */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">All Menu Items</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Loading menu items...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No Menu Items Found' 
                : 'No Menu Items'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first menu item'}
            </p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <GlassButton variant="primary" onClick={handleAddMenu}>
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </GlassButton>
            )}
          </div>
        ) : (
          <GlassTable
            headers={['Menu ID', 'Name', 'Category', 'Price', 'Status', 'Tags', 'Actions']}
            data={tableData}
            onRowAction={(row, action) => {
              if (action === 'edit') {
                handleEditMenu(row._original)
              } else if (action === 'delete') {
                handleDeleteMenu(row._original)
              }
            }}
            actions={[
              { label: 'Edit', key: 'edit', variant: 'secondary' },
              { label: 'Delete', key: 'delete', variant: 'danger' }
            ]}
          />
        )}
      </GlassCard>

      {/* Add/Edit Menu Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Menu ID *"
              name="menuid"
              value={formData.menuid}
              onChange={handleInputChange}
              placeholder="e.g., burger-001"
              error={errors.menuid}
              disabled={!!editingMenu}
            />

            <GlassInput
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Classic Burger"
              error={errors.name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter menu item description..."
              rows={3}
              className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Price *"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              error={errors.price}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Image URL"
              name="img"
              value={formData.img}
              onChange={handleInputChange}
              placeholder="https://..."
              error={errors.img}
            />

            <GlassInput
              label="Icon URL"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="https://..."
              error={errors.icon}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Prep Time (minutes)"
              name="preparationTime"
              type="number"
              value={formData.preparationTime}
              onChange={handleInputChange}
              placeholder="15"
              error={errors.preparationTime}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700">Dietary Tags</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-600"
                />
                <span className="text-sm text-gray-700 font-medium">🌱 Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="isSpicy"
                  checked={formData.isSpicy}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-600"
                />
                <span className="text-sm text-gray-700 font-medium">🌶️ Spicy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-600"
                />
                <span className="text-sm text-gray-700 font-medium">🌾 Gluten Free</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1 order-1 sm:order-2"
            >
              {editingMenu ? 'Update Menu Item' : 'Create Menu Item'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}

export default MenuManagement
