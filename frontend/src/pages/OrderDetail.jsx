import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder } from '../api'

export default function OrderDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrder(id).then((r) => setOrder(r.data)).catch(() => setError('Order not found'))
  }, [id])

  if (error) return <div><div className="alert alert-error">{error}</div><button className="btn btn-ghost" onClick={() => nav('/orders')}>← Back</button></div>
  if (!order) return <div className="empty">Loading…</div>

  return (
    <div>
      <div className="page-header">
        <h1>Order #{order.id}</h1>
        <button className="btn btn-ghost" onClick={() => nav('/orders')}>← Back to Orders</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>ORDER INFO</h3>
          <p><b>Status:</b> <span className="badge badge-ok">{order.status}</span></p>
          <p style={{ marginTop: 8 }}><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>
          <p style={{ marginTop: 8 }}><b>Total:</b> <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>${order.total_amount.toFixed(2)}</span></p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>CUSTOMER</h3>
          <p><b>{order.customer?.name}</b></p>
          <p style={{ marginTop: 4, color: 'var(--muted)' }}>{order.customer?.email}</p>
          {order.customer?.phone && <p style={{ marginTop: 4, color: 'var(--muted)' }}>{order.customer.phone}</p>}
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>ORDER ITEMS</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name || `Product #${item.product_id}`}</td>
                  <td>{item.product?.sku && <span className="tag">{item.product.sku}</span>}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td><b>${(item.unit_price * item.quantity).toFixed(2)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
