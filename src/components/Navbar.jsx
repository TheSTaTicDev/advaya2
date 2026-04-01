import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Farmer Dashboard', path: '/farmer' },
    { name: 'Marketplace',      path: '/marketplace' },
    { name: 'Logistics Center', path: '/logistics' },
  ];

  return (
    <nav
      className="fixed w-full z-10 top-0 left-0 backdrop-blur-md"
      style={{ background: 'rgba(13,13,13,0.85)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="max-w-[1400px] mx-auto px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold"
              style={{ color: 'var(--color-green)' }}
            >
              AgriChain
            </Link>

            <div className="hidden md:flex gap-1">
              {navItems.map(item => {
                const active = location.pathname === item.path || (item.path === '/farmer' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active ? 'var(--color-surface)' : 'transparent',
                      color: active ? 'var(--color-text)' : 'var(--color-muted)',
                      border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}

