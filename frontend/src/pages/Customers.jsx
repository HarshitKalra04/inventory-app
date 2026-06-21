import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api'

const EMPTY = { name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => getCustomers().then((r) => setCustomers(r.data))
  useEffect(() => { load() }, [])

  const open = () => { setForm(EMPTY); setError(''); setModal(true) }
  const close = () => setModal(false)

  const save = async () => {
    setError('')
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Invalid email address'); return }
    setLoading(true)
    try {
      await createCustomer(form)
      setSuccess('Customer added!'); setTimeout(() => setSuccess(''), 3000)
      close(); load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add customer')
    } finally { setLoading(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this customer?')) return
    try { await deleteCustomer(id); load() }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={open}>+ Add Customer</button>
      </div>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.length === 0 && <tr><td colSpan={5} className="empty">No customers yet</td></tr>}
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Customer</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></div>
            <div className="form-group"><label>Phone (optional)</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0000" /></div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Add Customer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
