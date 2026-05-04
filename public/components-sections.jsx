/* PromForge — community sections (with UI wiring) */
const { useState: useS2 } = React;
const { Icon: I2 } = window.PF_BASE;

const PostsSection = () => {
  const ui = window.PF_UI.useUI();
  const [tab, setTab] = useS2("hot");
  const data = window.PF_DATA.posts;
  const list = data[tab] || data.hot;
  return (
    <div className="posts-block">
      <div className="tabs">
        <button className={"tab" + (tab === "hot" ? " active" : "")} onClick={() => setTab("hot")}>
          🔥 인기글 <span className="count">{data.hot.length}</span>
        </button>
        <button className={"tab" + (tab === "latest" ? " active" : "")} onClick={() => setTab("latest")}>
          최신글 <span className="count">{data.latest.length}</span>
        </button>
        <button className={"tab" + (tab === "verified" ? " active" : "")} onClick={() => { setTab("verified"); ui.toast("검증된 프롬프트만 표시합니다", "필터"); setTimeout(() => setTab("hot"), 600); }}>검증된 프롬프트 <span className="count">42</span></button>
        <button className={"tab" + (tab === "release" ? " active" : "")} onClick={() => { setTab("release"); ui.toast("출시작 모음을 표시합니다", "필터"); setTimeout(() => setTab("hot"), 600); }}>출시작 <span className="count">28</span></button>
      </div>
      <div className="post-list">
        {list.map((p, i) => (
          <div key={i} className={"post-row " + p.color} onClick={() => ui.open("post", p)}>
            <span className="tag">{p.tag}</span>
            <div className="title-cell">
              <div className="t">
                {p.hot ? <span style={{color: "var(--ember)", marginRight: 6}}>🔥</span> : null}
                {p.title}
              </div>
              <div className="meta">
                <span className="author">{p.author}</span>
                <span>·</span>
                <span>{p.time}</span>
                {p.badge ? <span className="badge">{p.badge}</span> : null}
              </div>
            </div>
            <div className="stats">
              <span><I2 name="eye" /> {p.views.toLocaleString()}</span>
              <span className={p.likes > 100 ? "hot" : ""}><I2 name="heart" /> {p.likes}</span>
              <span><I2 name="msg" /> {p.replies}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Showcase = () => {
  const ui = window.PF_UI.useUI();
  const items = window.PF_DATA.showcases;
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
            <button className="btn btn-ghost" onClick={() => ui.toast("전체 쇼케이스로 이동", "안내")}>전체보기 <I2 name="arrow" /></button>
          </div>
        </div>
        <div className="showcase-grid">
          {items.map((g, i) => (
            <div key={g.id} className={"showcase-card" + (g.featured ? " feat" : "")} onClick={() => ui.open("showcase", g)}>
              <div className="placeholder" data-label={"[ " + g.title + " — preview ]"}></div>
              <div className="info">
                {g.featured ? <span className="pill ember">PICK OF THE WEEK</span> : <span className="pill">{g.genre.split("·")[0].trim()}</span>}
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
  const studies = window.PF_DATA.studies;
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
            <div key={i} className="study-card" onClick={() => ui.open("study", s)}>
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
            <a className="btn btn-discord" href={ui.discordUrl} onClick={(e) => { e.preventDefault(); ui.toast("Discord 채널로 이동합니다", "디스코드"); }}>
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
  const goTo = (id) => (e) => {
    e.preventDefault();
    if (ui.route === "admin") ui.setRoute("home");
    setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior:"smooth"}), 60);
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
              <li><a href="#" onClick={open("library")}>프롬프트 라이브러리</a></li>
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
              <li><a href={ui.discordUrl} onClick={(e) => { e.preventDefault(); ui.toast("Discord 채널로 이동합니다", "디스코드"); }}>Discord</a></li>
              <li><a href="#" onClick={open("sns", "youtube")}>YouTube</a></li>
              <li><a href="#" onClick={open("sns", "twitter")}>X / Twitter</a></li>
              <li><a href="#" onClick={open("sns", "github")}>GitHub</a></li>
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
