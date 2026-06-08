import { useStore } from '@/lib/store';
import shopConfig from '@/shop.config';

export default function Admin() {
  const user = useStore(s => s.user);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm" style={{ color: shopConfig.colors.muted }}>
          Welcome back, {user.name || user.email}
        </p>
      </div>

      <nav className="grid gap-3">
        {user.role === 'admin' && (
          <a href="/admin/docs" className="block p-4 rounded-xl border transition-all hover:shadow-sm"
            style={{ borderColor: `${shopConfig.colors.muted}22` }}>
            <h3 className="font-medium" style={{ color: shopConfig.colors.text }}>Documents</h3>
            <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>Internal planning docs and notes</p>
          </a>
        )}
        {user.role === 'admin' && (
          <a href="/admin/team" className="block p-4 rounded-xl border transition-all hover:shadow-sm"
            style={{ borderColor: `${shopConfig.colors.muted}22` }}>
            <h3 className="font-medium" style={{ color: shopConfig.colors.text }}>Team</h3>
            <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>Manage team members and invitations</p>
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
  );
}
