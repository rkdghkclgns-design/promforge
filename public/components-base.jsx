/* PromForge components — base (with UI wiring) */

const { useState, useEffect, useRef } = React;

// —— Inline SVG icons ——
const Icon = ({ name, className = "icn" }) => {
  const paths = {
    spark: <><path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="M5 5l3 3"/><path d="M16 16l3 3"/><path d="M5 19l3-3"/><path d="M16 8l3-3"/></>,
    trophy: <><path d="M6 4h12v4a6 6 0 0 1-12 0V4z"/><path d="M6 6H3a3 3 0 0 0 3 3"/><path d="M18 6h3a3 3 0 0 1-3 3"/><path d="M9 18h6"/><path d="M12 14v4"/></>,
    tool: <><path d="M14.7 6.3a4 4 0 0 1 5 5L11 20a2.8 2.8 0 1 1-4-4l8.7-9.7z"/><path d="M14 7l3 3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.7.4-1.5 1-1.5 2"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    palette: <><path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 4-4 4h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor"/><circle cx="11" cy="6.5" r="1" fill="currentColor"/><circle cx="16" cy="9" r="1" fill="currentColor"/></>,
    send: <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
    chat: <><path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    heart: <><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></>,
    msg: <><path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z"/></>,
    arrow: <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
    flame: <><path d="M12 2s5 4.5 5 10a5 5 0 1 1-10 0c0-2 1-3.5 2-4.5C9 9 9 7 8 5c3 1 4 2 4 5 0-1 1-2.5 2-3 0 1 0 2-1 3 1-2 2-3 3-3-1 2-2 3-2 5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    discord: <><path d="M19 5a14 14 0 0 0-3.5-1l-.4.7a13 13 0 0 0-4.2 0L10.5 4A14 14 0 0 0 7 5a17 17 0 0 0-3 11 14 14 0 0 0 4 2l.7-1a10 10 0 0 1-2-1c.2-.1.3-.2.5-.3a10 10 0 0 0 8.5 0l.5.3a10 10 0 0 1-2 1l.7 1a14 14 0 0 0 4-2 17 17 0 0 0-3-11z"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    bell_off: <><path d="M3 3l18 18"/><path d="M9.4 4.6A6 6 0 0 1 18 8c0 3 .5 5 1 6.4M6 8c0 7-3 9-3 9h12.5"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// —— Nav ——
// Session-aware: shows login/signup OR user badge depending on auth state.
// Replaces the old absolute-overlay NavSession to avoid duplicate buttons.
const Nav = () => {
  const ui = window.PF_UI.useUI();
  const [searchVal, setSearchVal] = useState("");
  const session = window.PF_AUTH?.useSession?.() ?? { user: null, ready: false };
  const ThemeToggle = window.PF_THEME?.ThemeToggle;

  const baseLinks = [
    ["home", "홈"], ["board", "게시판"], ["showcase", "쇼케이스"],
    ["studies", "스터디"], ["forge", "내 작업장"], ["digest", "다이제스트"]
  ];
  // Only include the admin link when the current user is an admin.
  const links = session.user?.role === "admin"
    ? [...baseLinks, ["admin", "관리자"]]
    : baseLinks;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.open("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui]);

  const onLink = (id, e) => {
    e.preventDefault();
    if (id === "forge") { ui.open("forge"); return; }
    if (id === "digest") { ui.open("subscribe"); return; }
    if (id === "admin") { ui.setRoute("admin"); return; }
    ui.setRoute(id);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onLogout = async () => {
    await window.PF_API.auth.logout();
    window.PF_AUTH.setSession({ user: null, ready: true });
    ui.toast("로그아웃 되었습니다", "OK");
    if (ui.route === "admin" || ui.route?.startsWith("board:")) ui.setRoute("home");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="logo" href="#home" onClick={(e) => onLink("home", e)}>
          <img src="assets/promforge_logo.png" alt="PromForge"/>
          <span className="brand-en">PromForge</span>
          <span className="brand-kr">/ 프롬포지</span>
        </a>
        <nav className="nav-links">
          {links.map(([id, label]) => (
            <a key={id}
               className={"nav-link" + (ui.route === id ? " active" : "") + (id === "admin" ? " is-admin" : "") + (id === "home" || id === "board" ? " keep-sm" : (id === "digest" || id === "forge" || id === "admin" ? " hide-md" : ""))}
               onClick={(e) => onLink(id, e)} href={"#" + id}>{label}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <div className="search" onClick={() => ui.open("search", searchVal)}>
            <Icon name="search" className="icn" />
            <input placeholder="프롬프트, 게임, 멤버 검색…" value={searchVal} readOnly />
            <span className="search-key">⌘K</span>
          </div>
          <button className="search-mobile" type="button" onClick={() => ui.open("search")} aria-label="검색">
            <Icon name="search" className="icn" />
          </button>
          <a className="btn btn-discord" href={ui.discordUrl} target="_blank" rel="noopener noreferrer" aria-label="Discord">
            <Icon name="discord" className="icn" />
            <span className="btn-discord-text">Discord</span>
          </a>
          {ThemeToggle && <ThemeToggle />}
          {!session.ready ? (
            <span style={{ color: "var(--ink-3)", fontSize: 12 }}>…</span>
          ) : session.user ? (
            <>
              <span className="mono nav-user-badge" style={{ fontSize: 12, color: "var(--cyan)" }}>
                @{session.user.username}{session.user.role === "admin" ? " · ADMIN" : ""}
              </span>
              <button className="btn btn-ghost" onClick={onLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost hide-sm" onClick={() => ui.open("login")}>로그인</button>
              <button className="btn btn-primary" onClick={() => ui.open("signup")}>
                <Icon name="flame" className="icn" />
                <span className="btn-primary-text">포지 가입</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// —— Ticker ——
const Ticker = () => {
  const items = window.PF_DATA.ticker;
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="container" style={{display: "flex", height: "100%", padding: 0, alignItems: "center"}}>
        <div className="label-cell"><Icon name="flame" className="icn" style={{width: 14, height: 14}} />LIVE FROM THE FORGE</div>
        <div style={{flex: 1, overflow: "hidden", height: "100%", display: "flex", alignItems: "center"}}>
          <div className="ticker-track">
            {doubled.map((it, i) => (
              <span key={i} className="ticker-item">
                <span className="pill">{it.type}</span>
                {it.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// —— Hero ——
const Hero = ({ tweaks }) => {
  const ui = window.PF_UI.useUI();
  const stats = window.PF_DATA.stats;
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="dot"></span>v2026.05 · AI Game Builders 한국 커뮤니티</span>
          <h1>
            프롬프트로 게임을 <br/>
            <span className="accent">두드려 만드는</span> <br/>
            <span className="cyan-accent">{tweaks.heroAccent || "메이커들의 작업장"}</span>
          </h1>
          <p className="lede">
            {tweaks.heroLede || "Claude, Cursor, Unity, Godot — 한국에서 AI로 게임을 만드는 사람들이 매일 모여 프롬프트를 공유하고, 함께 스터디하고, 출시까지 두드려 보냅니다."}
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => ui.open("signup")}><Icon name="flame" className="icn" /> 포지 가입하기 (무료)</button>
            <button className="btn btn-ghost" onClick={() => { document.getElementById("board")?.scrollIntoView({behavior: "smooth"}); }}>오늘의 프롬프트 보기 <Icon name="arrow" className="icn" /></button>
          </div>
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div className="hero-stat" key={i}>
                <div className="num">{s.num}<span className="unit">{s.unit}</span></div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
};

const HeroVisual = () => (
  <div className="hero-vis">
    <div className="spark-orb"></div>
    <div className="forge-card fc-main" style={{inset: "10% 4% 8% 6%"}}>
      <div className="fc-bar">
        <div className="fc-dots"><span></span><span></span><span></span></div>
        <span className="fc-title">forge://prompt/dungeon-generator.md</span>
        <div className="fc-tabs"><span style={{color: "var(--cyan)"}}>● live</span><span>v3.2</span></div>
      </div>
      <div className="fc-body">
        <span className="code-line"><span className="ln">1</span><span className="tk-com"># Roguelike Dungeon — System Prompt</span></span>
        <span className="code-line"><span className="ln">2</span><span className="tk-key">role</span>: <span className="tk-str">"dungeon_master"</span></span>
        <span className="code-line"><span className="ln">3</span><span className="tk-key">tone</span>: <span className="tk-str">"한국어, 8bit 농담 허용"</span></span>
        <span className="code-line"><span className="ln">4</span><span className="tk-key">constraints</span>:</span>
        <span className="code-line"><span className="ln">5</span>{"  "}- <span className="tk-prop">map.size</span> = <span className="tk-str">"7x7"</span></span>
        <span className="code-line"><span className="ln">6</span>{"  "}- <span className="tk-prop">turn.budget</span> = <span className="tk-fn">tokens</span>(<span className="tk-str">"~140"</span>)</span>
        <span className="code-line"><span className="ln">7</span>{"  "}- <span className="tk-prop">save</span> = <span className="tk-fn">json</span>(<span className="tk-str">"./run.json"</span>)</span>
        <span className="code-line"><span className="ln">8</span><span className="tk-key">on_input</span>: <span className="tk-fn">narrate</span> → <span className="tk-fn">resolve</span> → <span className="tk-fn">save</span></span>
        <div className="fc-output">
          <div className="label">▸ output (turn 14)</div>
          <div className="out">
            북쪽 통로에서 차가운 공기와 함께 잿빛 부엉이의 외침. <br/>
            방의 끝에는 <span className="mono" style={{color: "var(--ember)"}}>[달빛 자물쇠]</span>가 걸린 문.
          </div>
        </div>
      </div>
    </div>
    {/* Hero side cards now backed by admin-controlled rolling banners.
        Falls back to the original static cards if no banners are loaded. */}
    {window.PF_BANNERS && <window.PF_BANNERS.HeroBannerSlots />}
  </div>
);

// —— Boards ——
const SLUG_TO_VISUAL = {
  prompts:   { color: "cyan",   glyph: "spark"   },
  showcase:  { color: "ember",  glyph: "trophy"  },
  workflow:  { color: "violet", glyph: "tool"    },
  qna:       { color: "green",  glyph: "help"    },
  design:    { color: "cyan",   glyph: "grid"    },
  "art-sound": { color: "ember", glyph: "palette" },
  release:   { color: "violet", glyph: "send"    },
  lounge:    { color: "green",  glyph: "chat"    },
  illust:    { color: "ember",  glyph: "palette" },
  cosplay:   { color: "violet", glyph: "spark"   },
};

const Boards = () => {
  const ui = window.PF_UI.useUI();
  const [boards, setBoards] = useState(window.PF_DATA.boards);
  const [loading, setLoading] = useState(true);
  const [theme] = window.PF_THEME?.useTheme?.() ?? ["light", () => {}, () => {}];

  useEffect(() => {
    let alive = true;
    window.PF_API.boards()
      .then((res) => {
        if (!alive || !res?.boards?.length) return;
        const merged = res.boards.map((b) => ({
          id: b.slug,
          slug: b.slug,
          title: b.title,
          desc: b.description ?? "",
          posts: b.posts ?? 0,
          today: b.today ?? 0,
          ...(SLUG_TO_VISUAL[b.slug] ?? { color: "cyan", glyph: "spark" }),
        }));
        setBoards(merged);
      })
      .catch(() => { /* keep mock fallback */ })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // Hide dark-only boards (illust/cosplay/showcase) in light mode.
  const visibleBoards = window.PF_THEME?.filterBoards
    ? window.PF_THEME.filterBoards(boards, theme)
    : boards;

  return (
    <section className="section" id="board">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="kicker">// boards</div>
            <h2>카테고리별 게시판</h2>
            <div className="sub">
              {visibleBoards.length}개 보드 · 라이브 데이터
              {theme === "light" && boards.length !== visibleBoards.length && (
                <span style={{marginLeft:8,color:"var(--ink-3)",fontSize:12}}>
                  (다크 모드 전용 {boards.length - visibleBoards.length}개 숨김)
                </span>
              )}
            </div>
          </div>
          <div className="right">
            <button className="btn btn-ghost" onClick={() => { document.getElementById("board")?.scrollIntoView({behavior:"smooth"}); ui.toast(`현재 ${visibleBoards.length}개 보드 표시 중`, "안내"); }}>전체보기 <Icon name="arrow" className="icn" /></button>
          </div>
        </div>
        <div className="boards-grid">
          {visibleBoards.map(b => (
            <div key={b.slug || b.id} className={"board-card " + b.color}
                 onClick={() => ui.setRoute("board:" + (b.slug || b.id))}
                 style={{position:"relative"}}>
              <button className="bell-btn" title="새 글 알림 받기"
                      onClick={(e) => {
                        e.stopPropagation();
                        ui.open("subscribe", { boardSlug: b.slug || b.id, boardTitle: b.title });
                      }}>
                <Icon name="bell" className="icn" />
              </button>
              <div className="glyph"><Icon name={b.glyph} className="icn" /></div>
              <div className="title">{b.title}</div>
              <div className="desc">{b.desc}</div>
              <div className="meta">
                <span>{b.posts.toLocaleString()} posts</span>
                <span className="new">+{b.today} today</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// —— BoardDetailPage ——
const PAGE_SIZE = 15;
const BoardDetailPage = ({ slug }) => {
  // ALL hooks must be declared at the top before any early-return so React's
  // hook call order stays stable across renders. Otherwise toggling theme
  // (which changes which branch runs) throws "Rendered more hooks…".
  const ui = window.PF_UI.useUI();
  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("hot");
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [theme] = (window.PF_THEME?.useTheme?.() ?? ["light", () => {}, () => {}]).slice(0, 2);
  // search + pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [activeQ, setActiveQ] = useState("");

  // Load board metadata once per slug.
  useEffect(() => {
    let alive = true;
    window.PF_API.boards().then((bRes) => {
      if (!alive) return;
      const found = (bRes.boards || []).find((b) => b.slug === slug);
      setBoard(found ? {
        ...found,
        desc: found.description,
        ...(SLUG_TO_VISUAL[found.slug] ?? { color: "cyan", glyph: "spark" }),
      } : null);
    }).catch(() => { /* keep null */ });
    return () => { alive = false; };
  }, [slug]);

  // Reset to page 1 when slug / tab / search query changes.
  useEffect(() => { setPage(1); }, [slug, tab, activeQ]);

  // Load page data when slug/tab/page/q changes.
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const params = { board: slug, tab, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE };
        if (activeQ) params.q = activeQ;
        const pRes = await window.PF_API.posts(params);
        if (!alive) return;
        setPosts(pRes.posts || []);
        setTotal(pRes.total ?? 0);
      } catch (err) {
        ui.toast("게시판을 불러오지 못했습니다", "오류");
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug, tab, page, activeQ]);

  const submitSearch = (e) => {
    e?.preventDefault();
    setActiveQ(searchInput.trim());
  };
  const clearSearch = () => { setSearchInput(""); setActiveQ(""); };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageWindow = (() => {
    // Show up to 7 page buttons centered on current page.
    const span = 7;
    let start = Math.max(1, page - Math.floor(span / 2));
    let end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  })();

  // Dark-only board guard (placed AFTER all hooks).
  const isDarkOnly = window.PF_THEME?.isDarkOnly?.(slug);
  if (isDarkOnly && theme === "light") {
    return (
      <div className="container" style={{padding:"80px 28px",textAlign:"center",maxWidth:560,margin:"0 auto"}}>
        <div className="kicker" style={{justifyContent:"center"}}>// 다크 모드 전용</div>
        <h2 style={{margin:"12px 0"}}>이 게시판은 다크 모드에서만 노출됩니다</h2>
        <p style={{color:"var(--ink-2)",fontSize:14,marginBottom:24,lineHeight:1.6}}>
          쇼케이스 / 일러스트 / 코스프레는 분위기에 어울리는 다크 모드에서 표시됩니다.<br/>
          우상단 ☾ 버튼으로 전환하거나 아래 버튼으로 바로 전환할 수 있습니다.
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <button className="btn btn-ghost" onClick={() => ui.setRoute("home")}>홈으로</button>
          <button className="btn btn-primary" onClick={() => { window.PF_THEME.setTheme("dark"); }}>다크 모드로 전환</button>
        </div>
      </div>
    );
  }

  if (!board && !loading) {
    return (
      <div className="container" style={{padding: "80px 28px", textAlign: "center"}}>
        <h2>알 수 없는 게시판</h2>
        <p style={{color:"var(--ink-2)",marginTop:12}}>'{slug}' 보드를 찾을 수 없습니다.</p>
        <button className="btn btn-primary" style={{marginTop:20}} onClick={() => ui.setRoute("home")}>홈으로</button>
      </div>
    );
  }

  return (
    <section className="section" style={{paddingTop: 28}}>
      <div className="container">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <button className="btn btn-ghost"
                  onClick={() => {
                    if (window.history.length > 1) window.history.back();
                    else { ui.setRoute("home"); setTimeout(() => document.getElementById("board")?.scrollIntoView({behavior:"smooth"}), 60); }
                  }}
                  style={{padding:"6px 12px",fontSize:13}}>← 뒤로</button>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--ink-3)"}}>
            <a href="#home" onClick={(e) => { e.preventDefault(); ui.setRoute("home"); }} style={{cursor:"pointer"}}>홈</a>
            <span>›</span>
            <a href="#home" onClick={(e) => { e.preventDefault(); ui.setRoute("home"); setTimeout(() => document.getElementById("board")?.scrollIntoView({behavior:"smooth"}), 60); }} style={{cursor:"pointer"}}>게시판</a>
            <span>›</span>
            <span style={{color:"var(--ink-1)"}}>{board?.title || "…"}</span>
          </div>
        </div>

        <div className="section-head" style={{marginBottom: 18}}>
          <div className="left" style={{display:"flex",alignItems:"center",gap:14}}>
            <div className={"board-card " + (board?.color || "cyan")}
                 style={{width:54,height:54,padding:0,display:"grid",placeItems:"center",pointerEvents:"none"}}>
              <div className="glyph" style={{margin:0}}>
                <Icon name={board?.glyph || "spark"} className="icn" />
              </div>
            </div>
            <div>
              <div className="kicker">// /board/{slug}</div>
              <h2 style={{margin:0}}>{board?.title || "…"}</h2>
              <div className="sub" style={{marginTop:4}}>{board?.desc || ""}</div>
            </div>
          </div>
          <div className="right" style={{display:"flex",alignItems:"center",gap:8}}>
            <button className="bell-btn lg" title={subscribed ? "알림 해제" : "새 글 알림 받기"}
                    onClick={() => {
                      setSubscribed((v) => !v);
                      ui.toast(subscribed ? "알림이 해제되었습니다" : `'${board?.title}' 알림이 켜졌습니다`, "구독");
                    }}>
              <Icon name={subscribed ? "bell_off" : "bell"} className="icn" />
            </button>
            <button className="btn btn-primary" onClick={() => ui.open("newpost")}>
              <Icon name="plus" className="icn" /> 새 글 쓰기
            </button>
          </div>
        </div>

        <div className="board-toolbar">
          <div className="tabs" style={{margin: 0}}>
            <button className={"tab" + (tab === "hot" ? " active" : "")} onClick={() => setTab("hot")}>🔥 인기글</button>
            <button className={"tab" + (tab === "latest" ? " active" : "")} onClick={() => setTab("latest")}>최신글</button>
          </div>
          <form className="board-search" onSubmit={submitSearch}>
            <Icon name="search" className="icn" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                   placeholder={`'${board?.title || "게시판"}'에서 검색…`} />
            {searchInput && (
              <button type="button" className="board-search-clear"
                      onClick={() => { setSearchInput(""); if (activeQ) setActiveQ(""); }}
                      aria-label="지우기">✕</button>
            )}
            <button type="submit" className="btn btn-ghost" style={{padding:"6px 12px",fontSize:12,marginLeft:6}}>검색</button>
          </form>
        </div>

        {activeQ && (
          <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(60,227,255,0.06)",border:"1px solid rgba(60,227,255,0.18)",fontSize:13,color:"var(--ink-1)",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span><span className="mono" style={{color:"var(--cyan)"}}>'{activeQ}'</span> 검색 결과 {total.toLocaleString()}건</span>
            <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11}} onClick={clearSearch}>전체 보기</button>
          </div>
        )}

        <div className="post-list">
          {loading ? (
            <div style={{padding:40,textAlign:"center",color:"var(--ink-3)"}}>불러오는 중…</div>
          ) : posts.length === 0 ? (
            <div style={{padding:40,textAlign:"center",color:"var(--ink-3)"}}>
              {activeQ
                ? <>'{activeQ}' 와 일치하는 글이 없습니다.<br/>다른 키워드로 검색해보세요.</>
                : <>아직 이 보드에 글이 없습니다. <br/>
                    <button className="btn btn-primary" style={{marginTop:14}} onClick={() => ui.open("newpost")}>첫 글 작성하기</button>
                  </>}
            </div>
          ) : posts.map((p, i) => (
            <div key={p.id || i} className={"post-row " + (board?.color || "cyan")} onClick={() => ui.open("post", p)}>
              <span className="tag">{p.tag}</span>
              {p.image_url && <img className="post-thumb" src={p.image_url} alt="" loading="lazy" />}
              <div className="title-cell">
                <div className="t">{p.title}</div>
                <div className="meta">
                  <span className="author">@{p.author}</span>
                  <span>·</span>
                  <span>{p.time}</span>
                  {p.badge ? <span className="badge">{p.badge}</span> : null}
                </div>
              </div>
              <div className="stats">
                <span>👁 {(p.views || 0).toLocaleString()}</span>
                <span>♥ {p.likes || 0}</span>
                <span>💬 {p.replies || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="pf-pager" aria-label="페이지 이동">
            <div className="pf-pager-info">
              {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, total).toLocaleString()}
              <span style={{color:"var(--ink-3)"}}> / {total.toLocaleString()}</span>
            </div>
            <div className="pf-pager-buttons">
              <button className="pf-pg" disabled={page === 1} onClick={() => setPage(1)}>« 처음</button>
              <button className="pf-pg" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ 이전</button>
              {pageWindow[0] > 1 && <span className="pf-pg-ellipsis">…</span>}
              {pageWindow.map((n) => (
                <button key={n} className={"pf-pg" + (n === page ? " active" : "")} onClick={() => setPage(n)}>{n}</button>
              ))}
              {pageWindow[pageWindow.length - 1] < totalPages && <span className="pf-pg-ellipsis">…</span>}
              <button className="pf-pg" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>다음 ›</button>
              <button className="pf-pg" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>끝 »</button>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
};

window.PF_BASE = { Icon, Nav, Ticker, Hero, Boards, BoardDetailPage };
