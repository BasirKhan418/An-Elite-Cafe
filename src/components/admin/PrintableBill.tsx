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
  const orderId = order.orderid ? `#${String(order.orderid).slice(-8)}` : '#ORDER'
  const table = order.tableNumber ? `Table ${order.tableNumber}` : '—'
  const d = new Date(order.orderDate)
  const dateStr = d.toLocaleDateString('en-GB')
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  const items = order.items || []
  const totalItems = items.reduce((sum, it) => sum + (it.quantity || 0), 0)

  const getItemName = (it: any) => {
    const menuItem = typeof it.menuid === 'object' ? it.menuid : null
    return menuItem?.name || 'Item'
  }

  const getItemPrice = (it: any) => {
    const menuItem = typeof it.menuid === 'object' ? it.menuid : null
    return menuItem?.price || 0
  }

  // Calculate bill
  const subtotal = order.subtotal
  const discountAmount = (subtotal * discount) / 100
  const afterDiscount = subtotal - discountAmount
  const sgstAmount = (afterDiscount * sgst) / 100
  const cgstAmount = (afterDiscount * cgst) / 100
  const total = Math.ceil(afterDiscount + sgstAmount + cgstAmount)

  const DotRule = () => (
    <div className="text-center text-[11px] tracking-[0.3em] leading-none my-2 select-none">
      ................................
    </div>
  )

  return (
    <div
      className="print-bill w-full max-w-[300px] mx-auto bg-white text-black p-4 text-center"
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-extrabold tracking-wide">AN ELITE CAFÉ</h1>
        <div className="text-[11px] uppercase tracking-widest mt-1">TAX INVOICE</div>
      </div>

      <DotRule />

      {/* Order Meta - Centered */}
      <div className="text-[12px] text-center">
        <div>
          <span className="font-semibold">ORDER:</span>
          <span>{orderId}</span>
        </div>
        <div>
          <span className="font-semibold">TABLE:</span>
          <span>{table}</span>
        </div>
        <div>
          <span className="font-semibold">TIME:</span>
          <span>{timeStr}</span>
        </div>
        <div>
          <span className="font-semibold">DATE:</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <DotRule />

      {/* Customer Info (if present) - Centered */}
      {(order.customerName || order.customerPhone) && (
        <>
          <div className="text-[12px] text-center">
            {order.customerName && (
              <div>
                <span className="font-semibold">NAME:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div>
                <span className="font-semibold">PHONE:</span>
                <span>{order.customerPhone}</span>
              </div>
            )}
          </div>
          <DotRule />
        </>
      )}

      {/* Items + Summary Box */}
      <div className="mt-2 border border-black rounded-sm p-2">
        {/* Header Row */}
        <div className="grid [grid-template-columns:1fr_70px_90px] gap-2 text-[12px] font-bold">
          <div className="text-left">ITEM</div>
          <div className="text-center">QUANTITY</div>
          <div className="text-right">PRICE</div>
        </div>
        <div className="h-[1px] bg-black my-1" />

        {/* Item Rows */}
        <div>
          {items.map((it: any, idx: number) => {
            const itemName = getItemName(it)
            const itemPrice = getItemPrice(it)
            const qty = it.quantity || 0
            const lineTotal = itemPrice * qty

            return (
              <div key={idx} className="py-1">
                <div className="grid [grid-template-columns:1fr_70px_90px] gap-2 text-[12px] items-start">
                  <div className="text-left font-medium break-words">{itemName}</div>
                  <div className="text-center">{qty}</div>
                  <div className="text-right font-semibold">₹{lineTotal.toFixed(2)}</div>
                </div>
                {it.notes && (
                  <div className="text-[10px] italic mt-1 opacity-80 text-left">Note: {it.notes}</div>
                )}
                {idx < items.length - 1 && (
                  <div className="border-b border-dashed border-gray-400 my-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Divider before totals */}
        <div className="h-[1px] bg-black my-2" />

        {/* Totals inside the box */}
        <div className="space-y-1 text-[12px]">
          <div className="grid grid-cols-2">
            <div className="text-left font-semibold">TOTAL ITEMS</div>
            <div className="text-right font-semibold">{totalItems}</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="text-left">Subtotal</div>
            <div className="text-right">₹{subtotal.toFixed(2)}</div>
          </div>

          {discount > 0 && (
            <>
              <div className="grid grid-cols-2 text-green-700">
                <div className="text-left">Discount ({discount}%)</div>
                <div className="text-right">-₹{discountAmount.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="text-left">After Discount</div>
                <div className="text-right">₹{afterDiscount.toFixed(2)}</div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2">
            <div className="text-left">SGST ({sgst}%)</div>
            <div className="text-right">₹{sgstAmount.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="text-left">CGST ({cgst}%)</div>
            <div className="text-right">₹{cgstAmount.toFixed(2)}</div>
          </div>

          <div className="h-[1px] bg-black my-1" />
          <div className="grid grid-cols-2 text-[13px] font-extrabold">
            <div className="text-left">GRAND TOTAL</div>
            <div className="text-right">₹{total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <DotRule />

      {/* Payment Status */}
      {order.paymentStatus && (
        <>
          <div className="text-[12px] text-center">
            <div className="font-semibold">
              Payment: {order.paymentStatus.toUpperCase().replace('_', ' ')}
            </div>
            {order.paymentMethod && (
              <div className="text-[11px] mt-1">
                Method: {order.paymentMethod.toUpperCase()}
              </div>
            )}
          </div>
          <DotRule />
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-2">
        <div className="text-[12px] font-semibold">Thank you for dining with us!</div>
        <div className="text-[11px] mt-1">AN ELITE CAFE</div>
        <div className="text-[10px] mt-1 text-gray-600">Visit Again!</div>
      </div>
    </div>
  )
}

export default PrintableBill
