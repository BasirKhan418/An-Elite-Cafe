"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { useAdminAuth } from './AdminAuthProvider'
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface FormErrors {
  [key: string]: string
}

const AdminSettings: React.FC = () => {
  const { adminData } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: { label: string; color: string } } = {
      'super_admin': { label: 'Super Admin', color: 'from-purple-500 to-pink-500' },
      'admin': { label: 'Admin', color: 'from-blue-500 to-cyan-500' },
      'manager': { label: 'Manager', color: 'from-green-500 to-emerald-500' }
    }
    return roleMap[role] || { label: role, color: 'from-gray-500 to-gray-600' }
  }

  const roleInfo = getRoleDisplay(adminData?.role || '')

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!otpSent && !passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (otpSent && !otpVerified && !passwordForm.otp.trim()) {
      newErrors.otp = 'OTP is required'
    }

    if (otpSent && !passwordForm.otp.trim()) {
      newErrors.otp = 'OTP is required'
    } else if (otpSent && passwordForm.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    }

    if (otpVerified) {
      if (!passwordForm.newPassword.trim()) {
        newErrors.newPassword = 'New password is required'
      } else if (passwordForm.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordForm.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase, lowercase, number and special character'
      }

      if (!passwordForm.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async () => {
    if (!passwordForm.currentPassword.trim()) {
      setErrors({ currentPassword: 'Current password is required to send OTP' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/auth/admin/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData?.email,
          currentPassword: passwordForm.currentPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setOtpSent(true)
        toast.success('OTP sent successfully', {
          description: 'Please check your email for the OTP code'
        })
      } else {
        toast.error(data.message || 'Failed to send OTP')
        if (data.message?.toLowerCase().includes('password')) {
          setErrors({ currentPassword: 'Incorrect password' })
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!passwordForm.otp.trim() || passwordForm.otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData?.email,
          otp: passwordForm.otp
        })
      })

      const data = await response.json()

      if (data.success) {
        setOtpVerified(true)
        toast.success('OTP verified successfully', {
          description: 'Now you can set your new password'
        })
      } else {
        toast.error(data.message || 'Invalid OTP')
        setErrors({ otp: data.message || 'Invalid OTP' })
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData?.email,
          otp: passwordForm.otp,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully', {
          description: 'You can now login with your new password'
        })
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
        })
        setOtpSent(false)
        setOtpVerified(false)
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setPasswordForm({ ...passwordForm, otp: '' })
    setOtpVerified(false)
    await handleSendOTP()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'profile'
              ? 'text-gray-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'password'
              ? 'text-gray-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-100">
                      {adminData?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{adminData?.name || 'Admin User'}</h3>
                    <p className="text-gray-600">@{adminData?.username || 'admin'}</p>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-600 font-medium">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{adminData?.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-600 font-medium">
                      <User className="w-4 h-4 mr-2" />
                      Username
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">@{adminData?.username || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-600 font-medium">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{adminData?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-600 font-medium">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin ID
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium font-mono text-sm">{adminData?.adminid || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 font-medium">Restaurant Name</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-medium">{adminData?.resname || 'An Elite Cafe'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 font-medium">Join Date</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {adminData?.joinDate 
                            ? new Date(adminData.joinDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Role & Permissions Card */}
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Role & Access</h2>
              
              <div className="space-y-6">
                {/* Role Badge */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${roleInfo.color} mb-4`}>
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{roleInfo.label}</h3>
                  <p className="text-gray-600 text-sm">Current Role</p>
                </div>

                {/* Permissions */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {adminData?.permissions?.map((permission: string, index: number) => (
                      <div key={index} className="flex items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-900 capitalize">
                          {permission.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-600 text-sm">No permissions assigned</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm text-gray-700">Account Status</span>
                    <span className="flex items-center text-sm font-semibold text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <GlassCard className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
            <p className="text-gray-600 text-sm mb-6">
              Update your password to keep your account secure. We'll send an OTP to your registered email.
            </p>

            <div className="space-y-6">
              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    !otpSent ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {otpSent ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="text-sm text-gray-900 font-medium">Verify Identity</span>
                </div>
                <div className={`h-0.5 flex-1 mx-4 ${otpSent ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    otpVerified ? 'bg-green-600 text-white' : otpSent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {otpVerified ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                  </div>
                  <span className={`text-sm font-medium ${otpSent ? 'text-gray-900' : 'text-gray-600'}`}>Verify OTP</span>
                </div>
                <div className={`h-0.5 flex-1 mx-4 ${otpVerified ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    otpVerified ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm font-medium ${otpVerified ? 'text-gray-900' : 'text-gray-600'}`}>New Password</span>
                </div>
              </div>

              {/* Step 1: Current Password */}
              {!otpSent && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <GlassButton
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send OTP to Email
                      </>
                    )}
                  </GlassButton>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {otpSent && !otpVerified && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      OTP has been sent to {adminData?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={passwordForm.otp}
                        onChange={(e) => setPasswordForm({ ...passwordForm, otp: e.target.value.replace(/\D/g, '') })}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                          errors.otp ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg text-gray-900 text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="000000"
                      />
                    </div>
                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <GlassButton
                      onClick={handleVerifyOTP}
                      disabled={loading || passwordForm.otp.length !== 6}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Verify OTP
                        </>
                      )}
                    </GlassButton>
                    <button
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {otpVerified && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      OTP verified successfully. Now set your new password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.newPassword}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Must contain at least 8 characters, including uppercase, lowercase, number and special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <GlassButton
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Change Password
                      </>
                    )}
                  </GlassButton>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default AdminSettings
