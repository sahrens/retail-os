import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import shopConfig from '@/shop.config';

type UserRole = 'admin' | 'member';

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: 'invited' | 'active';
  created_at: string;
  last_login: string | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  member: 'Member',
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function InviteForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.members.invite(email.trim(), role);
      setSuccess(`Invite sent to ${email}`);
      setEmail('');
      onInvited();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: shopConfig.colors.text }}>
        Invite new team member
      </h3>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email@example.com"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
      />
      <div className="flex gap-2">
        <select
          value={role}
          onChange={e => setRole(e.target.value as UserRole)}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition-opacity disabled:opacity-50"
          style={{ background: shopConfig.colors.primary }}
        >
          {loading ? 'Sending...' : 'Send invite'}
        </button>
      </div>
      <p className="text-xs" style={{ color: shopConfig.colors.muted }}>
        {role === 'admin' ? 'Full access + manage team' : 'View docs and team content'}
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm" style={{ color: shopConfig.colors.primary }}>{success}</p>}
    </form>
  );
}

function MemberCard({
  member,
  currentUserId,
  onRoleChange,
  onRemove,
  onResendInvite,
}: {
  member: Member;
  currentUserId: string;
  onRoleChange: (id: string, role: UserRole) => void;
  onRemove: (id: string) => void;
  onResendInvite: (id: string) => void;
}) {
  const isSelf = member.id === currentUserId;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Top row: avatar + name */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
          style={{ background: shopConfig.colors.primary }}
        >
          {(member.name || member.email)[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium break-all" style={{ color: shopConfig.colors.text }}>
              {member.name || 'No name set'}
            </span>
            {isSelf && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                you
              </span>
            )}
          </div>
          <p className="text-xs break-all mt-0.5" style={{ color: shopConfig.colors.muted }}>
            {member.email}
          </p>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: member.role === 'admin' ? `${shopConfig.colors.primary}20` : '#f3f4f6',
            color: member.role === 'admin' ? shopConfig.colors.primary : shopConfig.colors.muted,
          }}
        >
          {ROLE_LABELS[member.role]}
        </span>
        {member.status === 'invited' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
            Invited
          </span>
        )}
        {member.status === 'invited' && !isSelf && (
          <button
            onClick={async () => {
              setResending(true);
              try {
                onResendInvite(member.id);
                setResent(true);
                setTimeout(() => setResent(false), 3000);
              } catch { /* handled by parent */ }
              setResending(false);
            }}
            disabled={resending || resent}
            className="text-xs px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
            style={{ background: `${shopConfig.colors.primary}15`, color: shopConfig.colors.primary }}
          >
            {resent ? 'Sent!' : resending ? 'Sending...' : 'Resend invite'}
          </button>
        )}
        <span className="text-xs ml-auto" style={{ color: shopConfig.colors.muted }}>
          {member.last_login ? `Active ${timeAgo(member.last_login)}` : 'Never logged in'}
        </span>
      </div>

      {/* Actions — only for non-self */}
      {!isSelf && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <select
            value={member.role}
            onChange={e => onRoleChange(member.id, e.target.value as UserRole)}
            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          {confirmRemove ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onRemove(member.id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="px-3 py-2 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="px-3 py-2 text-gray-400 hover:text-red-500 text-xs transition-colors"
              title="Remove member"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const user = useStore(s => s.user);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.members.list();
      setMembers(list);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await api.members.updateRole(id, role);
      setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.members.remove(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      await api.members.resendInvite(id);
    } catch (err) {
      console.error('Failed to resend invite:', err);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p style={{ color: shopConfig.colors.muted }}>Admin access required to manage team.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: shopConfig.colors.text }}>Team</h1>
        <p className="text-sm mt-1" style={{ color: shopConfig.colors.muted }}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
      </div>

      <InviteForm onInvited={loadMembers} />

      {loading ? (
        <div className="text-center py-8" style={{ color: shopConfig.colors.muted }}>Loading...</div>
      ) : (
        <div className="space-y-3">
          {members.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              currentUserId={user.id}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
              onResendInvite={handleResendInvite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
