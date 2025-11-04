"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminAnalytics from '@/components/admin/AdminAnalytics'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

const AnalyticsPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="analytics">
        <AdminAnalytics />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default AnalyticsPage
