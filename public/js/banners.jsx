/* PromForge — banners.
   - HeroBannerSlots: two side cards in the hero, never showing the same banner.
     Rotation is shared so slot A = idx, slot B = idx+1, always offset by 1.
     Users can pause/resume and step prev/next manually.
   - PopupBanner: full-screen modal, shown once per session per banner.
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

  // Single hero slot — shows whichever banner the parent assigns.
  // Includes per-slot dot indicators that reflect the parent's currentIdx + offset.
  const HeroSlot = ({ position, banner, total, dotIndex }) => {
    const ui = useUI();
    if (!banner) return null;
    const accent = accentVar(banner.accent);

    return (
      <div className={`hero-side-card pf-hero-banner ${position}`}
           onClick={() => openLink(ui, banner.link_url)}
           style={{ borderLeft: `2px solid ${accent}`, cursor: banner.link_url ? "pointer" : "default" }}>
        <div className="pf-hero-meta">
          <span className="dot" style={{ background: accent }} />
          <span className="mono" style={{ color: accent, fontSize: 11, letterSpacing: "0.1em" }}>
            {banner.subtitle || "PROMFORGE"}
          </span>
        </div>
        <div className="pf-hero-title">{banner.title}</div>
        {banner.body && <div className="pf-hero-body">{banner.body}</div>}
        {banner.link_url && (
          <div className="pf-hero-cta" style={{ color: accent }}>
            {banner.link_label || "자세히 보기"} →
          </div>
        )}
        {total > 1 && (
          <div className="pf-hero-dots">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={"pf-hero-dot" + (i === dotIndex ? " active" : "")}
                    style={{ background: i === dotIndex ? accent : undefined }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const HeroBannerSlots = () => {
    const [banners, setBanners] = useState([]);
    const [idx, setIdx] = useState(0);              // top slot index
    const [paused, setPaused] = useState(false);    // hover pause
    const [manualUntil, setManualUntil] = useState(0); // pause until ts after manual click
    const containerRef = useRef(null);

    useEffect(() => {
      window.PF_API.banners("rolling")
        .then((res) => setBanners(res.banners || []))
        .catch(() => {});
    }, []);

    // Auto-advance: rotates the top index. Bottom slot is always (idx + 1) so
    // the two slots never collide when there are 2+ banners.
    useEffect(() => {
      if (banners.length < 2) return;
      const t = setInterval(() => {
        if (paused) return;
        if (Date.now() < manualUntil) return;
        setIdx((i) => (i + 1) % banners.length);
      }, 6000);
      return () => clearInterval(t);
    }, [banners.length, paused, manualUntil]);

    const step = (delta) => {
      if (!banners.length) return;
      setManualUntil(Date.now() + 12000); // pause auto-advance for 12s after manual interaction
      setIdx((i) => (i + delta + banners.length) % banners.length);
    };

    if (!banners.length) {
      // Friendly fallback when no rolling banners are configured.
      return (
        <>
          <div className="hero-side-card hsc-2">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ color: "var(--cyan)", fontSize: 11, letterSpacing: "0.1em" }}>WEEKLY FORGE</span>
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>—</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>롤링 배너 영역</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>관리자 → 공지 관리에서 등록하면 이 영역이 회전합니다.</div>
          </div>
          <div className="hero-side-card hsc-1">
            <div className="mono" style={{ color: "var(--ember)", fontSize: 10.5, letterSpacing: "0.12em", marginBottom: 8 }}>● 안내</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>두 번째 슬롯</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>두 슬롯은 서로 다른 공지를 동시 표시합니다.</div>
          </div>
        </>
      );
    }

    const topBanner = banners[idx];
    const bottomIdx = banners.length > 1 ? (idx + 1) % banners.length : null;
    const bottomBanner = bottomIdx != null ? banners[bottomIdx] : null;

    return (
      <div ref={containerRef} className="pf-hero-banner-group"
           onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <HeroSlot position="hsc-2" banner={topBanner} total={banners.length} dotIndex={idx} />
        {bottomBanner && <HeroSlot position="hsc-1" banner={bottomBanner} total={banners.length} dotIndex={bottomIdx} />}
        {banners.length > 1 && (
          <div className="pf-hero-controls">
            <button className="pf-hero-ctrl" onClick={(e) => { e.stopPropagation(); step(-1); }}
                    title="이전 배너" aria-label="이전">‹</button>
            <button className="pf-hero-ctrl" onClick={(e) => { e.stopPropagation(); setManualUntil(Date.now() + 12000); setPaused((p) => !p); }}
                    title={paused ? "자동 회전 재개" : "자동 회전 정지"} aria-label="재생/정지">
              {paused ? "▶" : "❚❚"}
            </button>
            <button className="pf-hero-ctrl" onClick={(e) => { e.stopPropagation(); step(1); }}
                    title="다음 배너" aria-label="다음">›</button>
            <span className="pf-hero-counter">
              <span className="mono">{idx + 1}–{Math.min(idx + 2, banners.length) || idx + 1}</span>
              <span style={{ color: "var(--ink-3)" }}>/{banners.length}</span>
            </span>
          </div>
        )}
      </div>
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
