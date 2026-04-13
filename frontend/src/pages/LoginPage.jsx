import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f6f3' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#37352f' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: '#9b9a97' }}>
            Sign in to ClientPortal
          </p>
        </div>

        <div
          className="rounded-xl p-8"
          style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}
        >
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#f7f6f3',
                    border: '1px solid #e9e8e4',
                    color: '#37352f',
                  }}
                  onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                  onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-medium transition-opacity mt-2"
              style={{ background: '#37352f', color: '#ffffff', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#9b9a97' }}>
          No account?{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: '#37352f' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
