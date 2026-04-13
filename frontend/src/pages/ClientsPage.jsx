import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY_FORM = { name: '', email: '', company: '', status: 'active' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
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
      } else {
        await api.post('/clients', form);
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
    if (!window.confirm('Delete this client? Their projects will also be deleted.')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} total</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add client
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit client' : 'New client'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Name *', type: 'text', placeholder: 'Jane Smith' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    required={name === 'name'}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Loading...</p>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No clients yet.</p>
            <button onClick={openCreate} className="mt-2 text-sm text-blue-600 hover:underline">
              Add your first client
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{client.name}</td>
                  <td className="px-6 py-3 text-gray-500">{client.company || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{client.email || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(client)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
