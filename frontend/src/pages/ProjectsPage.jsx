import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/axios';

const EMPTY_FORM = { title: '', description: '', status: 'pending', clientId: '' };

const STATUS_STYLES = {
  pending:   { background: '#fef9c3', color: '#854d0e' },
  active:    { background: '#dcfce7', color: '#166534' },
  completed: { background: '#dbeafe', color: '#1e40af' },
};

const inputStyle = {
  background: '#f7f6f3',
  border: '1px solid #e9e8e4',
  color: '#37352f',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.client_name || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (project) => {
    setForm({ title: project.title, description: project.description || '', status: project.status, clientId: project.client_id });
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
        toast.success('Project updated');
      } else {
        await api.post('/projects', form);
        toast.success('Project added');
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
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Delete this project?</p>
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
                await api.delete(`/projects/${id}`);
                toast.success('Project deleted');
                fetchData();
              } catch (err) {
                toast.error('Failed to delete project');
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
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#37352f' }}>Projects</h1>
          <p className="text-sm" style={{ color: '#9b9a97' }}>{projects.length} total</p>
        </div>
        <button
          onClick={openCreate}
          disabled={clients.length === 0}
          title={clients.length === 0 ? 'Add a client first' : ''}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed"
          style={{ background: clients.length === 0 ? '#e9e8e4' : '#37352f', color: clients.length === 0 ? '#9b9a97' : '#ffffff' }}
        >
          <Plus size={14} />
          New project
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9b9a97' }} />
          <input
            type="text"
            placeholder="Search projects…"
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
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
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
              {editingId ? 'Edit project' : 'New project'}
            </h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>
                  Title <span style={{ color: '#9b9a97' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Website Redesign"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                  onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Optional details…"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                  onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>
                  Client <span style={{ color: '#9b9a97' }}>*</span>
                </label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ background: '#f7f6f3', border: '1px solid #e9e8e4', color: '#37352f' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ background: '#37352f', color: '#ffffff', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add project'}
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
        ) : projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm mb-2" style={{ color: '#9b9a97' }}>No projects yet.</p>
            {clients.length > 0 && (
              <button onClick={openCreate} className="text-sm font-medium hover:underline" style={{ color: '#37352f' }}>
                Add your first project →
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#9b9a97' }}>No projects match your search.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #e9e8e4', background: '#fbfaf8' }}>
                {['Title', 'Client', 'Status', ''].map((h) => (
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
              {filtered.map((project, i) => (
                <tr
                  key={project.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f0ee' : 'none' }}
                  className="hover:bg-[#fbfaf8] transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: '#37352f' }}>{project.title}</p>
                    {project.description && (
                      <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#9b9a97' }}>
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#9b9a97' }}>{project.client_name}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={STATUS_STYLES[project.status] || { background: '#f3f4f6', color: '#6b7280' }}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(project)}
                        className="p-1.5 rounded-md hover:bg-[#f1f0ee] transition-colors"
                        style={{ color: '#9b9a97' }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
