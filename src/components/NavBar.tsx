import { useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import shopConfig from '@/shop.config';

/**
 * NavBar — shared top navigation for all protected admin pages.
 * Shows shop name, route links (admin-only: Docs, Team), and user/logout.
 */
export function NavBar() {
  const [location, setLocation] = useLocation();
  const user = useStore(s => s.user);
  const setUser = useStore(s => s.setUser);

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const linkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-white'
        : 'hover:opacity-70'
    }`;

  return (
    <header className="border-b px-4 py-3" style={{ borderColor: `${shopConfig.colors.muted}22` }}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Left: shop name → links to public storefront */}
        <a
          href="/"
          className="text-lg font-semibold"
          style={{ color: shopConfig.colors.primary }}
        >
          {shopConfig.name}
        </a>

        {/* Center: nav links */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setLocation('/admin')}
            className={linkClass(location === '/admin')}
            style={{
              color: location === '/admin' ? '#fff' : shopConfig.colors.muted,
              background: location === '/admin' ? shopConfig.colors.primary : undefined,
            }}
          >
            Home
          </button>
          {isAdmin && (
            <button
              onClick={() => setLocation('/admin/docs')}
              className={linkClass(location === '/admin/docs')}
              style={{
                color: location === '/admin/docs' ? '#fff' : shopConfig.colors.muted,
                background: location === '/admin/docs' ? shopConfig.colors.primary : undefined,
              }}
            >
              Docs
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setLocation('/admin/team')}
              className={linkClass(location === '/admin/team')}
              style={{
                color: location === '/admin/team' ? '#fff' : shopConfig.colors.muted,
                background: location === '/admin/team' ? shopConfig.colors.primary : undefined,
              }}
            >
              Team
            </button>
          )}
        </nav>

        {/* Right: user + logout */}
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:inline" style={{ color: shopConfig.colors.muted }}>
            {user?.name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-2.5 py-1.5 rounded-lg border transition-opacity hover:opacity-70"
            style={{ borderColor: `${shopConfig.colors.muted}44`, color: shopConfig.colors.muted }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
