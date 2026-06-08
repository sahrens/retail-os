import { useEffect, lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import { Login } from '@/pages/Login';
import { NavBar } from '@/components/NavBar';
import shopConfig from '@/shop.config';

const Landing = lazy(() => import('@/pages/Landing'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminDocs = lazy(() => import('@/pages/AdminDocs'));
const Team = lazy(() => import('@/pages/Team'));

function Loading() {
  return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(s => s.user);
  const loading = useStore(s => s.loading);
  if (loading) return <Loading />;
  if (!user) return <Login />;
  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: shopConfig.colors.bg }}>
      <NavBar />
      {children}
    </div>
  );
}

export default function App() {
  const setUser = useStore(s => s.setUser);
  const setLoading = useStore(s => s.setLoading);

  useEffect(() => {
    api.auth.me().then(res => {
      setUser(res.user as any);
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />

        {/* Protected admin routes */}
        <Route path="/admin">
          <ProtectedRoute>
            <AdminLayout><Admin /></AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/docs">
          <ProtectedRoute>
            <AdminLayout><AdminDocs /></AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/team">
          <ProtectedRoute>
            <AdminLayout><Team /></AdminLayout>
          </ProtectedRoute>
        </Route>

        {/* Fallback */}
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Page not found</p>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}
