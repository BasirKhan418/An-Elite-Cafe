export class AdminAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Auth API
  static async login(credentials: { email: string; password: string }) {
    const response = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return response.json()
  }

  // Tables API
  static async getTables() {
    const response = await fetch('/api/tables/manage', {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async createTable(tableData: any) {
    const response = await fetch('/api/tables/manage', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tableData)
    })
    return response.json()
  }

  static async updateTable(tableData: any) {
    const response = await fetch('/api/tables/manage', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tableData)
    })
    return response.json()
  }

  static async deleteTable(tableid: string) {
    const response = await fetch('/api/tables/manage', {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ tableid })
    })
    return response.json()
  }

  // Employees API
  static async getEmployees() {
    const response = await fetch('/api/employees', {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async createEmployee(employeeData: any) {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(employeeData)
    })
    return response.json()
  }

  static async updateEmployee(employeeData: any) {
    const response = await fetch('/api/employees', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(employeeData)
    })
    return response.json()
  }

  // Orders API
  static async getOrders(params?: { status?: string; tableid?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.tableid) queryParams.append('tableid', params.tableid)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await fetch(`/api/orders?${queryParams}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async updateOrderStatus(orderid: string, status?: string, paymentStatus?: string) {
    const response = await fetch('/api/orders', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderid, status, paymentStatus })
    })
    return response.json()
  }

  static async getOrderStats() {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Coupon API
  static async getCoupons() {
    const response = await fetch('/api/coupon', {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async validateCoupon(couponcode: string) {
    const response = await fetch('/api/coupon/validate', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ couponcode })
    })
    return response.json()
  }

  // Billing API
  static async generateBill(orderid: string, coupon: string[], sgst: number, cgst: number) {
    const response = await fetch('/api/orders/bill', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderid, coupon, sgst, cgst })
    })
    return response.json()
  }

  static async markOrderAsDone(orderid: string, paymentmode: string) {
    const response = await fetch('/api/orders/done', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderid, paymentmode })
    })
    return response.json()
  }
}