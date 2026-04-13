import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statCards = [
  { key: 'clients', label: 'Total clients', icon: Users, linkTo: '/clients' },
  { key: 'projects', label: 'Total projects', icon: FolderKanban, linkTo: '/projects' },
  { key: 'active', label: 'Active projects', icon: Zap, linkTo: '/projects' },
];

const STATUS_STYLES = {
  active: { background: '#dcfce7', color: '#166534' },
  inactive: { background: '#f3f4f6', color: '#6b7280' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0, active: 0 });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/projects'),
        ]);
        const clients = clientsRes.data.clients;
        const projects = projectsRes.data.projects;
        setStats({
          clients: clients.length,
          projects: projects.length,
          active: projects.filter((p) => p.status === 'active').length,
        });
        setRecentClients(clients.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-1" style={{ color: '#37352f' }}>
          Good morning, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm" style={{ color: '#9b9a97' }}>
          Here's what's happening with your clients.
        </p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: '#9b9a97' }}>Loading…</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {statCards.map(({ key, label, icon: Icon, linkTo }) => (
              <Link
                key={key}
                to={linkTo}
                className="rounded-xl p-5 transition-all hover:shadow-sm group"
                style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#9b9a97' }}>
                    {label}
                  </p>
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: '#f7f6f3' }}
                  >
                    <Icon size={14} strokeWidth={1.75} style={{ color: '#9b9a97' }} />
                  </div>
                </div>
                <p className="text-3xl font-semibold" style={{ color: '#37352f' }}>
                  {stats[key]}
                </p>
              </Link>
            ))}
          </div>

          {/* Recent clients */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #e9e8e4' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: '#37352f' }}>
                Recent clients
              </h2>
              <Link
                to="/clients"
                className="text-xs transition-colors hover:underline"
                style={{ color: '#9b9a97' }}
              >
                View all →
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm mb-2" style={{ color: '#9b9a97' }}>No clients yet.</p>
                <Link
                  to="/clients"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#37352f' }}
                >
                  Add your first client →
                </Link>
              </div>
            ) : (
              <ul>
                {recentClients.map((client, i) => (
                  <li
                    key={client.id}
                    className="px-6 py-3.5 flex items-center justify-between"
                    style={{
                      borderBottom: i < recentClients.length - 1 ? '1px solid #f1f0ee' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: '#f1f0ee', color: '#37352f' }}
                      >
                        {client.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#37352f' }}>
                          {client.name}
                        </p>
                        <p className="text-xs" style={{ color: '#9b9a97' }}>
                          {client.company || 'No company'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={STATUS_STYLES[client.status] || STATUS_STYLES.inactive}
                    >
                      {client.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
