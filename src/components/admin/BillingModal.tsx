"use client"

import React, { useState, useEffect, useRef } from 'react'
import { GlassCard, GlassButton } from '@/components/ui/glass'
import { AdminAPI } from '@/lib/adminApi'
import type { Order, Coupon } from '@/types/order'
import PrintableBill from './PrintableBill'
import { 
  X, 
  IndianRupee, 
  Percent,
  Tag,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Receipt,
  Printer
} from 'lucide-react'
import { toast } from 'sonner'
interface BillingModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onBillGenerated: () => void
}

const BillingModal: React.FC<BillingModalProps> = ({ order, isOpen, onClose, onBillGenerated }) => {
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([])
  const [sgst, setSgst] = useState(2.5)
  const [cgst, setCgst] = useState(2.5)
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'other'>('cash')
  const [processing, setProcessing] = useState(false)
  const [billGenerated, setBillGenerated] = useState(false)
  const [billDetails, setBillDetails] = useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && order) {
      fetchCoupons()
      
      // Check if bill is already generated
      const isAlreadyGenerated = order.isgeneratedBill || false
      console.log('BillingModal opened:', { 
        orderid: order.orderid,
        isgeneratedBill: order.isgeneratedBill,
        isAlreadyGenerated,
        status: order.status 
      })
      setBillGenerated(isAlreadyGenerated)
      
      setSgst(order.sgst || 2.5)
      setCgst(order.cgst || 2.5)
      
      // For already generated bills, coupons are already applied to the amounts
      // so we don't need to show them again
      setAppliedCoupons([])
      setCouponCode('')
      setPaymentMode('cash')
      setBillDetails(null)
    }
  }, [isOpen, order, order?.isgeneratedBill])

  const fetchCoupons = async () => {
    try {
      const response = await AdminAPI.getCoupons()
      if (response.success) {
        setAvailableCoupons(response.coupons || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  const validateAndApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setValidatingCoupon(true)
    try {
      const response = await AdminAPI.validateCoupon(couponCode.trim())
      if (response.success) {
        if (!appliedCoupons.includes(couponCode.trim())) {
          setAppliedCoupons([...appliedCoupons, couponCode.trim()])
          setCouponCode('')
          // Show success message
          toast.success(`✓ Coupon "${couponCode.trim()}" applied successfully! You get ${response.coupon?.discountPercentage}% off.`)
        } else {
          toast.warning('⚠ This coupon is already applied')
        }
      } else {
        toast.error(`✗ ${response.message || 'Invalid coupon code'}`)
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      toast.error('✗ Failed to validate coupon. Please try again.')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = (code: string) => {
    setAppliedCoupons(appliedCoupons.filter(c => c !== code))
  }

  const calculateBillPreview = () => {
    if (!order) return { subtotal: 0, discount: 0, sgstAmount: 0, cgstAmount: 0, tax: 0, total: 0, discountPercentage: 0 }

    // If the bill is already generated, show values based on the stored order fields
    if (order.isgeneratedBill || billGenerated) {
      const subtotal = order.subtotal || 0
      const discountPercentage = order.discount || 0
      const discountAmount = (subtotal * discountPercentage) / 100
      const afterDiscount = subtotal - discountAmount

      // Prefer stored SGST/CGST when available; otherwise split total tax evenly if provided
      let sgstPct = order.sgst ?? sgst
      let cgstPct = order.cgst ?? cgst

      let sgstAmount = 0
      let cgstAmount = 0

      if (order.sgst !== undefined && order.cgst !== undefined) {
        sgstAmount = (afterDiscount * sgstPct) / 100
        cgstAmount = (afterDiscount * cgstPct) / 100
      } else if (order.tax) {
        const totalTaxAmt = (afterDiscount * order.tax) / 100
        sgstAmount = totalTaxAmt / 2
        cgstAmount = totalTaxAmt / 2
      } else {
        // Fallback to local percentages if nothing stored
        sgstAmount = (afterDiscount * sgstPct) / 100
        cgstAmount = (afterDiscount * cgstPct) / 100
      }

      const taxAmount = sgstAmount + cgstAmount
      const total = order.totalAmount ?? Math.ceil(afterDiscount + taxAmount)

      return {
        subtotal,
        discount: discountAmount,
        sgstAmount,
        cgstAmount,
        tax: taxAmount,
        total: total > 0 ? total : 0,
        discountPercentage
      }
    }

    // Otherwise, we're previewing before generation using selected coupons and current SGST/CGST inputs
    let subtotal = order.subtotal
    let discountPercentage = 0

    // Calculate total discount from applied coupons
    appliedCoupons.forEach(code => {
      const coupon = availableCoupons.find(c => c.couponcode === code)
      if (coupon) {
        discountPercentage += coupon.discountPercentage
      }
    })

    // Calculate discount on subtotal
    const discountAmount = (subtotal * discountPercentage) / 100
    const afterDiscount = subtotal - discountAmount
    
    // Calculate tax on discounted amount
    const sgstAmount = (afterDiscount * sgst) / 100
    const cgstAmount = (afterDiscount * cgst) / 100
    const taxAmount = sgstAmount + cgstAmount
    
    // Calculate final total
    const total = Math.ceil(afterDiscount + taxAmount)

    return {
      subtotal,
      discount: discountAmount,
      sgstAmount,
      cgstAmount,
      tax: taxAmount,
      total: total > 0 ? total : 0,
      discountPercentage
    }
  }

  const handleGenerateBill = async () => {
    if (!order) return
    
    // Check if bill is already generated
    if (order.isgeneratedBill || billGenerated) {
      toast.warning('⚠ Bill has already been generated for this order. You cannot regenerate it.')
      return
    }

    setProcessing(true)
    try {
      const response = await AdminAPI.generateBill(order.orderid, appliedCoupons, sgst, cgst)
      if (response.success) {
        setBillGenerated(true)
        setBillDetails(response)
        // Update the order object to reflect the bill has been generated
        if (order) {
          order.isgeneratedBill = true
        }
        toast.success('✓ Bill generated successfully!')
        onBillGenerated()
      } else {
        toast.error(`✗ ${response.message || 'Failed to generate bill'}`)
      }
    } catch (error) {
      console.error('Error generating bill:', error)
      toast.error('✗ Failed to generate bill. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCompleteBill = async () => {
    if (!order) return

    setProcessing(true)
    try {
      const response = await AdminAPI.markOrderAsDone(order.orderid, paymentMode)
      if (response.success) {
        toast.success('Order completed successfully!')
        onBillGenerated()
        onClose()
      } else {
        toast.error(response.message || 'Failed to complete order')
      }
    } catch (error) {
      console.error('Error completing order:', error)
      toast.error('Failed to complete order')
    } finally {
      setProcessing(false)
    }
  }

  const handlePrintBill = () => {
    if (!printRef.current) return

    const printWindow = window.open('', '_blank', 'width=400,height=800')
    if (!printWindow) {
      toast.warning('Please allow popups to print the bill')
      return
    }

    const printContent = printRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Order ${order?.orderid}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              padding: 0;
              margin: 0;
            }
            /* Match the classes used by PrintableBill so the preview centers correctly */
            .bill-wrapper {
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .bill-print {
              max-width: 280px;
              margin: 0 auto;
              background: white;
            }
            @media print {
              body {
                background: white;
              }
              .bill-print { box-shadow: none; }
            }
            @page {
              size: auto;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 250);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const billPreview = calculateBillPreview()

  if (!isOpen || !order) return null

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Wallet },
    { id: 'other', label: 'Other', icon: IndianRupee }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky z-50 top-0 bg-white/90 backdrop-blur-sm p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              {(billGenerated || order.isgeneratedBill) ? 'Bill Summary' : 'Generate Bill'}
            </h2>
            <p className="text-sm text-gray-600">
              Order ID: {order.orderid} - Table {order.tableNumber}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info message if viewing already generated bill */}
          {(order.isgeneratedBill || billGenerated) && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-start gap-3">
              <Receipt className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Bill Generated</p>
                <p className="text-sm text-blue-700 mt-1">
                  {order.status === 'done' ? 'This order has been completed. You can print the bill again if needed.' : 'You can print the bill or complete the order.'}
                </p>
              </div>
            </div>
          )}

          {/* Order Items Summary */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => {
                const menuItem = typeof item.menuid === 'object' ? item.menuid : null;
                const itemName = menuItem?.name || 'Unknown Item';
                const itemPrice = menuItem?.price || 0;
                
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {itemName} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>₹{billPreview.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {!billGenerated && !order.isgeneratedBill && (
            <>
              {/* Coupon Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Apply Coupons
                </h3>
                
                {/* Coupon Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && validateAndApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <GlassButton
                    variant="primary"
                    onClick={validateAndApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </GlassButton>
                </div>

                {/* Applied Coupons */}
                {appliedCoupons.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {appliedCoupons.map(code => {
                      const coupon = availableCoupons.find(c => c.couponcode === code)
                      return (
                        <div key={code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                          <div>
                            <p className="font-medium text-green-800">{code}</p>
                            {coupon && (
                              <p className="text-xs text-green-600">{coupon.discountPercentage}% off</p>
                            )}
                          </div>
                          <button 
                            onClick={() => removeCoupon(code)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Available Coupons */}
                {availableCoupons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Available Coupons:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCoupons
                        .filter(c => !appliedCoupons.includes(c.couponcode))
                        .filter(c => c.totalUsageLimit === null || c.totalUsageLimit > 0)
                        .map(coupon => (
                          <button
                            key={coupon._id}
                            onClick={() => {
                              setCouponCode(coupon.couponcode)
                              validateAndApplyCoupon()
                            }}
                            className="text-left p-2 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <p className="font-medium text-sm text-blue-600">{coupon.couponcode}</p>
                            <p className="text-xs text-gray-600">{coupon.discountPercentage}% off</p>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tax Section - SGST & CGST */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  GST Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* SGST Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SGST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={sgst}
                      onChange={(e) => setSgst(Number(e.target.value))}
                      disabled={billGenerated || order.isgeneratedBill}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="2.5"
                    />
                  </div>
                  
                  {/* CGST Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CGST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={cgst}
                      onChange={(e) => setCgst(Number(e.target.value))}
                      disabled={billGenerated || order.isgeneratedBill}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="2.5"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total GST: {(sgst + cgst).toFixed(1)}%
                </p>
              </div>
            </>
          )}

          {/* Bill Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-800 mb-3">Bill Summary</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{billPreview.subtotal.toFixed(2)}</span>
            </div>

            {billPreview.discountPercentage > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({billPreview.discountPercentage}%)</span>
                <span>-₹{billPreview.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SGST ({sgst}%)</span>
              <span className="font-medium">₹{billPreview.sgstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CGST ({cgst}%)</span>
              <span className="font-medium">₹{billPreview.cgstAmount.toFixed(2)}</span>
            </div>

            <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{billPreview.total.toFixed(2)}</span>
            </div>
          </div>

          {billGenerated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Bill Generated Successfully!</span>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(method => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMode(method.id as any)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          paymentMode === method.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </GlassButton>
            {!billGenerated && !order.isgeneratedBill ? (
              <GlassButton 
                variant="primary" 
                onClick={handleGenerateBill}
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Generating...' : 'Generate Bill'}
              </GlassButton>
            ) : (
              <>
                <GlassButton 
                  variant="secondary" 
                  onClick={handlePrintBill}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill</span>
                </GlassButton>
                {order.status !== 'done' && (
                  <GlassButton 
                    variant="primary" 
                    onClick={handleCompleteBill}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? 'Processing...' : 'Complete Order'}
                  </GlassButton>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hidden Printable Bill */}
        <div className="hidden">
          <div ref={printRef}>
            {order && (
              <PrintableBill 
                order={order} 
                discount={billPreview.discountPercentage}
                sgst={sgst}
                cgst={cgst}
              />
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default BillingModal
