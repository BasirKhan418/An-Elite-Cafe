"use client"

import React from 'react'
import type { Order } from '@/types/order'

interface KitchenTicketProps {
  order: Order
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

const KitchenTicket: React.FC<KitchenTicketProps> = ({ order }) => {
  const totalItems = order.items.reduce((sum, it) => sum + (it.quantity || 0), 0)

  const itemsWithNotes = order.items
    .map((it) => {
      const menu = typeof it.menuid === 'object' ? it.menuid : undefined
      return {
        name: (menu?.name || 'Item').toUpperCase(),
        note: (it.notes || '').toUpperCase().trim(),
      }
    })
    .filter((x) => x.note.length > 0)

  return (
    <div
      className="kot-wrapper"
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <div
        className="kot-print"
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
        <div style={{ fontSize: 11, marginTop: 2 }}>KITCHEN ORDER TICKET</div>
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

      <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>

      {/* Items list */}
      <div style={{ marginTop: 6 }}>
        {order.items.map((it, idx) => {
          const menu = typeof it.menuid === 'object' ? it.menuid : undefined
          const name = (menu?.name || 'ITEM').toUpperCase()
          const qty = it.quantity || 0
          const note = (it.notes || '').trim()
          return (
            <div key={idx} style={{ marginBottom: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr', columnGap: 8 }}>
                <div style={{ fontWeight: 700 }}>{qty}</div>
                <div style={{ fontWeight: 700 }}>{name}</div>
              </div>
              {note && (
                <div style={{ fontSize: 11, marginTop: 2, paddingLeft: 24 }}>
                  <span>NOTE:</span> <span>{note.toUpperCase()}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, marginTop: 4 }}>{dots}</div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}>
        <div>TOTAL ITEMS:</div>
        <div>{totalItems}</div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>

      {/* Special Notes */}
      <div style={{ textAlign: 'center', fontWeight: 700, marginTop: 8 }}>
        ** SPECIAL NOTES **
      </div>
      <div style={{ fontSize: 11, marginTop: 6 }}>
        {itemsWithNotes.length > 0 ? (
          itemsWithNotes.map((x, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              {x.name}: <span>{x.note}</span>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center' }}>NONE</div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{dots}</div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontWeight: 700, marginTop: 8 }}>
        ** PREPARE IMMEDIATELY **
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, marginTop: 6 }}>KITCHEN COPY</div>
      </div>
      <style jsx>{`
        /* Ensure the ticket centers on both screen and print */
        @media print {
          .kot-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
          }
          .kot-print {
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

export default KitchenTicket
