"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import EmployeeManagement from '@/components/admin/EmployeeManagement'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

const EmployeesPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="employees">
        <EmployeeManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default EmployeesPage