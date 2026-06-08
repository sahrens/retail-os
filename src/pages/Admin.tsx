import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import shopConfig from '@/shop.config';

export default function Admin() {
  const user = useStore(s => s.user);
  const setUser = useStore(s => s.setUser);

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: shopConfig.colors.bg }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: shopConfig.colors.text }}>
              {shopConfig.name}
            </h1>
            <p className="text-sm" style={{ color: shopConfig.colors.muted }}>
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded border transition-opacity hover:opacity-70"
            style={{ borderColor: `${shopConfig.colors.muted}44`, color: shopConfig.colors.muted }}>
            Log out
          </button>
        </div>

        <nav className="grid gap-3">
          {user.role === 'admin' && (
            <a href="/admin/docs" className="block p-4 rounded-xl border transition-all hover:shadow-sm"
              style={{ borderColor: `${shopConfig.colors.muted}22` }}>
              <h3 className="font-medium" style={{ color: shopConfig.colors.text }}>Documents</h3>
              <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>Internal planning docs and notes</p>
            </a>
          )}
          <div className="block p-4 rounded-xl border opacity-50"
            style={{ borderColor: `${shopConfig.colors.muted}22` }}>
            <h3 className="font-medium" style={{ color: shopConfig.colors.text }}>Inventory</h3>
            <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>Coming soon</p>
          </div>
          <div className="block p-4 rounded-xl border opacity-50"
            style={{ borderColor: `${shopConfig.colors.muted}22` }}>
            <h3 className="font-medium" style={{ color: shopConfig.colors.text }}>Sales</h3>
            <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>Coming soon</p>
          </div>
        </nav>
      </div>
    </div>
  );
}
