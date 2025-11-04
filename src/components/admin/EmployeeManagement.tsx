"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  UserPlus,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
interface Employee {
  _id: string
  name: string
  username?: string
  email: string
  role: string
  img?: string
  empid: string
  joinDate: string
  shift: string
  isActive: boolean
}

interface EmployeeFormData {
  name: string
  username: string
  email: string
  role: string
  shift: string
  img?: string
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    username: '',
    email: '',
    role: '',
    shift: 'Morning Shift (9 AM - 5 PM)',
    img: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const shiftOptions = [
    'Morning Shift (9 AM - 5 PM)',
    'Evening Shift (5 PM - 1 AM)',
    'Night Shift (1 AM - 9 AM)',
    'Full Day (9 AM - 9 PM)'
  ]

  const roleOptions = [
    'Waiter',
    'Chef',
    'Cashier',
    'Manager',
    'Supervisor',
    'Kitchen Assistant',
    'Cleaner'
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data || [])
      } else {
        console.error('Error fetching employees:', data.message)
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setFormData({
      name: '',
      username: '',
      email: '',
      role: '',
      shift: 'Morning Shift (9 AM - 5 PM)',
      img: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      username: employee.username || '',
      email: employee.email,
      role: employee.role,
      shift: employee.shift,
      img: employee.img || ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    toast.warning(`Remove ${employee.name}?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            const token = localStorage.getItem('adminToken')
            
            const response = await fetch('/api/employees', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: employee.email })
            })

            const data = await response.json()

            if (data.success) {
              setEmployees(employees.filter(e => e._id !== employee._id))
              toast.success('Employee removed successfully!')
            } else {
              console.error('Error deleting employee:', data.message)
              toast.error(data.message || 'Error deleting employee')
            }
          } catch (error) {
            console.error('Error deleting employee:', error)
            toast.error('Error deleting employee. Please try again.')
          }
        }
      }
    })
  }

  const handleToggleStatus = async (employee: Employee) => {
    const action = employee.isActive ? 'deactivate' : 'activate'
    toast.warning(`${action.charAt(0).toUpperCase() + action.slice(1)} ${employee.name}?`, {
      description: `Employee will be ${action}d`,
      action: {
        label: action.charAt(0).toUpperCase() + action.slice(1),
        onClick: async () => {
          try {
            const token = localStorage.getItem('adminToken')
            
            const response = await fetch('/api/employees', {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: employee.email })
            })

            const data = await response.json()

            if (data.success) {
              setEmployees(employees.map(e => 
                e._id === employee._id 
                  ? { ...e, isActive: !e.isActive }
                  : e
              ))
              toast.success(`Employee ${action}d successfully!`)
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
    }

    // Check for duplicate email (only for new employees or different email)
    const existingEmployee = employees.find(e => e.email === formData.email)
    if (existingEmployee && (!editingEmployee || existingEmployee._id !== editingEmployee._id)) {
      newErrors.email = 'Email already exists'
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
      const method = editingEmployee ? 'PUT' : 'POST'
      
      const payload = editingEmployee 
        ? { ...formData, email: formData.email, originalEmail: editingEmployee.email }
        : formData

      const response = await fetch('/api/employees', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        if (editingEmployee) {
          // Update existing employee
          setEmployees(employees.map(e => 
            e._id === editingEmployee._id 
              ? { ...e, ...formData, _id: e._id, empid: e.empid, joinDate: e.joinDate }
              : e
          ))
          toast.success('Employee updated successfully!')
        } else {
          // Add new employee
          const newEmployee: Employee = {
            _id: data.data._id || Date.now().toString(),
            ...formData,
            empid: data.data.empid || `EMP_${Date.now()}`,
            joinDate: data.data.joinDate || new Date().toISOString(),
            isActive: data.data.isActive !== undefined ? data.data.isActive : true
          }
          setEmployees([newEmployee, ...employees])
          toast.success('Employee added successfully!')
        }
        setShowModal(false)
      } else {
        console.error('Error saving employee:', data.message)
        toast.error(data.message || 'Error saving employee. Please check the form and try again.')
      }
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error('Error saving employee. Please try again.')
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  const handleEmployeeAction = (employee: Employee, action: string) => {
    switch (action) {
      case 'edit':
        handleEditEmployee(employee)
        break
      case 'delete':
        handleDeleteEmployee(employee)
        break
      case 'toggle':
        handleToggleStatus(employee)
        break
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-600">Manage restaurant staff and their information</p>
        </div>
        <GlassButton variant="primary" onClick={handleAddEmployee} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </GlassButton>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {employees.filter(e => e.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Inactive</p>
              <p className="text-3xl font-bold text-red-600">
                {employees.filter(e => !e.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">New This Month</p>
              <p className="text-3xl font-bold text-blue-600">
                {employees.filter(e => {
                  const joinDate = new Date(e.joinDate)
                  const now = new Date()
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Employees List */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">All Employees</h3>
        
        {employees.length > 0 ? (
          <GlassTable
            headers={['Employee ID', 'Name', 'Email', 'Role', 'Shift', 'Status', 'Join Date', 'Actions']}
            data={employees.map(employee => ({
              'Employee ID': employee.empid,
              'Name': employee.name,
              'Email': employee.email,
              'Role': employee.role,
              'Shift': employee.shift,
              'Status': (
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(employee.isActive)}>{getStatusIcon(employee.isActive)}</span>
                  <span className={getStatusColor(employee.isActive)}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ),
              'Join Date': new Date(employee.joinDate).toLocaleDateString(),
              _originalData: employee
            }))}
            actions={[
              { label: 'Edit', key: 'edit', variant: 'secondary' },
              { label: 'Toggle Status', key: 'toggle', variant: 'primary' },
              { label: 'Remove', key: 'delete', variant: 'danger' }
            ]}
            onRowAction={(row, action) => handleEmployeeAction(row._originalData, action)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Employees Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first team member</p>
            <GlassButton variant="primary" onClick={handleAddEmployee} className="flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add Your First Employee</span>
            </GlassButton>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Employee Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., John Doe"
            error={errors.name}
          />

          <GlassInput
            label="Username (Optional)"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="e.g., johndoe"
          />

          <GlassInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="e.g., john@elitecafe.com"
            error={errors.email}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
            >
              <option value="" className="bg-white">Select Role</option>
              {roleOptions.map(role => (
                <option key={role} value={role} className="bg-white">{role}</option>
              ))}
            </select>
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Shift</label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({...formData, shift: e.target.value})}
              className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
            >
              {shiftOptions.map(shift => (
                <option key={shift} value={shift} className="bg-white">{shift}</option>
              ))}
            </select>
          </div>

          <GlassInput
            label="Profile Image URL (Optional)"
            value={formData.img || ''}
            onChange={(e) => setFormData({...formData, img: e.target.value})}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-3 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingEmployee ? 'Update' : 'Add'} Employee
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}

export default EmployeeManagement