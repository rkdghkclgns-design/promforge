/* PromForge — community sections (with UI wiring) */
const { useState: useS2, useEffect: useE2 } = React;
const { Icon: I2 } = window.PF_BASE;

const TAG_COLOR = {
  PROMPT: "cyan", SHOWCASE: "ember", WORKFLOW: "violet", "Q&A": "green",
  DESIGN: "cyan", TOOLS: "violet", ART: "ember", FREE: "green",
  RELEASE: "violet",
};

const PostsSection = () => {
  const ui = window.PF_UI.useUI();
  const [tab, setTab] = useS2("hot");
  const [posts, setPosts] = useS2([]);
  const [counts, setCounts] = useS2({ hot: 0, latest: 0, verified: 0, release: 0 });
  const [loading, setLoading] = useS2(true);

  const fetchTab = async (which) => {
    setLoading(true);
    try {
      const params = which === "verified"
        ? { tab: "hot", limit: 30 }
        : which === "release"
          ? { tab: "latest", board: "release", limit: 30 }
          : { tab: which, limit: 30 };
      const res = await window.PF_API.posts(params);
      let list = res.posts ?? [];
      if (which === "verified") list = list.filter((p) => p.badge && p.badge.includes("검증"));
      // Filter dark-only board posts in light mode
      const theme = document.documentElement.getAttribute("data-theme") || "light";
      const darkOnly = window.PF_THEME?.DARK_ONLY_BOARDS;
      if (theme !== "dark" && darkOnly) {
        list = list.filter((p) => !darkOnly.has(p.board_slug));
      }
      list = list.slice(0, 20);
      setPosts(list);
      setCounts((c) => ({ ...c, [which]: list.length }));
    } catch {
      const m = window.PF_DATA.posts;
      setPosts(m[which] || m.hot);
    } finally {
      setLoading(false);
    }
  };

  useE2(() => { fetchTab(tab); }, [tab]);

  // Re-fetch when the user toggles theme so dark-only posts show/hide.
  useE2(() => {
    const obs = new MutationObserver(() => fetchTab(tab));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [tab]);

  return (
    <div className="posts-block">
      <div className="tabs">
        <button className={"tab" + (tab === "hot" ? " active" : "")} onClick={() => setTab("hot")}>
          🔥 인기글 <span className="count">{counts.hot}</span>
        </button>
        <button className={"tab" + (tab === "latest" ? " active" : "")} onClick={() => setTab("latest")}>
          최신글 <span className="count">{counts.latest}</span>
        </button>
        <button className={"tab" + (tab === "verified" ? " active" : "")} onClick={() => setTab("verified")}>검증된 프롬프트 <span className="count">{counts.verified}</span></button>
        <button className={"tab" + (tab === "release" ? " active" : "")} onClick={() => setTab("release")}>출시작 <span className="count">{counts.release}</span></button>
      </div>
      <div className="post-list">
        {loading ? <div style={{padding: 32, textAlign: "center", color: "var(--ink-3)"}}>불러오는 중…</div>
        : posts.length === 0 ? <div style={{padding: 32, textAlign: "center", color: "var(--ink-3)"}}>표시할 글이 없습니다.</div>
        : posts.map((p, i) => (
          <div key={p.id || i} className={"post-row " + (TAG_COLOR[p.tag] || p.color || "cyan")} onClick={() => ui.open("post", p)}>
            <span className="tag">{p.tag}</span>
            {p.image_url && <img className="post-thumb" src={p.image_url} alt="" loading="lazy" />}
            <div className="title-cell">
              <div className="t">
                {p.likes > 100 ? <span style={{color: "var(--ember)", marginRight: 6}}>🔥</span> : null}
                {p.title}
              </div>
              <div className="meta">
                <span className="author">@{p.author}</span>
                <span>·</span>
                <span>{p.time}</span>
                {p.badge ? <span className="badge">{p.badge}</span> : null}
              </div>
            </div>
            <div className="stats">
              <span><I2 name="eye" /> {(p.views || 0).toLocaleString()}</span>
              <span className={p.likes > 100 ? "hot" : ""}><I2 name="heart" /> {p.likes || 0}</span>
              <span><I2 name="msg" /> {p.replies || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Showcase = () => {
  // ALL hooks must run before any early-return so the call order is stable
  // across renders (otherwise React throws "Rendered more hooks than during
  // the previous render" when toggling theme).
  const ui = window.PF_UI.useUI();
  const [items, setItems] = useS2(window.PF_DATA.showcases);
  const [theme] = window.PF_THEME?.useTheme?.() ?? ["light"];
  useE2(() => {
    let alive = true;
    window.PF_API.showcases().then((res) => {
      if (!alive || !res?.showcases?.length) return;
      const merged = res.showcases.map((s, i) => ({
        id: s.id, title: s.title,
        genre: s.genre || "Game",
        author: s.author?.startsWith("@") ? s.author : `@${s.author || "anon"}`,
        note: s.description,
        featured: i === 0,
        hue: i === 0 ? "ember" : null,
      }));
      setItems(merged);
    }).catch(() => { /* keep mock */ });
    return () => { alive = false; };
  }, []);
  // Hide entire showcase section in light mode (after hooks have run).
  if (theme !== "dark") return null;
  return (
    <section className="section" id="showcase">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="kicker">// showcase</div>
            <h2>커뮤니티가 만든 게임</h2>
            <div className="sub">매주 멤버들이 출시하거나 빌드 중인 게임을 모았습니다.</div>
          </div>
          <div className="right">
            <button className="btn btn-ghost" onClick={() => ui.open("filter")}>필터: 전체</button>
            <button className="btn btn-ghost" onClick={() => { document.getElementById("showcase")?.scrollIntoView({behavior:"smooth"}); ui.toast(`총 ${items.length}개 작품 표시 중`, "쇼케이스"); }}>전체보기 <I2 name="arrow" /></button>
          </div>
        </div>
        <div className="showcase-grid">
          {items.map((g, i) => (
            <div key={g.id || i} className={"showcase-card" + (g.featured ? " feat" : "")} onClick={() => ui.open("showcase", g)}>
              {g.image_url ? (
                <img className="showcase-img" src={g.image_url} alt={g.title} loading="lazy" />
              ) : (
                <div className="placeholder" data-label={"[ " + g.title + " — preview ]"}></div>
              )}
              <div className="info">
                {g.featured ? <span className="pill ember">PICK OF THE WEEK</span> : <span className="pill">{(g.genre || "GAME").split("·")[0].trim()}</span>}
                <h3>{g.title}</h3>
                <div className="meta">{g.genre} · {g.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Studies = () => {
  const ui = window.PF_UI.useUI();
  const [studies, setStudies] = useS2(window.PF_DATA.studies);
  useE2(() => {
    let alive = true;
    window.PF_API.studies().then((res) => {
      if (!alive || !res?.studies?.length) return;
      const merged = res.studies.map((s) => ({
        id: s.id,
        title: s.title,
        desc: s.desc || s.description || "",
        status: s.status || "recruit",
        week: s.week || "WEEK 0",
        members: ["EK", "SH", "MI", "JP"].slice(0, 4),
        total: s.total || "0/10",
      }));
      setStudies(merged);
    }).catch(() => { /* keep mock */ });
    return () => { alive = false; };
  }, []);
  const colors = ["#3ce3ff", "#ff8a3c", "#9a8cff", "#6ee7a0", "#ffd166", "#7defff"];
  return (
    <section className="section" id="studies">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="kicker">// study groups</div>
            <h2>지금 모집 중인 스터디</h2>
            <div className="sub">매주 만나서 같이 두드리는 사람들. 입문부터 출시 스프린트까지.</div>
          </div>
          <div className="right">
            <button className="btn btn-ghost" onClick={() => ui.open("newstudy")}><I2 name="plus" /> 스터디 만들기</button>
          </div>
        </div>
        <div className="study-grid">
          {studies.map((s, i) => (
            <div key={s.id || i} className="study-card" onClick={() => ui.open("study", s)}>
              <div className="top">
                <span className={"status " + s.status}>
                  {s.status === "recruit" ? "● 모집중" : s.status === "active" ? "● 진행중" : "● 마감"}
                </span>
                <span className="week">{s.week}</span>
              </div>
              <h3>{s.title}</h3>
              <div className="desc">{s.desc}</div>
              <div className="meta-row">
                <div className="avatars">
                  {s.members.map((m, j) => (
                    <div key={j} className="av" style={{background: colors[(i + j) % colors.length], color: "#0a0e1a"}}>{m}</div>
                  ))}
                  <div className="av more">+{Math.max(0, parseInt(s.total.split("/")[0]) - s.members.length)}</div>
                </div>
                <div className="progress">{s.total}<span className="full"> 멤버</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Rail = () => {
  const ui = window.PF_UI.useUI();
  const ranking = window.PF_DATA.ranking;
  const activity = window.PF_DATA.activity;
  return (
    <aside className="rail">
      <div className="rail-card digest-card" id="digest">
        <div className="ember-glyph">⚒</div>
        <div className="label">▸ Weekly Forge Digest · WK 18</div>
        <h3>이번 주 한국 AI 게임 씬에서 일어난 일들</h3>
        <p>릴리즈 4건, 신규 프롬프트 38개, 스터디 신설 3개, 현장 게임잼 64팀. 매주 월요일 아침 정리해 드립니다.</p>
        <button className="btn btn-primary" style={{width: "100%", justifyContent: "center"}} onClick={() => ui.open("subscribe")}>이메일 구독 (무료)</button>
      </div>

      <div className="rail-card">
        <h4>🏆 이주의 메이커 <a href="#" className="all" onClick={(e) => { e.preventDefault(); ui.toast("전체 랭킹으로 이동", "안내"); }}>랭킹 전체</a></h4>
        <div className="rank-list">
          {ranking.map((r, i) => (
            <div key={i} className={"rank-row" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")} style={{cursor: "pointer"}} onClick={() => ui.toast(`@${r.name} 프로필 열기`, "프로필")}>
              <div className="num">#{i + 1}</div>
              <div className="av" style={{background: r.color}}>{r.name.slice(0, 2).toUpperCase()}</div>
              <div className="who">
                <div className="name">{r.name}</div>
                <div className="role">{r.role}</div>
              </div>
              <div className="pts">+{r.pts}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rail-card">
        <h4>최근 활동 <span className="all">실시간</span></h4>
        <div className="activity-list">
          {activity.map((a, i) => (
            <div key={i} className="activity-row" style={{cursor: "pointer"}} onClick={() => ui.toast(`@${a.who} · ${a.obj}`, "활동")}>
              <div className="av" style={{background: a.color}}>{a.who.slice(0, 2).toUpperCase()}</div>
              <div className="body">
                <span className="name">@{a.who}</span> {a.action} <span className="obj">{a.obj}</span>{a.suffix || ""}
                <span className="time">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

const Tools = () => {
  const ui = window.PF_UI.useUI();
  const tools = window.PF_DATA.tools;
  return (
    <section className="section" style={{paddingTop: 0}}>
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="kicker">// tools in use</div>
            <h2>커뮤니티가 가장 많이 쓰는 도구들</h2>
            <div className="sub">태그를 누르면 해당 도구의 글만 모아 볼 수 있습니다.</div>
          </div>
        </div>
        <div className="tools-grid">
          {tools.map((t, i) => (
            <div key={i} className="tool-chip" onClick={() => ui.open("tool", t)}>
              <div className="name">{t.name}</div>
              <div className="cnt">{t.cnt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTABanner = () => {
  const ui = window.PF_UI.useUI();
  return (
    <section className="section">
      <div className="container">
        <div className="cta-banner">
          <div className="anvil"><img src="assets/promforge_logo.png" alt="" /></div>
          <span className="eyebrow"><span className="dot"></span>지금 가입하면</span>
          <h2 style={{marginTop: 14}}>아이디어를 들고 오세요. <br/>나머지는 같이 두드립니다.</h2>
          <p>검증된 프롬프트 라이브러리, 출시 멘토, 매주 새로운 스터디 — 모두 무료. 가입은 30초.</p>
          <div className="group">
            <button className="btn btn-primary" onClick={() => ui.open("signup")}><I2 name="flame" /> 포지 가입하기</button>
            <a className="btn btn-discord" href={ui.discordUrl} target="_blank" rel="noopener noreferrer">
              <I2 name="discord" /> Discord 들어가기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const ui = window.PF_UI.useUI();
  const open = (kind, payload) => (e) => { e.preventDefault(); ui.open(kind, payload); };
  // Goes to a section anchor on the home page. If the user is on a sub-route
  // (admin / board:slug), we have to switch routes first and then scroll
  // after the home view renders (otherwise getElementById returns null).
  const goTo = (id) => (e) => {
    e.preventDefault();
    const onHome = !ui.route || ui.route === "home";
    if (!onHome) {
      ui.setRoute("home");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-col foot-brand">
            <div className="logo" style={{marginBottom: 4}}>
              <img src="assets/promforge_logo.png" alt="" style={{width: 30, height: 30}} />
              <span className="brand-en">PromForge</span>
            </div>
            <p>AI로 게임을 만드는 한국 메이커들의 작업장. 프롬프트와 코드, 그리고 사람들이 모이는 곳.</p>
          </div>
          <div className="foot-col">
            <h5>커뮤니티</h5>
            <ul>
              <li><a href="#board" onClick={goTo("board")}>게시판</a></li>
              <li><a href="#showcase" onClick={goTo("showcase")}>쇼케이스</a></li>
              <li><a href="#studies" onClick={goTo("studies")}>스터디</a></li>
              <li><a href="#" onClick={open("jam")}>게임잼</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>리소스</h5>
            <ul>
              <li><a href="#board:prompts" onClick={(e) => { e.preventDefault(); ui.setRoute("board:prompts"); }}>프롬프트 라이브러리</a></li>
              <li><a href="#" onClick={open("toolguide")}>툴 비교 가이드</a></li>
              <li><a href="#" onClick={open("checklist")}>출시 체크리스트</a></li>
              <li><a href="#" onClick={open("mentors")}>멘토 디렉토리</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>회사</h5>
            <ul>
              <li><a href="#" onClick={open("about")}>소개</a></li>
              <li><a href="#" onClick={open("conduct")}>행동강령</a></li>
              <li><a href="#" onClick={open("subscribe")}>뉴스레터</a></li>
              <li><a href="#" onClick={open("contact")}>문의</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>SNS</h5>
            <ul>
              <li><a href={ui.discordUrl} target="_blank" rel="noopener noreferrer">Discord</a></li>
              <li><a href="https://www.youtube.com/results?search_query=AI+%EA%B2%8C%EC%9E%84+%EC%A0%9C%EC%9E%91+%ED%95%9C%EA%B5%AD" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              <li><a href="https://x.com/search?q=AI%20%EA%B2%8C%EC%9E%84%20%EC%A0%9C%EC%9E%91&f=live" target="_blank" rel="noopener noreferrer">X / Twitter</a></li>
              <li><a href="https://github.com/rkdghkclgns-design/promforge" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 PromForge · 프롬포지 커뮤니티</span>
          <span className="signature">&lt;script&gt; forged in 한국 ⚒ &lt;/script&gt;</span>
        </div>
      </div>
    </footer>
  );
};

window.PF_SEC = { PostsSection, Showcase, Studies, Rail, Tools, CTABanner, Footer };
