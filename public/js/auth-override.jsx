/* Real auth + admin gating layered on top of the prototype.
   - Replaces SignupModal/LoginModal with API-backed forms.
   - Adds a session-aware Nav (Login → Logout, Admin link visibility).
   - Redirects #admin attempts by non-admins back to home.
*/
(function () {
  const { useState, useEffect } = React;

  // ── Session store ────────────────────────────────────────────────────────────
  const listeners = new Set();
  const session = { user: null, ready: false };
  const setSession = (next) => {
    Object.assign(session, next);
    listeners.forEach((l) => l(session));
  };
  const useSession = () => {
    const [, force] = useState(0);
    useEffect(() => {
      const fn = () => force((n) => n + 1);
      listeners.add(fn);
      return () => listeners.delete(fn);
    }, []);
    return session;
  };
  window.PF_AUTH = { useSession, setSession };

  // Boot: hydrate session from /api/auth/me.
  window.PF_API.auth.me().then((data) => {
    setSession({ user: data?.user ?? null, ready: true });
  });

  // ── Real Signup modal ────────────────────────────────────────────────────────
  const RealSignupModal = () => {
    const ui = window.PF_UI.useUI();
    const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const submit = async () => {
      setError(null);
      setBusy(true);
      try {
        const { user } = await window.PF_API.auth.signup(form);
        setSession({ user, ready: true });
        ui.close();
        ui.toast(`환영합니다, ${user.nickname || user.username}!`, '가입완료');
      } catch (err) {
        const code = err?.data?.error;
        if (code === 'already_exists') setError('이미 등록된 아이디 또는 이메일입니다.');
        else if (code === 'invalid_input') setError('입력값을 확인해주세요. (아이디 3-32자 영숫자, 비밀번호 4자 이상)');
        else setError(err.message || '가입 중 오류가 발생했습니다.');
      } finally {
        setBusy(false);
      }
    };

    return (
      <>
        <div className="kicker">// 가입</div>
        <h2>포지에 합류하기</h2>
        <p className="lede">실제 계정이 생성됩니다. 비밀번호는 안전하게 해시 저장돼요.</p>
        <label className="field"><label>아이디</label><input value={form.username} onChange={e => setForm({...form, username: e.target.value.trim()})} placeholder="3-32자, 영문·숫자·_-" /></label>
        <label className="field"><label>이메일</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value.trim()})} placeholder="you@studio.com" /></label>
        <label className="field"><label>닉네임</label><input value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} placeholder="화면에 표시될 이름" /></label>
        <label className="field"><label>비밀번호</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="4자 이상" /></label>
        {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}
        <div className="actions">
          <button className="btn btn-ghost" onClick={ui.close} disabled={busy}>취소</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? '처리 중…' : '가입 완료'}</button>
        </div>
      </>
    );
  };

  // ── Real Login modal ─────────────────────────────────────────────────────────
  const RealLoginModal = () => {
    const ui = window.PF_UI.useUI();
    const [form, setForm] = useState({ username: '', password: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const submit = async () => {
      setError(null);
      setBusy(true);
      try {
        const { user } = await window.PF_API.auth.login(form);
        setSession({ user, ready: true });
        ui.close();
        ui.toast(`로그인 완료 — ${user.nickname || user.username}`, 'OK');
        if (user.role === 'admin') ui.setRoute('admin');
      } catch (err) {
        const code = err?.data?.error;
        if (code === 'invalid_credentials') setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        else setError(err.message || '로그인 중 오류가 발생했습니다.');
      } finally {
        setBusy(false);
      }
    };

    return (
      <>
        <div className="kicker">// 로그인</div>
        <h2>다시 만나서 반가워요</h2>
        <label className="field"><label>아이디</label><input autoFocus value={form.username} onChange={e => setForm({...form, username: e.target.value.trim()})} placeholder="username" /></label>
        <label className="field"><label>비밀번호</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="••••••••" /></label>
        {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}
        <div className="actions">
          <button className="btn btn-ghost" onClick={() => ui.open('signup')} disabled={busy}>가입하기</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? '처리 중…' : '로그인'}</button>
        </div>
      </>
    );
  };

  // Replace the prototype's modals.
  window.PF_AUTH.RealLoginModal = RealLoginModal;
  window.PF_AUTH.RealSignupModal = RealSignupModal;

  // ── User badge for the nav ───────────────────────────────────────────────────
  const NavSession = () => {
    const ui = window.PF_UI.useUI();
    const { user, ready } = useSession();
    if (!ready) return <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>…</span>;
    if (!user) {
      return (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" onClick={() => ui.open('login')}>로그인</button>
          <button className="btn btn-primary" onClick={() => ui.open('signup')}>가입</button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--cyan)' }}>
          @{user.username}{user.role === 'admin' ? ' · ADMIN' : ''}
        </span>
        {user.role === 'admin' && (
          <button className="btn btn-ghost" onClick={() => ui.setRoute('admin')}>관리자</button>
        )}
        <button className="btn btn-ghost" onClick={async () => {
          await window.PF_API.auth.logout();
          setSession({ user: null, ready: true });
          ui.toast('로그아웃 되었습니다', 'OK');
          if (ui.route === 'admin') ui.setRoute('home');
        }}>로그아웃</button>
      </div>
    );
  };
  window.PF_AUTH.NavSession = NavSession;

  // ── Admin route guard ────────────────────────────────────────────────────────
  const AdminGuard = ({ children }) => {
    const ui = window.PF_UI.useUI();
    const { user, ready } = useSession();
    if (!ready) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--ink-2)' }}>세션 확인 중…</div>;
    if (!user) {
      return (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <h2>로그인이 필요한 페이지입니다</h2>
          <p style={{ color: 'var(--ink-2)', marginTop: 12 }}>관리자 계정으로 로그인해주세요.</p>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => ui.open('login')}>로그인</button>
          </div>
        </div>
      );
    }
    if (user.role !== 'admin') {
      return (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <h2>접근 권한이 없습니다</h2>
          <p style={{ color: 'var(--ink-2)', marginTop: 12 }}>관리자만 열람할 수 있는 페이지입니다.</p>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => ui.setRoute('home')}>홈으로</button>
          </div>
        </div>
      );
    }
    return children;
  };
  window.PF_AUTH.AdminGuard = AdminGuard;

  // ── Login-required wrapper for sensitive content ─────────────────────────────
  const LoginGate = ({ children, label = '이 콘텐츠' }) => {
    const ui = window.PF_UI.useUI();
    const { user } = useSession();
    if (user) return children;
    return (
      <div style={{
        padding: '32px 28px',
        border: '1px dashed var(--line-strong)',
        borderRadius: 12,
        background: 'rgba(20,26,46,0.4)',
        textAlign: 'center',
      }}>
        <div className="kicker" style={{ marginBottom: 8 }}>// 로그인 필요</div>
        <div style={{ color: 'var(--ink-1)', marginBottom: 14 }}>
          {label}은 로그인 후 자유롭게 열람할 수 있습니다.
        </div>
        <button className="btn btn-primary" onClick={() => ui.open('login')}>로그인하기</button>
      </div>
    );
  };
  window.PF_AUTH.LoginGate = LoginGate;
})();
