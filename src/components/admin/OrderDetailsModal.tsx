"use client"

import React, { useRef } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import type { Order, PopulatedMenuItem } from '@/types/order'
import { 
  X, 
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  IndianRupee,
  Tag,
  Calendar,
  ChefHat,
  Receipt,
  CreditCard
} from 'lucide-react'

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

import KitchenTicket from './KitchenTicket'

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const kotRef = useRef<HTMLDivElement>(null)
  if (!isOpen || !order) return null

  const handlePrintKOT = () => {
    if (!kotRef.current || !order) return
    const printWindow = window.open('', '_blank', 'width=360,height=800')
    if (!printWindow) return
    const html = kotRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KOT - ${order.orderid}</title>
          <style>
            @page { margin: 6mm; }
            body { background: #fff; margin: 0; }
            /* Ensure true size in print */
            .kot-print { width: 280px; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = function(){ setTimeout(function(){ window.print(); }, 200); };
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'ready': return 'bg-green-100 text-green-800 border-green-300'
      case 'served': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'done': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partially_paid': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-6 border-b border-gray-200 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Order Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">Order ID: {order.orderid}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Table Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{order.customerName || 'Walk-in Customer'}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Table Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Table {order.tableNumber}</span>
                </div>
                {order.employeeName && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Served by: {order.employeeName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Order Placed</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {new Date(order.orderDate).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Last Updated</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-800">
                    {new Date(order.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {order.completedAt && (
                <div>
                  <p className="text-gray-600 mb-1">Completed</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-800">
                      {new Date(order.completedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const menuItem = typeof item.menuid === 'object' ? item.menuid : null;
                const itemName = menuItem?.name || 'Unknown Item';
                const itemPrice = menuItem?.price || 0;
                const itemDescription = menuItem && 'description' in menuItem ? (menuItem as any).description : undefined;
                
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{itemName}</h4>
                        {itemDescription && (
                          <p className="text-sm text-gray-600 mt-1">{itemDescription}</p>
                        )}
                        {item.notes && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-800">
                              <Tag className="w-3 h-3 inline mr-1" />
                              Note: {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">₹{itemPrice.toFixed(2)} each</p>
                        <p className="font-bold text-gray-900 mt-1">
                          ₹{(itemPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Bill Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{order.subtotal.toFixed(2)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({order.discount}%)</span>
                  <span className="font-medium">
                    -₹{((order.subtotal * order.discount) / 100).toFixed(2)}
                  </span>
                </div>
              )}

              {order.tax > 0 && (
                <>
                  {order.sgst !== undefined && order.cgst !== undefined ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST ({order.sgst}%)</span>
                        <span className="font-medium text-gray-800">
                          ₹{((order.subtotal * (1 - order.discount / 100) * order.sgst) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST ({order.cgst}%)</span>
                        <span className="font-medium text-gray-800">
                          ₹{((order.subtotal * (1 - order.discount / 100) * order.cgst) / 100).toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({order.tax}%)</span>
                      <span className="font-medium text-gray-800">
                        ₹{((order.subtotal * (1 - order.discount / 100) * order.tax) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>

              {order.paymentMethod && (
                <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <GlassButton variant="secondary" onClick={handlePrintKOT}>
              Print KOT
            </GlassButton>
            <GlassButton variant="primary" onClick={onClose}>
              Close
            </GlassButton>
          </div>
        </div>

        {/* Hidden KOT for printing */}
        <div className="hidden">
          <div ref={kotRef}>
            {order && <KitchenTicket order={order} />}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default OrderDetailsModal
