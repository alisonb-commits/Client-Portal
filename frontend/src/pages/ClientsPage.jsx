import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY_FORM = { name: '', email: '', company: '', status: 'active' };

const inputStyle = {
  background: '#f7f6f3',
  border: '1px solid #e9e8e4',
  color: '#37352f',
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (client) => {
    setForm({ name: client.name, email: client.email || '', company: client.company || '', status: client.status });
    setEditingId(client.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
        toast.success('Client updated');
      } else {
        await api.post('/clients', form);
        toast.success('Client added');
      }
      setShowForm(false);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Delete this client?</p>
        <p className="text-xs" style={{ color: '#9b9a97' }}>Their projects will also be deleted.</p>
        <div className="flex gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 rounded-md text-xs font-medium"
            style={{ background: '#f7f6f3', border: '1px solid #e9e8e4', color: '#37352f' }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/clients/${id}`);
                toast.success('Client deleted');
                fetchClients();
              } catch (err) {
                toast.error('Failed to delete client');
              }
            }}
            className="flex-1 py-1.5 rounded-md text-xs font-medium"
            style={{ background: '#dc2626', color: '#ffffff' }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#37352f' }}>Clients</h1>
          <p className="text-sm" style={{ color: '#9b9a97' }}>{clients.length} total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: '#37352f', color: '#ffffff' }}
        >
          <Plus size={14} />
          New client
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9b9a97' }} />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: '#ffffff', border: '1px solid #e9e8e4', color: '#37352f' }}
            onFocus={e => e.target.style.border = '1px solid #a8a29e'}
            onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: '#ffffff', border: '1px solid #e9e8e4', color: '#37352f' }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}
          >
            <h2 className="text-base font-semibold mb-5" style={{ color: '#37352f' }}>
              {editingId ? 'Edit client' : 'New client'}
            </h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Name', required: true, type: 'text', placeholder: 'Jane Smith' },
                { name: 'email', label: 'Email', required: false, type: 'email', placeholder: 'jane@example.com' },
                { name: 'company', label: 'Company', required: false, type: 'text', placeholder: 'Acme Corp' },
              ].map(({ name, label, required, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>
                    {label}{required && <span style={{ color: '#9b9a97' }}> *</span>}
                  </label>
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    required={required}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                    onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{ background: '#f7f6f3', border: '1px solid #e9e8e4', color: '#37352f' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ background: '#37352f', color: '#ffffff', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}>
        <div className="overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm" style={{ color: '#9b9a97' }}>Loading…</p>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm mb-2" style={{ color: '#9b9a97' }}>No clients yet.</p>
            <button onClick={openCreate} className="text-sm font-medium hover:underline" style={{ color: '#37352f' }}>
              Add your first client →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#9b9a97' }}>No clients match your search.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #e9e8e4', background: '#fbfaf8' }}>
                {['Name', 'Company', 'Email', 'Projects', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#9b9a97' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, i) => (
                <tr
                  key={client.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f0ee' : 'none' }}
                  className="hover:bg-[#fbfaf8] transition-colors group"
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: '#37352f' }}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: '#f1f0ee', color: '#37352f' }}
                      >
                        {client.name[0].toUpperCase()}
                      </div>
                      {client.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#9b9a97' }}>{client.company || '—'}</td>
                  <td className="px-5 py-3.5" style={{ color: '#9b9a97' }}>{client.email || '—'}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#9b9a97' }}>{client.project_count}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={client.status === 'active'
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#f3f4f6', color: '#6b7280' }
                      }
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(client)}
                        className="p-1.5 rounded-md hover:bg-[#f1f0ee] transition-colors"
                        style={{ color: '#9b9a97' }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        style={{ color: '#9b9a97' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9b9a97'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </Layout>
  );
}
