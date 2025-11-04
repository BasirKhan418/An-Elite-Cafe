"use client"

import React from 'react'
import type { Order } from '@/types/order'

interface PrintableBillProps {
  order: Order
  discount?: number
  sgst: number
  cgst: number
}

const PrintableBill: React.FC<PrintableBillProps> = ({ order, discount = 0, sgst, cgst }) => {
  const calculateBill = () => {
    const subtotal = order.subtotal
    const discountAmount = (subtotal * discount) / 100
    const afterDiscount = subtotal - discountAmount
    const sgstAmount = (afterDiscount * sgst) / 100
    const cgstAmount = (afterDiscount * cgst) / 100
    const total = Math.ceil(afterDiscount + sgstAmount + cgstAmount)

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      sgstAmount,
      cgstAmount,
      total
    }
  }

  const bill = calculateBill()

  return (
    <div className="print-bill w-full max-w-[375px] mx-auto bg-white text-black p-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center pb-4 mb-4" style={{ borderBottom: '2px solid #000' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ letterSpacing: '1px' }}>AN ELITE CAFÉ</h1>
        <p className="text-xs text-gray-600 uppercase tracking-wide">Tax Invoice</p>
      </div>

      {/* Order Info */}
      <div className="pb-3 mb-4" style={{ borderBottom: '1px dashed #666' }}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Order:</span>
            <span className="font-semibold ml-2">#{order.orderid.slice(-8)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Table:</span>
            <span className="font-semibold ml-2">{order.tableNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Date:</span>
            <span className="ml-2">{new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Time:</span>
            <span className="ml-2">{new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {(order.customerName || order.customerPhone) && (
        <div className="pb-3 mb-4" style={{ borderBottom: '1px dashed #666' }}>
          <div className="text-sm">
            {order.customerName && (
              <div className="mb-1">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium ml-2">{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium ml-2">{order.customerPhone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="pb-3 mb-4" style={{ borderBottom: '1px dashed #666' }}>
        <h3 className="font-semibold text-sm mb-3 text-gray-700">ORDER ITEMS</h3>
        {order.items.map((item, index) => {
          const menuItem = typeof item.menuid === 'object' ? item.menuid : null
          const itemName = menuItem?.name || 'Unknown Item'
          const itemPrice = menuItem?.price || 0
          
          return (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <div className="font-medium">{itemName}</div>
                  <div className="text-xs text-gray-600">₹{itemPrice.toFixed(2)} × {item.quantity}</div>
                </div>
                <div className="font-semibold">₹{(itemPrice * item.quantity).toFixed(2)}</div>
              </div>
              {item.notes && (
                <div className="mt-1 ml-2 text-xs text-gray-600 italic bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                  Note: {item.notes}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bill Summary */}
      <div className="pb-3 mb-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-700">BILL SUMMARY</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount}%)</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">After Discount</span>
                <span className="font-medium">₹{bill.afterDiscount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">SGST ({sgst}%)</span>
            <span>₹{bill.sgstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">CGST ({cgst}%)</span>
            <span>₹{bill.cgstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #ccc' }}>
            <span className="font-semibold">Total GST</span>
            <span className="font-semibold">₹{(bill.sgstAmount + bill.cgstAmount).toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-3 text-lg" style={{ borderTop: '2px solid #000' }}>
            <span className="font-bold">GRAND TOTAL</span>
            <span className="font-bold">₹{bill.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {order.paymentStatus && (
        <div className="text-center text-sm mb-4 bg-gray-50 p-3 rounded">
          <div className="font-semibold mb-1">Payment: {order.paymentStatus.toUpperCase().replace('_', ' ')}</div>
          {order.paymentMethod && (
            <div className="text-gray-600">Method: {order.paymentMethod.toUpperCase()}</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-4" style={{ borderTop: '1px dashed #666' }}>
        <p className="text-sm font-medium mb-2">Thank you for dining with us!</p>
        <p className="text-xs text-gray-500">AN ELITE CAFE</p>
        <p className="text-xs text-gray-500 mt-1">Visit Again!</p>
      </div>
    </div>
  )
}

export default PrintableBill
