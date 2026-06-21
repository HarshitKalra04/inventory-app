import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'

const EMPTY = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | product obj
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => getProducts().then((r) => setProducts(r.data))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add') }
  const openEdit = (p) => { setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }); setError(''); setModal(p) }
  const close = () => setModal(null)

  const save = async () => {
    setError('')
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') {
      setError('All fields are required'); return
    }
    if (Number(form.price) < 0 || Number(form.quantity) < 0) {
      setError('Price and quantity must be non-negative'); return
    }
    setLoading(true)
    try {
      const payload = { name: form.name, sku: form.sku, price: Number(form.price), quantity: Number(form.quantity) }
      if (modal === 'add') await createProduct(payload)
      else await updateProduct(modal.id, payload)
      setSuccess(modal === 'add' ? 'Product created!' : 'Product updated!')
      setTimeout(() => setSuccess(''), 3000)
      close(); load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save product')
    } finally { setLoading(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); load() }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={5} className="empty">No products yet</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><span className="tag">{p.sku}</span></td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity <= 10 ? 'badge-low' : 'badge-ok'}`}>
                      {p.quantity} units
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></div>
            <div className="form-group"><label>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Unique SKU code" /></div>
            <div className="form-row">
              <div className="form-group"><label>Price ($)</label><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="form-group"><label>Quantity</label><input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
