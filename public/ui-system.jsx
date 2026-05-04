/* PromForge — UI context, modal, toast, router */
const { createContext, useContext, useState: useUS, useEffect: useUE, useCallback } = React;

const DISCORD_URL = "https://discord.gg/promforge";

const UIContext = createContext(null);
const useUI = () => useContext(UIContext);

const UIProvider = ({ children }) => {
  const [modal, setModal] = useUS(null); // { kind, payload }
  const [toasts, setToasts] = useUS([]);
  const [route, setRouteState] = useUS(() => (location.hash || "#home").slice(1) || "home");

  useUE(() => {
    const onHash = () => setRouteState((location.hash || "#home").slice(1) || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setRoute = useCallback((r) => {
    location.hash = "#" + r;
    setRouteState(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toast = useCallback((msg, kind = "OK") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  const open = useCallback((kind, payload) => setModal({ kind, payload }), []);
  const close = useCallback(() => setModal(null), []);

  // ESC to close
  useUE(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <UIContext.Provider value={{ modal, open, close, toast, route, setRoute, discordUrl: DISCORD_URL }}>
      {children}
      <ModalHost />
      <ToastStack toasts={toasts} />
    </UIContext.Provider>
  );
};

const ToastStack = ({ toasts }) => (
  <div className="toast-stack">
    {toasts.map(t => (
      <div key={t.id} className="toast">
        <span className="pill">{t.kind}</span>
        {t.msg}
      </div>
    ))}
  </div>
);

const ModalHost = () => {
  const { modal, close, toast } = useUI();
  if (!modal) return null;
  const { kind, payload } = modal;

  const stop = (e) => e.stopPropagation();

  let body = null;
  if (kind === "post") body = <PostModal post={payload} />;
  else if (kind === "board") body = <BoardModal board={payload} />;
  else if (kind === "showcase") body = <ShowcaseModal game={payload} />;
  else if (kind === "study") body = <StudyModal study={payload} />;
  else if (kind === "tool") body = <ToolModal tool={payload} />;
  else if (kind === "signup") body = window.PF_AUTH?.RealSignupModal ? <window.PF_AUTH.RealSignupModal /> : <SignupModal />;
  else if (kind === "login") body = window.PF_AUTH?.RealLoginModal ? <window.PF_AUTH.RealLoginModal /> : <LoginModal />;
  else if (kind === "newpost") body = <NewPostModal />;
  else if (kind === "newstudy") body = <NewStudyModal />;
  else if (kind === "search") body = <SearchModal initial={payload} />;
  else if (kind === "subscribe") body = <SubscribeModal />;
  else if (kind === "filter") body = <FilterModal />;
  else if (kind === "forge") body = <ForgeModal />;
  else if (kind === "jam")        body = <window.PF_INFO.JamModal />;
  else if (kind === "library")    body = <window.PF_INFO.LibraryModal />;
  else if (kind === "toolguide")  body = <window.PF_INFO.ToolGuideModal />;
  else if (kind === "checklist")  body = <window.PF_INFO.ChecklistModal />;
  else if (kind === "mentors")    body = <window.PF_INFO.MentorsModal />;
  else if (kind === "about")      body = <window.PF_INFO.AboutModal />;
  else if (kind === "conduct")    body = <window.PF_INFO.ConductModal />;
  else if (kind === "contact")    body = <window.PF_INFO.ContactModal />;
  else if (kind === "sns")        body = <window.PF_INFO.SnsModal which={payload} />;

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className={"modal" + (kind === "search" || kind === "post" || kind === "showcase" ? " wide" : "")} onClick={stop}>
        <button className="x" onClick={close} aria-label="close">✕</button>
        {body}
      </div>
    </div>
  );
};

// —— Per-modal bodies ——
const PostModal = ({ post }) => {
  const { toast } = useUI();
  const [liked, setLiked] = useUS(false);
  const [likes, setLikes] = useUS(post.likes);
  return (
    <>
      <div className="kicker">{post.tag}</div>
      <h2>{post.title}</h2>
      <div className="meta-row">
        <span>@{post.author}</span>
        <span>· {post.time}</span>
        <span>· 👁 {post.views.toLocaleString()}</span>
        <span>· 💬 {post.replies}</span>
        {post.badge ? <span style={{color: "var(--ember)"}}>· {post.badge}</span> : null}
      </div>
      <p className="body-text">
        이 글은 PromForge 커뮤니티 멤버 <b>@{post.author}</b>가 공유한 게시물입니다.
        실제 글에는 프롬프트 전문, 게임 빌드 영상, 그리고 댓글 토론이 포함됩니다.
      </p>
      <pre className="code">{`# ${post.title}

> by @${post.author} · ${post.time}

## 핵심 요약
- ${post.tag === "PROMPT" ? "Claude/GPT 시스템 프롬프트 v3 — 토큰 절감 패턴" :
   post.tag === "SHOWCASE" ? "4주간 빌드한 텍스트 어드벤처. 분기 240+." :
   post.tag === "WORKFLOW" ? "Cursor Composer로 보스전 패턴 5종 자동 구현" :
   "커뮤니티 멤버가 공유한 인사이트와 토론"}
- 검증: PromForge 멤버 12명이 직접 테스트
- 라이선스: CC-BY 4.0

## 본문
프롬프트 본문, 빌드 일지, 멤버 피드백 — 모두 자유롭게 열람 가능합니다.
스크롤을 내려 댓글 ${post.replies}개와 함께 토론에 참여해보세요.`}</pre>
      <div className="actions">
        <button className="btn btn-ghost" onClick={() => { setLiked(!liked); setLikes(l => l + (liked ? -1 : 1)); }}>
          {liked ? "♥" : "♡"} 추천 {likes}
        </button>
        <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(location.href); toast("링크가 복사되었습니다"); }}>링크 복사</button>
        <button className="btn btn-primary" onClick={() => toast("댓글이 등록되었습니다", "댓글")}>댓글 달기</button>
      </div>
    </>
  );
};

const BoardModal = ({ board }) => {
  const { toast, close } = useUI();
  return (
    <>
      <div className="kicker">// board</div>
      <h2>{board.title}</h2>
      <p className="lede">{board.desc}</p>
      <div className="meta-row">
        <span>📚 {board.posts.toLocaleString()} posts</span>
        <span>· 🆕 +{board.today} today</span>
        <span>· 👥 활성 멤버 약 {Math.round(board.posts / 12)}명</span>
      </div>
      <p className="body-text">
        이 보드의 모든 게시글은 자유롭게 열람할 수 있습니다.
        지금은 메인 피드의 인기/최신 탭에서 글을 둘러볼 수 있고, 새 글 알림을 받으려면 아래 버튼을 눌러주세요.
      </p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        <button className="btn btn-primary" onClick={() => toast(`'${board.title}' 보드 알림 켜짐`, "구독")}>새 글 알림 받기</button>
      </div>
    </>
  );
};

const ShowcaseModal = ({ game }) => {
  const { toast } = useUI();
  return (
    <>
      <div className="kicker">// showcase</div>
      <h2>{game.title}</h2>
      <p className="lede">{game.genre} · {game.author}</p>
      <div style={{height: 220, borderRadius: 10, marginBottom: 16,
        background: "radial-gradient(circle at 30% 40%, rgba(255,138,60,0.18), transparent 50%), radial-gradient(circle at 70% 70%, rgba(60,227,255,0.15), transparent 50%), var(--bg-2)",
        border: "1px solid var(--line)", display: "grid", placeItems: "center",
        fontFamily: "JetBrains Mono", fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase"}}>
        [ {game.title} — gameplay preview ]
      </div>
      <p className="body-text">
        AI 도구를 활용해 만든 커뮤니티 출시작입니다. 빌드 일지, 사용한 프롬프트, 멤버 피드백을 함께 확인할 수 있어요.
      </p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={() => toast(`@${game.author.replace("@","")} 팔로우`, "구독")}>제작자 팔로우</button>
        <button className="btn btn-cyan" onClick={() => toast(`'${game.title}' 플레이 시작`, "플레이")}>플레이하기 →</button>
      </div>
    </>
  );
};

const StudyModal = ({ study }) => {
  const { toast, close } = useUI();
  return (
    <>
      <div className="kicker">// study group</div>
      <h2>{study.title}</h2>
      <p className="lede">{study.desc}</p>
      <div className="meta-row">
        <span>📅 {study.week}</span>
        <span>· 👥 {study.total}</span>
        <span>· 상태: {study.status === "recruit" ? "모집중" : study.status === "active" ? "진행중" : "마감"}</span>
      </div>
      <p className="body-text">
        매주 정해진 시간에 모여서 함께 작업합니다. Discord 음성채널 + 깃 저장소 공유 + 매주 회고 세션.
        모집중인 스터디는 신청 후 운영자 승인을 거칩니다.
      </p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        {study.status === "full"
          ? <button className="btn btn-ghost" disabled>대기열 등록</button>
          : <button className="btn btn-primary" onClick={() => toast(`'${study.title}' 스터디에 신청했습니다`, "신청")}>신청하기</button>}
      </div>
    </>
  );
};

const ToolModal = ({ tool }) => {
  const { toast } = useUI();
  return (
    <>
      <div className="kicker">// tool</div>
      <h2>{tool.name}</h2>
      <p className="lede">{tool.cnt} · 커뮤니티에서 가장 활발히 논의되는 도구 중 하나</p>
      <p className="body-text">
        {tool.name} 관련 가이드, 프롬프트, 워크플로 글을 모아 보여주는 페이지로 이동합니다.
      </p>
      <div className="actions">
        <button className="btn btn-primary" onClick={() => toast(`'${tool.name}' 태그 글 모음으로 이동`, "필터")}>{tool.name} 글 보기</button>
      </div>
    </>
  );
};

const SignupModal = () => {
  const { toast, close } = useUI();
  const [form, setForm] = useUS({ email: "", nick: "", role: "Game Designer" });
  return (
    <>
      <div className="kicker">// 가입</div>
      <h2>포지에 합류하기</h2>
      <p className="lede">30초면 충분해요. 가입은 무료, 검증된 프롬프트 라이브러리 즉시 열람.</p>
      <label className="field"><label>이메일</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@studio.com" /></label>
      <label className="field"><label>닉네임</label><input value={form.nick} onChange={e => setForm({...form, nick: e.target.value})} placeholder="@your_handle" /></label>
      <label className="field"><label>역할</label><input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Game Designer / Indie Dev / Prompt Engineer..." /></label>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>취소</button>
        <button className="btn btn-primary" onClick={() => { close(); toast(`환영합니다, ${form.nick || "메이커"}!`, "가입완료"); }}>가입 완료</button>
      </div>
    </>
  );
};

const LoginModal = () => {
  const { toast, close, open } = useUI();
  return (
    <>
      <div className="kicker">// 로그인</div>
      <h2>다시 만나서 반가워요</h2>
      <label className="field"><label>이메일</label><input placeholder="you@studio.com" /></label>
      <label className="field"><label>비밀번호</label><input type="password" placeholder="••••••••" /></label>
      <div className="actions">
        <button className="btn btn-ghost" onClick={() => open("signup")}>가입하기</button>
        <button className="btn btn-primary" onClick={() => { close(); toast("로그인 완료", "OK"); }}>로그인</button>
      </div>
    </>
  );
};

const NewPostModal = () => {
  const { toast, close } = useUI();
  const [form, setForm] = useUS({ board: "프롬프트 라이브러리", title: "", body: "" });
  return (
    <>
      <div className="kicker">// 글쓰기</div>
      <h2>새 글 작성</h2>
      <label className="field"><label>보드</label><input value={form.board} onChange={e => setForm({...form, board: e.target.value})} /></label>
      <label className="field"><label>제목</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="제목을 입력하세요" /></label>
      <label className="field"><label>본문</label><textarea rows={6} value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="공유할 프롬프트, 코드, 또는 질문…" /></label>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>취소</button>
        <button className="btn btn-primary" onClick={() => { close(); toast("글이 발행되었습니다", "발행"); }}>발행</button>
      </div>
    </>
  );
};

const NewStudyModal = () => {
  const { toast, close } = useUI();
  return (
    <>
      <div className="kicker">// 스터디 만들기</div>
      <h2>새 스터디 모집</h2>
      <label className="field"><label>스터디명</label><input placeholder="예) Godot + LLM 6주 스프린트" /></label>
      <label className="field"><label>소개</label><textarea rows={4} placeholder="누구를 모집하는지, 무엇을 함께 할지 적어주세요" /></label>
      <label className="field"><label>정원</label><input placeholder="예) 12" /></label>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>취소</button>
        <button className="btn btn-primary" onClick={() => { close(); toast("스터디 모집이 게시되었습니다", "공개"); }}>공개하기</button>
      </div>
    </>
  );
};

const SearchModal = ({ initial }) => {
  const { toast } = useUI();
  const [q, setQ] = useUS(initial || "");
  const all = [
    ...window.PF_DATA.posts.hot.map(p => ({ kind: "post", title: p.title, sub: `@${p.author} · ${p.tag}` })),
    ...window.PF_DATA.posts.latest.map(p => ({ kind: "post", title: p.title, sub: `@${p.author} · ${p.tag}` })),
    ...window.PF_DATA.showcases.map(g => ({ kind: "game", title: g.title, sub: g.genre })),
    ...window.PF_DATA.studies.map(s => ({ kind: "study", title: s.title, sub: s.week })),
    ...window.PF_DATA.tools.map(t => ({ kind: "tool", title: t.name, sub: t.cnt })),
  ];
  const results = q.trim() ? all.filter(x => (x.title + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 10) : [];
  return (
    <>
      <div className="kicker">// 검색</div>
      <h2>커뮤니티 전체 검색</h2>
      <label className="field"><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="프롬프트, 게임, 멤버, 도구…" /></label>
      <div style={{maxHeight: 320, overflowY: "auto"}}>
        {q.trim() === "" ? (
          <div style={{color: "var(--ink-3)", fontSize: 13, padding: "20px 0", textAlign: "center", fontFamily: "JetBrains Mono, monospace"}}>검색어를 입력하세요</div>
        ) : results.length === 0 ? (
          <div style={{color: "var(--ink-3)", fontSize: 13, padding: "20px 0", textAlign: "center"}}>'{q}' 와 일치하는 결과가 없습니다</div>
        ) : results.map((r, i) => (
          <div key={i} onClick={() => toast(`'${r.title}' 열기`, r.kind.toUpperCase())} style={{padding: "10px 0", borderBottom: "1px solid var(--line)", cursor: "pointer"}}>
            <div style={{fontSize: 14, color: "var(--ink-0)", fontWeight: 500}}>{r.title}</div>
            <div style={{fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace", marginTop: 2}}>{r.kind} · {r.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const SubscribeModal = () => {
  const { toast, close } = useUI();
  const [email, setEmail] = useUS("");
  return (
    <>
      <div className="kicker">// 다이제스트 구독</div>
      <h2>매주 월요일 아침, 한 번에.</h2>
      <p className="lede">한국 AI 게임 씬에서 일어난 일들 — 릴리즈, 프롬프트, 스터디, 게임잼 — 8분 안에 읽도록 정리해 드립니다.</p>
      <label className="field"><label>이메일</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" /></label>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>나중에</button>
        <button className="btn btn-primary" onClick={() => { close(); toast("구독되었습니다. 다음 월요일에 만나요!", "구독"); }}>구독하기</button>
      </div>
    </>
  );
};

const FilterModal = () => {
  const { toast, close } = useUI();
  return (
    <>
      <div className="kicker">// 필터</div>
      <h2>피드 필터링</h2>
      <p className="lede">보드, 도구, 작성자별로 피드를 좁혀 볼 수 있습니다.</p>
      <p className="body-text">필터는 누구나 자유롭게 사용할 수 있어요.</p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        <button className="btn btn-primary" onClick={() => { close(); toast("필터 적용됨", "필터"); }}>적용</button>
      </div>
    </>
  );
};

const ForgeModal = () => {
  const { toast, close, open } = useUI();
  const [tab, setTab] = useUS("prompts");

  const stats = [
    {n: "저장한 프롬프트", v: "47", c: "var(--ember)"},
    {n: "참여 스터디", v: "2", c: "var(--violet)"},
    {n: "이번주 커밋", v: "28", c: "var(--green)"},
  ];

  const prompts = [
    { name: "Roguelike Dungeon DM v3", note: "Claude · 4096 tok · 검증됨", tag: "PROMPT" },
    { name: "한국어 RPG 마스터 페르소나", note: "GPT-4o · 톤 일관성 패턴", tag: "PROMPT" },
    { name: "보스전 패턴 5종 (JSON spec)", note: "Cursor Composer 입력용", tag: "WORKFLOW" },
  ];
  const myStudies = [
    { name: "Unity × LLM Agent 7기", note: "WEEK 0/8 · 다음 모임: 월 21:00", role: "참가자" },
    { name: "Claude Code 게임잼 클럽", note: "WEEK 4/12 · 매주 토요일", role: "운영자" },
  ];

  const tabs = [
    {id: "prompts", label: "저장한 프롬프트", count: prompts.length},
    {id: "studies", label: "참여 스터디", count: myStudies.length},
  ];

  return (
    <>
      <div className="kicker">// 내 작업장 — 개인 대시보드</div>
      <h2>내 작업장</h2>
      <p className="lede">
        저장해 둔 프롬프트와 참여 중인 스터디를 한 곳에서 관리하고, 여기서 새 글이나 스터디를 바로 시작하세요.
      </p>

      {/* 통계 */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16}}>
        {stats.map((s, i) => (
          <div key={i} style={{padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
            <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase"}}>{s.n}</div>
            <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 600, marginTop: 2, color: s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18}}>
        <button className="btn btn-primary" style={{justifyContent: "flex-start"}} onClick={() => { close(); open("newpost"); }}>
          ✎ &nbsp; 새 글 쓰기
        </button>
        <button className="btn btn-ghost" style={{justifyContent: "flex-start"}} onClick={() => { toast("프롬프트가 라이브러리에 저장되었습니다", "저장"); }}>
          ✦ &nbsp; 프롬프트 저장
        </button>
        <button className="btn btn-ghost" style={{justifyContent: "flex-start"}} onClick={() => { close(); open("newstudy"); }}>
          ◇ &nbsp; 스터디 모집
        </button>
      </div>

      {/* 탭 */}
      <div style={{display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 12}}>
        {tabs.map(t => (
          <button key={t.id}
            className="tab"
            style={{
              padding: "9px 14px", fontSize: 13,
              color: tab === t.id ? "var(--ink-0)" : "var(--ink-2)",
              borderBottom: "2px solid " + (tab === t.id ? "var(--cyan)" : "transparent"),
              marginBottom: -1,
            }}
            onClick={() => setTab(t.id)}>
            {t.label} <span className="mono" style={{fontSize: 11, color: "var(--ink-3)", marginLeft: 4}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div style={{maxHeight: 240, overflowY: "auto"}}>
        {tab === "prompts" && prompts.map((p, i) => (
          <div key={i} onClick={() => toast(`'${p.name}' 프롬프트 열기`, "프롬프트")} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)", cursor: "pointer"}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 500, color: "var(--ink-0)"}}>{p.name}</div>
              <div style={{fontSize: 12, color: "var(--ink-3)", marginTop: 2, fontFamily: "JetBrains Mono, monospace"}}>{p.note}</div>
            </div>
            <span style={{fontSize: 10, color: "var(--cyan)", fontFamily: "JetBrains Mono, monospace", border: "1px solid rgba(60,227,255,0.25)", padding: "2px 6px", borderRadius: 4}}>{p.tag}</span>
          </div>
        ))}
        {tab === "studies" && myStudies.map((s, i) => (
          <div key={i} onClick={() => toast(`'${s.name}' 스터디 페이지로 이동`, "스터디")} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)", cursor: "pointer"}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 500, color: "var(--ink-0)"}}>{s.name}</div>
              <div style={{fontSize: 12, color: "var(--ink-3)", marginTop: 2, fontFamily: "JetBrains Mono, monospace"}}>{s.note}</div>
            </div>
            <span style={{fontSize: 11, color: s.role === "운영자" ? "var(--ember)" : "var(--ink-2)", fontFamily: "JetBrains Mono, monospace"}}>{s.role}</span>
          </div>
        ))}
      </div>
    </>
  );
};

window.PF_UI = { UIProvider, useUI, DISCORD_URL };
