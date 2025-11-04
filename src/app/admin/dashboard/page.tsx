"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

const DashboardPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="dashboard">
        <AdminDashboard />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default DashboardPage