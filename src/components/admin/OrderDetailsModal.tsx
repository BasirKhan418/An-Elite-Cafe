"use client"

import React from 'react'
import { X, User, Phone, Calendar, Clock, Utensils, Hash } from 'lucide-react'
import type { Order } from '@/types/order'

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-amber-500',
      preparing: 'bg-blue-500',
      ready: 'bg-green-500',
      served: 'bg-purple-500',
      done: 'bg-emerald-500',
      cancelled: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6" />
              <h2 className="text-xl font-bold">Order Details</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Info Card */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Order ID</p>
                    <p className="font-semibold">#{order.orderid?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Table Number</p>
                    <p className="font-semibold">Table {order.tableNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
                    <p className="font-semibold">
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Time</p>
                    <p className="font-semibold">
                      {new Date(order.orderDate || order.createdAt).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-medium">Status</span>
                    <span className={`${getStatusColor(order.status)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {(order.customerName || order.customerPhone) && (
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {order.customerName && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Name</p>
                      <p className="font-semibold">{order.customerName}</p>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold">{order.customerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3">
                <h3 className="font-bold">Order Items</h3>
              </div>
              
              <div className="bg-white">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 bg-gray-100 border-b border-gray-300 px-4 py-3 text-sm font-bold text-gray-700">
                  <div className="col-span-6">ITEM</div>
                  <div className="col-span-2 text-center">QUANTITY</div>
                  <div className="col-span-2 text-right">PRICE</div>
                  <div className="col-span-2 text-right">AMOUNT</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => {
                    const menuItem = typeof item.menuid === 'object' ? item.menuid : null
                    const itemName = menuItem?.name || 'Unknown Item'
                    const itemPrice = menuItem?.price || 0
                    const lineTotal = itemPrice * (item.quantity || 0)

                    return (
                      <div key={idx} className="px-4 py-3">
                        <div className="grid grid-cols-12 gap-2 text-sm items-center">
                          <div className="col-span-6 font-medium">{itemName}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-right">₹{itemPrice.toFixed(2)}</div>
                          <div className="col-span-2 text-right font-semibold">₹{lineTotal.toFixed(2)}</div>
                        </div>
                        {item.notes && (
                          <div className="mt-2 text-xs text-gray-600 italic bg-yellow-50 px-3 py-2 rounded border-l-2 border-yellow-400">
                            <span className="font-semibold">Note:</span> {item.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className="bg-gray-50 border-t-2 border-gray-300 px-4 py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold text-green-700 pt-2 border-t border-gray-300">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {order.paymentStatus && (
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="font-semibold uppercase text-green-700">{order.paymentStatus}</p>
                  </div>
                  {order.paymentMethod && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Method</p>
                      <p className="font-semibold uppercase">{order.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employee Info */}
            {order.employeeName && (
              <div className="text-center text-sm text-gray-600">
                Served by <span className="font-semibold text-gray-800">{order.employeeName}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-100 px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsModal
