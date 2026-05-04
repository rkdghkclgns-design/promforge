/* PromForge — Info / Footer / Resource modals */

const PF_INFO = (() => {
  const { useState } = React;
  const useUI = () => window.PF_UI.useUI();

  // ─────────── Helpers ───────────
  const SectionHead = ({ kicker, title, sub }) => (
    <>
      <div className="kicker">{kicker}</div>
      <h2>{title}</h2>
      {sub && <p className="lede">{sub}</p>}
    </>
  );

  const StatRow = ({ items }) => (
    <div style={{display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, marginBottom: 16}}>
      {items.map((s, i) => (
        <div key={i} style={{padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
          <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase"}}>{s.n}</div>
          <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 600, marginTop: 2, color: s.c || "var(--ember)"}}>{s.v}</div>
        </div>
      ))}
    </div>
  );

  const Tag = ({ children, color = "var(--cyan)" }) => (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      background: `color-mix(in oklab, ${color} 10%, transparent)`,
      border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
      color,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 10.5,
      letterSpacing: "0.04em",
      marginRight: 4,
      marginBottom: 4,
    }}>{children}</span>
  );

  const ListRow = ({ title, sub, right, onClick }) => (
    <div onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid var(--line)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 14, fontWeight: 500, color: "var(--ink-0)"}}>{title}</div>
        {sub && <div style={{fontSize: 12, color: "var(--ink-3)", marginTop: 3, fontFamily: "JetBrains Mono, monospace"}}>{sub}</div>}
      </div>
      {right && <div style={{flexShrink: 0, marginLeft: 12}}>{right}</div>}
    </div>
  );

  // ────────────────────── 게임잼 ──────────────────────
  const JamModal = () => {
    const ui = useUI();
    const jams = [
      { slug: "weekly-18",        name: "포지 위클리잼 #18 — 'Cozy AI'",     status: "● 진행중",  statusColor: "var(--cyan)",  end: "10/14 23:59",   teams: 24, prize: "Anthropic 크레딧 $200", open: true },
      { slug: "claude-code-2026", name: "Claude Code 게임잼 2026 가을",      status: "○ 모집중",  statusColor: "var(--ember)", end: "11/01 시작",    teams: 92, prize: "총 상금 ₩5,000,000",     open: true },
      { slug: "solo-48h",         name: "Solo Dev 48h 챌린지",                status: "○ 다음달",  statusColor: "var(--violet)", end: "12/12 시작",    teams: 0,  prize: "굿즈 + 인터뷰",         open: true },
      { slug: "folktale",         name: "Korean Folktale Jam",                status: "✓ 종료",    statusColor: "var(--ink-3)", end: "9/22 종료",     teams: 47, prize: "₩2,000,000 분배 완료",   open: false },
      { slug: "pixel-art",        name: "GPT × Pixel Art 미니잼",             status: "✓ 종료",    statusColor: "var(--ink-3)", end: "8/30 종료",     teams: 31, prize: "Steam 키 30장",          open: false },
    ];
    const themes = ["Cozy AI", "1-bit Aesthetic", "한국 설화", "1-Button", "AI 협력 NPC", "Sound-only"];
    const [signed, setSigned] = useState(new Set());
    const apply = async (jam) => {
      if (!jam.open) { ui.toast("이미 종료된 잼입니다", "알림"); return; }
      try {
        await window.PF_API.jamSignup({ jamSlug: jam.slug });
        setSigned((s) => new Set([...s, jam.slug]));
        ui.toast(`'${jam.name}' 신청 완료`, "참여");
      } catch (err) {
        if (err?.data?.error === "login_required") { ui.open("login"); }
        else ui.toast("신청 실패: " + (err.message || "오류"), "오류");
      }
    };
    return (
      <>
        <SectionHead kicker="// jam — 게임잼 허브" title="게임잼" sub="2~7일 동안 빠르게 만들고, 함께 플레이하고, 피드백을 주고받는 단기 챌린지." />
        <StatRow items={[
          { n: "이번달 잼", v: "3", c: "var(--cyan)" },
          { n: "참여팀 누적", v: "412", c: "var(--ember)" },
          { n: "출시 게임", v: "186", c: "var(--violet)" },
          { n: "다음 잼까지", v: "4d 12h", c: "var(--green)" },
        ]} />
        <h3 style={{fontSize: 13, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "10px 0 8px", fontFamily: "JetBrains Mono, monospace"}}>예정 / 진행중</h3>
        {jams.map((j, i) => (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--line)"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:500,color:"var(--ink-0)"}}>{j.name}</div>
              <div style={{fontSize:12,color:"var(--ink-3)",marginTop:3,fontFamily:"JetBrains Mono, monospace"}}>{j.teams ? j.teams + "팀 · " : ""}{j.prize}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
              <div style={{fontFamily:"JetBrains Mono, monospace",fontSize:11,color:j.statusColor}}>{j.status}</div>
              <div style={{fontSize:11,color:"var(--ink-3)",marginTop:2,marginBottom:6}}>{j.end}</div>
              {j.open && (
                <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11}}
                        disabled={signed.has(j.slug)}
                        onClick={() => apply(j)}>
                  {signed.has(j.slug) ? "✓ 신청완료" : "참가신청"}
                </button>
              )}
            </div>
          </div>
        ))}
        <h3 style={{fontSize: 13, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 8px", fontFamily: "JetBrains Mono, monospace"}}>최근 테마</h3>
        <div style={{marginBottom: 16}}>{themes.map((t, i) => <Tag key={i} color={i % 2 ? "var(--ember)" : "var(--cyan)"}>#{t}</Tag>)}</div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
        </div>
      </>
    );
  };

  // ────────────────────── 프롬프트 라이브러리 ──────────────────────
  const LibraryModal = () => {
    const ui = useUI();
    const [tab, setTab] = useState("all");
    const items = [
      { name: "Roguelike Dungeon DM v3",          tool: "Claude",   tokens: 4096, downloads: 3421, verified: true,  cat: "narrative" },
      { name: "한국어 RPG 마스터 페르소나",         tool: "GPT-4o",   tokens: 2840, downloads: 2890, verified: true,  cat: "narrative" },
      { name: "보스전 패턴 5종 (JSON spec)",        tool: "Cursor",   tokens: 1920, downloads: 2104, verified: true,  cat: "mechanics" },
      { name: "타일맵 자동 생성 워크플로",         tool: "Claude",   tokens: 3210, downloads: 1987, verified: true,  cat: "art" },
      { name: "픽셀 아트 캐릭터 배치 시스템",      tool: "GPT-4o",   tokens: 2480, downloads: 1842, verified: false, cat: "art" },
      { name: "절차적 퀘스트 생성기 v2",            tool: "Claude",   tokens: 5120, downloads: 1620, verified: true,  cat: "narrative" },
      { name: "사운드 디렉터 페르소나",             tool: "GPT-4o",   tokens: 1840, downloads: 1340, verified: false, cat: "audio" },
      { name: "Unity C# 보일러플레이트 생성",      tool: "Cursor",   tokens: 2240, downloads: 1280, verified: true,  cat: "code" },
      { name: "분기 시나리오 트리 빌더",            tool: "Claude",   tokens: 3680, downloads: 1120, verified: true,  cat: "narrative" },
      { name: "Stable Diffusion LoRA 트레이닝 가이드", tool: "SD",   tokens: 1280, downloads: 980,  verified: false, cat: "art" },
    ];
    const cats = [
      { id: "all",       label: "전체" },
      { id: "narrative", label: "내러티브" },
      { id: "mechanics", label: "메카닉" },
      { id: "art",       label: "아트" },
      { id: "audio",     label: "오디오" },
      { id: "code",      label: "코드" },
    ];
    const filtered = tab === "all" ? items : items.filter(i => i.cat === tab);
    return (
      <>
        <SectionHead kicker="// library — 검증된 프롬프트" title="프롬프트 라이브러리" sub="커뮤니티 멤버 12+가 직접 테스트한 프롬프트만 모았습니다. 모두 CC-BY 4.0." />
        <StatRow items={[
          { n: "전체 프롬프트", v: "184", c: "var(--ember)" },
          { n: "검증됨", v: "92", c: "var(--green)" },
          { n: "이번주 신규", v: "12", c: "var(--cyan)" },
        ]} />
        <div style={{display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 12, overflowX: "auto"}}>
          {cats.map(c => (
            <button key={c.id} onClick={() => setTab(c.id)} style={{
              padding: "9px 14px", fontSize: 12.5, background: "transparent", border: "none",
              color: tab === c.id ? "var(--ink-0)" : "var(--ink-2)",
              borderBottom: "2px solid " + (tab === c.id ? "var(--cyan)" : "transparent"),
              marginBottom: -1, cursor: "pointer", whiteSpace: "nowrap",
            }}>{c.label}</button>
          ))}
        </div>
        <div style={{maxHeight: 320, overflowY: "auto"}}>
          {filtered.map((p, i) => (
            <ListRow key={i}
              title={<>{p.name} {p.verified && <span style={{color: "var(--green)", fontFamily: "JetBrains Mono, monospace", fontSize: 11, marginLeft: 6}}>✓ 검증</span>}</>}
              sub={`${p.tool} · ${p.tokens.toLocaleString()} tok · ⇩ ${p.downloads.toLocaleString()}`}
              right={<button className="btn-mini" onClick={(e) => { e.stopPropagation(); ui.toast(`'${p.name}' 다운로드 시작`, "다운로드"); }}>⇩ 받기</button>}
              onClick={() => ui.toast(`'${p.name}' 상세 보기`, "프롬프트")} />
          ))}
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
          <button className="btn btn-primary" onClick={() => { ui.close(); ui.open("newpost"); }}>내 프롬프트 기여하기</button>
        </div>
      </>
    );
  };

  // ────────────────────── 툴 비교 가이드 ──────────────────────
  const ToolGuideModal = () => {
    const ui = useUI();
    const tools = [
      { name: "Claude",      strength: "긴 문맥, 일관된 톤",      weak: "이미지 생성 X",        best: "내러티브 / 시나리오",  price: "Pro $20/mo",  rating: 4.8 },
      { name: "GPT-4o",      strength: "범용, 멀티모달",          weak: "긴 문맥에서 일관성",   best: "범용 / 빠른 프로토",   price: "Plus $20/mo", rating: 4.6 },
      { name: "Cursor",      strength: "코드 컨텍스트, Composer", weak: "에디터 의존",          best: "엔진 코드 생성",       price: "Pro $20/mo",  rating: 4.7 },
      { name: "Stable Diff", strength: "LoRA 자유, 로컬 가능",    weak: "초기 셋업 어려움",     best: "스프라이트 / 배경",   price: "무료",         rating: 4.4 },
      { name: "Midjourney",  strength: "퀄리티, 스타일",          weak: "스타일 재현 어려움",   best: "콘셉트 / 키비주얼",   price: "$10~$60/mo",   rating: 4.5 },
      { name: "Suno",        strength: "음악 생성, 가사 지원",   weak: "사용권 제한",          best: "BGM / 짧은 트랙",     price: "Pro $10/mo",   rating: 4.2 },
    ];
    return (
      <>
        <SectionHead kicker="// guide — AI 툴 비교" title="툴 비교 가이드" sub="2026년 가을 기준, 한국 메이커 384명이 평가한 결과를 종합했습니다." />
        <table style={{width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 14}}>
          <thead>
            <tr style={{borderBottom: "1px solid var(--line)"}}>
              <th style={{textAlign: "left", padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase"}}>툴</th>
              <th style={{textAlign: "left", padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase"}}>강점</th>
              <th style={{textAlign: "left", padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase"}}>적합</th>
              <th style={{textAlign: "right", padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase"}}>가격</th>
              <th style={{textAlign: "right", padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase"}}>★</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t, i) => (
              <tr key={i} style={{borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer"}} onClick={() => ui.toast(`'${t.name}' 상세 비교`, "툴")}>
                <td style={{padding: "11px 8px", color: "var(--ember)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600}}>{t.name}</td>
                <td style={{padding: "11px 8px", color: "var(--ink-1)"}}>{t.strength}</td>
                <td style={{padding: "11px 8px", color: "var(--ink-2)"}}>{t.best}</td>
                <td style={{padding: "11px 8px", textAlign: "right", color: "var(--ink-2)", fontFamily: "JetBrains Mono, monospace"}}>{t.price}</td>
                <td style={{padding: "11px 8px", textAlign: "right", color: "var(--cyan)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600}}>{t.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions">
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
          <button className="btn btn-primary" onClick={() => ui.toast("PDF 가이드 다운로드 시작", "다운로드")}>전체 가이드 PDF</button>
        </div>
      </>
    );
  };

  // ────────────────────── 출시 체크리스트 ──────────────────────
  const ChecklistModal = () => {
    const ui = useUI();
    const STORAGE_KEY = "pf_launch_checklist";
    const [done, setDone] = useState(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return new Set(JSON.parse(raw));
      } catch { /* noop */ }
      return new Set();
    });
    React.useEffect(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...done])); } catch { /* noop */ }
    }, [done]);
    const sections = [
      { name: "PRE-PRODUCTION", items: [
        { id: 0, t: "장르/톤/타깃 정의서 작성" },
        { id: 1, t: "AI 툴 스택 결정 (프롬프트/코드/아트/사운드)" },
        { id: 2, t: "최소 플레이어블 정의 (1주)" },
      ]},
      { name: "PRODUCTION", items: [
        { id: 3, t: "코어 루프 검증 (5명 이상 플레이테스트)" },
        { id: 4, t: "프롬프트 라이브러리 정리 + 버전 관리" },
        { id: 5, t: "에셋 라이선스 확인 (AI 생성물 포함)" },
        { id: 6, t: "한국어/영어 텍스트 분리" },
      ]},
      { name: "PRE-LAUNCH", items: [
        { id: 7, t: "트레일러 30초컷 제작" },
        { id: 8, t: "Steam 페이지 등록 (출시 4주 전)" },
        { id: 9, t: "PromForge 쇼케이스 등록" },
        { id: 10, t: "한국어 커뮤니티 시드 (Discord, X, 인디씬)" },
      ]},
      { name: "LAUNCH & POST", items: [
        { id: 11, t: "출시일 D-day 체크 (서버, 스토어 가격)" },
        { id: 12, t: "출시 후 1주 핫픽스 윈도우 확보" },
        { id: 13, t: "포스트모템 글 PromForge에 공유" },
      ]},
    ];
    const total = sections.reduce((s, x) => s + x.items.length, 0);
    const pct = Math.round((done.size / total) * 100);
    const toggle = (id) => setDone(d => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });
    return (
      <>
        <SectionHead kicker="// checklist — 인디 출시 체크" title="출시 체크리스트" sub="아이디어부터 포스트모템까지. 한국 메이커 27명의 실전 경험을 종합한 14단계." />
        <div style={{padding: "14px 16px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)", marginBottom: 16}}>
          <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
            <span style={{fontSize: 12.5, color: "var(--ink-2)"}}>진행률</span>
            <span style={{fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: "var(--cyan)"}}>{done.size} / {total} ({pct}%)</span>
          </div>
          <div style={{height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden"}}>
            <div style={{height: "100%", width: pct + "%", background: "linear-gradient(90deg, var(--cyan), var(--ember))", transition: "width 400ms"}}/>
          </div>
        </div>
        <div style={{maxHeight: 320, overflowY: "auto"}}>
          {sections.map((sec, i) => (
            <div key={i} style={{marginBottom: 14}}>
              <h4 style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ember)", letterSpacing: "0.08em", margin: "0 0 8px"}}>// {sec.name}</h4>
              {sec.items.map(it => (
                <label key={it.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)"}}>
                  <input type="checkbox" checked={done.has(it.id)} onChange={() => toggle(it.id)} style={{accentColor: "var(--cyan)"}}/>
                  <span style={{fontSize: 13, color: done.has(it.id) ? "var(--ink-3)" : "var(--ink-0)", textDecoration: done.has(it.id) ? "line-through" : "none"}}>{it.t}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={() => { setDone(new Set()); ui.toast("체크리스트가 초기화됐습니다", "초기화"); }}>초기화</button>
          <button className="btn btn-primary" onClick={() => { ui.close(); ui.toast(`${done.size}/${total} 항목 자동 저장됨 (브라우저)`, "저장"); }}>닫기</button>
        </div>
      </>
    );
  };

  // ────────────────────── 멘토 디렉토리 ──────────────────────
  const MentorsModal = () => {
    const ui = useUI();
    const FALLBACK = [
      { name: "이도현", handle: "@dohyun.dev",      area: "Unity / 시스템 디자인",      years: 11, rate: "₩80k/h",  spots: 2, avatar: "DH", color: "var(--cyan)" },
      { name: "박혜진", handle: "@hyejin.kr",        area: "내러티브 / 분기 설계",       years: 7,  rate: "₩60k/h",  spots: 1, avatar: "HJ", color: "var(--ember)" },
      { name: "최승민", handle: "@soundlab.choi",   area: "사운드 / Suno 워크플로",    years: 9,  rate: "₩70k/h",  spots: 0, avatar: "SC", color: "var(--violet)" },
      { name: "한지영", handle: "@studio.han",      area: "팀 빌딩 / 출시 PM",         years: 14, rate: "₩100k/h", spots: 1, avatar: "JY", color: "var(--green)" },
      { name: "민수아", handle: "@art.minji",        area: "픽셀 / Stable Diffusion",   years: 6,  rate: "₩55k/h",  spots: 3, avatar: "MS", color: "var(--ember)" },
      { name: "윤재호", handle: "@dev_yoon",         area: "Cursor 자동화 / DevOps",   years: 8,  rate: "₩75k/h",  spots: 2, avatar: "JH", color: "var(--cyan)" },
    ];
    const [mentors, setMentors] = useState(FALLBACK);
    React.useEffect(() => {
      window.PF_API.mentors().then((res) => {
        if (!res?.mentors?.length) return;
        const colors = ["var(--cyan)","var(--ember)","var(--violet)","var(--green)"];
        const live = res.mentors.map((m, i) => ({
          name: m.nickname || m.username,
          handle: "@" + m.username,
          area: m.role_label,
          years: 0,
          rate: "무료 매칭",
          spots: 3,
          avatar: (m.nickname || m.username).slice(0, 2).toUpperCase(),
          color: colors[i % colors.length],
          since: m.since,
        }));
        // Live mentors first, then fallback (until directory grows)
        setMentors([...live, ...FALLBACK]);
      }).catch(() => { /* keep fallback */ });
    }, []);
    return (
      <>
        <SectionHead kicker="// mentors — 1:1 멘토" title="멘토 디렉토리" sub="3년 이상 출시 경험이 있는 메이커들이 짧게 도와줍니다. 첫 30분은 무료 매칭." />
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 360, overflowY: "auto"}}>
          {mentors.map((m, i) => (
            <div key={i} style={{padding: "14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
              <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 10}}>
                <div style={{width: 38, height: 38, borderRadius: 8, background: m.color, color: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 13}}>{m.avatar}</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--ink-0)"}}>{m.name}</div>
                  <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-3)"}}>{m.handle}</div>
                </div>
              </div>
              <div style={{fontSize: 12, color: "var(--ink-1)", marginBottom: 6}}>{m.area}</div>
              <div style={{display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-3)"}}>
                <span>{m.years}년차 · {m.rate}</span>
                <span style={{color: m.spots > 0 ? "var(--green)" : "var(--ember)"}}>{m.spots > 0 ? `${m.spots}자리` : "마감"}</span>
              </div>
              <button className="btn btn-ghost" style={{width: "100%", marginTop: 10, padding: "6px"}} disabled={m.spots === 0}
                onClick={() => ui.toast(m.spots > 0 ? `${m.name} 멘토에게 신청 보냄` : "마감", "멘토")}>
                {m.spots > 0 ? "신청하기" : "대기열 등록"}
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ────────────────────── 소개 ──────────────────────
  const AboutModal = () => {
    const ui = useUI();
    return (
      <>
        <SectionHead kicker="// about — PromForge 소개" title="우리는 왜 모였나" />
        <p className="body-text">
          AI는 게임을 빠르게 만들 수 있게 해줬지만, 한국어 메이커들이 모일 곳은 흩어져 있었습니다.
          PromForge는 프롬프트 · 코드 · 사람을 한 작업장에 모으기 위해 2026년 봄 시작됐습니다.
        </p>
        <h3 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 16, marginTop: 18, marginBottom: 8, color: "var(--ink-0)"}}>지표</h3>
        <StatRow items={[
          { n: "운영 시작", v: "2026.03", c: "var(--ember)" },
          { n: "활성 멤버", v: "14.8k", c: "var(--cyan)" },
          { n: "출시 게임", v: "186", c: "var(--violet)" },
          { n: "주간 잼 누적", v: "32회", c: "var(--green)" },
        ]} />
        <h3 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 16, marginTop: 18, marginBottom: 8, color: "var(--ink-0)"}}>핵심 원칙</h3>
        <ul style={{paddingLeft: 18, color: "var(--ink-1)", fontSize: 14, lineHeight: 1.7}}>
          <li><b style={{color: "var(--ember)"}}>공유는 검증으로.</b> 프롬프트는 12명 이상 테스트 후 라이브러리에 등록</li>
          <li><b style={{color: "var(--ember)"}}>표절 대신 영감.</b> 모든 자료는 CC-BY 4.0 또는 출처 명시</li>
          <li><b style={{color: "var(--ember)"}}>출시까지 함께.</b> 아이디어가 아니라 셰이프된 게임이 나오는 곳</li>
          <li><b style={{color: "var(--ember)"}}>한국어 우선.</b> 한국어 메이커가 한국어로 일하는 환경 보호</li>
        </ul>
        <h3 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 16, marginTop: 18, marginBottom: 8, color: "var(--ink-0)"}}>운영팀</h3>
        <div style={{fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, fontFamily: "JetBrains Mono, monospace"}}>
          @studio.han · @dohyun.dev · @hyejin.kr · @dev_yoon · 그리고 자원봉사 모더레이터 12명
        </div>
        <div className="actions" style={{marginTop: 18}}>
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
          <button className="btn btn-primary" onClick={() => { ui.close(); ui.open("signup"); }}>가입하고 합류하기</button>
        </div>
      </>
    );
  };

  // ────────────────────── 행동강령 ──────────────────────
  const ConductModal = () => {
    const ui = useUI();
    return (
      <>
        <SectionHead kicker="// code of conduct — 행동강령 v1.2" title="행동강령" sub="모두가 안전하게 작업할 수 있도록. 위반은 1차 경고 → 2차 7일 제한 → 3차 영구 차단." />
        <div style={{display: "flex", flexDirection: "column", gap: 12, marginBottom: 16}}>
          {[
            { k: "01", t: "존중", d: "정체성, 배경, 경험 수준에 관계없이 서로를 존중합니다. 인신공격, 차별 발언은 즉시 제재." },
            { k: "02", t: "기여 정직", d: "AI가 만든 부분과 직접 만든 부분을 구분해 표기합니다. 표절 / 무단 도용 금지." },
            { k: "03", t: "프롬프트 출처", d: "다른 사람의 프롬프트를 가져올 땐 원작자 표기. 라이선스(CC-BY 등) 준수." },
            { k: "04", t: "스팸 / 홍보 제한", d: "자기 게임 홍보는 쇼케이스에. 다른 사용자에게 직접 광고 메시지 금지." },
            { k: "05", t: "안전한 콘텐츠", d: "성적 콘텐츠, 폭력 미화, 불법 주제는 게시 금지. 미성년자 보호 우선." },
            { k: "06", t: "신고는 익명", d: "신고자는 보호됩니다. 보복성 행위 발견 시 즉시 영구 차단." },
          ].map((r, i) => (
            <div key={i} style={{display: "flex", gap: 14, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
              <span style={{fontFamily: "JetBrains Mono, monospace", fontSize: 18, color: "var(--ember)", fontWeight: 600}}>{r.k}</span>
              <div>
                <div style={{fontSize: 14, fontWeight: 600, color: "var(--ink-0)", marginBottom: 4}}>{r.t}</div>
                <div style={{fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55}}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding: 12, borderRadius: 8, background: "rgba(255,138,60,0.06)", border: "1px solid rgba(255,138,60,0.2)", fontSize: 12.5, color: "var(--ink-1)"}}>
          위반 발견 시 → <b style={{color: "var(--ember)"}}>report@promforge.kr</b> 또는 게시글 내 신고 버튼
        </div>
        <div className="actions" style={{marginTop: 16}}>
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
          <button className="btn btn-primary" onClick={() => ui.toast("행동강령 동의 완료", "동의")}>읽고 동의함</button>
        </div>
      </>
    );
  };

  // ────────────────────── 문의 ──────────────────────
  const ContactModal = () => {
    const ui = useUI();
    const [form, setForm] = useState({ category: "general", subject: "", message: "", name: "", email: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const types = [
      { id: "general",     label: "일반 문의" },
      { id: "bug",         label: "버그 제보" },
      { id: "partnership", label: "파트너십" },
      { id: "press",       label: "취재 / 인터뷰" },
      { id: "other",       label: "기타" },
    ];
    const submit = async () => {
      setError(null);
      if (!form.subject.trim() || !form.message.trim()) { setError("제목과 내용을 입력해주세요."); return; }
      setBusy(true);
      try {
        await window.PF_API.contact(form);
        ui.close();
        ui.toast("문의가 접수됐습니다 · 24시간 내 회신", "문의");
      } catch (err) {
        setError("전송 실패: " + (err.message || "오류"));
      } finally { setBusy(false); }
    };
    return (
      <>
        <SectionHead kicker="// contact — 문의" title="문의하기" sub="모든 문의는 DB에 안전하게 기록됩니다. 평일 24시간 내 회신." />
        <div style={{marginBottom: 14}}>
          <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8}}>유형</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            {types.map(t => (
              <button key={t.id} onClick={() => setForm({...form, category: t.id})} style={{
                padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                background: form.category === t.id ? "rgba(60,227,255,0.12)" : "transparent",
                border: "1px solid " + (form.category === t.id ? "rgba(60,227,255,0.4)" : "var(--line)"),
                color: form.category === t.id ? "var(--cyan)" : "var(--ink-2)",
                fontFamily: "JetBrains Mono, monospace",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <label className="field" style={{margin:0}}><label>이름 (선택)</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="홍길동" /></label>
          <label className="field" style={{margin:0}}><label>이메일 (회신 받을 곳)</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@studio.com" /></label>
        </div>
        <label className="field"><label>제목</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="간단한 제목" maxLength={200} /></label>
        <label className="field"><label>내용</label><textarea rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="자세한 상황을 적어주세요..." maxLength={4000} /></label>
        {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}
        <div className="actions" style={{marginTop: 6}}>
          <button className="btn btn-ghost" onClick={ui.close} disabled={busy}>닫기</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? "전송 중…" : "보내기"}</button>
        </div>
      </>
    );
  };

  // ────────────────────── SNS landing ──────────────────────
  const SnsModal = ({ which }) => {
    const ui = useUI();
    const data = {
      youtube: {
        title: "PromForge YouTube",
        kicker: "// youtube — 영상 채널",
        sub: "위클리잼 하이라이트, 멤버 인터뷰, 워크플로 데모를 매주 1편 업로드합니다.",
        url: "youtube.com/@promforge",
        stats: [
          { n: "구독자", v: "8.2k", c: "var(--ember)" },
          { n: "영상", v: "94", c: "var(--cyan)" },
          { n: "총 조회수", v: "412k", c: "var(--violet)" },
        ],
        recent: [
          { t: "Claude로 4주 만에 텍스트 어드벤처 — 분기 240개", views: "18k", time: "2일 전" },
          { t: "Cursor Composer 보스전 자동화 라이브", views: "12k", time: "5일 전" },
          { t: "위클리잼 #17 베스트 5작 플레이", views: "9.4k", time: "1주 전" },
          { t: "AI 사운드 워크플로 — Suno + EQ + 마스터링", views: "7.8k", time: "2주 전" },
        ],
      },
      twitter: {
        title: "PromForge on X",
        kicker: "// x.com — 실시간",
        sub: "잼 공지, 신규 검증 프롬프트, 메이커 인터뷰 클립을 빠르게 공유합니다.",
        url: "x.com/promforge_kr",
        stats: [
          { n: "팔로워", v: "12.4k", c: "var(--cyan)" },
          { n: "포스트", v: "1,820", c: "var(--ember)" },
          { n: "월간 노출", v: "284k", c: "var(--violet)" },
        ],
        recent: [
          { t: "위클리잼 #18 'Cozy AI' 시작! 24팀 참여 ✦", views: "4.2k", time: "12분 전" },
          { t: "신규 검증 프롬프트 3개 추가 — 라이브러리 확인", views: "3.1k", time: "2시간 전" },
          { t: "@hyejin.kr 인터뷰: 4주 어드벤처 빌드 회고", views: "2.8k", time: "어제" },
          { t: "Cursor 신기능 빠른 정리 (스레드)", views: "5.6k", time: "2일 전" },
        ],
      },
      github: {
        title: "PromForge on GitHub",
        kicker: "// github — 오픈소스",
        sub: "프롬프트 라이브러리, 보일러플레이트, 커뮤니티 도구를 오픈소스로 공개합니다.",
        url: "github.com/promforge",
        stats: [
          { n: "공개 레포", v: "24", c: "var(--green)" },
          { n: "★ Star", v: "3.8k", c: "var(--ember)" },
          { n: "기여자", v: "142", c: "var(--cyan)" },
        ],
        recent: [
          { t: "promforge/prompt-library — Claude/GPT 검증 프롬프트", views: "★ 1.2k", time: "최근 커밋 3시간 전" },
          { t: "promforge/godot-llm-bridge — Godot ↔ LLM 통합", views: "★ 824", time: "최근 커밋 2일 전" },
          { t: "promforge/jam-template — 잼 시작 템플릿", views: "★ 412", time: "최근 커밋 1주 전" },
          { t: "promforge/k-localize — 한국어 게임 로컬라이즈 도구", views: "★ 284", time: "최근 커밋 3주 전" },
        ],
      },
    };
    const d = data[which];
    return (
      <>
        <SectionHead kicker={d.kicker} title={d.title} sub={d.sub} />
        <StatRow items={d.stats} />
        <h3 style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "12px 0 6px"}}>최근</h3>
        {d.recent.map((r, i) => (
          <ListRow key={i} title={r.t} sub={r.time} right={<span style={{fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-3)"}}>{r.views}</span>}
            onClick={() => ui.toast(`'${r.t}' 열기`, which.toUpperCase())} />
        ))}
        <div className="actions" style={{marginTop: 16}}>
          <button className="btn btn-ghost" onClick={ui.close}>닫기</button>
          <button className="btn btn-primary" onClick={() => { ui.toast(`${d.url} 새 탭에서 열기`, "외부"); ui.close(); }}>{d.url} 열기 ↗</button>
        </div>
      </>
    );
  };

  return { JamModal, LibraryModal, ToolGuideModal, ChecklistModal, MentorsModal, AboutModal, ConductModal, ContactModal, SnsModal };
})();

window.PF_INFO = PF_INFO;
