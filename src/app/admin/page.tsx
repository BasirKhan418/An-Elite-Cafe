"use client"

import { useEffect } from 'react'

const AdminPage: React.FC = () => {
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken')
    
    if (token) {
      // Redirect to dashboard if logged in
      window.location.href = '/admin/dashboard'
    } else {
      // Redirect to login if not logged in
      window.location.href = '/admin/login'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
}

export default AdminPage