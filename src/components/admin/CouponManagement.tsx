"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { GlassCard, GlassButton, GlassInput, GlassModal, GlassTable } from '@/components/ui/glass'
import { AdminAPI } from '@/lib/adminApi'
import type { Coupon } from '@/types/order'
import { toast } from 'sonner'

const initialForm = {
  id: '',
  name: '',
  couponcode: '',
  discountPercentage: 0,
  description: '',
  totalUsageLimit: null as number | null,
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(initialForm)

  const headers = useMemo(() => ['Name', 'Code', 'Discount %', 'Usage Limit', 'Description', 'Actions'], [])

  const actions = useMemo(() => ([
    { label: 'Edit', key: 'edit', variant: 'secondary' as const },
    { label: 'Delete', key: 'delete', variant: 'danger' as const },
  ]), [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await AdminAPI.getCoupons()
      if (res.success) {
        setCoupons(res.coupons || [])
      } else {
        toast.error(res.message || 'Failed to load coupons')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const openCreate = () => {
    setForm(initialForm)
    setEditing(false)
    setModalOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setForm({
      id: (coupon as any)._id || '',
      name: coupon.name || '',
      couponcode: coupon.couponcode || '',
      discountPercentage: coupon.discountPercentage || 0,
      description: coupon.description || '',
      totalUsageLimit: coupon.totalUsageLimit ?? null,
    })
    setEditing(true)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      // Basic validation
      if (!form.name.trim()) return toast.error('Name is required')
      if (!form.couponcode.trim()) return toast.error('Code is required')
      if (form.discountPercentage < 0 || form.discountPercentage > 100) return toast.error('Discount must be 0-100')

      const payload: any = {
        name: form.name.trim(),
        couponcode: form.couponcode.trim().toUpperCase(),
        discountPercentage: Number(form.discountPercentage),
        description: form.description?.trim() || undefined,
        totalUsageLimit: form.totalUsageLimit === null || form.totalUsageLimit === undefined || form.totalUsageLimit === ('' as any)
          ? null
          : Number(form.totalUsageLimit),
      }

      let res
      if (editing) {
        res = await AdminAPI.updateCoupon({ id: form.id, ...payload })
      } else {
        res = await AdminAPI.createCoupon(payload)
      }

      if (res.success) {
        toast.success(res.message || (editing ? 'Coupon updated' : 'Coupon created'))
        setModalOpen(false)
        fetchCoupons()
      } else {
        toast.error(res.message || 'Operation failed')
      }
    } catch (e) {
      console.error(e)
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    toast.warning(`Delete coupon ${coupon.couponcode}?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const res = await AdminAPI.deleteCoupon((coupon as any)._id)
            if (res.success) {
              toast.success('Coupon deleted')
              fetchCoupons()
            } else {
              toast.error(res.message || 'Failed to delete')
            }
          } catch (e) {
            console.error(e)
            toast.error('Failed to delete')
          }
        },
      },
    })
  }

  const onRowAction = (row: any, action: string) => {
    const coupon = row.__source as Coupon
    if (action === 'edit') return openEdit(coupon)
    if (action === 'delete') return handleDelete(coupon)
  }

  const tableData = useMemo(() => {
    return coupons.map((c) => ({
      Name: c.name,
      Code: c.couponcode,
      'Discount %': c.discountPercentage,
      'Usage Limit': c.totalUsageLimit === null ? 'Unlimited' : c.totalUsageLimit,
      Description: c.description || '-',
      _actions: actions,
      __source: c, // hidden source object for actions
    }))
  }, [coupons, actions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Coupon Management</h3>
        <GlassButton onClick={openCreate}>Add Coupon</GlassButton>
      </div>

      <GlassCard className="p-4">
        {loading ? (
          <p className="text-gray-600">Loading coupons…</p>
        ) : (
          <GlassTable headers={headers} data={tableData} onRowAction={onRowAction} />
        )}
      </GlassCard>

      <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <div className="grid grid-cols-1 gap-4">
          <GlassInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <GlassInput
            label="Code"
            value={form.couponcode}
            onChange={(e) => setForm((f) => ({ ...f, couponcode: e.target.value.toUpperCase() }))}
          />
          <GlassInput
            label="Discount Percentage"
            type="number"
            value={form.discountPercentage}
            onChange={(e) => setForm((f) => ({ ...f, discountPercentage: Number(e.target.value) }))}
          />
          <GlassInput
            label="Usage Limit (leave blank for unlimited)"
            type="number"
            value={form.totalUsageLimit as any}
            onChange={(e) => {
              const val = e.target.value
              setForm((f) => ({ ...f, totalUsageLimit: val === '' ? null : Number(val) }))
            }}
          />
          <GlassInput
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</GlassButton>
            <GlassButton onClick={handleSave}>{editing ? 'Update' : 'Create'}</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}

export default CouponManagement
