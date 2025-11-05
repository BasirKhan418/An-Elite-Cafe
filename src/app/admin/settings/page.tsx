"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import AdminSettings from '@/components/admin/AdminSettings'

const SettingsPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="settings">
        <AdminSettings />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default SettingsPage
