"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'
import RecipeManagement from '@/components/admin/RecipeManagement'

const RecipesPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="inventory-recipes">
        <RecipeManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default RecipesPage