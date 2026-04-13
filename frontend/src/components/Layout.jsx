import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FolderKanban, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

function SidebarContent({ user, onLogout, onNavClick }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4">
        <span className="text-base font-semibold tracking-tight" style={{ color: '#37352f' }}>
          ClientPortal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[#e9e8e4] text-[#37352f] font-medium'
                  : 'text-[#9b9a97] hover:bg-[#f1f0ee] hover:text-[#37352f]'
              }`
            }
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-2 pb-4 pt-2" style={{ borderTop: '1px solid #e9e8e4' }}>
        <Link
          to="/profile"
          onClick={onNavClick}
          className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-md hover:bg-[#f1f0ee] transition-colors"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: '#e9e8e4', color: '#37352f' }}
          >
            {initials}
          </div>
          <span className="text-xs truncate" style={{ color: '#9b9a97' }}>
            {user?.name}
          </span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-[#f1f0ee]"
          style={{ color: '#9b9a97' }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f7f6f3' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-col shrink-0"
        style={{ background: '#fbfaf8', borderRight: '1px solid #e9e8e4' }}
      >
        <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => {}} />
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 left-0 h-full w-56 z-50 flex flex-col md:hidden transition-transform duration-200"
        style={{
          background: '#fbfaf8',
          borderRight: '1px solid #e9e8e4',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <span className="text-base font-semibold" style={{ color: '#37352f' }}>ClientPortal</span>
          <button onClick={() => setDrawerOpen(false)} style={{ color: '#9b9a97' }}>
            <X size={18} />
          </button>
        </div>
        <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => setDrawerOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center px-4 h-12 shrink-0"
          style={{ background: '#fbfaf8', borderBottom: '1px solid #e9e8e4' }}
        >
          <button onClick={() => setDrawerOpen(true)} style={{ color: '#9b9a97' }}>
            <Menu size={18} />
          </button>
          <span className="ml-3 text-sm font-semibold" style={{ color: '#37352f' }}>
            ClientPortal
          </span>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
