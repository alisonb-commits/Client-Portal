import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, login, token } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const { data } = await api.put('/auth/profile', { name: nameForm.name });
      login(data.user, token);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/profile', {
        name: user.name,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputStyle = {
    background: '#f7f6f3',
    border: '1px solid #e9e8e4',
    color: '#37352f',
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1" style={{ color: '#37352f' }}>Profile</h1>
        <p className="text-sm" style={{ color: '#9b9a97' }}>Manage your account settings</p>
      </div>

      <div className="max-w-lg space-y-6">

        {/* Name */}
        <div className="rounded-xl p-6" style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#37352f' }}>Display name</h2>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>Full name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ background: '#37352f', color: '#ffffff', opacity: savingName ? 0.6 : 1 }}
              >
                {savingName ? 'Saving…' : 'Save name'}
              </button>
            </div>
          </form>
        </div>

        {/* Email (read-only) */}
        <div className="rounded-xl p-6" style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#37352f' }}>Email address</h2>
          <p
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: '#f7f6f3', border: '1px solid #e9e8e4', color: '#9b9a97' }}
          >
            {user?.email}
          </p>
          <p className="text-xs mt-2" style={{ color: '#9b9a97' }}>Email cannot be changed.</p>
        </div>

        {/* Password */}
        <div className="rounded-xl p-6" style={{ background: '#ffffff', border: '1px solid #e9e8e4' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#37352f' }}>Change password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current password', placeholder: '••••••••' },
              { name: 'newPassword', label: 'New password', placeholder: 'Min. 8 characters' },
              { name: 'confirmPassword', label: 'Confirm new password', placeholder: '••••••••' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#37352f' }}>{label}</label>
                <input
                  type="password"
                  value={passwordForm[name]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [name]: e.target.value })}
                  required
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid #a8a29e'}
                  onBlur={e => e.target.style.border = '1px solid #e9e8e4'}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ background: '#37352f', color: '#ffffff', opacity: savingPassword ? 0.6 : 1 }}
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}
