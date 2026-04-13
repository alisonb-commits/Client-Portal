import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatCard({ label, value, linkTo }) {
  return (
    <Link
      to={linkTo}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </Link>
  );
}

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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Clients" value={stats.clients} linkTo="/clients" />
            <StatCard label="Total Projects" value={stats.projects} linkTo="/projects" />
            <StatCard label="Active Projects" value={stats.active} linkTo="/projects" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Recent Clients</h2>
              <Link to="/clients" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {recentClients.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No clients yet.</p>
                <Link to="/clients" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                  Add your first client
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentClients.map((client) => (
                  <li key={client.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.company || '—'}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        client.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
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
