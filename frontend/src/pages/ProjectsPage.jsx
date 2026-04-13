import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY_FORM = { title: '', description: '', status: 'pending', clientId: '' };

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients'),
      ]);
      setProjects(projectsRes.data.projects);
      setClients(clientsRes.data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description || '',
      status: project.status,
      clientId: project.client_id,
    });
    setEditingId(project.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post('/projects', form);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} total</p>
        </div>
        <button
          onClick={openCreate}
          disabled={clients.length === 0}
          title={clients.length === 0 ? 'Add a client first' : ''}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add project
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit project' : 'New project'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Website Redesign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Optional details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
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
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add project'}
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
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No projects yet.</p>
            {clients.length > 0 && (
              <button onClick={openCreate} className="mt-2 text-sm text-blue-600 hover:underline">
                Add your first project
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-800">{project.title}</p>
                    {project.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{project.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{project.client_name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[project.status] || 'bg-gray-100 text-gray-500'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(project)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
