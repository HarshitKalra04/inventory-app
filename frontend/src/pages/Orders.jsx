import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder } from '../api'

export default function Orders() {
  const nav = useNavigate()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => getOrders().then((r) => setOrders(r.data))
  useEffect(() => {
    load()
    getCustomers().then((r) => setCustomers(r.data))
    getProducts().then((r) => setProducts(r.data))
  }, [])

  const open = () => { setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] }); setError(''); setModal(true) }
  const close = () => setModal(false)

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => setForm((f) => {
    const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }
  })

  const preview = () => form.items.reduce((sum, it) => {
    const p = products.find((x) => x.id === Number(it.product_id))
    return sum + (p ? p.price * Number(it.quantity || 0) : 0)
  }, 0)

  const save = async () => {
    setError('')
    if (!form.customer_id) { setError('Select a customer'); return }
    if (form.items.some((it) => !it.product_id || !it.quantity)) { setError('Fill all item fields'); return }
    setLoading(true)
    try {
      await createOrder({ customer_id: Number(form.customer_id), items: form.items.map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) })) })
      setSuccess('Order created!'); setTimeout(() => setSuccess(''), 3000)
      close(); load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create order')
    } finally { setLoading(false) }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try { await deleteOrder(id); load() }
    catch (e) { alert(e.response?.data?.detail || 'Failed to cancel') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={open}>+ New Order</button>
      </div>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={7} className="empty">No orders yet</td></tr>}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td>
                  <td>{o.customer?.name || `Customer #${o.customer_id}`}</td>
                  <td>{o.items?.length ?? '—'} item(s)</td>
                  <td><b>${o.total_amount.toFixed(2)}</b></td>
                  <td><span className="badge badge-ok">{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav(`/orders/${o.id}`)} style={{ marginRight: 8 }}>View</button>
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(o.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Order</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Customer</label>
              <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 600 }}>Items</label>
                <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
              </div>
              {form.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 8, marginBottom: 8 }}>
                  <select value={it.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)} ({p.quantity} left)</option>)}
                  </select>
                  <input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                  {form.items.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>}
                </div>
              ))}
            </div>
            {preview() > 0 && (
              <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                Estimated total: <b>${preview().toFixed(2)}</b>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Creating…' : 'Create Order'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
