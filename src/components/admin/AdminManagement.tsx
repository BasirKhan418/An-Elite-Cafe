"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  UserPlus,
  RefreshCw,
  Calendar,
  Key
} from 'lucide-react'
import { toast } from 'sonner'

interface Admin {
  _id: string
  name: string
  username: string
  email: string
  role: string
  img?: string
  adminid: string
  joinDate: string
  permissions: string[]
  isActive: boolean
  createdBy?: string
}

interface AdminFormData {
  name: string
  username: string
  email: string
  password?: string
  permissions: string[]
  img?: string
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    permissions: [],
    img: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const availablePermissions = [
    { value: 'manage_employees', label: 'Manage Employees' },
    { value: 'manage_tables', label: 'Manage Tables' },
    { value: 'view_orders', label: 'View Orders' },
    { value: 'manage_orders', label: 'Manage Orders' },
    { value: 'manage_inventory', label: 'Manage Inventory' },
    { value: 'view_analytics', label: 'View Analytics' },
    { value: 'system_settings', label: 'System Settings' }
  ]

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.data || [])
      } else {
        console.error('Error fetching admins:', data.message)
        toast.error(data.message || 'Failed to fetch admins')
        setAdmins([])
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Error fetching admins. Please try again.')
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = () => {
    setEditingAdmin(null)
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      permissions: [],
      img: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      username: admin.username,
      email: admin.email,
      password: '', // Don't show password
      permissions: admin.permissions,
      img: admin.img || ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    toast.warning(`Remove ${admin.name}?`, {
      description: "This admin will be deactivated and lose access.",
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            const token = localStorage.getItem('adminToken')
            
            const response = await fetch(`/api/admins?id=${admin._id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            const data = await response.json()

            if (data.success) {
              setAdmins(admins.filter(a => a._id !== admin._id))
              toast.success('Admin removed successfully!')
            } else {
              console.error('Error deleting admin:', data.message)
              toast.error(data.message || 'Error deleting admin')
            }
          } catch (error) {
            console.error('Error deleting admin:', error)
            toast.error('Error deleting admin. Please try again.')
          }
        }
      }
    })
  }

  const handleToggleStatus = async (admin: Admin) => {
    const action = admin.isActive ? 'deactivate' : 'activate'
    toast.warning(`${action.charAt(0).toUpperCase() + action.slice(1)} ${admin.name}?`, {
      description: `Admin will be ${action}d`,
      action: {
        label: action.charAt(0).toUpperCase() + action.slice(1),
        onClick: async () => {
          try {
            const token = localStorage.getItem('adminToken')
            
            const response = await fetch('/api/admins', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                id: admin._id,
                isActive: !admin.isActive 
              })
            })

            const data = await response.json()

            if (data.success) {
              setAdmins(admins.map(a => 
                a._id === admin._id 
                  ? { ...a, isActive: !a.isActive }
                  : a
              ))
              toast.success(`Admin ${action}d successfully!`)
            } else {
              console.error('Error toggling status:', data.message)
              toast.error(data.message || 'Error toggling status')
            }
          } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Error toggling status. Please try again.')
          }
        }
      }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password is required only when creating new admin
    if (!editingAdmin && !formData.password) {
      newErrors.password = 'Password is required'
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required'
    }

    // Check for duplicate email/username (only for new admins or different email)
    const existingAdmin = admins.find(a => 
      (a.email === formData.email || a.username === formData.username) &&
      (!editingAdmin || a._id !== editingAdmin._id)
    )
    if (existingAdmin) {
      if (existingAdmin.email === formData.email) {
        newErrors.email = 'Email already exists'
      }
      if (existingAdmin.username === formData.username) {
        newErrors.username = 'Username already exists'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const method = editingAdmin ? 'PUT' : 'POST'
      
      const payload: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        permissions: formData.permissions,
        img: formData.img
      }

      // Only include password for new admins
      if (!editingAdmin && formData.password) {
        payload.password = formData.password
        payload.role = 'admin' // Force role to be admin
      }

      // Include ID for updates
      if (editingAdmin) {
        payload.id = editingAdmin._id
      }

      const response = await fetch('/api/admins', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        if (editingAdmin) {
          // Update existing admin
          setAdmins(admins.map(a => 
            a._id === editingAdmin._id 
              ? { ...a, ...formData, password: undefined }
              : a
          ))
          toast.success('Admin updated successfully!')
        } else {
          // Add new admin
          await fetchAdmins() // Refresh list
          toast.success('Admin added successfully!')
        }
        setShowModal(false)
      } else {
        console.error('Error saving admin:', data.message)
        if (data.errors) {
          console.error('Validation errors:', data.errors)
          // Show first validation error
          const firstError = data.errors[0]
          toast.error(`${firstError.path.join('.')}: ${firstError.message}`)
        } else {
          toast.error(data.message || 'Error saving admin. Please check the form and try again.')
        }
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      toast.error('Error saving admin. Please try again.')
    }
  }

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Admin Management
          </h1>
          <p className="text-gray-600 mt-1">Manage admin accounts and permissions</p>
        </div>
        <div className="flex gap-3">
          <GlassButton
            onClick={fetchAdmins}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </GlassButton>
          <GlassButton
            onClick={handleAddAdmin}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{admins.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Admins</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {admins.filter(a => a.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Admins</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {admins.filter(a => !a.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Admins Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-900">Admin</th>
                <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                <th className="text-left p-4 font-semibold text-gray-900">Admin ID</th>
                <th className="text-left p-4 font-semibold text-gray-900">Permissions</th>
                <th className="text-left p-4 font-semibold text-gray-900">Join Date</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No admins found. Add your first admin to get started.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                          <p className="text-sm text-gray-500">@{admin.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{admin.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {admin.adminid}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.slice(0, 2).map(perm => (
                          <span key={perm} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {admin.permissions.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{admin.permissions.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(admin.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${getStatusColor(admin.isActive)}`}>
                        {getStatusIcon(admin.isActive)}
                        <span className="text-sm font-medium">
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <GlassButton
                          onClick={() => handleEditAdmin(admin)}
                          variant="secondary"
                          className="p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </GlassButton>
                        <GlassButton
                          onClick={() => handleToggleStatus(admin)}
                          variant="secondary"
                          className="p-2"
                        >
                          {admin.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </GlassButton>
                        <GlassButton
                          onClick={() => handleDeleteAdmin(admin)}
                          variant="secondary"
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </GlassButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add/Edit Admin Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <GlassInput
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <GlassInput
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <GlassInput
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className={errors.email ? 'border-red-500' : ''}
              disabled={!!editingAdmin}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {!editingAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <GlassInput
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter secure password"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions * <span className="text-gray-500 font-normal">(Select at least one)</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availablePermissions.map(perm => (
                <label key={perm.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{perm.label}</span>
                </label>
              ))}
            </div>
            {errors.permissions && <p className="text-red-500 text-xs mt-1">{errors.permissions}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image URL (Optional)
            </label>
            <GlassInput
              type="url"
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton
              type="submit"
              className="flex-1"
            >
              {editingAdmin ? 'Update Admin' : 'Add Admin'}
            </GlassButton>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}

export default AdminManagement
