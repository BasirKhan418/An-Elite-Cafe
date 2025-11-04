"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import StockManagement from '@/components/admin/StockManagement'

const StockPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="inventory-stock">
        <StockManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default StockPage