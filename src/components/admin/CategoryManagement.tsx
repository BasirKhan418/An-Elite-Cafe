"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  FolderOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface Category {
  _id: string
  categoryid: string
  name: string
  icon?: string
  createdAt?: string
}

interface CategoryFormData {
  categoryid: string
  name: string
  icon?: string
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    categoryid: '',
    name: '',
    icon: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        window.location.href = '/admin/login'
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
      } else {
        console.error('Error fetching categories:', data.message)
        if (data.message === 'Invalid token') {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminData')
          window.location.href = '/admin/login'
        }
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      categoryid: '',
      name: '',
      icon: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      categoryid: category.categoryid,
      name: category.name,
      icon: category.icon || ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteWarning(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/category', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryid: categoryToDelete.categoryid })
      })

      const data = await response.json()

      if (data.success) {
        setCategories(categories.filter(c => c._id !== categoryToDelete._id))
        setShowDeleteWarning(false)
        setCategoryToDelete(null)
      } else {
        console.error('Error deleting category:', data.message)
        alert(data.message || 'Error deleting category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category. Please try again.')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.categoryid.trim()) {
      newErrors.categoryid = 'Category ID is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    if (formData.icon && formData.icon.trim() && !isValidUrl(formData.icon)) {
      newErrors.icon = 'Icon must be a valid URL'
    }

    // Check for duplicate category ID (only for new categories or different ID)
    const existingCategory = categories.find(c => c.categoryid === formData.categoryid)
    if (existingCategory && (!editingCategory || existingCategory._id !== editingCategory._id)) {
      newErrors.categoryid = 'Category ID already exists'
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
      const method = editingCategory ? 'PUT' : 'POST'
      
      const payload: any = {
        categoryid: formData.categoryid,
        name: formData.name
      }

      if (formData.icon && formData.icon.trim()) {
        payload.icon = formData.icon
      }

      const response = await fetch('/api/category', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        await fetchCategories()
        setShowModal(false)
        setFormData({ categoryid: '', name: '', icon: '' })
      } else {
        console.error('Error saving category:', data.message)
        alert(data.message || 'Error saving category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const tableData = categories.map(category => ({
    'Category ID': category.categoryid,
    'Name': category.name,
    'Icon': category.icon ? (
      <a href={category.icon} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        View Icon
      </a>
    ) : 'N/A',
    'Created': category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A',
    _original: category
  }))

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            Category Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage menu categories</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <GlassButton
            variant="secondary"
            onClick={fetchCategories}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleAddCategory}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Categories</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Categories Table */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">All Categories</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Categories Found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first category</p>
            <GlassButton variant="primary" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </GlassButton>
          </div>
        ) : (
          <GlassTable
            headers={['Category ID', 'Name', 'Icon', 'Created', 'Actions']}
            data={tableData}
            onRowAction={(row, action) => {
              if (action === 'edit') {
                handleEditCategory(row._original)
              } else if (action === 'delete') {
                handleDeleteCategory(row._original)
              }
            }}
            actions={[
              { label: 'Edit', key: 'edit', variant: 'secondary' },
              { label: 'Delete', key: 'delete', variant: 'danger' }
            ]}
          />
        )}
      </GlassCard>

      {/* Add/Edit Category Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Category ID *"
            name="categoryid"
            value={formData.categoryid}
            onChange={handleInputChange}
            placeholder="e.g., appetizers"
            error={errors.categoryid}
            disabled={!!editingCategory}
          />

          <GlassInput
            label="Category Name *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Appetizers"
            error={errors.name}
          />

          <GlassInput
            label="Icon URL (optional)"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            placeholder="https://example.com/icon.png"
            error={errors.icon}
          />

          <div className="flex gap-3 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Delete Warning Modal */}
      <GlassModal
        isOpen={showDeleteWarning}
        onClose={() => {
          setShowDeleteWarning(false)
          setCategoryToDelete(null)
        }}
        title="⚠️ Delete Category Warning"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1 text-sm sm:text-base">
                Warning: This action cannot be undone!
              </h3>
              <p className="text-xs sm:text-sm text-red-700">
                Deleting this category will also delete <strong>all menu items</strong> associated with it.
              </p>
            </div>
          </div>

          {categoryToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">You are about to delete:</p>
              <p className="font-semibold text-gray-900 text-base">{categoryToDelete.name}</p>
              <p className="text-sm text-gray-500">ID: {categoryToDelete.categoryid}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => {
                setShowDeleteWarning(false)
                setCategoryToDelete(null)
              }}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="button"
              variant="danger"
              onClick={confirmDelete}
              className="flex-1 order-1 sm:order-2"
            >
              Yes, Delete Category
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}

export default CategoryManagement
