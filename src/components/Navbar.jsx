import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import { useRole } from '../context/RoleContext';
import { LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSwitchRole = () => {
    setRole(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Farmer Dashboard', path: '/farmer', roles: ['farmer'] },
    { name: 'Marketplace', path: '/marketplace', roles: ['retailer'] },
    { name: 'Crop Management', path: '/logistics', roles: ['farmer', 'retailer'] },
  ];

  return (
    <nav
      className="fixed w-full z-50 top-0 left-0 transition-colors"
      style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="max-w-[1400px] mx-auto px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight transition-colors"
              style={{ color: 'var(--color-green-dark)' }}
            >
              AgriProof
            </Link>

            <div className="hidden md:flex gap-6 h-full items-center">
              {navItems
                .filter(item => item.roles.includes(role))
                .map(item => {
                  const active = location.pathname === item.path || (item.path === '/farmer' && location.pathname === '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-sm font-semibold transition-colors relative h-full flex items-center"
                      style={{
                        color: active ? 'var(--color-green-dark)' : 'var(--color-muted)',
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-green-dark)' }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-muted)' }}
                    >
                      {item.name}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 rounded-t-sm" style={{ backgroundColor: 'var(--color-green)' }} />
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {role && (
              <button
                onClick={handleSwitchRole}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 group"
                style={{ color: 'var(--color-muted)', border: '1px solid transparent' }}
              >
                <LogOut size={16} className="group-hover:text-red-400" />
                Switch Role
              </button>
            )}
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
