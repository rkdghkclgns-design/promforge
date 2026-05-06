/* PromForge — banners.
   - HeroBannerSlots: replaces the hero side cards with two rotating banner slots.
   - PopupBanner: full-screen modal once per session per banner.
   Both are admin-controlled via /admin/banners CRUD; data via /banners.
*/
(function () {
  const { useState, useEffect } = React;
  const useUI = () => window.PF_UI.useUI();

  const accentVar = (a) => ({
    cyan: "var(--cyan)",
    ember: "var(--ember)",
    violet: "var(--violet)",
    green: "var(--green)",
    spark: "var(--spark)",
  })[a] || "var(--cyan)";

  const openLink = (ui, url) => {
    if (!url) return;
    if (url.startsWith("#")) {
      const target = url.slice(1);
      if (["signup", "login", "subscribe", "jam", "library", "checklist", "mentors", "contact", "about", "conduct", "forge"].includes(target)) {
        ui.open(target); return;
      }
      if (target.startsWith("board:") || ["home", "admin"].includes(target)) {
        ui.setRoute(target); return;
      }
      const el = document.getElementById(target);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Hero banner slot — single card cycling through banners.
  const HeroSlot = ({ position, banners, offset = 0 }) => {
    const ui = useUI();
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
      if (banners.length < 2 || paused) return;
      const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 6000 + offset * 800);
      return () => clearInterval(t);
    }, [banners.length, paused, offset]);

    if (!banners.length) return null;
    const b = banners[(idx + offset) % banners.length];
    const accent = accentVar(b.accent);

    return (
      <div className={`hero-side-card pf-hero-banner ${position}`}
           onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
           onClick={() => openLink(ui, b.link_url)}
           style={{ borderLeft: `2px solid ${accent}`, cursor: b.link_url ? "pointer" : "default" }}>
        <div className="pf-hero-meta">
          <span className="dot" style={{ background: accent }} />
          <span className="mono" style={{ color: accent, fontSize: 11, letterSpacing: "0.1em" }}>
            {b.subtitle || "WEEKLY FORGE"}
          </span>
        </div>
        <div className="pf-hero-title">{b.title}</div>
        {b.body && <div className="pf-hero-body">{b.body}</div>}
        {b.link_url && (
          <div className="pf-hero-cta" style={{ color: accent }}>
            {b.link_label || "자세히 보기"} →
          </div>
        )}
        {banners.length > 1 && (
          <div className="pf-hero-dots">
            {banners.map((_, i) => (
              <span key={i} className={"pf-hero-dot" + (i === (idx + offset) % banners.length ? " active" : "")}
                    style={{ background: i === (idx + offset) % banners.length ? accent : undefined }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const HeroBannerSlots = () => {
    const [banners, setBanners] = useState([]);
    useEffect(() => {
      window.PF_API.banners("rolling")
        .then((res) => setBanners(res.banners || []))
        .catch(() => {});
    }, []);

    // No banners → keep the design with two static fallback cards so the
    // layout never collapses.
    if (!banners.length) {
      return (
        <>
          <div className="hero-side-card hsc-2">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ color: "var(--cyan)", fontSize: 11, letterSpacing: "0.1em" }}>WEEKLY FORGE</span>
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>WK 18</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>이주의 픽: 안개의 도서관</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>관리자 페이지에서 공지를 추가하면 이 영역이 롤링됩니다.</div>
          </div>
          <div className="hero-side-card hsc-1">
            <div className="mono" style={{ color: "var(--ember)", fontSize: 10.5, letterSpacing: "0.12em", marginBottom: 8 }}>● 안내</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>롤링 배너 영역</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>/admin → 공지 관리에서 등록하세요.</div>
          </div>
        </>
      );
    }

    // With 1 banner → only show top slot. With 2+ → both slots cycling.
    return (
      <>
        <HeroSlot position="hsc-2" banners={banners} offset={0} />
        {banners.length > 1 && <HeroSlot position="hsc-1" banners={banners} offset={1} />}
      </>
    );
  };

  // ── Popup banner (unchanged) ─────────────────────────────────────────────
  const PopupBanner = () => {
    const ui = useUI();
    const [banner, setBanner] = useState(null);
    const [closed, setClosed] = useState(false);

    useEffect(() => {
      window.PF_API.banners("popup").then((res) => {
        const list = res.banners || [];
        if (!list.length) return;
        let dismissed = [];
        try { dismissed = JSON.parse(sessionStorage.getItem("pf_dismissed_popups") || "[]"); } catch { /* */ }
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
      } catch { /* */ }
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

  window.PF_BANNERS = { HeroBannerSlots, PopupBanner, openLink };
})();
