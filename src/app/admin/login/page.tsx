"use client"

import React, { useState } from 'react'
import { GlassCard, GlassInput, GlassButton } from '@/components/ui/glass'
import { ShieldCheck, Coffee, Lock, Mail, Eye, EyeOff } from 'lucide-react'

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Store the token
        localStorage.setItem('adminToken', data.data.token)
        localStorage.setItem('adminData', JSON.stringify(data.data.admin))
        
        // Redirect to dashboard
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      
      {/* Animated Geometric Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-gray-800/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gray-900/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-gray-700/3 via-gray-800/3 to-gray-900/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Coffee Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Coffee className="absolute top-20 left-[10%] w-8 h-8 text-gray-300/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Coffee className="absolute top-40 right-[15%] w-6 h-6 text-gray-300/20 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Coffee className="absolute bottom-32 left-[20%] w-10 h-10 text-gray-300/20 animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Main Login Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl shadow-gray-900/10 rounded-3xl p-10">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/30 transform hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-3xl">AC</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-gray-900" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-600 font-medium">An Elite Cafe - Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl animate-shake">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="admin@elitecafe.com"
                required
                className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all duration-300 hover:bg-white/90"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all duration-300 hover:bg-white/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 rounded-lg"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock className="w-4 h-4" />
              <p className="text-sm font-medium">Secure admin access only</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © 2025 An Elite Cafe. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin