"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassTable, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  Utensils, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  CircleDot, 
  Clock,
  RefreshCw
} from 'lucide-react'

interface Table {
  _id: string
  tableid: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  createdAt: string
}

interface TableFormData {
  tableid: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
}

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<TableFormData>({
    tableid: '',
    name: '',
    capacity: 1,
    status: 'available'
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/tables/manage', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setTables(data.data)
      } else {
        console.error('Error fetching tables:', data.message)
        setTables([])
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
      setTables([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = () => {
    setEditingTable(null)
    setFormData({
      tableid: '',
      name: '',
      capacity: 1,
      status: 'available'
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setFormData({
      tableid: table.tableid,
      name: table.name,
      capacity: table.capacity,
      status: table.status
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeleteTable = async (table: Table) => {
    if (window.confirm(`Are you sure you want to delete ${table.name}?`)) {
      try {
        const token = localStorage.getItem('adminToken')
        
        const response = await fetch('/api/tables/manage', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tableid: table.tableid })
        })

        const data = await response.json()

        if (data.success) {
          setTables(tables.filter(t => t._id !== table._id))
        } else {
          console.error('Error deleting table:', data.message)
          alert(data.message || 'Error deleting table')
        }
      } catch (error) {
        console.error('Error deleting table:', error)
        alert('Error deleting table. Please try again.')
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.tableid.trim()) {
      newErrors.tableid = 'Table ID is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Table name is required'
    }
    if (formData.capacity < 1 || formData.capacity > 20) {
      newErrors.capacity = 'Capacity must be between 1 and 20'
    }

    // Check for duplicate table ID (only for new tables or different ID)
    const existingTable = tables.find(t => t.tableid === formData.tableid)
    if (existingTable && (!editingTable || existingTable._id !== editingTable._id)) {
      newErrors.tableid = 'Table ID already exists'
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
      const method = editingTable ? 'PUT' : 'POST'
      
      const response = await fetch('/api/tables/manage', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingTable ? { ...formData, tableid: editingTable.tableid } : formData)
      })

      const data = await response.json()

      if (data.success) {
        if (editingTable) {
          // Update existing table
          setTables(tables.map(t => 
            t._id === editingTable._id 
              ? { ...t, ...formData }
              : t
          ))
        } else {
          // Add new table
          setTables([...tables, data.data])
        }
        setShowModal(false)
      } else {
        console.error('Error saving table:', data.message)
        alert(data.message || 'Error saving table')
      }
    } catch (error) {
      console.error('Error saving table:', error)
      alert('Error saving table. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'occupied': return 'text-red-600' 
      case 'reserved': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4" />
      case 'occupied': return <CircleDot className="w-4 h-4" />
      case 'reserved': return <Clock className="w-4 h-4" />
      default: return <CircleDot className="w-4 h-4" />
    }
  }

  const handleTableAction = (table: Table, action: string) => {
    switch (action) {
      case 'edit':
        handleEditTable(table)
        break
      case 'delete':
        handleDeleteTable(table)
        break
      case 'status':
        // Toggle status
        const newStatus = table.status === 'available' ? 'occupied' : 'available'
        setTables(tables.map(t => 
          t._id === table._id 
            ? { ...t, status: newStatus }
            : t
        ))
        break
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="w-12 h-12 text-gray-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading tables...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Table Management</h2>
          <p className="text-gray-600">Manage restaurant tables and their status</p>
        </div>
        <GlassButton variant="primary" onClick={handleAddTable} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Table</span>
        </GlassButton>
      </div>

      {/* Table Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Tables</p>
              <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {tables.filter(t => t.status === 'available').length}
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
              <p className="text-gray-600 text-sm font-medium mb-1">Occupied</p>
              <p className="text-3xl font-bold text-red-600">
                {tables.filter(t => t.status === 'occupied').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tables List */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">All Tables</h3>
        
        {tables.length > 0 ? (
          <GlassTable
            headers={['Table ID', 'Name', 'Capacity', 'Status', 'Created', 'Actions']}
            data={tables.map(table => ({
              'Table ID': table.tableid,
              'Name': table.name,
              'Capacity': `${table.capacity} people`,
              'Status': (
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(table.status)}>{getStatusIcon(table.status)}</span>
                  <span className={getStatusColor(table.status)}>
                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </span>
                </div>
              ),
              'Created': new Date(table.createdAt).toLocaleDateString(),
              _originalData: table
            }))}
            actions={[
              { label: 'Edit', key: 'edit', variant: 'secondary' },
              { label: 'Toggle Status', key: 'status', variant: 'primary' },
              { label: 'Delete', key: 'delete', variant: 'danger' }
            ]}
            onRowAction={(row, action) => handleTableAction(row._originalData, action)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tables Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first table to the restaurant</p>
            <GlassButton variant="primary" onClick={handleAddTable} className="flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add Your First Table</span>
            </GlassButton>
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Table Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTable ? 'Edit Table' : 'Add New Table'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Table ID"
            value={formData.tableid}
            onChange={(e) => setFormData({...formData, tableid: e.target.value})}
            placeholder="e.g., T-001"
            error={errors.tableid}
          />

          <GlassInput
            label="Table Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Table 1"
            error={errors.name}
          />

          <GlassInput
            label="Capacity"
            type="number"
            min="1"
            max="20"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
            error={errors.capacity}
          />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            className="w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300"
          >
            <option value="available" className="bg-white">Available</option>
            <option value="occupied" className="bg-white">Occupied</option>
            <option value="reserved" className="bg-white">Reserved</option>
          </select>
        </div>          <div className="flex gap-3 pt-4">
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
              {editingTable ? 'Update' : 'Create'} Table
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}

export default TableManagement