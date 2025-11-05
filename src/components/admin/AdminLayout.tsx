"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import { useAdminAuth } from './AdminAuthProvider'
import { 
  LayoutDashboard, 
  Utensils, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  LogOut,
  User,
  FolderOpen,
  UtensilsCrossed,
  Package,
  ChevronDown,
  ShoppingCart,
  ChefHat,
  Shield,
  TicketPercent
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
}

interface NavItem {
  id: string
  label: string
  icon: any
  href?: string
  submenu?: Array<{ id: string; label: string; href: string }>
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { adminData, logout } = useAdminAuth()

  // Check if user is super admin (case-insensitive check)
  const isSuperAdmin = adminData?.role?.toLowerCase() === 'super_admin'

  const navigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'tables', label: 'Table Management', icon: Utensils, href: '/admin/tables' },
    { id: 'categories', label: 'Categories', icon: FolderOpen, href: '/admin/categories' },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, href: '/admin/menu' },
    { id: 'coupons', label: 'Coupons', icon: TicketPercent, href: '/admin/coupons' },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      submenu: [
        { id: 'inventory-dashboard', label: 'Dashboard', href: '/admin/inventory' },
        { id: 'inventory-stock', label: 'Stock Management', href: '/admin/inventory/stock' },
        { id: 'inventory-recipes', label: 'Recipes', href: '/admin/inventory/recipes' }
      ]
    },
    { id: 'employees', label: 'Employee Management', icon: Users, href: '/admin/employees' },
    { 
      id: 'orders', 
      label: 'Order Status', 
      icon: ClipboardList, 
      submenu: [
        { id: 'orders-active', label: 'Active Orders', href: '/admin/orders/active' },
        { id: 'orders-history', label: 'Order History', href: '/admin/orders/history' }
      ]
    },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
    ...(isSuperAdmin ? [{ id: 'admins', label: 'Admin Management', icon: Shield, href: '/admin/admins' }] : []),
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ]

  // Auto-expand menu if current page belongs to a submenu
  useEffect(() => {
    const activeMenuItem = navigationItems.find(item => {
      if (item.submenu) {
        return item.submenu.some(sub => sub.id === currentPage)
      }
      return false
    })
    
    if (activeMenuItem) {
      setExpandedMenu(activeMenuItem.id)
    }
  }, [currentPage])

  const handleLogout = () => {
    toast.warning('Logout?', {
      description: "You will be signed out of your admin session.",
      action: {
        label: "Logout",
        onClick: () => logout()
      }
    })
  }

  const isCurrentPageActive = (item: NavItem) => {
    if (item.submenu) {
      return item.submenu.some(sub => currentPage === sub.id)
    }
    return currentPage === item.id
  }

  const toggleMenu = (itemId: string) => {
    setExpandedMenu(prev => prev === itemId ? null : itemId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#6366f1,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_80%_800px,#8b5cf6,transparent)]" />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <aside className={cn(
          "relative transition-all duration-300 ease-in-out bg-white shadow-xl",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className={cn(
              "flex items-center gap-3 p-4 border-b border-gray-200",
              !sidebarOpen && "justify-center px-2"
            )}>
              {sidebarOpen ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    AC
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-gray-900 truncate">An Elite Cafe</h1>
                    <p className="text-xs text-gray-500">Admin Dashboard</p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Expand sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
              <div className={cn("space-y-1", sidebarOpen ? "px-3" : "px-2")}>
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  const isActive = isCurrentPageActive(item)
                  const hasSubmenu = !!item.submenu
                  const isExpanded = expandedMenu === item.id

                  return (
                    <div key={item.id} className="relative group">
                      {hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden",
                              sidebarOpen ? "justify-between" : "justify-center",
                              isActive
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive ? "text-white" : "text-gray-600"
                              )} />
                              {sidebarOpen && (
                                <span className={cn("font-medium text-sm", isActive && "font-semibold")}>
                                  {item.label}
                                </span>
                              )}
                            </div>
                            {sidebarOpen && (
                              <ChevronDown className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isExpanded ? "rotate-180" : "",
                                isActive ? "text-white" : "text-gray-600"
                              )} />
                            )}
                          </button>

                          {/* Submenu */}
                          {sidebarOpen && isExpanded && (
                            <div className="mt-1 ml-2 space-y-1 border-l-2 border-gray-200 pl-3 py-1">
                              {item.submenu?.map((subitem) => {
                                const isSubActive = currentPage === subitem.id
                                return (
                                  <a
                                    key={subitem.id}
                                    href={subitem.href}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                      isSubActive
                                        ? "bg-gray-900 text-white font-semibold"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      isSubActive ? "bg-white" : "bg-gray-400"
                                    )} />
                                    <span>{subitem.label}</span>
                                  </a>
                                )
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <a
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden",
                            sidebarOpen ? "justify-start" : "justify-center",
                            isActive
                              ? "bg-gray-900 text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <IconComponent className={cn(
                            "w-5 h-5 flex-shrink-0",
                            isActive ? "text-white" : "text-gray-600"
                          )} />
                          {sidebarOpen && (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </a>
                      )}

                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>

            {/* User Profile Section */}
            <div className={cn("border-t border-gray-200", sidebarOpen ? "p-4" : "p-2")}>
              {sidebarOpen ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {adminData?.name || 'Super Admin'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {adminData?.email || 'admin@elitecafe.com'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer mx-auto">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-gray-900 text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg min-w-[200px]">
                    <p className="text-sm font-semibold truncate">
                      {adminData?.name || 'Super Admin'}
                    </p>
                    <p className="text-xs text-gray-300 truncate">
                      {adminData?.email || 'admin@elitecafe.com'}
                    </p>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <GlassCard className="border-l-0 border-r-0 border-t-0 rounded-none p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {navigationItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <GlassButton variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                </GlassButton>
                <GlassButton variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout