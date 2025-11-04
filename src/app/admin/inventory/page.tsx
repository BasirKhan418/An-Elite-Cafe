"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import InventoryDashboard from '@/components/admin/InventoryDashboard'

const InventoryPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="inventory-dashboard">
        <InventoryDashboard />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default InventoryPage