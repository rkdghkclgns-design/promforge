/* PromForge — RollingBanner + PopupBanner.
   Admin-controlled via /admin/banners CRUD; public read via /banners.
*/
(function () {
  const { useState, useEffect, useRef } = React;
  const useUI = () => window.PF_UI.useUI();

  const accentVar = (a) => ({
    cyan: "var(--cyan)",
    ember: "var(--ember)",
    violet: "var(--violet)",
    green: "var(--green)",
    spark: "var(--spark)",
  })[a] || "var(--cyan)";

  // Helper: open link, supporting both internal routes (#board:slug, #signup) and external URLs.
  const openLink = (ui, url) => {
    if (!url) return;
    if (url.startsWith("#")) {
      const target = url.slice(1);
      // internal modal kinds
      if (["signup", "login", "subscribe", "jam", "library", "checklist", "mentors", "contact", "about", "conduct", "forge"].includes(target)) {
        ui.open(target);
        return;
      }
      // route (e.g. board:prompts, admin, home)
      if (target.startsWith("board:") || ["home", "admin"].includes(target)) {
        ui.setRoute(target);
        return;
      }
      // section anchor scroll
      const el = document.getElementById(target);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
      // fallback: scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ── Rolling banner ────────────────────────────────────────────────────────
  const RollingBanner = () => {
    const ui = useUI();
    const [banners, setBanners] = useState([]);
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
      window.PF_API.banners("rolling").then((res) => setBanners(res.banners || [])).catch(() => {});
    }, []);

    useEffect(() => {
      if (banners.length < 2 || paused) return;
      const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5500);
      return () => clearInterval(t);
    }, [banners.length, paused]);

    if (!banners.length) return null;
    const b = banners[idx];
    const accent = accentVar(b.accent);

    return (
      <div className="pf-rolling" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="pf-rolling-card" style={{ borderLeft: `3px solid ${accent}` }}
             onClick={() => openLink(ui, b.link_url)}>
          <div className="pf-rolling-meta">
            <span className="dot" style={{ background: accent }} />
            <span className="kicker" style={{ color: accent, margin: 0 }}>
              {b.subtitle || (b.kind === "rolling" ? "WEEKLY FORGE" : "공지")}
            </span>
          </div>
          <h3 className="pf-rolling-title">{b.title}</h3>
          {b.body && <p className="pf-rolling-body">{b.body}</p>}
          {b.link_url && (
            <span className="pf-rolling-cta" style={{ color: accent }}>
              {b.link_label || "자세히 보기"} →
            </span>
          )}
        </div>
        {banners.length > 1 && (
          <div className="pf-rolling-dots">
            {banners.map((_, i) => (
              <button key={i} className={"pf-dot" + (i === idx ? " active" : "")}
                      style={{ background: i === idx ? accent : undefined }}
                      onClick={() => setIdx(i)} aria-label={`배너 ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Popup banner — shown once per session per banner id ──────────────────
  const PopupBanner = () => {
    const ui = useUI();
    const [banner, setBanner] = useState(null);
    const [closed, setClosed] = useState(false);

    useEffect(() => {
      window.PF_API.banners("popup").then((res) => {
        const list = res.banners || [];
        if (!list.length) return;
        // Pick the first not-yet-dismissed-this-session banner
        let dismissed = [];
        try { dismissed = JSON.parse(sessionStorage.getItem("pf_dismissed_popups") || "[]"); } catch { /* noop */ }
        const next = list.find((b) => !dismissed.includes(b.id));
        if (next) setBanner(next);
      }).catch(() => {});
    }, []);

    if (!banner || closed) return null;
    const accent = accentVar(banner.accent);

    const close = () => {
      try {
        const list = JSON.parse(sessionStorage.getItem("pf_dismissed_popups") || "[]");
        if (!list.includes(banner.id)) list.push(banner.id);
        sessionStorage.setItem("pf_dismissed_popups", JSON.stringify(list));
      } catch { /* noop */ }
      setClosed(true);
    };

    return (
      <div className="pf-popup-backdrop" onClick={close}>
        <div className="pf-popup" style={{ borderTop: `3px solid ${accent}` }} onClick={(e) => e.stopPropagation()}>
          <button className="pf-popup-x" onClick={close} aria-label="닫기">✕</button>
          <div className="kicker" style={{ color: accent, marginBottom: 8 }}>
            {banner.subtitle || "공지"}
          </div>
          <h2 style={{ marginBottom: 10 }}>{banner.title}</h2>
          {banner.body && <p className="body-text" style={{ marginBottom: 18 }}>{banner.body}</p>}
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={close}>오늘 그만 보기</button>
            {banner.link_url && (
              <button className="btn btn-primary" onClick={() => { close(); openLink(ui, banner.link_url); }}>
                {banner.link_label || "자세히 보기"} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  window.PF_BANNERS = { RollingBanner, PopupBanner, openLink };
})();
