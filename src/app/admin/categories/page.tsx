"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import CategoryManagement from '@/components/admin/CategoryManagement'

const CategoriesPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="categories">
        <CategoryManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default CategoriesPage
