// Tiny API client used by the React prototype to talk to the Node backend.
(function () {
  const base = '/api';

  async function request(path, options = {}) {
    const res = await fetch(base + path, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'same-origin',
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
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
      me: () => request('/auth/me').catch(() => null),
      signup: (body) => request('/auth/signup', { method: 'POST', body }),
      login: (body) => request('/auth/login', { method: 'POST', body }),
      logout: () => request('/auth/logout', { method: 'POST' }),
    },
    boards: () => request('/boards'),
    posts: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/posts' + (q ? `?${q}` : ''));
    },
    createPost: (body) => request('/posts', { method: 'POST', body }),
    studies: () => request('/studies'),
    showcases: () => request('/showcases'),
    subscribe: (email) => request('/subscribe', { method: 'POST', body: { email } }),
    admin: {
      overview: () => request('/admin/overview'),
      users: () => request('/admin/users'),
      audit: () => request('/admin/audit'),
      subscribers: () => request('/admin/subscribers'),
    },
    gemini: (query) => request('/gemini/search', { method: 'POST', body: { query } }),
  };

  window.PF_API = api;
})();
