"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminManagement from '@/components/admin/AdminManagement'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

export default function AdminsPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="admins">
        <AdminManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}
