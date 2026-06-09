/**
 * RetailOS API Worker
 * Cloudflare Worker with D1 database
 * Auth: email OTP via AgentMail, session cookies, role-based permissions
 */
export interface Env {
  DB: D1Database;
  AGENTMAIL_API_KEY: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  // Injected by private deployment repo
  DOCS?: Record<string, string>;
  SHOP_NAME?: string;
}

type UserRole = 'admin' | 'member';

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// --- Helpers ---

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function generateOtp(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1000000).padStart(6, '0');
}

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function sessionCookie(token: string, maxAge = 30 * 24 * 3600): string {
  return `shop_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearSessionCookie(): string {
  return 'shop_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/shop_session=([^;]+)/);
  return match ? match[1] : null;
}

async function getSessionUser(request: Request, db: D1Database): Promise<SessionUser | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const row = await db.prepare(
    `SELECT u.id, u.email, u.name, u.role FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = ? AND s.expires_at > datetime('now') AND u.status = 'active'`
  ).bind(token).first<{ id: string; email: string; name: string | null; role: string }>();
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role as UserRole };
}

function isAdmin(role: string): boolean {
  return role === 'admin';
}

async function sendOtpEmail(email: string, code: string, shopName: string, siteUrl: string, apiKey: string): Promise<boolean> {
  const magicLink = `${siteUrl}/auth/verify?email=${encodeURIComponent(email)}&code=${code}`;
  try {
    const res = await fetch('https://api.agentmail.to/v0/inboxes/atlas-nav%40agentmail.to/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [email],
        subject: `${shopName} — Tap to log in`,
        text: `${shopName}\n\nTap this link to log in:\n\n  ${magicLink}\n\nOr enter this code manually: ${code}\n\nExpires in 10 minutes.`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
    <div style="background:#4a6741;padding:20px 24px;">
      <h1 style="color:white;margin:0;font-size:18px;">${shopName}</h1>
    </div>
    <div style="padding:24px;">
      <p style="color:#333;font-size:15px;line-height:1.5;margin:0 0 20px;">Tap the button below to log in:</p>
      <a href="${magicLink}" style="display:inline-block;background:#4a6741;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Log in</a>
      <p style="color:#999;font-size:13px;line-height:1.5;margin:20px 0 0;">Or enter this code manually:</p>
      <p style="font-family:monospace;font-size:28px;font-weight:700;letter-spacing:6px;color:#4a6741;margin:8px 0 0;">${code}</p>
      <p style="color:#999;font-size:12px;margin:20px 0 0;">Expires in 10 minutes.</p>
    </div>
  </div>
</div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendInviteEmail(
  email: string,
  role: string,
  inviterName: string,
  shopName: string,
  siteUrl: string,
  apiKey: string
): Promise<boolean> {
  const roleLabel = role === 'admin' ? 'an admin' : 'a team member';
  try {
    const res = await fetch('https://api.agentmail.to/v0/inboxes/atlas-nav%40agentmail.to/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [email],
        subject: `${inviterName} invited you to ${shopName}`,
        text: `${shopName}\n\n${inviterName} has invited you as ${roleLabel}.\n\nVisit ${siteUrl}/login and enter your email to log in.`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
    <div style="background:#4a6741;padding:20px 24px;">
      <h1 style="color:white;margin:0;font-size:18px;">${shopName}</h1>
    </div>
    <div style="padding:24px;">
      <p style="color:#333;font-size:15px;line-height:1.5;margin:0 0 8px;"><strong>${inviterName}</strong> has invited you as ${roleLabel}.</p>
      <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 20px;">Visit the link below and enter your email to log in:</p>
      <a href="${siteUrl}/login" style="display:inline-block;background:#4a6741;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Join ${shopName}</a>
    </div>
    <div style="padding:12px 24px;background:#f9f9f9;border-top:1px solid #e5e5e5;">
      <p style="color:#aaa;font-size:11px;margin:0;">RetailOS</p>
    </div>
  </div>
</div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Main Worker ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    // ─── AUTH ENDPOINTS ───

    // Request OTP
    if (path === '/api/auth/request-otp' && request.method === 'POST') {
      const { email } = await request.json() as { email: string };
      if (!email) return json({ error: 'Email required' }, 400);
      const normalizedEmail = email.toLowerCase().trim();

      // Check user exists
      const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(normalizedEmail).first<{ id: string }>();
      if (!user) return json({ error: 'Not authorized. Contact an admin for access.' }, 403);

      // Generate and store OTP
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await env.DB.prepare(
        'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)'
      ).bind(normalizedEmail, code, expiresAt).run();

      // Send email
      const shopName = env.SHOP_NAME || 'RetailOS';
      const sent = await sendOtpEmail(normalizedEmail, code, shopName, url.origin, env.AGENTMAIL_API_KEY);
      if (!sent) return json({ error: 'Failed to send email.' }, 500);

      return json({ ok: true });
    }

    // Verify OTP
    if (path === '/api/auth/verify-otp' && request.method === 'POST') {
      const { email, code } = await request.json() as { email: string; code: string };
      if (!email || !code) return json({ error: 'Email and code required' }, 400);
      const normalizedEmail = email.toLowerCase().trim();

      const otp = await env.DB.prepare(
        'SELECT id FROM otp_codes WHERE email = ? AND code = ? AND expires_at > datetime(\'now\') AND used = 0'
      ).bind(normalizedEmail, code).first<{ id: number }>();
      if (!otp) return json({ error: 'Invalid or expired code' }, 401);

      await env.DB.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').bind(otp.id).run();

      const user = await env.DB.prepare('SELECT id, name, role, status FROM users WHERE email = ?')
        .bind(normalizedEmail).first<{ id: string; name: string | null; role: string; status: string }>();
      if (!user) return json({ error: 'User not found' }, 404);

      if (user.status === 'invited') {
        await env.DB.prepare("UPDATE users SET status = 'active' WHERE id = ?").bind(user.id).run();
      }
      await env.DB.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(user.id).run();

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      await env.DB.prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, user.id, expiresAt).run();

      await env.DB.prepare(
        "DELETE FROM otp_codes WHERE email = ? AND (used = 1 OR expires_at < datetime('now'))"
      ).bind(normalizedEmail).run();

      return new Response(JSON.stringify({
        ok: true,
        user: { id: user.id, email: normalizedEmail, name: user.name, role: user.role },
        needsName: !user.name,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie(token),
        },
      });
    }

    // Magic link verify (GET)
    if (path === '/auth/verify' && request.method === 'GET') {
      const email = url.searchParams.get('email');
      const code = url.searchParams.get('code');
      if (!email || !code) return new Response('Missing params', { status: 400 });
      const normalizedEmail = email.toLowerCase().trim();

      const otp = await env.DB.prepare(
        'SELECT id FROM otp_codes WHERE email = ? AND code = ? AND expires_at > datetime(\'now\') AND used = 0'
      ).bind(normalizedEmail, code).first<{ id: number }>();
      if (!otp) return new Response(null, { status: 302, headers: { Location: '/?error=expired' } });

      await env.DB.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').bind(otp.id).run();

      const user = await env.DB.prepare('SELECT id, name, role, status FROM users WHERE email = ?')
        .bind(normalizedEmail).first<{ id: string; name: string | null; role: string; status: string }>();
      if (!user) return new Response(null, { status: 302, headers: { Location: '/?error=not_found' } });

      if (user.status === 'invited') {
        await env.DB.prepare("UPDATE users SET status = 'active' WHERE id = ?").bind(user.id).run();
      }
      await env.DB.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(user.id).run();

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      await env.DB.prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, user.id, expiresAt).run();

      await env.DB.prepare(
        "DELETE FROM otp_codes WHERE email = ? AND (used = 1 OR expires_at < datetime('now'))"
      ).bind(normalizedEmail).run();

      const redirectTo = user.name ? '/admin' : '/admin?setup=name';
      return new Response(null, {
        status: 302,
        headers: { Location: redirectTo, 'Set-Cookie': sessionCookie(token) },
      });
    }

    // Get current session
    if (path === '/api/auth/me' && request.method === 'GET') {
      const user = await getSessionUser(request, env.DB);
      if (!user) return json({ user: null });
      return json({ user });
    }

    // Set display name
    if (path === '/api/auth/set-name' && request.method === 'POST') {
      const user = await getSessionUser(request, env.DB);
      if (!user) return json({ error: 'Unauthorized' }, 401);
      const { name } = await request.json() as { name: string };
      if (!name?.trim()) return json({ error: 'Name required' }, 400);
      await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name.trim(), user.id).run();
      return json({ ok: true, name: name.trim() });
    }

    // Logout
    if (path === '/api/auth/logout' && request.method === 'POST') {
      const token = getSessionToken(request);
      if (token) {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
      });
    }

    // ─── ADMIN DOCS ENDPOINTS ───

    if (path === '/api/docs' && request.method === 'GET') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Forbidden' }, 403);
      const docs = env.DOCS || {};
      const list = Object.keys(docs).map(slug => ({
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      }));
      return json({ docs: list });
    }

    if (path.startsWith('/api/docs/') && request.method === 'GET') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Forbidden' }, 403);
      const slug = path.slice('/api/docs/'.length);
      const docs = env.DOCS || {};
      const content = docs[slug];
      if (!content) return json({ error: 'Not found' }, 404);
      return json({ slug, content });
    }

    // ─── MEMBER MANAGEMENT ENDPOINTS ───

    // List all members
    if (path === '/api/members' && request.method === 'GET') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Admin access required' }, 403);
      const { results } = await env.DB.prepare(
        'SELECT id, email, name, role, status, created_at, last_login FROM users ORDER BY created_at DESC'
      ).all();
      return json(results);
    }

    // Invite new member
    if (path === '/api/members/invite' && request.method === 'POST') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Admin access required' }, 403);
      const { email, role } = await request.json() as { email: string; role?: string };
      if (!email) return json({ error: 'Email required' }, 400);
      const normalizedEmail = email.toLowerCase().trim();
      const validRoles = ['admin', 'member'];
      const memberRole = validRoles.includes(role || '') ? role! : 'member';

      // Check if user already exists
      const existing = await env.DB.prepare('SELECT id, status FROM users WHERE email = ?')
        .bind(normalizedEmail).first<{ id: string; status: string }>();
      if (existing) {
        return json({ error: 'User with this email already exists' }, 409);
      }

      // Create user
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO users (id, email, role, status) VALUES (?, ?, ?, 'invited')`
      ).bind(id, normalizedEmail, memberRole).run();

      // Send invite email
      const shopName = env.SHOP_NAME || 'RetailOS';
      const inviterName = user.name || user.email;
      await sendInviteEmail(normalizedEmail, memberRole, inviterName, shopName, url.origin, env.AGENTMAIL_API_KEY);

      return json({ ok: true, id });
    }

    // Resend invite email
    if (path === '/api/members/resend-invite' && request.method === 'POST') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Admin access required' }, 403);
      const { userId } = await request.json() as { userId: string };
      if (!userId) return json({ error: 'userId required' }, 400);

      const member = await env.DB.prepare('SELECT email, role, status FROM users WHERE id = ?')
        .bind(userId).first<{ email: string; role: string; status: string }>();
      if (!member) return json({ error: 'Member not found' }, 404);
      if (member.status !== 'invited') return json({ error: 'Member has already joined' }, 400);

      const shopName = env.SHOP_NAME || 'RetailOS';
      const inviterName = user.name || user.email;
      const sent = await sendInviteEmail(member.email, member.role, inviterName, shopName, url.origin, env.AGENTMAIL_API_KEY);
      if (!sent) return json({ error: 'Failed to send email' }, 500);
      return json({ ok: true });
    }

    // Update member role
    if (path.startsWith('/api/members/') && request.method === 'PUT') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Admin access required' }, 403);
      const memberId = path.split('/')[3];
      const { role } = await request.json() as { role: string };
      const validRoles = ['admin', 'member'];
      if (!validRoles.includes(role)) return json({ error: 'Invalid role' }, 400);

      // Prevent self-demotion
      if (memberId === user.id) return json({ error: 'Cannot change your own role' }, 400);

      await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, memberId).run();
      return json({ ok: true });
    }

    // Remove member
    if (path.startsWith('/api/members/') && request.method === 'DELETE') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Admin access required' }, 403);
      const memberId = path.split('/')[3];

      // Prevent self-removal
      if (memberId === user.id) return json({ error: 'Cannot remove yourself' }, 400);

      // Delete sessions, then user
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(memberId).run();
      await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(memberId).run();
      return json({ ok: true });
    }

    // ─── LEGACY INVITE ENDPOINT (backward compat) ───

    if (path === '/api/admin/invite' && request.method === 'POST') {
      const user = await getSessionUser(request, env.DB);
      if (!user || !isAdmin(user.role)) return json({ error: 'Forbidden' }, 403);
      const { email, role } = await request.json() as { email: string; role?: string };
      if (!email) return json({ error: 'Email required' }, 400);
      const normalizedEmail = email.toLowerCase().trim();
      const id = crypto.randomUUID();
      const userRole = role === 'admin' ? 'admin' : 'member';
      await env.DB.prepare(
        'INSERT INTO users (id, email, role, status) VALUES (?, ?, ?, \'invited\')'
      ).bind(id, normalizedEmail, userRole).run();
      return json({ ok: true, id });
    }

    // ─── FALLTHROUGH TO STATIC ASSETS ───

    return env.ASSETS.fetch(request);
  },
};
