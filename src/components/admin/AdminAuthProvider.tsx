"use client"

import React, { useEffect, useState } from 'react'

interface AdminAuthProviderProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const storedAdminData = localStorage.getItem('adminData')

      if (!token || !storedAdminData) {
        if (requireAuth) {
          window.location.href = '/admin/login'
          return
        }
        setLoading(false)
        return
      }

      // Verify token with backend (optional)
      // You can add token verification logic here
      
      setAdminData(JSON.parse(storedAdminData))
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminData')
      
      if (requireAuth) {
        window.location.href = '/admin/login'
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    window.location.href = '/admin/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <AdminAuthContext.Provider value={{ 
      isAuthenticated, 
      adminData, 
      logout,
      checkAuthentication 
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Create context for admin auth
const AdminAuthContext = React.createContext<{
  isAuthenticated: boolean
  adminData: any
  logout: () => void
  checkAuthentication: () => void
}>({
  isAuthenticated: false,
  adminData: null,
  logout: () => {},
  checkAuthentication: () => {}
})

export const useAdminAuth = () => {
  const context = React.useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export default AdminAuthProvider