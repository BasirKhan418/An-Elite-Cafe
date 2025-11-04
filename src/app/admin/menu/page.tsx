"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import MenuManagement from '@/components/admin/MenuManagement'

const MenuPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="menu">
        <MenuManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default MenuPage
