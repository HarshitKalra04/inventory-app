import { useEffect, useState } from 'react'
import { getDashboard } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then((r) => setStats(r.data))
      .catch(() => setError('Failed to load dashboard'))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!stats) return <div className="empty">Loading…</div>

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_products}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_customers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: stats.low_stock_products.length ? 'var(--warning)' : 'var(--success)' }}>
            {stats.low_stock_products.length}
          </div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      {stats.low_stock_products.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>⚠️ Low Stock Products</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Stock</th><th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="tag">{p.sku}</span></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-low' : 'badge-low'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
