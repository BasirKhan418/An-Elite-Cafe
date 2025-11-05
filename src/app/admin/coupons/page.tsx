"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import CouponManagement from '@/components/admin/CouponManagement'
import AdminAuthProvider from '@/components/admin/AdminAuthProvider'

const CouponsPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminLayout currentPage="coupons">
        <CouponManagement />
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default CouponsPage
