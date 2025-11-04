"use client"

import React from 'react'
import type { Order } from '@/types/order'

interface PrintableBillProps {
  order: Order
  discount?: number
  sgst: number
  cgst: number
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${min}`
}

const dots = '........................................'

const PrintableBill: React.FC<PrintableBillProps> = ({ order, discount = 0, sgst, cgst }) => {
  const calculateBill = () => {
    // Prefer values from an already generated order to ensure the print matches the official bill
    const effectiveDiscount = (order.isgeneratedBill ? (order.discount || 0) : discount) || 0
    const effectiveSgst = order.sgst ?? sgst
    const effectiveCgst = order.cgst ?? cgst

    const subtotal = order.subtotal
    const discountAmount = (subtotal * effectiveDiscount) / 100
    const afterDiscount = subtotal - discountAmount
    const sgstAmount = (afterDiscount * effectiveSgst) / 100
    const cgstAmount = (afterDiscount * effectiveCgst) / 100
    const computedTotal = Math.ceil(afterDiscount + sgstAmount + cgstAmount)
    const total = order.isgeneratedBill && order.totalAmount ? order.totalAmount : computedTotal

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      sgstAmount,
      cgstAmount,
      total,
      effectiveDiscount,
      effectiveSgst,
      effectiveCgst
    }
  }

  const bill = calculateBill()

  return (
    <div
      className="bill-wrapper"
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <div
        className="bill-print"
        style={{
          width: 280,
          margin: '0 auto',
          color: '#000',
          background: '#fff',
          padding: '8px 12px',
          fontFamily: 'Courier New, monospace',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>AN ELITE CAFÉ</div>
          <div style={{ fontSize: 11, marginTop: 2 }}>TAX INVOICE</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: 1 }}>{dots}</div>

        {/* Meta rows */}
        <div style={{ fontSize: 11, marginTop: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span>ORDER:</span>
              <span style={{ marginLeft: 6 }}>#{order.orderid.slice(-8).toUpperCase()}</span>
            </div>
            <div>
              <span>TABLE:</span>
              <span style={{ marginLeft: 6 }}>Table {order.tableNumber}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <div>
              <span>TIME:</span>
              <span style={{ marginLeft: 6 }}>{formatTime(order.orderDate)}</span>
            </div>
            <div>
              <span>DATE:</span>
              <span style={{ marginLeft: 6 }}>{formatDate(order.orderDate)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {(order.customerName || order.customerPhone) && (
          <>
            <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>
            <div style={{ fontSize: 11, marginTop: 6 }}>
              {order.customerName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>NAME:</span>
                  <span>{order.customerName.toUpperCase()}</span>
                </div>
              )}
              {order.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PHONE:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>

        {/* Items Header */}
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 40px 50px', columnGap: 4, marginBottom: 4 }}>
            <div>QTY</div>
            <div>ITEM</div>
            <div style={{ textAlign: 'right' }}>RATE</div>
            <div style={{ textAlign: 'right' }}>AMOUNT</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11 }}>{dots}</div>

        {/* Items list */}
        <div style={{ marginTop: 6 }}>
          {order.items.map((item, idx) => {
            const menuItem = typeof item.menuid === 'object' ? item.menuid : null
            const itemName = (menuItem?.name || 'ITEM').toUpperCase()
            const itemPrice = menuItem?.price || 0
            const qty = item.quantity || 0
            const amount = itemPrice * qty
            const note = (item.notes || '').trim()
            
            return (
              <div key={idx} style={{ marginBottom: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 40px 50px', columnGap: 4, fontSize: 11 }}>
                  <div style={{ fontWeight: 700 }}>{qty}</div>
                  <div style={{ fontWeight: 700 }}>{itemName}</div>
                  <div style={{ textAlign: 'right' }}>₹{itemPrice.toFixed(0)}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700 }}>₹{amount.toFixed(0)}</div>
                </div>
                {note && (
                  <div style={{ fontSize: 10, marginTop: 2, paddingLeft: 24 }}>
                    <span>NOTE:</span> <span>{note.toUpperCase()}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 4 }}>{dots}</div>

        {/* Bill Summary */}
        <div style={{ marginTop: 6, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>SUBTOTAL:</span>
            <span style={{ fontWeight: 700 }}>₹{bill.subtotal.toFixed(2)}</span>
          </div>

          {bill.effectiveDiscount > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>DISCOUNT ({bill.effectiveDiscount}%):</span>
                <span style={{ fontWeight: 700 }}>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>AFTER DISCOUNT:</span>
                <span style={{ fontWeight: 700 }}>₹{bill.afterDiscount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>SGST ({bill.effectiveSgst}%):</span>
            <span>₹{bill.sgstAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>CGST ({bill.effectiveCgst}%):</span>
            <span>₹{bill.cgstAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>TOTAL GST:</span>
            <span style={{ fontWeight: 700 }}>₹{(bill.sgstAmount + bill.cgstAmount).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 4 }}>{dots}</div>

        {/* Grand Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8, fontSize: 12 }}>
          <div>GRAND TOTAL:</div>
          <div>₹{bill.total.toFixed(2)}</div>
        </div>

        {/* Payment Status */}
        {order.paymentStatus && (
          <>
            <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>
            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 700 }}>PAYMENT: {order.paymentStatus.toUpperCase().replace('_', ' ')}</div>
              {order.paymentMethod && (
                <div style={{ marginTop: 2 }}>METHOD: {order.paymentMethod.toUpperCase()}</div>
              )}
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>THANK YOU FOR DINING WITH US!</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>AN ELITE CAFE</div>
          <div style={{ fontSize: 11, marginTop: 2 }}>VISIT AGAIN!</div>
        </div>
      </div>
      <style jsx>{`
        /* Ensure the bill centers on both screen and print */
        @media print {
          .bill-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
          }
          .bill-print {
            margin: 0 auto !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default PrintableBill