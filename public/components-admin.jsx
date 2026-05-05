/* PromForge — Admin / Analytics Dashboard */

const PF_ADMIN = (() => {
  const { useState, useEffect, useRef } = React;

  // ─────────── Mock analytics data ───────────
  const KPIS = [
    { id: "users",   label: "전체 회원",       value: 14820, delta: "+312",   period: "이번주", color: "var(--ember)" },
    { id: "dau",     label: "DAU",             value: 2147,  delta: "+8.4%",  period: "vs 어제", color: "var(--cyan)" },
    { id: "wau",     label: "WAU",             value: 7320,  delta: "+12.1%", period: "vs 지난주", color: "var(--violet)" },
    { id: "mau",     label: "MAU",             value: 11450, delta: "+5.2%",  period: "vs 지난달", color: "var(--green)" },
    { id: "posts",   label: "전체 게시글",     value: 8941,  delta: "+184",   period: "이번주", color: "var(--ember)" },
    { id: "comments",label: "전체 댓글",       value: 32104, delta: "+1.2k",  period: "이번주", color: "var(--cyan)" },
    { id: "avg_session", label: "평균 세션",   value: "8m 24s", delta: "+42s", period: "vs 지난주", color: "var(--violet)" },
    { id: "retention",   label: "7일 리텐션",  value: "42.8%",  delta: "+3.1%p", period: "vs 지난달", color: "var(--green)" },
  ];

  // 30 days of data
  const buildSeries = (base, vol) => Array.from({length: 30}, (_, i) => {
    const trend = i / 30 * base * 0.4;
    const noise = (Math.sin(i * 0.7) + Math.cos(i * 0.4)) * vol;
    return Math.max(0, Math.round(base * 0.6 + trend + noise));
  });

  const SERIES = {
    signups: buildSeries(80, 25),
    dau:     buildSeries(2000, 250),
    posts:   buildSeries(140, 40),
    sessions:buildSeries(3500, 450),
  };

  const TRAFFIC_SOURCES = [
    { src: "Direct", v: 38, c: "var(--cyan)" },
    { src: "Google Search", v: 24, c: "var(--ember)" },
    { src: "Discord", v: 16, c: "var(--violet)" },
    { src: "X / Twitter", v: 11, c: "var(--green)" },
    { src: "YouTube", v: 6, c: "#ff6b9d" },
    { src: "기타 Referral", v: 5, c: "var(--ink-3)" },
  ];

  const DEVICES = [
    { name: "Desktop", v: 62 },
    { name: "Mobile",  v: 31 },
    { name: "Tablet",  v: 7 },
  ];

  const BOARD_STATS = [
    { name: "프롬프트 라이브러리", posts: 2841, views: 184200, engagement: 8.2, growth: "+12.4%" },
    { name: "쇼케이스",              posts: 1204, views: 256800, engagement: 11.6, growth: "+18.1%" },
    { name: "툴 / 워크플로",         posts: 1537, views: 98400,  engagement: 6.4, growth: "+5.2%" },
    { name: "Q&A · 에러해결",        posts: 1842, views: 76300,  engagement: 5.1, growth: "+3.8%" },
    { name: "게임 디자인 토론",      posts: 824,  views: 51200,  engagement: 7.3, growth: "+9.1%" },
    { name: "AI 아트 & 사운드",      posts: 487,  views: 42100,  engagement: 9.8, growth: "+22.4%" },
    { name: "출시 & 마케팅",         posts: 312,  views: 38900,  engagement: 6.9, growth: "+7.6%" },
    { name: "자유게시판",             posts: 894,  views: 28400,  engagement: 4.2, growth: "+1.4%" },
  ];

  const TOP_POSTS = [
    { title: "Claude로 4주 만에 텍스트 어드벤처 만들기 — 분기 240개 설계기", author: "@hyejin.kr", views: 18420, likes: 842, comments: 124, board: "쇼케이스" },
    { title: "Roguelike Dungeon DM v3 — 토큰 절감 시스템 프롬프트", author: "@maker_kim",   views: 14200, likes: 738, comments: 96,  board: "프롬프트" },
    { title: "Cursor Composer로 보스전 패턴 자동 생성", author: "@dev_yoon",    views: 11580, likes: 524, comments: 81,  board: "워크플로" },
    { title: "한국어 RPG 마스터 페르소나 — 톤 일관성 패턴",    author: "@narrative.lab", views: 9840,  likes: 487, comments: 73,  board: "프롬프트" },
    { title: "Godot + LLM 에이전트 통합 가이드",       author: "@indie.park",   views: 8210,  likes: 412, comments: 58,  board: "Q&A" },
  ];

  const TOP_USERS = [
    { name: "hyejin.kr",     contrib: 184, rep: 12480, badge: "메이커" },
    { name: "maker_kim",     contrib: 142, rep: 9820,  badge: "프롬프터" },
    { name: "dev_yoon",      contrib: 118, rep: 7240,  badge: "워크플로" },
    { name: "narrative.lab", contrib: 96,  rep: 6180,  badge: "라이터" },
    { name: "indie.park",    contrib: 82,  rep: 5410,  badge: "엔지니어" },
    { name: "soundlab.choi", contrib: 71,  rep: 4280,  badge: "오디오" },
    { name: "art.minji",     contrib: 64,  rep: 3920,  badge: "아티스트" },
    { name: "studio.han",    contrib: 58,  rep: 3540,  badge: "팀장" },
  ];

  const TOOL_USAGE = [
    { name: "Claude",      pct: 68 },
    { name: "GPT-4o",      pct: 54 },
    { name: "Cursor",      pct: 47 },
    { name: "Unity",       pct: 32 },
    { name: "Godot",       pct: 28 },
    { name: "Stable Diffusion", pct: 24 },
    { name: "Midjourney",  pct: 19 },
    { name: "Suno",        pct: 14 },
  ];

  const RECENT_REPORTS = [
    { id: "R-2841", type: "스팸", target: "@spam_user_42", reporter: "@maker_kim",   when: "12분 전",  status: "대기" },
    { id: "R-2840", type: "저작권", target: "쇼케이스 #1842",  reporter: "@indie.park", when: "38분 전",  status: "검토중" },
    { id: "R-2839", type: "혐오 표현", target: "댓글 #91204",  reporter: "@hyejin.kr",  when: "1시간 전", status: "처리됨" },
    { id: "R-2838", type: "스팸", target: "@bot_xxx",       reporter: "자동 감지",       when: "2시간 전", status: "처리됨" },
  ];

  const SYSTEM = [
    { name: "API 응답시간 (p95)", v: "184ms", ok: true },
    { name: "DB 쿼리 (p95)",       v: "42ms",  ok: true },
    { name: "스토리지 사용량",      v: "284 GB / 1 TB", ok: true },
    { name: "에러율 (24h)",         v: "0.04%", ok: true },
    { name: "큐 대기열",             v: "12",    ok: true },
    { name: "CDN 캐시 적중률",      v: "94.2%", ok: true },
  ];

  const FUNNEL = [
    { stage: "방문",         v: 18420 },
    { stage: "회원가입",     v: 1842 },
    { stage: "첫 게시글",    v: 824 },
    { stage: "3+ 게시글",    v: 412 },
    { stage: "스터디 참여",  v: 184 },
  ];

  // ─────────── Tiny chart components ───────────

  // Date label helper — assumes data ends today
  const dateLabelFor = (idx, total) => {
    const d = new Date();
    d.setDate(d.getDate() - (total - 1 - idx));
    return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`;
  };

  // Tooltip shared by all charts
  const ChartTooltip = ({ x, y, lines }) => (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: "translate(-50%, calc(-100% - 10px))",
      background: "rgba(8,11,22,0.96)",
      border: "1px solid var(--line)",
      borderRadius: 6, padding: "7px 10px",
      pointerEvents: "none", whiteSpace: "nowrap", zIndex: 50,
      fontFamily: "JetBrains Mono, monospace", fontSize: 11,
      boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{color: l.c || "var(--ink-0)", lineHeight: 1.5}}>
          {l.label && <span style={{color: "var(--ink-3)", marginRight: 6}}>{l.label}</span>}
          <span style={{fontWeight: l.bold ? 600 : 400}}>{l.value}</span>
        </div>
      ))}
    </div>
  );

  const Sparkline = ({ data, color = "var(--cyan)", height = 56, labelFormatter }) => {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 100;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * w,
      y: height - ((d - min) / range) * (height - 4) - 2,
      v: d, idx: i,
    }));
    const linePts = points.map(p => `${p.x},${p.y}`).join(" ");
    const area = `0,${height} ${linePts} ${w},${height}`;
    const gradId = `grad-${color.replace(/[^a-z]/gi,"")}`;

    const onMove = (e) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const idx = Math.max(0, Math.min(data.length - 1, Math.round(relX * (data.length - 1))));
      const p = points[idx];
      setHover({
        idx,
        pxX: p.x / w * rect.width,
        pxY: p.y / height * rect.height,
      });
    };

    return (
      <div ref={wrapRef} style={{position: "relative", width: "100%", height}}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{width: "100%", height, display: "block"}}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradId})`} />
          <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {hover && (
            <>
              <line x1={points[hover.idx].x} x2={points[hover.idx].x} y1="0" y2={height}
                stroke={color} strokeOpacity="0.4" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="2 2" />
              <circle cx={points[hover.idx].x} cy={points[hover.idx].y} r="2.5" fill={color} stroke="var(--bg-0)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {hover && (
          <ChartTooltip x={hover.pxX} y={hover.pxY} lines={[
            { label: "DATE", value: dateLabelFor(hover.idx, data.length), c: "var(--ink-3)" },
            { value: (labelFormatter ? labelFormatter(points[hover.idx].v) : points[hover.idx].v.toLocaleString()), c: color, bold: true },
          ]}/>
        )}
      </div>
    );
  };

  const Bars = ({ data, color = "var(--ember)", height = 80, unit = "%" }) => {
    const [hover, setHover] = useState(null);
    const wrapRef = useRef(null);
    const max = Math.max(...data.map(d => d.v));
    return (
      <div ref={wrapRef} style={{display: "flex", alignItems: "flex-end", gap: 6, height, position: "relative"}}>
        {data.map((d, i) => (
          <div key={i} style={{flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative"}}
            onMouseEnter={(e) => {
              const rect = wrapRef.current.getBoundingClientRect();
              const target = e.currentTarget.getBoundingClientRect();
              setHover({ d, x: target.left - rect.left + target.width / 2, y: target.top - rect.top });
            }}
            onMouseLeave={() => setHover(null)}>
            <div style={{
              width: "100%",
              height: `${(d.v / max) * (height - 18)}px`,
              background: hover && hover.d === d ? color : `linear-gradient(to top, ${color}, ${color}aa)`,
              borderRadius: "3px 3px 0 0",
              minHeight: 2,
              transition: "background 120ms",
            }}/>
            <div style={{fontSize: 9.5, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap"}}>{d.name}</div>
          </div>
        ))}
        {hover && (
          <ChartTooltip x={hover.x} y={hover.y} lines={[
            { label: hover.d.name },
            { value: hover.d.v + unit, c: color, bold: true },
          ]}/>
        )}
      </div>
    );
  };

  const HBar = ({ value, max = 100, color = "var(--cyan)" }) => (
    <div style={{height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden"}}>
      <div style={{height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 3, transition: "width 600ms"}}/>
    </div>
  );

  const Donut = ({ data, size = 120, valueLabel = "%" }) => {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null);
    const total = data.reduce((s, d) => s + d.v, 0);
    const r = size / 2 - 8;
    const c = size / 2;
    let acc = 0;
    const segs = data.map((d, i) => {
      const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += d.v;
      const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const large = (end - start) > Math.PI ? 1 : 0;
      const x1 = c + r * Math.cos(start);
      const y1 = c + r * Math.sin(start);
      const x2 = c + r * Math.cos(end);
      const y2 = c + r * Math.sin(end);
      const mid = (start + end) / 2;
      return { d, path: `M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, midX: c + r * 0.6 * Math.cos(mid), midY: c + r * 0.6 * Math.sin(mid) };
    });
    return (
      <div ref={wrapRef} style={{position: "relative", width: size, height: size}}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{width: size, height: size}}>
          {segs.map((s, i) => (
            <path key={i} d={s.path} fill={s.d.c} stroke="var(--bg-0)" strokeWidth="1.5"
              opacity={hover && hover.d !== s.d ? 0.45 : 1}
              style={{cursor: "pointer", transition: "opacity 120ms"}}
              onMouseEnter={(e) => {
                const rect = wrapRef.current.getBoundingClientRect();
                const sx = (s.midX / size) * rect.width;
                const sy = (s.midY / size) * rect.height;
                setHover({ d: s.d, x: sx, y: sy });
              }}
              onMouseLeave={() => setHover(null)} />
          ))}
          <circle cx={c} cy={c} r={r * 0.55} fill="var(--bg-0)" pointerEvents="none" />
          <text x={c} y={c - 2} textAnchor="middle" fill="var(--ink-0)" fontSize="14" fontWeight="600" fontFamily="Space Grotesk" pointerEvents="none">
            {hover ? hover.d.v + valueLabel : "100%"}
          </text>
          <text x={c} y={c + 12} textAnchor="middle" fill="var(--ink-3)" fontSize="8.5" fontFamily="JetBrains Mono" pointerEvents="none">
            {hover ? (hover.d.src || hover.d.name || "").slice(0, 10).toUpperCase() : "SOURCES"}
          </text>
        </svg>
        {hover && (
          <ChartTooltip x={hover.x} y={hover.y} lines={[
            { label: hover.d.src || hover.d.name },
            { value: `${hover.d.v}${valueLabel} (${Math.round((hover.d.v / total) * 100)}% of total)`, c: hover.d.c, bold: true },
          ]}/>
        )}
      </div>
    );
  };

  // ─────────── Reusable card ───────────
  const Card = ({ kicker, title, action, children, style }) => (
    <div className="admin-card" style={style}>
      <div className="admin-card-head">
        <div>
          {kicker && <div className="kicker" style={{fontSize: 10.5, color: "var(--ink-3)"}}>{kicker}</div>}
          <h3 style={{fontSize: 15, margin: 0, fontWeight: 600, fontFamily: "Space Grotesk, sans-serif", color: "var(--ink-0)"}}>{title}</h3>
        </div>
        {action}
      </div>
      <div className="admin-card-body">{children}</div>
    </div>
  );

  // ─────────── Main ───────────
  const AdminPage = () => {
    const ui = window.PF_UI.useUI();
    const [range, setRange] = useState("30d");
    const [tab, setTab] = useState("overview");

    const tabs = [
      { id: "overview", label: "개요" },
      { id: "banners",  label: "공지 관리" },
      { id: "users",    label: "사용자" },
      { id: "content",  label: "콘텐츠" },
      { id: "engagement", label: "참여도" },
      { id: "moderation", label: "신고/모더레이션" },
      { id: "system",   label: "시스템" },
    ];

    const ranges = [
      { id: "24h", label: "24시간" },
      { id: "7d",  label: "7일" },
      { id: "30d", label: "30일" },
      { id: "90d", label: "90일" },
      { id: "all", label: "전체" },
    ];

    return (
      <div className="admin-shell">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="container admin-topbar-inner">
            <div style={{display: "flex", alignItems: "center", gap: 14}}>
              <button className="btn btn-ghost" onClick={() => ui.setRoute("home")} style={{padding: "6px 10px"}}>← 홈</button>
              <div>
                <div className="kicker" style={{fontSize: 10, marginBottom: 2}}>// /admin — 관리자 대시보드</div>
                <h1 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 600, color: "var(--ink-0)", margin: 0}}>
                  PromForge <span style={{color: "var(--ember)"}}>Admin</span>
                </h1>
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div className="admin-range">
                {ranges.map(r => (
                  <button key={r.id} className={"range-btn" + (range === r.id ? " active" : "")} onClick={() => setRange(r.id)}>{r.label}</button>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={() => ui.toast("CSV 내보내기 시작됨", "Export")}>
                ⇩ Export CSV
              </button>
              <button className="btn btn-primary" onClick={() => ui.toast("리포트가 새로고침되었습니다", "Sync")}>
                ⟳ 새로고침
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <div className="container" style={{display: "flex", gap: 0, overflowX: "auto"}}>
            {tabs.map(t => (
              <button key={t.id} className={"admin-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container admin-main">
          {tab === "overview" && <OverviewTab />}
          {tab === "banners" && <BannersTab />}
          {tab === "users" && <UsersTab />}
          {tab === "content" && <ContentTab />}
          {tab === "engagement" && <EngagementTab />}
          {tab === "moderation" && <ModerationTab />}
          {tab === "system" && <SystemTab />}
        </div>
      </div>
    );
  };

  // ─────────── User management mock data ───────────
  const ROLES = [
    { id: "owner",   label: "오너",        color: "var(--ember)",  rank: 5, desc: "최고 권한. 모든 작업 가능" },
    { id: "admin",   label: "관리자",      color: "var(--violet)", rank: 4, desc: "사용자/콘텐츠/시스템 관리" },
    { id: "mod",     label: "모더레이터",  color: "var(--cyan)",   rank: 3, desc: "신고 처리, 게시글 비공개" },
    { id: "verified",label: "검증 메이커", color: "var(--green)",  rank: 2, desc: "프롬프트 검증 마크 부여 가능" },
    { id: "member",  label: "일반 회원",   color: "var(--ink-2)",  rank: 1, desc: "기본 회원 (게시·댓글)" },
    { id: "guest",   label: "게스트",      color: "var(--ink-3)",  rank: 0, desc: "읽기 전용. 작성 불가" },
  ];

  const PERMISSIONS = [
    { id: "post",        label: "게시글 작성",         group: "콘텐츠" },
    { id: "comment",     label: "댓글 작성",            group: "콘텐츠" },
    { id: "upload",      label: "이미지/파일 업로드",  group: "콘텐츠" },
    { id: "verify",      label: "프롬프트 검증",        group: "콘텐츠" },
    { id: "feature",     label: "쇼케이스 피처링",      group: "콘텐츠" },
    { id: "mod_post",    label: "게시글 비공개/삭제",  group: "모더레이션" },
    { id: "mod_user",    label: "사용자 경고/정지",    group: "모더레이션" },
    { id: "mod_report",  label: "신고 처리",            group: "모더레이션" },
    { id: "user_role",   label: "사용자 역할 변경",    group: "관리" },
    { id: "user_delete", label: "사용자 탈퇴 처리",    group: "관리" },
    { id: "billing",     label: "결제/후원 관리",        group: "관리" },
    { id: "system",      label: "시스템 설정",          group: "관리" },
  ];

  const ROLE_PERMS = {
    owner:    new Set(PERMISSIONS.map(p => p.id)),
    admin:    new Set(["post","comment","upload","verify","feature","mod_post","mod_user","mod_report","user_role","user_delete"]),
    mod:      new Set(["post","comment","upload","verify","mod_post","mod_user","mod_report"]),
    verified: new Set(["post","comment","upload","verify"]),
    member:   new Set(["post","comment","upload"]),
    guest:    new Set([]),
  };

  // 14 mock users — variety of statuses
  const MOCK_USERS = [
    { id: 1,  name: "studio.han",    full: "한지영",  email: "han@studio.kr",     role: "owner",    status: "active",     joined: "2026-03-04", lastActive: "방금",       posts: 184, reports: 0 },
    { id: 2,  name: "admin.lee",     full: "이도현",  email: "lee@promforge.kr",  role: "admin",    status: "active",     joined: "2026-03-05", lastActive: "5분 전",     posts: 84,  reports: 0 },
    { id: 3,  name: "mod.kim",       full: "김민수",  email: "minsoo@kim.dev",    role: "mod",      status: "active",     joined: "2026-03-12", lastActive: "12분 전",    posts: 142, reports: 1 },
    { id: 4,  name: "mod.choi",      full: "최승민",  email: "choi@soundlab.kr",  role: "mod",      status: "active",     joined: "2026-04-02", lastActive: "38분 전",    posts: 71,  reports: 0 },
    { id: 5,  name: "hyejin.kr",     full: "박혜진",  email: "hye@maker.kr",      role: "verified", status: "active",     joined: "2026-04-18", lastActive: "1시간 전",   posts: 96,  reports: 0 },
    { id: 6,  name: "maker_kim",     full: "김영준",  email: "yj@dev.kr",         role: "verified", status: "active",     joined: "2026-05-01", lastActive: "2시간 전",   posts: 142, reports: 0 },
    { id: 7,  name: "dev_yoon",      full: "윤재호",  email: "yoon@dev.kr",       role: "verified", status: "active",     joined: "2026-05-14", lastActive: "어제",       posts: 118, reports: 0 },
    { id: 8,  name: "narrative.lab", full: "정수아",  email: "soo@narrative.io",  role: "member",   status: "active",     joined: "2026-06-22", lastActive: "오늘",       posts: 64,  reports: 2 },
    { id: 9,  name: "indie.park",    full: "박지훈",  email: "jh@indie.kr",       role: "member",   status: "active",     joined: "2026-07-03", lastActive: "3일 전",     posts: 38,  reports: 0 },
    { id: 10, name: "art.minji",     full: "민수아",  email: "art@minji.kr",      role: "member",   status: "warned",     joined: "2026-08-12", lastActive: "1일 전",     posts: 24,  reports: 3 },
    { id: 11, name: "newbie_kr",     full: "이태호",  email: "th@newbie.kr",      role: "member",   status: "active",     joined: "2026-09-28", lastActive: "12시간 전",  posts: 4,   reports: 0 },
    { id: 12, name: "spam_user_42",  full: "—",       email: "x@spam.io",          role: "member",   status: "suspended",  joined: "2026-10-01", lastActive: "차단됨",     posts: 12,  reports: 8 },
    { id: 13, name: "bot_xxx",       full: "—",       email: "bot@auto.io",        role: "guest",    status: "banned",     joined: "2026-10-04", lastActive: "차단됨",     posts: 0,   reports: 14 },
    { id: 14, name: "former.user",   full: "—",       email: "deleted@—",          role: "member",   status: "withdrawn",  joined: "2026-04-12", lastActive: "탈퇴",       posts: 18,  reports: 0 },
  ];

  // ─────────── User actions store ───────────
  // We mutate the user list via state lifted in UsersTab.


  // ────────────────────── 공지(배너) 관리 ──────────────────────
  const blank = () => ({
    kind: "rolling", title: "", subtitle: "", body: "",
    link_url: "", link_label: "자세히 보기", accent: "cyan",
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: "",
    priority: 50, active: true,
  });
  const toLocalInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
  const fromLocalInput = (s) => s ? new Date(s).toISOString() : null;

  const BannersTab = () => {
    const ui = window.PF_UI.useUI();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | 'new' | banner.id
    const [form, setForm] = useState(blank());
    const [busy, setBusy] = useState(false);

    const load = () => {
      setLoading(true);
      window.PF_API.admin.banners()
        .then((r) => setBanners(r.banners || []))
        .catch((e) => ui.toast("불러오기 실패: " + (e.message || ""), "오류"))
        .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const startNew = () => { setForm(blank()); setEditing("new"); };
    const startEdit = (b) => {
      setForm({
        kind: b.kind, title: b.title, subtitle: b.subtitle ?? "", body: b.body ?? "",
        link_url: b.link_url ?? "", link_label: b.link_label ?? "자세히 보기",
        accent: b.accent ?? "cyan",
        starts_at: toLocalInput(b.starts_at),
        ends_at: toLocalInput(b.ends_at),
        priority: b.priority ?? 0, active: b.active,
      });
      setEditing(b.id);
    };
    const cancel = () => { setEditing(null); setForm(blank()); };

    const save = async () => {
      if (!form.title.trim()) { ui.toast("제목을 입력해주세요", "오류"); return; }
      setBusy(true);
      const payload = {
        ...form,
        starts_at: fromLocalInput(form.starts_at),
        ends_at: form.ends_at ? fromLocalInput(form.ends_at) : null,
        priority: Number(form.priority) || 0,
      };
      try {
        if (editing === "new") await window.PF_API.admin.createBanner(payload);
        else await window.PF_API.admin.updateBanner(editing, payload);
        ui.toast("저장됐습니다", "공지");
        cancel();
        load();
      } catch (err) { ui.toast("저장 실패: " + (err.message || ""), "오류"); }
      finally { setBusy(false); }
    };

    const toggleActive = async (b) => {
      try {
        await window.PF_API.admin.updateBanner(b.id, { active: !b.active });
        load();
      } catch (err) { ui.toast("실패: " + (err.message || ""), "오류"); }
    };

    const remove = async (b) => {
      if (!confirm(`'${b.title}' 공지를 삭제할까요?`)) return;
      try {
        await window.PF_API.admin.deleteBanner(b.id);
        ui.toast("삭제됐습니다", "공지");
        load();
      } catch (err) { ui.toast("실패: " + (err.message || ""), "오류"); }
    };

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div className="kicker">// banners — 롤링/팝업 공지</div>
            <h2 style={{margin:"4px 0 0"}}>공지 관리</h2>
            <div style={{fontSize:13,color:"var(--ink-2)",marginTop:6}}>
              롤링 배너는 우상단에 자동 순환 표시, 팝업은 페이지 진입 시 1회 모달.
              연결 링크는 <span className="mono" style={{color:"var(--cyan)"}}>#board:prompts</span> 같은 내부 라우트나 외부 URL 모두 허용.
            </div>
          </div>
          <button className="btn btn-primary" onClick={startNew}>＋ 새 공지</button>
        </div>

        {editing && (
          <div className="pf-banner-form">
            <label><span className="lbl">유형</span>
              <select value={form.kind} onChange={(e) => setForm({...form, kind: e.target.value})}>
                <option value="rolling">롤링 배너 (우상단)</option>
                <option value="popup">팝업 (페이지 진입 시)</option>
              </select>
            </label>
            <label><span className="lbl">강조 컬러</span>
              <select value={form.accent} onChange={(e) => setForm({...form, accent: e.target.value})}>
                <option value="cyan">cyan</option>
                <option value="ember">ember</option>
                <option value="violet">violet</option>
                <option value="green">green</option>
                <option value="spark">spark</option>
              </select>
            </label>
            <label className="full"><span className="lbl">제목</span>
              <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="이주의 픽: 안개의 도서관" />
            </label>
            <label className="full"><span className="lbl">서브타이틀 (선택)</span>
              <input value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} placeholder="WK 18 · WEEKLY FORGE" />
            </label>
            <label className="full"><span className="lbl">본문 (선택)</span>
              <textarea value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} placeholder="4주간 GPT-4o로만 빌드한 텍스트 어드벤처. 분기 240+." />
            </label>
            <label><span className="lbl">연결 링크</span>
              <input value={form.link_url} onChange={(e) => setForm({...form, link_url: e.target.value})} placeholder="#board:prompts 또는 https://..." />
            </label>
            <label><span className="lbl">링크 텍스트</span>
              <input value={form.link_label} onChange={(e) => setForm({...form, link_label: e.target.value})} placeholder="자세히 보기" />
            </label>
            <label><span className="lbl">노출 시작</span>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({...form, starts_at: e.target.value})} />
            </label>
            <label><span className="lbl">노출 종료 (비우면 무기한)</span>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({...form, ends_at: e.target.value})} />
            </label>
            <label><span className="lbl">우선순위 (높을수록 먼저)</span>
              <input type="number" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} />
            </label>
            <label><span className="lbl">활성</span>
              <select value={String(form.active)} onChange={(e) => setForm({...form, active: e.target.value === "true"})}>
                <option value="true">노출</option>
                <option value="false">숨김</option>
              </select>
            </label>
            <div className="full" style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn btn-ghost" onClick={cancel} disabled={busy}>취소</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
            </div>
          </div>
        )}

        <div style={{border:"1px solid var(--line)",borderRadius:10,overflow:"hidden",background:"rgba(20,26,46,0.3)"}}>
          <div className="pf-banner-row head">
            <div>제목</div><div>유형</div><div>우선순위</div><div>노출 종료</div><div>상태</div><div>관리</div>
          </div>
          {loading ? (
            <div style={{padding:32,textAlign:"center",color:"var(--ink-3)"}}>불러오는 중…</div>
          ) : banners.length === 0 ? (
            <div style={{padding:32,textAlign:"center",color:"var(--ink-3)"}}>아직 등록된 공지가 없습니다.</div>
          ) : banners.map((b) => (
            <div key={b.id} className="pf-banner-row">
              <div>
                <div style={{fontWeight:500,color:"var(--ink-0)",marginBottom:2}}>{b.title}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",fontFamily:"JetBrains Mono, monospace"}}>{b.subtitle || "—"}</div>
              </div>
              <div style={{fontFamily:"JetBrains Mono, monospace",fontSize:11,color: b.kind === "rolling" ? "var(--cyan)" : "var(--ember)"}}>
                {b.kind === "rolling" ? "롤링" : "팝업"}
              </div>
              <div style={{fontFamily:"JetBrains Mono, monospace",fontSize:12}}>{b.priority}</div>
              <div style={{fontSize:11,color:"var(--ink-3)"}}>{b.ends_at ? new Date(b.ends_at).toLocaleDateString("ko-KR") : "무기한"}</div>
              <div>
                <button onClick={() => toggleActive(b)} style={{
                  padding:"3px 9px",fontSize:11,borderRadius:4,
                  background: b.active ? "rgba(110,231,160,0.12)" : "rgba(255,138,60,0.12)",
                  border: b.active ? "1px solid rgba(110,231,160,0.4)" : "1px solid rgba(255,138,60,0.4)",
                  color: b.active ? "var(--green)" : "var(--ember)",
                  cursor:"pointer", fontFamily:"JetBrains Mono, monospace"}}>
                  {b.active ? "● 노출" : "○ 숨김"}
                </button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11}} onClick={() => startEdit(b)}>편집</button>
                <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11,color:"var(--ember)"}} onClick={() => remove(b)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LiveKPI = () => {
    const [kpi, setKpi] = useState(null);
    const [err, setErr] = useState(null);
    const refresh = () => {
      window.PF_API.admin.overview()
        .then((d) => setKpi(d.kpi))
        .catch((e) => setErr(e.message || "fetch failed"));
    };
    useEffect(() => { refresh(); }, []);
    if (err) return (
      <div style={{padding:14,borderRadius:10,border:"1px solid var(--line)",background:"rgba(255,90,31,0.08)",marginBottom:18}}>
        <div className="kicker" style={{color:"var(--ember)"}}>// 라이브 데이터 로드 실패</div>
        <div style={{fontSize:13,color:"var(--ink-2)",marginTop:4}}>{err}</div>
      </div>
    );
    return (
      <div style={{padding:"14px 16px",borderRadius:10,border:"1px solid var(--line-strong)",background:"rgba(60,227,255,0.05)",marginBottom:18,display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
        <div className="kicker" style={{color:"var(--cyan)",margin:0}}>● LIVE · Supabase</div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",fontFamily:"JetBrains Mono, monospace",fontSize:13}}>
          <span><span style={{color:"var(--ink-3)"}}>users:</span> <span style={{color:"var(--ink-0)"}}>{kpi?.total_users ?? "…"}</span></span>
          <span><span style={{color:"var(--ink-3)"}}>posts:</span> <span style={{color:"var(--ink-0)"}}>{kpi?.total_posts ?? "…"}</span></span>
          <span><span style={{color:"var(--ink-3)"}}>studies:</span> <span style={{color:"var(--ink-0)"}}>{kpi?.total_studies ?? "…"}</span></span>
          <span><span style={{color:"var(--ink-3)"}}>subs:</span> <span style={{color:"var(--ink-0)"}}>{kpi?.total_subscribers ?? "…"}</span></span>
          <span><span style={{color:"var(--ink-3)"}}>logins/24h:</span> <span style={{color:"var(--green)"}}>{kpi?.logins_24h ?? "…"}</span></span>
        </div>
        <button className="btn btn-ghost" onClick={refresh} style={{marginLeft:"auto",padding:"4px 10px",fontSize:12}}>↻ 새로고침</button>
      </div>
    );
  };

  const OverviewTab = () => (
    <>
      <LiveKPI />
      {/* KPI grid (illustrative) */}
      <div className="admin-kpi-grid">
        {KPIS.map(k => (
          <div key={k.id} className="admin-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color: k.color}}>{typeof k.value === "number" ? k.value.toLocaleString() : k.value}</div>
            <div className="kpi-delta">
              <span style={{color: k.delta.startsWith("+") || k.delta.startsWith("↑") ? "var(--green)" : "var(--ember)"}}>{k.delta}</span>
              <span style={{color: "var(--ink-3)", marginLeft: 6}}>{k.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Time series */}
      <div className="admin-grid-2">
        <Card kicker="// signups" title="일일 가입자" action={<span className="mono dim">최근 30일</span>}>
          <Sparkline data={SERIES.signups} color="var(--ember)" height={120} />
          <div className="series-legend">
            <span>30일 합계 <b>{SERIES.signups.reduce((s,v)=>s+v,0).toLocaleString()}</b></span>
            <span>일평균 <b>{Math.round(SERIES.signups.reduce((s,v)=>s+v,0)/30).toLocaleString()}</b></span>
            <span>피크 <b>{Math.max(...SERIES.signups).toLocaleString()}</b></span>
          </div>
        </Card>
        <Card kicker="// dau" title="DAU 추이" action={<span className="mono dim">최근 30일</span>}>
          <Sparkline data={SERIES.dau} color="var(--cyan)" height={120} />
          <div className="series-legend">
            <span>30일 평균 <b>{Math.round(SERIES.dau.reduce((s,v)=>s+v,0)/30).toLocaleString()}</b></span>
            <span>피크 <b>{Math.max(...SERIES.dau).toLocaleString()}</b></span>
            <span>오늘 <b>{SERIES.dau[SERIES.dau.length-1].toLocaleString()}</b></span>
          </div>
        </Card>
        <Card kicker="// content" title="일일 게시글" action={<span className="mono dim">최근 30일</span>}>
          <Sparkline data={SERIES.posts} color="var(--violet)" height={120} />
          <div className="series-legend">
            <span>30일 합계 <b>{SERIES.posts.reduce((s,v)=>s+v,0).toLocaleString()}</b></span>
            <span>일평균 <b>{Math.round(SERIES.posts.reduce((s,v)=>s+v,0)/30).toLocaleString()}</b></span>
          </div>
        </Card>
        <Card kicker="// sessions" title="세션 수" action={<span className="mono dim">최근 30일</span>}>
          <Sparkline data={SERIES.sessions} color="var(--green)" height={120} />
          <div className="series-legend">
            <span>30일 합계 <b>{SERIES.sessions.reduce((s,v)=>s+v,0).toLocaleString()}</b></span>
            <span>일평균 <b>{Math.round(SERIES.sessions.reduce((s,v)=>s+v,0)/30).toLocaleString()}</b></span>
          </div>
        </Card>
      </div>

      {/* Funnel + Sources */}
      <div className="admin-grid-2">
        <Card kicker="// funnel" title="활성화 퍼널">
          <div className="funnel">
            {FUNNEL.map((f, i) => {
              const pct = (f.v / FUNNEL[0].v) * 100;
              const dropPct = i > 0 ? Math.round(((FUNNEL[i-1].v - f.v) / FUNNEL[i-1].v) * 100) : 0;
              return (
                <div key={i} className="funnel-row">
                  <div className="funnel-meta">
                    <div className="funnel-stage">{f.stage}</div>
                    <div className="funnel-num">{f.v.toLocaleString()} <span className="dim">· {pct.toFixed(1)}%</span></div>
                  </div>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{width: pct + "%"}}/>
                  </div>
                  {i > 0 && <div className="funnel-drop">↓ {dropPct}% 이탈</div>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card kicker="// traffic" title="유입 채널">
          <div style={{display: "flex", alignItems: "center", gap: 18}}>
            <Donut data={TRAFFIC_SOURCES} size={140}/>
            <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 8}}>
              {TRAFFIC_SOURCES.map((s, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12.5}}>
                  <span style={{width: 9, height: 9, borderRadius: 2, background: s.c, flexShrink: 0}}/>
                  <span style={{flex: 1, color: "var(--ink-1)"}}>{s.src}</span>
                  <span className="mono" style={{color: "var(--ink-0)", fontWeight: 600}}>{s.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  // Status pill
  const StatusPill = ({ status }) => {
    const map = {
      active:    { label: "활성",     c: "var(--green)" },
      warned:    { label: "경고",     c: "#ffd166" },
      suspended: { label: "정지",     c: "var(--ember)" },
      banned:    { label: "영구차단", c: "#ff4d6d" },
      withdrawn: { label: "탈퇴",     c: "var(--ink-3)" },
    };
    const m = map[status] || { label: status, c: "var(--ink-2)" };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "3px 9px", borderRadius: 4, fontSize: 11,
        fontFamily: "JetBrains Mono, monospace",
        background: `color-mix(in oklab, ${m.c} 12%, transparent)`,
        color: m.c, border: `1px solid color-mix(in oklab, ${m.c} 28%, transparent)`,
      }}>
        <span style={{width: 6, height: 6, borderRadius: "50%", background: m.c}}/>
        {m.label}
      </span>
    );
  };

  const RoleBadge = ({ roleId }) => {
    const r = ROLES.find(x => x.id === roleId) || ROLES[ROLES.length - 1];
    return (
      <span style={{
        display: "inline-block", padding: "3px 9px", borderRadius: 4,
        fontSize: 11, fontFamily: "JetBrains Mono, monospace",
        background: `color-mix(in oklab, ${r.color} 12%, transparent)`,
        color: r.color, border: `1px solid color-mix(in oklab, ${r.color} 30%, transparent)`,
      }}>{r.label}</span>
    );
  };

  // ─────────── User detail / edit drawer ───────────
  const UserDrawer = ({ user, onClose, onUpdate }) => {
    const ui = window.PF_UI.useUI();
    const [draft, setDraft] = useState({
      role: user.role,
      perms: new Set(ROLE_PERMS[user.role]),
      // tracks if user manually toggled (overrides role default)
      customPerms: false,
    });
    const [confirm, setConfirm] = useState(null); // {action, days?, reason?}

    const role = ROLES.find(r => r.id === draft.role);

    const togglePerm = (pid) => {
      setDraft(d => {
        const next = new Set(d.perms);
        next.has(pid) ? next.delete(pid) : next.add(pid);
        return { ...d, perms: next, customPerms: true };
      });
    };

    const setRole = (rid) => {
      setDraft({ role: rid, perms: new Set(ROLE_PERMS[rid]), customPerms: false });
    };

    const save = () => {
      onUpdate({ ...user, role: draft.role });
      ui.toast(`@${user.name} 의 역할을 '${ROLES.find(r=>r.id===draft.role).label}'(으)로 변경했습니다`, "역할 변경");
    };

    const doAction = (kind, payload) => {
      if (kind === "warn") {
        onUpdate({ ...user, status: "warned", reports: user.reports + 1 });
        ui.toast(`@${user.name} 에게 경고를 발송했습니다`, "경고");
      } else if (kind === "suspend") {
        onUpdate({ ...user, status: "suspended", lastActive: `정지 (${payload.days}일)` });
        ui.toast(`@${user.name} 을(를) ${payload.days}일간 정지했습니다 · 사유: ${payload.reason}`, "정지");
      } else if (kind === "ban") {
        onUpdate({ ...user, status: "banned", lastActive: "영구차단" });
        ui.toast(`@${user.name} 을(를) 영구 차단했습니다`, "차단");
      } else if (kind === "unban") {
        onUpdate({ ...user, status: "active", lastActive: "방금" });
        ui.toast(`@${user.name} 의 제재를 해제했습니다`, "해제");
      } else if (kind === "withdraw") {
        onUpdate({ ...user, status: "withdrawn", role: "guest", lastActive: "탈퇴 처리됨" });
        ui.toast(`@${user.name} 계정을 탈퇴 처리했습니다`, "탈퇴 처리");
      } else if (kind === "reset_pw") {
        ui.toast(`@${user.name} 에게 비밀번호 재설정 메일을 보냈습니다`, "비밀번호 재설정");
      }
      setConfirm(null);
      onClose();
    };

    const groups = [...new Set(PERMISSIONS.map(p => p.group))];

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal wide" style={{maxWidth: 760}} onClick={e => e.stopPropagation()}>
          <button className="x" onClick={onClose} aria-label="close">✕</button>

          {/* Header */}
          <div className="kicker">// users — 사용자 상세</div>
          <div style={{display: "flex", alignItems: "center", gap: 14, marginTop: 6, paddingBottom: 16, borderBottom: "1px solid var(--line)"}}>
            <div style={{width: 52, height: 52, borderRadius: 10, background: role.color, color: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 18}}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 19, fontWeight: 600, color: "var(--ink-0)"}}>
                {user.full !== "—" ? user.full : "(이름 미공개)"}
                <span style={{color: "var(--ember)", fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginLeft: 8, fontWeight: 400}}>@{user.name}</span>
              </div>
              <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: "var(--ink-3)", marginTop: 3}}>
                {user.email} · 가입 {user.joined} · 마지막 활동 {user.lastActive}
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end"}}>
              <StatusPill status={user.status}/>
              <RoleBadge roleId={user.role}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, margin: "16px 0"}}>
            {[
              { n: "게시글", v: user.posts, c: "var(--ember)" },
              { n: "신고 받음", v: user.reports, c: user.reports > 2 ? "#ff4d6d" : "var(--ink-2)" },
              { n: "가입일", v: user.joined.slice(5), c: "var(--cyan)" },
              { n: "최근 로그인", v: user.lastActive, c: "var(--violet)" },
            ].map((s, i) => (
              <div key={i} style={{padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
                <div className="mono" style={{fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase"}}>{s.n}</div>
                <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: s.c, marginTop: 2}}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Role */}
          <h4 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "var(--ink-0)", margin: "10px 0 8px"}}>역할 (Role)</h4>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10}}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                background: draft.role === r.id ? `color-mix(in oklab, ${r.color} 14%, transparent)` : "rgba(20,26,46,0.4)",
                border: "1px solid " + (draft.role === r.id ? r.color : "var(--line)"),
              }}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3}}>
                  <span style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: r.color, fontWeight: 600}}>{r.label}</span>
                  <span className="mono" style={{fontSize: 10, color: "var(--ink-3)"}}>L{r.rank}</span>
                </div>
                <div style={{fontSize: 11, color: "var(--ink-2)", lineHeight: 1.4}}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* Permissions */}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 8px"}}>
            <h4 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "var(--ink-0)", margin: 0}}>
              권한 (Permissions) <span style={{fontSize: 11, color: "var(--ink-3)", fontWeight: 400, marginLeft: 6}}>{draft.perms.size} / {PERMISSIONS.length}</span>
            </h4>
            {draft.customPerms && (
              <button className="btn-mini" onClick={() => setRole(draft.role)}>역할 기본값으로 리셋</button>
            )}
          </div>
          {groups.map(g => (
            <div key={g} style={{marginBottom: 10}}>
              <div className="mono" style={{fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6}}>{g}</div>
              <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6}}>
                {PERMISSIONS.filter(p => p.group === g).map(p => (
                  <label key={p.id} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(11,14,26,0.4)", cursor: "pointer", fontSize: 12.5}}>
                    <input type="checkbox" checked={draft.perms.has(p.id)} onChange={() => togglePerm(p.id)} style={{accentColor: "var(--cyan)"}}/>
                    <span style={{color: draft.perms.has(p.id) ? "var(--ink-0)" : "var(--ink-3)"}}>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <h4 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "var(--ink-0)", margin: "20px 0 8px"}}>관리 작업</h4>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8}}>
            <button className="btn btn-ghost" style={{justifyContent: "center"}} onClick={() => doAction("reset_pw")}>비밀번호 재설정</button>
            <button className="btn btn-ghost" style={{justifyContent: "center", color: "#ffd166"}} onClick={() => setConfirm({ kind: "warn" })}>⚠ 경고 발송</button>
            <button className="btn btn-ghost" style={{justifyContent: "center", color: "var(--ember)"}} onClick={() => setConfirm({ kind: "suspend", days: 7, reason: "" })}>⏸ 일시 정지</button>
            {user.status === "active" || user.status === "warned" ? (
              <button className="btn btn-ghost" style={{justifyContent: "center", color: "#ff4d6d"}} onClick={() => setConfirm({ kind: "ban", reason: "" })}>⛔ 영구 차단</button>
            ) : user.status !== "withdrawn" ? (
              <button className="btn btn-ghost" style={{justifyContent: "center", color: "var(--green)"}} onClick={() => setConfirm({ kind: "unban" })}>✓ 제재 해제</button>
            ) : (
              <button className="btn btn-ghost" style={{justifyContent: "center", opacity: 0.4}} disabled>탈퇴된 계정</button>
            )}
            <button className="btn btn-ghost" style={{justifyContent: "center", color: "#ff4d6d"}} onClick={() => setConfirm({ kind: "withdraw", reason: "" })} disabled={user.status === "withdrawn"}>✗ 탈퇴 처리</button>
            <button className="btn btn-ghost" style={{justifyContent: "center"}} onClick={() => ui.toast(`감사 로그: @${user.name}`, "로그")}>감사 로그 보기</button>
          </div>

          {/* Confirm panel */}
          {confirm && (
            <div style={{marginTop: 12, padding: 14, borderRadius: 10, border: "1px solid var(--ember)", background: "rgba(255,107,53,0.06)"}}>
              <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 600, color: "var(--ember)", marginBottom: 8}}>
                {confirm.kind === "warn"     && "경고를 발송하시겠습니까?"}
                {confirm.kind === "suspend"  && "사용자를 일시 정지하시겠습니까?"}
                {confirm.kind === "ban"      && "영구 차단하시겠습니까? (복구 불가)"}
                {confirm.kind === "unban"    && "제재를 해제하시겠습니까?"}
                {confirm.kind === "withdraw" && "계정을 탈퇴 처리하시겠습니까? (작성 글은 보존)"}
              </div>
              {confirm.kind === "suspend" && (
                <div style={{display: "flex", gap: 6, marginBottom: 10}}>
                  {[1, 3, 7, 14, 30].map(d => (
                    <button key={d} className="btn-mini" onClick={() => setConfirm({ ...confirm, days: d })}
                      style={{background: confirm.days === d ? "rgba(255,107,53,0.2)" : "transparent", borderColor: confirm.days === d ? "var(--ember)" : "var(--line)", color: confirm.days === d ? "var(--ember)" : "var(--ink-2)"}}>
                      {d}일
                    </button>
                  ))}
                </div>
              )}
              {(confirm.kind === "suspend" || confirm.kind === "ban" || confirm.kind === "withdraw") && (
                <textarea value={confirm.reason || ""} onChange={e => setConfirm({...confirm, reason: e.target.value})} placeholder="사유를 적어주세요... (감사 로그에 기록됩니다)" style={{
                  width: "100%", minHeight: 60, resize: "vertical", padding: 10,
                  background: "rgba(11,14,26,0.6)", border: "1px solid var(--line)", borderRadius: 6,
                  color: "var(--ink-0)", fontSize: 12.5, fontFamily: "IBM Plex Sans KR, sans-serif", marginBottom: 10,
                }}/>
              )}
              <div style={{display: "flex", gap: 8, justifyContent: "flex-end"}}>
                <button className="btn btn-ghost" onClick={() => setConfirm(null)}>취소</button>
                <button className="btn btn-primary" style={{background: confirm.kind === "ban" || confirm.kind === "withdraw" ? "#ff4d6d" : undefined}}
                  onClick={() => doAction(confirm.kind, confirm)}>
                  확인 실행
                </button>
              </div>
            </div>
          )}

          {/* Save role/perms */}
          <div className="actions" style={{marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)"}}>
            <button className="btn btn-ghost" onClick={onClose}>닫기</button>
            <button className="btn btn-primary" onClick={save} disabled={draft.role === user.role}>역할 변경 저장</button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────── UsersTab ───────────
  const UsersTab = () => {
    const ui = window.PF_UI.useUI();
    const [users, setUsers] = useState(MOCK_USERS);
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [q, setQ] = useState("");
    const [drawerUser, setDrawerUser] = useState(null);
    const [liveLoaded, setLiveLoaded] = useState(false);

    // Hydrate with live DB users (merged on top of mock seed for visual variety).
    useEffect(() => {
      window.PF_API.admin.users().then((res) => {
        if (!res?.users?.length) return;
        const liveUsers = res.users.map((u, i) => ({
          id: `live-${u.id}`,
          name: `@${u.username}`,
          full: u.nickname || u.username,
          email: u.email || "—",
          role: u.role === "admin" ? "admin" : "member",
          status: "active",
          posts: 0,
          comments: 0,
          karma: 0,
          joined: (u.created_at || "").slice(0, 10),
          lastActive: u.last_login_at ? new Date(u.last_login_at).toLocaleString("ko-KR") : "—",
          warnings: 0,
          customPerms: false,
          isLive: true,
        }));
        setUsers([...liveUsers, ...MOCK_USERS]);
        setLiveLoaded(true);
      }).catch(() => { /* keep mock-only */ });
    }, []);

    const updateUser = (u) => setUsers(prev => prev.map(x => x.id === u.id ? u : x));

    const filtered = users.filter(u => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (q && !(u.name.includes(q) || u.full.includes(q) || u.email.includes(q))) return false;
      return true;
    });

    const counts = {
      total: users.length,
      active: users.filter(u => u.status === "active").length,
      warned: users.filter(u => u.status === "warned").length,
      suspended: users.filter(u => u.status === "suspended").length,
      banned: users.filter(u => u.status === "banned").length,
      withdrawn: users.filter(u => u.status === "withdrawn").length,
    };

    return (
      <>
        {/* Status KPIs */}
        <div className="admin-kpi-grid" style={{gridTemplateColumns: "repeat(6, 1fr)"}}>
          {[
            { label: "전체",       v: counts.total,     c: "var(--ink-0)",  s: "all" },
            { label: "활성",       v: counts.active,    c: "var(--green)",  s: "active" },
            { label: "경고",       v: counts.warned,    c: "#ffd166",       s: "warned" },
            { label: "정지",       v: counts.suspended, c: "var(--ember)",  s: "suspended" },
            { label: "영구차단",   v: counts.banned,    c: "#ff4d6d",       s: "banned" },
            { label: "탈퇴",       v: counts.withdrawn, c: "var(--ink-3)",  s: "withdrawn" },
          ].map((k, i) => (
            <div key={i} className="admin-kpi" onClick={() => setStatusFilter(k.s)}
              style={{cursor: "pointer", outline: statusFilter === k.s ? `1px solid ${k.c}` : "none"}}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{color: k.c, fontSize: 22}}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="admin-grid-2">
          <Card kicker="// device" title="디바이스 분포">
            <Bars data={DEVICES.map(d => ({name: d.name, v: d.v}))} color="var(--cyan)" height={140} unit="%"/>
            <div className="series-legend">
              {DEVICES.map(d => <span key={d.name}>{d.name} <b>{d.v}%</b></span>)}
            </div>
          </Card>
          <Card kicker="// geo" title="지역 분포 (Top)">
            <div style={{display: "flex", flexDirection: "column", gap: 10}}>
              {[
                { name: "서울/경기", v: 64, c: "var(--ember)" },
                { name: "부산/경남", v: 11, c: "var(--cyan)" },
                { name: "대구/경북", v: 8, c: "var(--violet)" },
                { name: "기타 국내", v: 12, c: "var(--green)" },
                { name: "해외 (KR diaspora)", v: 5, c: "var(--ink-3)" },
              ].map((r, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: 10}}>
                  <span style={{width: 110, fontSize: 12.5, color: "var(--ink-1)"}}>{r.name}</span>
                  <div style={{flex: 1}}><HBar value={r.v} color={r.c}/></div>
                  <span className="mono" style={{width: 40, textAlign: "right", color: "var(--ink-0)", fontSize: 12, fontWeight: 600}}>{r.v}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* User management */}
        <Card kicker="// directory" title="사용자 관리"
          action={<span className="mono dim">{filtered.length} / {users.length} 명</span>}
          style={{marginTop: 16}}>

          {/* Filter bar */}
          <div style={{display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center"}}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="이름 / 핸들 / 이메일 검색..." style={{
              flex: 1, minWidth: 220, padding: "8px 12px", background: "rgba(11,14,26,0.6)",
              border: "1px solid var(--line)", borderRadius: 6, color: "var(--ink-0)",
              fontSize: 12.5, fontFamily: "JetBrains Mono, monospace",
            }}/>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
              padding: "8px 12px", background: "rgba(11,14,26,0.6)", border: "1px solid var(--line)",
              borderRadius: 6, color: "var(--ink-0)", fontSize: 12.5, fontFamily: "JetBrains Mono, monospace",
            }}>
              <option value="all">모든 역할</option>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
              padding: "8px 12px", background: "rgba(11,14,26,0.6)", border: "1px solid var(--line)",
              borderRadius: 6, color: "var(--ink-0)", fontSize: 12.5, fontFamily: "JetBrains Mono, monospace",
            }}>
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="warned">경고</option>
              <option value="suspended">정지</option>
              <option value="banned">영구차단</option>
              <option value="withdrawn">탈퇴</option>
            </select>
            <button className="btn btn-ghost" onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setQ(""); }}>초기화</button>
            <button className="btn btn-primary" onClick={() => ui.toast("필터된 결과 CSV로 내보내기", "Export")}>⇩ 내보내기</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>사용자</th><th>역할</th><th>상태</th>
                <th>게시글</th><th>신고</th><th>마지막 활동</th><th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{cursor: "pointer"}} onClick={() => setDrawerUser(u)}>
                  <td className="mono dim">#{u.id.toString().padStart(3, "0")}</td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <div style={{width: 28, height: 28, borderRadius: 6, background: (ROLES.find(r => r.id === u.role) || {}).color || "var(--ink-3)", color: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 11}}>
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize: 12.5, color: "var(--ember)", fontFamily: "JetBrains Mono, monospace"}}>@{u.name}</div>
                        <div style={{fontSize: 11, color: "var(--ink-3)"}}>{u.full !== "—" ? u.full : "(이름 미공개)"}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge roleId={u.role}/></td>
                  <td><StatusPill status={u.status}/></td>
                  <td className="mono">{u.posts}</td>
                  <td className="mono" style={{color: u.reports > 2 ? "#ff4d6d" : u.reports > 0 ? "#ffd166" : "var(--ink-3)"}}>{u.reports}</td>
                  <td className="mono dim">{u.lastActive}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn-mini" onClick={() => setDrawerUser(u)}>관리</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{textAlign: "center", padding: 24, color: "var(--ink-3)"}}>조건에 맞는 사용자가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Top contributors (existing) */}
        <Card kicker="// top contributors" title="기여도 상위 멤버" style={{marginTop: 16}}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>멤버</th><th>역할</th><th>기여도(주)</th><th>레퓨테이션</th><th>액션</th></tr>
            </thead>
            <tbody>
              {TOP_USERS.map((u, i) => (
                <tr key={i}>
                  <td className="mono dim">#{i + 1}</td>
                  <td><span style={{color: "var(--ember)", fontFamily: "JetBrains Mono, monospace"}}>@{u.name}</span></td>
                  <td><span className="chip">{u.badge}</span></td>
                  <td className="mono">{u.contrib}</td>
                  <td className="mono">{u.rep.toLocaleString()}</td>
                  <td>
                    <button className="btn-mini" onClick={() => {
                      const found = users.find(x => x.name === u.name);
                      if (found) setDrawerUser(found); else ui.toast(`@${u.name} 프로필`, "프로필");
                    }}>프로필</button>
                    <button className="btn-mini" style={{marginLeft: 6}} onClick={() => ui.toast(`@${u.name} 에게 메시지`, "DM")}>메시지</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {drawerUser && <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onUpdate={updateUser}/>}
      </>
    );
  };

  const ContentTab = () => (
    <>
      <div className="admin-kpi-grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
        {[
          { label: "전체 게시글", v: "8,941",  d: "+184",  c: "var(--ember)" },
          { label: "이번주 게시글", v: "184",   d: "+12.4%", c: "var(--cyan)" },
          { label: "전체 댓글",     v: "32,104", d: "+1.2k",  c: "var(--violet)" },
          { label: "이번주 좋아요",  v: "9,420",  d: "+18.1%", c: "var(--green)" },
        ].map((k, i) => (
          <div key={i} className="admin-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color: k.c}}>{k.v}</div>
            <div className="kpi-delta"><span style={{color: "var(--green)"}}>{k.d}</span><span style={{color: "var(--ink-3)", marginLeft: 6}}>이번주</span></div>
          </div>
        ))}
      </div>

      <Card kicker="// boards" title="보드별 활동" style={{marginTop: 16}}>
        <table className="admin-table">
          <thead>
            <tr><th>보드</th><th>게시글</th><th>조회수</th><th>참여율(%)</th><th>성장률</th><th>활동</th></tr>
          </thead>
          <tbody>
            {BOARD_STATS.map((b, i) => (
              <tr key={i}>
                <td>{b.name}</td>
                <td className="mono">{b.posts.toLocaleString()}</td>
                <td className="mono">{b.views.toLocaleString()}</td>
                <td className="mono">{b.engagement.toFixed(1)}%</td>
                <td className="mono" style={{color: "var(--green)"}}>{b.growth}</td>
                <td style={{minWidth: 120}}><HBar value={b.engagement * 8} color="var(--cyan)"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="admin-grid-2">
        <Card kicker="// top posts" title="이번주 인기 게시글">
          <div style={{display: "flex", flexDirection: "column", gap: 10}}>
            {TOP_POSTS.map((p, i) => (
              <div key={i} style={{padding: "10px 0", borderBottom: i < TOP_POSTS.length - 1 ? "1px solid var(--line)" : "none"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10}}>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13, fontWeight: 500, color: "var(--ink-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{p.title}</div>
                    <div className="mono" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 3}}>
                      {p.author} · {p.board} · 👁 {p.views.toLocaleString()} · ♥ {p.likes} · 💬 {p.comments}
                    </div>
                  </div>
                  <span className="mono dim" style={{flexShrink: 0}}>#{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card kicker="// tools" title="도구별 사용 비율">
          <div style={{display: "flex", flexDirection: "column", gap: 9}}>
            {TOOL_USAGE.map((t, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 10}}>
                <span style={{width: 110, fontSize: 12.5, color: "var(--ink-1)"}}>{t.name}</span>
                <div style={{flex: 1}}><HBar value={t.pct} color={i % 2 ? "var(--ember)" : "var(--cyan)"}/></div>
                <span className="mono" style={{width: 40, textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--ink-0)"}}>{t.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  // Pre-computed heatmap values (deterministic — based on day & hour)
  const HEATMAP_DATA = (() => {
    const days = ["월","화","수","목","금","토","일"];
    return days.map((day, di) => {
      return Array.from({length: 24}, (_, hi) => {
        const isPeak = (hi >= 19 && hi <= 23) || (di >= 5 && hi >= 13);
        // deterministic pseudo-random
        const seed = (di * 31 + hi * 7) % 100 / 100;
        const v = isPeak ? 0.55 + seed * 0.45 : 0.06 + seed * 0.38;
        // estimate sessions
        const baseSessions = 2400;
        const sessions = Math.round(baseSessions * v);
        return { v, sessions, day, hour: hi };
      });
    });
  })();

  const Heatmap = () => {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null);
    const days = ["월","화","수","목","금","토","일"];
    return (
      <div ref={wrapRef} style={{position: "relative", display: "flex", flexDirection: "column", gap: 3}}>
        {days.map((day, di) => (
          <div key={day} style={{display: "flex", gap: 3, alignItems: "center"}}>
            <span className="mono" style={{width: 18, fontSize: 10, color: "var(--ink-3)"}}>{day}</span>
            <div style={{flex: 1, display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2}}>
              {HEATMAP_DATA[di].map((cell, hi) => (
                <div key={hi}
                  onMouseEnter={(e) => {
                    const wrap = wrapRef.current.getBoundingClientRect();
                    const t = e.currentTarget.getBoundingClientRect();
                    setHover({ cell, x: t.left - wrap.left + t.width / 2, y: t.top - wrap.top });
                  }}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    aspectRatio: "1/1", background: `rgba(255,107,53,${cell.v})`,
                    borderRadius: 1.5, cursor: "pointer",
                    outline: hover && hover.cell === cell ? "1px solid var(--ember)" : "none",
                  }}/>
              ))}
            </div>
          </div>
        ))}
        <div style={{display: "flex", justifyContent: "space-between", marginTop: 4, paddingLeft: 21, fontSize: 10, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace"}}>
          <span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>23시</span>
        </div>
        {hover && (
          <ChartTooltip x={hover.x} y={hover.y} lines={[
            { label: `${hover.cell.day}요일 ${String(hover.cell.hour).padStart(2,"0")}:00` },
            { value: `${hover.cell.sessions.toLocaleString()} 세션`, c: "var(--ember)", bold: true },
            { value: `강도 ${Math.round(hover.cell.v * 100)}%`, c: "var(--ink-3)" },
          ]}/>
        )}
      </div>
    );
  };

  const EngagementTab = () => (
    <>
      <div className="admin-grid-2">
        <Card kicker="// retention" title="코호트 리텐션 (D1 / D7 / D30)">
          <div style={{display: "flex", flexDirection: "column", gap: 8, marginTop: 4}}>
            {[
              { week: "WK 18", d1: 62, d7: 42, d30: 28 },
              { week: "WK 17", d1: 64, d7: 41, d30: 27 },
              { week: "WK 16", d1: 58, d7: 39, d30: 26 },
              { week: "WK 15", d1: 60, d7: 38, d30: 24 },
              { week: "WK 14", d1: 55, d7: 36, d30: 23 },
            ].map((c, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12}}>
                <span className="mono" style={{width: 50, color: "var(--ink-3)"}}>{c.week}</span>
                <div style={{flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4}}>
                  <div className="cohort-cell" style={{background: `rgba(60,227,255,${c.d1/100})`}}>{c.d1}%</div>
                  <div className="cohort-cell" style={{background: `rgba(60,227,255,${c.d7/100})`}}>{c.d7}%</div>
                  <div className="cohort-cell" style={{background: `rgba(60,227,255,${c.d30/100})`}}>{c.d30}%</div>
                </div>
              </div>
            ))}
            <div style={{display: "grid", gridTemplateColumns: "50px 1fr 1fr 1fr", gap: 4, marginTop: 4, fontSize: 10, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace"}}>
              <span></span><span style={{textAlign: "center"}}>D1</span><span style={{textAlign: "center"}}>D7</span><span style={{textAlign: "center"}}>D30</span>
            </div>
          </div>
        </Card>

        <Card kicker="// session" title="시간대별 활동 히트맵">
          <Heatmap />
        </Card>
      </div>

      <div className="admin-grid-2">
        <Card kicker="// quality" title="콘텐츠 품질 지표">
          <div style={{display: "flex", flexDirection: "column", gap: 12}}>
            {[
              { label: "평균 좋아요/글", v: "12.4", c: "var(--ember)" },
              { label: "평균 댓글/글",   v: "3.6",  c: "var(--cyan)" },
              { label: "북마크/글",       v: "2.1",  c: "var(--violet)" },
              { label: "공유/글",         v: "0.8",  c: "var(--green)" },
              { label: "검증 프롬프트 비율", v: "18.4%", c: "var(--ember)" },
              { label: "스팸 자동 제거율", v: "98.7%", c: "var(--green)" },
            ].map((m, i) => (
              <div key={i} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(20,26,46,0.4)", borderRadius: 8, border: "1px solid var(--line)"}}>
                <span style={{fontSize: 13, color: "var(--ink-1)"}}>{m.label}</span>
                <span style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, color: m.c}}>{m.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card kicker="// search" title="인기 검색어 (이번주)">
          <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {[
              { q: "claude 시스템 프롬프트", n: 1840, t: "↑ 23%" },
              { q: "cursor composer",         n: 1240, t: "↑ 18%" },
              { q: "텍스트 어드벤처",          n: 982,  t: "↑ 14%" },
              { q: "godot llm",               n: 824,  t: "↑ 9%" },
              { q: "보스전 패턴",              n: 712,  t: "↑ 31%" },
              { q: "stable diffusion 게임",    n: 634,  t: "↓ 4%" },
              { q: "프롬프트 최적화",          n: 581,  t: "↑ 12%" },
              { q: "unity ai",                n: 514,  t: "↑ 7%" },
            ].map((s, i) => (
              <div key={i} style={{display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 7 ? "1px solid var(--line)" : "none", fontSize: 12.5}}>
                <span><span className="mono dim" style={{marginRight: 8}}>#{i+1}</span><span style={{color: "var(--ink-0)"}}>{s.q}</span></span>
                <span><span className="mono" style={{color: "var(--ink-3)", marginRight: 10}}>{s.n.toLocaleString()}</span><span className="mono" style={{color: s.t.startsWith("↑") ? "var(--green)" : "var(--ember)", fontSize: 11}}>{s.t}</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  const ModerationTab = () => (
    <>
      <div className="admin-kpi-grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
        {[
          { label: "대기 중인 신고",  v: "12", c: "var(--ember)" },
          { label: "오늘 처리",       v: "47", c: "var(--cyan)" },
          { label: "차단된 사용자",    v: "8",  c: "var(--violet)" },
          { label: "자동 감지 (24h)", v: "184", c: "var(--green)" },
        ].map((k, i) => (
          <div key={i} className="admin-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color: k.c}}>{k.v}</div>
            <div className="kpi-delta"><span style={{color: "var(--ink-3)"}}>최근 24시간</span></div>
          </div>
        ))}
      </div>

      <Card kicker="// reports" title="최근 신고" style={{marginTop: 16}}>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>유형</th><th>대상</th><th>신고자</th><th>시간</th><th>상태</th><th>액션</th></tr>
          </thead>
          <tbody>
            {RECENT_REPORTS.map((r, i) => (
              <tr key={i}>
                <td className="mono dim">{r.id}</td>
                <td><span className="chip" style={{color: r.type === "스팸" ? "var(--ember)" : r.type === "저작권" ? "var(--cyan)" : "var(--violet)"}}>{r.type}</span></td>
                <td className="mono">{r.target}</td>
                <td className="mono dim">{r.reporter}</td>
                <td className="mono dim">{r.when}</td>
                <td>
                  <span className="status-dot" style={{
                    background: r.status === "대기" ? "var(--ember)" : r.status === "검토중" ? "var(--cyan)" : "var(--green)"
                  }}/> {r.status}
                </td>
                <td>
                  <button className="btn-mini">검토</button>
                  <button className="btn-mini" style={{marginLeft: 6}}>처리</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="admin-grid-2">
        <Card kicker="// breakdown" title="신고 유형 분포">
          <div style={{display: "flex", alignItems: "center", gap: 18}}>
            <Donut data={[
              { src: "스팸", v: 48, c: "var(--ember)" },
              { src: "혐오 표현", v: 24, c: "var(--violet)" },
              { src: "저작권", v: 14, c: "var(--cyan)" },
              { src: "오프토픽", v: 8, c: "var(--green)" },
              { src: "기타", v: 6, c: "var(--ink-3)" },
            ]} size={140}/>
            <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 8}}>
              {[
                { src: "스팸", v: 48, c: "var(--ember)" },
                { src: "혐오 표현", v: 24, c: "var(--violet)" },
                { src: "저작권", v: 14, c: "var(--cyan)" },
                { src: "오프토픽", v: 8, c: "var(--green)" },
                { src: "기타", v: 6, c: "var(--ink-3)" },
              ].map((s, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12.5}}>
                  <span style={{width: 9, height: 9, borderRadius: 2, background: s.c, flexShrink: 0}}/>
                  <span style={{flex: 1, color: "var(--ink-1)"}}>{s.src}</span>
                  <span className="mono" style={{color: "var(--ink-0)", fontWeight: 600}}>{s.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card kicker="// queue" title="처리 시간 (평균)">
          <div style={{display: "flex", flexDirection: "column", gap: 12}}>
            {[
              { label: "최초 응답",       v: "14분", c: "var(--green)" },
              { label: "1차 검토 완료",  v: "2.4시간", c: "var(--cyan)" },
              { label: "최종 처리",       v: "8.1시간", c: "var(--ember)" },
              { label: "이의제기 처리",   v: "1.2일", c: "var(--violet)" },
            ].map((m, i) => (
              <div key={i} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(20,26,46,0.4)", borderRadius: 8, border: "1px solid var(--line)"}}>
                <span style={{fontSize: 13, color: "var(--ink-1)"}}>{m.label}</span>
                <span style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, color: m.c}}>{m.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  const SystemTab = () => (
    <>
      <div className="admin-kpi-grid" style={{gridTemplateColumns: "repeat(3, 1fr)"}}>
        {SYSTEM.slice(0, 6).map((s, i) => (
          <div key={i} className="admin-kpi">
            <div className="kpi-label">{s.name}</div>
            <div className="kpi-value" style={{color: s.ok ? "var(--green)" : "var(--ember)", fontSize: 22}}>
              <span className="status-dot" style={{background: s.ok ? "var(--green)" : "var(--ember)", marginRight: 8}}/>
              {s.v}
            </div>
            <div className="kpi-delta"><span style={{color: "var(--ink-3)"}}>{s.ok ? "정상" : "주의"} · 실시간</span></div>
          </div>
        ))}
      </div>

      <Card kicker="// audit log" title="감사 로그 (최근)" style={{marginTop: 16}}>
        <table className="admin-table">
          <thead>
            <tr><th>시간</th><th>관리자</th><th>액션</th><th>대상</th><th>IP</th></tr>
          </thead>
          <tbody>
            {[
              { t: "12:42:18", who: "@admin.lee",  what: "사용자 차단",       target: "@spam_user_42", ip: "211.108.x.x" },
              { t: "12:38:04", who: "@mod.kim",    what: "게시글 비공개",     target: "post #18420",   ip: "121.78.x.x" },
              { t: "12:31:51", who: "@admin.lee",  what: "신고 처리(보류)",   target: "R-2840",        ip: "211.108.x.x" },
              { t: "11:58:22", who: "system",     what: "자동 스팸 제거",    target: "post #18416",   ip: "auto" },
              { t: "11:42:09", who: "@mod.choi",   what: "배지 부여",         target: "@hyejin.kr",    ip: "175.214.x.x" },
              { t: "11:24:38", who: "@admin.lee",  what: "공지사항 게시",     target: "notice #042",   ip: "211.108.x.x" },
            ].map((row, i) => (
              <tr key={i}>
                <td className="mono dim">{row.t}</td>
                <td className="mono" style={{color: row.who === "system" ? "var(--ink-3)" : "var(--ember)"}}>{row.who}</td>
                <td>{row.what}</td>
                <td className="mono">{row.target}</td>
                <td className="mono dim">{row.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="admin-grid-2">
        <Card kicker="// infra" title="인프라 상태">
          <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {[
              { name: "API 서버 (3개)", status: "HEALTHY", v: "3/3 online" },
              { name: "DB Primary",     status: "HEALTHY", v: "rep lag 12ms" },
              { name: "Redis Cache",    status: "HEALTHY", v: "94.2% hit rate" },
              { name: "Object Storage", status: "HEALTHY", v: "284 GB used" },
              { name: "CDN",            status: "HEALTHY", v: "p95 84ms" },
              { name: "Search Index",   status: "WARNING", v: "rebuild in 2h" },
            ].map((s, i) => (
              <div key={i} style={{display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "rgba(20,26,46,0.4)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5}}>
                <span>{s.name}</span>
                <span><span className="status-dot" style={{background: s.status === "HEALTHY" ? "var(--green)" : "var(--ember)"}}/> <span className="mono dim">{s.v}</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card kicker="// errors" title="최근 에러 (24h)">
          <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {[
              { code: "500", path: "/api/posts/:id/like", count: 4, last: "32분 전" },
              { code: "503", path: "/api/search",         count: 2, last: "1시간 전" },
              { code: "404", path: "/api/users/:id",      count: 18, last: "방금" },
              { code: "429", path: "/api/comments",       count: 7, last: "12분 전" },
            ].map((e, i) => (
              <div key={i} style={{display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "rgba(20,26,46,0.4)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5}}>
                <span><span className="mono" style={{color: e.code.startsWith("5") ? "var(--ember)" : e.code.startsWith("4") ? "var(--cyan)" : "var(--ink-1)", marginRight: 8, fontWeight: 600}}>{e.code}</span><span className="mono">{e.path}</span></span>
                <span className="mono dim">{e.count}회 · {e.last}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  return { AdminPage };
})();

window.PF_ADMIN = PF_ADMIN;
