"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import TableManagement from '@/components/admin/TableManagement'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

const TablesPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="tables">
        <TableManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default TablesPage