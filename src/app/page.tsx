"use client"
import { Toaster } from 'sonner'
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight'
import { Button as MovingBorderButton } from '@/components/ui/moving-border'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { GlassButton } from '@/components/ui/glass'
import { motion } from 'framer-motion'
import { 
  UtensilsCrossed, 
  Users, 
  ShoppingCart,
  ChefHat,
  BarChart,
  Package,
  ClipboardList,
  TicketPercent,
  Utensils,
  FolderOpen,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Page = () => {
  const features = [
    {
      title: "Inventory Management",
      description: "Track ingredients, manage stock levels with real-time updates.",
      icon: <Package className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-2",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Order Management",
      description: "Streamline orders from kitchen to table with order tracking.",
      icon: <ClipboardList className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Analytics Dashboard",
      description: "Get insights into sales and revenue trends with dashboards.",
      icon: <BarChart className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Employee Management",
      description: "Manage employees and assign roles with permissions.",
      icon: <Users className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-2",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Table Management",
      description: "Manage reservations and table status efficiently.",
      icon: <Utensils className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Menu & Categories",
      description: "Update your menu, manage categories, and set pricing.",
      icon: <UtensilsCrossed className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Recipe Management",
      description: "Track recipes and ingredient requirements.",
      icon: <ChefHat className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Coupon System",
      description: "Create and manage discount coupons for customers.",
      icon: <TicketPercent className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
    {
      title: "Categories",
      description: "Organize your menu items with category management.",
      icon: <FolderOpen className="h-6 w-6 text-gray-700" />,
      className: "md:col-span-1",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50"></div>
      ),
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden'>
      <Toaster position='top-center' richColors />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#6366f1,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_80%_800px,#8b5cf6,transparent)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="An Elite Cafe Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">An Elite Cafe</span>
                <span className="text-xs text-gray-500">Management System</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link href="/admin/login">
                <GlassButton variant="primary" size="md">
                  Admin Login
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <Image
                src="/logo.png"
                alt="An Elite Cafe"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
              />
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto mb-6 leading-tight text-gray-900">
              Restaurant Management <br />
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12"
            >
              Comprehensive management system for restaurant operations, inventory, orders, and staff.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/admin/login">
                <GlassButton variant="primary" size="lg">
                  Access Admin Panel
                  <ArrowRight className="w-5 h-5" />
                </GlassButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Comprehensive Features
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to manage your restaurant efficiently
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <BentoGrid>
              {features.map((feature, idx) => (
                <BentoGridItem
                  key={idx}
                  title={feature.title}
                  description={feature.description}
                  header={feature.header}
                  icon={feature.icon}
                  className={feature.className}
                />
              ))}
            </BentoGrid>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="backdrop-blur-md bg-white/90 border border-gray-200/50 rounded-3xl p-12 shadow-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Access the admin panel to manage your restaurant operations
            </p>
            <Link href="/admin/login">
              <GlassButton variant="primary" size="lg">
                Login to Admin Panel
                <ArrowRight className="w-5 h-5" />
              </GlassButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 py-8 px-4 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="An Elite Cafe"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-sm text-gray-600">
                © 2025 An Elite Cafe. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Page
