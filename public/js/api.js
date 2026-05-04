// PromForge API client.
// Talks directly to a Supabase Edge Function (`pf-api`) so the GitHub Pages
// build works without a separate Node host.
(function () {
  // Supabase project + anon key are public values — anon key gates the Edge
  // Function's outer auth, our own JWT (x-pf-token) gates user identity.
  const SUPABASE_URL = 'https://etasxbaorwgjoofdxean.supabase.co';
  // Legacy JWT-format anon key (publishable). Required by Edge Function
  // verify_jwt — newer sb_publishable_… keys are not JWTs and are rejected.
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us';
  const base = SUPABASE_URL + '/functions/v1/pf-api';

  const TOKEN_KEY = 'pf_token';
  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
  const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      ...(options.headers || {}),
    };
    const tok = getToken();
    if (tok) headers['x-pf-token'] = tok;

    const res = await fetch(base + path, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Capture rotating session token if the server issued one.
    const newToken = res.headers.get('x-pf-token');
    if (newToken) setToken(newToken);

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok) {
      const err = new Error(data?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const api = {
    auth: {
      me: () => request('/me').catch((e) => { if (e.status === 401) return null; throw e; }),
      signup: async (body) => {
        const r = await request('/signup', { method: 'POST', body });
        if (r?.token) setToken(r.token);
        return r;
      },
      login: async (body) => {
        const r = await request('/login', { method: 'POST', body });
        if (r?.token) setToken(r.token);
        return r;
      },
      logout: async () => {
        try { await request('/logout', { method: 'POST' }); } catch { /* ignore */ }
        setToken(null);
        return { ok: true };
      },
    },
    boards: () => request('/boards'),
    posts: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/posts' + (q ? `?${q}` : ''));
    },
    studies: () => request('/studies'),
    showcases: () => request('/showcases'),
    subscribe: (email) => request('/subscribe', { method: 'POST', body: { email } }),
    admin: {
      overview: () => request('/admin/overview'),
      users: () => request('/admin/users'),
      audit: () => request('/admin/audit'),
      subscribers: () => request('/admin/subscribers'),
    },
    gemini: (query) => request('/gemini-search', { method: 'POST', body: { query } }),
    _internal: { setToken, getToken },
  };

  window.PF_API = api;
})();
