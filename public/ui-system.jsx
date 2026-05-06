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

  // Cross-component events: SearchModal / external code can request opening
  // a post / study / showcase modal by id. Wired here so navigation works
  // even when the calling component doesn't have access to UIContext.
  useUE(() => {
    const openPost = (e) => open("post", e.detail);
    const openStudy = (e) => open("study", e.detail);
    const openShowcase = (e) => open("showcase", e.detail);
    window.addEventListener("pf:open-post", openPost);
    window.addEventListener("pf:open-study", openStudy);
    window.addEventListener("pf:open-showcase", openShowcase);
    return () => {
      window.removeEventListener("pf:open-post", openPost);
      window.removeEventListener("pf:open-study", openStudy);
      window.removeEventListener("pf:open-showcase", openShowcase);
    };
  }, [open]);

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
  const { toast, open } = useUI();
  const [full, setFull] = useUS(post);
  const [liked, setLiked] = useUS(false);
  const [likes, setLikes] = useUS(post.likes ?? 0);
  const [busy, setBusy] = useUS(false);

  // Comments
  const [comments, setComments] = useUS([]);
  const [commentText, setCommentText] = useUS("");
  const [posting, setPosting] = useUS(false);
  const [bookmarked, setBookmarked] = useUS(post.is_bookmarked ?? false);
  const [bookmarkCount, setBookmarkCount] = useUS(post.bookmarks ?? 0);
  const [bmBusy, setBmBusy] = useUS(false);
  const session = window.PF_AUTH?.useSession?.() ?? { user: null };

  // Hydrate full post + comments
  useUE(() => {
    let alive = true;
    if (!post.id) return;
    (async () => {
      try {
        const detail = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/posts/${post.id}`, {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
            'x-pf-token': window.PF_API._internal.getToken() || '',
          },
        }).then(r => r.json());
        if (alive && detail.post) {
          setFull({ ...post, ...detail.post });
          if (detail.post.is_bookmarked != null) setBookmarked(detail.post.is_bookmarked);
          if (detail.post.bookmarks != null) setBookmarkCount(detail.post.bookmarks);
        }
      } catch { /* */ }
      try {
        const c = await window.PF_API.comments(post.id);
        if (alive) setComments(c.comments || []);
      } catch { /* */ }
    })();
    return () => { alive = false; };
  }, [post.id]);

  const onLike = async () => {
    if (!post.id) { setLiked(!liked); setLikes((l) => l + (liked ? -1 : 1)); return; }
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
          'x-pf-token': window.PF_API._internal.getToken() || '',
        },
      });
      if (r.status === 401) { toast('추천하려면 로그인이 필요합니다', '로그인'); open('login'); return; }
      const data = await r.json();
      if (data.likes != null) { setLikes(data.likes); setLiked(true); }
    } finally { setBusy(false); }
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    if (!session.user) { open('login'); return; }
    setPosting(true);
    try {
      const r = await window.PF_API.addComment(post.id, text);
      setComments((cs) => [...cs, r.comment]);
      setCommentText("");
      toast("댓글이 등록되었습니다", "댓글");
    } catch (err) {
      const code = err?.data?.error;
      if (code === "login_required") open('login');
      else toast("등록 실패: " + (err.message || ""), "오류");
    } finally { setPosting(false); }
  };

  const removeComment = async (c) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    try {
      await window.PF_API.deleteComment(c.id);
      setComments((cs) => cs.filter((x) => x.id !== c.id));
      toast("삭제되었습니다", "댓글");
    } catch (err) { toast("실패: " + (err.message || ""), "오류"); }
  };

  const likeComment = async (c) => {
    try {
      const r = await window.PF_API.likeComment(c.id);
      setComments((cs) => cs.map((x) => x.id === c.id ? { ...x, likes: r.likes } : x));
    } catch (err) {
      if (err?.data?.error === "login_required") open('login');
    }
  };

  const onBookmark = async () => {
    if (!post.id) return;
    if (!session.user) { open('login'); return; }
    if (bmBusy) return;
    setBmBusy(true);
    try {
      const r = await window.PF_API.toggleBookmark(post.id);
      setBookmarked(r.bookmarked);
      setBookmarkCount(r.bookmarks ?? bookmarkCount);
      toast(r.bookmarked ? "찜 목록에 추가되었습니다 (+2P)" : "찜이 해제되었습니다", "찜");
    } catch (err) {
      const code = err?.data?.error;
      if (code === "login_required") open('login');
      else toast("실패: " + (err.message || ""), "오류");
    } finally { setBmBusy(false); }
  };

  const md = window.PF_MD?.renderMarkdown;

  return (
    <>
      <div className="kicker">{full.tag}</div>
      <h2>{full.title}</h2>
      <div className="meta-row">
        <span>@{full.author}</span>
        {window.PF_BADGE && <window.PF_BADGE.LevelBadge level={full.author_level} role={full.author_role} />}
        {full.time && <span>· {full.time}</span>}
        {full.views != null && <span>· 👁 {Number(full.views).toLocaleString()}</span>}
        <span>· 💬 {comments.length}</span>
        <span>· ★ {bookmarkCount}</span>
        {full.badge ? <span style={{color: "var(--ember)"}}>· {full.badge}</span> : null}
      </div>
      {full.image_url && (
        <img src={full.image_url} alt="" className="md-hero" />
      )}
      {full.body ? (
        <div className="md-body">{md ? md(full.body) : <pre className="code" style={{whiteSpace:'pre-wrap'}}>{full.body}</pre>}</div>
      ) : (
        <p className="body-text" style={{padding: 16, border: '1px dashed var(--line-strong)', borderRadius: 8, background: 'rgba(20,26,46,0.3)'}}>
          {full.preview || '본문을 불러오는 중…'}
        </p>
      )}
      <div className="actions">
        <button className="btn btn-ghost" onClick={onLike} disabled={busy}>
          {liked ? "♥" : "♡"} 추천 {likes}
        </button>
        <button className="btn btn-ghost" onClick={onBookmark} disabled={bmBusy}
                style={{
                  color: bookmarked ? "var(--ember)" : undefined,
                  borderColor: bookmarked ? "rgba(255,138,60,0.45)" : undefined,
                  background: bookmarked ? "rgba(255,138,60,0.08)" : undefined,
                }}>
          {bookmarked ? "★" : "☆"} 찜 {bookmarkCount}
        </button>
        <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(location.href).then(() => toast("링크가 복사되었습니다")).catch(() => toast("복사 실패", "오류")); }}>링크 복사</button>
      </div>

      {/* Comments */}
      <div className="pf-comments">
        <div className="kicker" style={{marginTop:18,marginBottom:10}}>// 댓글 {comments.length}</div>
        {comments.length === 0 && (
          <div style={{padding:16,textAlign:"center",color:"var(--ink-3)",fontSize:13,border:"1px dashed var(--line)",borderRadius:8,marginBottom:10}}>
            첫 댓글을 남겨보세요
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="pf-comment">
            <div className="pf-comment-head">
              <span className="mono" style={{color:"var(--cyan)"}}>@{c.author}</span>
              <span style={{color:"var(--ink-3)",fontSize:11,marginLeft:6}}>· {c.time}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                <button className="pf-comment-act" onClick={() => likeComment(c)}>♥ {c.likes || 0}</button>
                {session.user && (session.user.id === c.user_id || session.user.role === "admin") && (
                  <button className="pf-comment-act" onClick={() => removeComment(c)} style={{color:"var(--ember)"}}>삭제</button>
                )}
              </div>
            </div>
            <div className="pf-comment-body">{c.body}</div>
          </div>
        ))}

        {session.user ? (
          <div className="pf-comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment(); }}
              placeholder="댓글을 입력하세요. (⌘/Ctrl + Enter 로 등록)"
              rows={3}
            />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
              <span style={{fontSize:11,color:"var(--ink-3)"}}>{commentText.length} / 4000</span>
              <button className="btn btn-primary" onClick={submitComment} disabled={posting || !commentText.trim()}
                      style={{padding:"6px 14px",fontSize:12}}>
                {posting ? "등록 중…" : "댓글 등록"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{padding:14,textAlign:"center",border:"1px dashed var(--line-strong)",borderRadius:8,marginTop:10}}>
            <span style={{fontSize:13,color:"var(--ink-2)"}}>댓글을 작성하려면 </span>
            <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:12}} onClick={() => open('login')}>로그인</button>
          </div>
        )}
      </div>
    </>
  );
};

const BoardModal = ({ board }) => {
  const { toast, close, setRoute } = useUI();
  const [subscribed, setSubscribed] = useUS(false);
  const slug = board.slug || board.id;
  return (
    <>
      <div className="kicker">// board</div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
        <h2 style={{margin:0}}>{board.title}</h2>
        <button className="bell-btn" title={subscribed ? "알림 해제" : "새 글 알림"}
                onClick={() => { setSubscribed((v) => !v); toast(subscribed ? "알림이 해제되었습니다" : `'${board.title}' 알림이 켜졌습니다`, "구독"); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="icn">
            {subscribed
              ? <><path d="M3 3l18 18"/><path d="M9.4 4.6A6 6 0 0 1 18 8c0 3 .5 5 1 6.4M6 8c0 7-3 9-3 9h12.5"/><path d="M10 21a2 2 0 0 0 4 0"/></>
              : <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>}
          </svg>
        </button>
      </div>
      <p className="lede" style={{marginTop:8}}>{board.desc}</p>
      <div className="meta-row">
        <span>📚 {(board.posts ?? 0).toLocaleString()} posts</span>
        <span>· 🆕 +{board.today ?? 0} today</span>
      </div>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        <button className="btn btn-primary" onClick={() => { close(); setRoute("board:" + slug); }}>전체 게시글 보기 →</button>
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

  // 2-column field-row helper that visually matches the project info card
  const Row = ({ label, value, accent }) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) return null;
    return (
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"6px 0",fontSize:13}}>
        <span style={{minWidth:64,color:"var(--ink-3)"}}>{label}</span>
        {Array.isArray(value)
          ? <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{value.map((v, i) =>
              <span key={i} className="mono" style={{padding:"2px 8px",borderRadius:4,
                  border:"1px solid var(--line)",fontSize:11.5,color:"var(--ink-1)"}}>{v}</span>)}</div>
          : accent
            ? <span className="mono" style={{padding:"2px 8px",borderRadius:4,
                border:"1px solid " + accent.b,color:accent.c,background:accent.bg,fontSize:11.5}}>{value}</span>
            : <span className="mono" style={{padding:"2px 8px",borderRadius:4,
                border:"1px solid var(--line)",fontSize:11.5,color:"var(--ink-1)"}}>{value}</span>
        }
      </div>
    );
  };

  const stageAccent = study.stage === "개발중"
    ? { b: "rgba(255,138,60,0.4)", c: "var(--ember)", bg: "rgba(255,138,60,0.08)" }
    : study.stage === "출시"
      ? { b: "rgba(110,231,160,0.4)", c: "var(--green)", bg: "rgba(110,231,160,0.08)" }
      : null;

  return (
    <>
      <div className="kicker">// project · study</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <span style={{display:"inline-grid",placeItems:"center",width:36,height:36,borderRadius:8,
                      background:"rgba(154,140,255,0.12)",color:"var(--violet)"}}>🎮</span>
        <h2 style={{margin:0}}>{study.title}</h2>
        {study.visibility === "private" && (
          <span title="비공개" style={{fontSize:13,color:"var(--ink-3)"}}>🔒</span>
        )}
      </div>
      {(study.desc || study.description) && <p className="lede" style={{marginTop:0}}>{study.desc || study.description}</p>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",
                   padding:"10px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)",
                   margin:"12px 0"}}>
        <Row label="기간" value={study.duration} />
        <Row label="단계" value={study.stage} accent={stageAccent} />
        <Row label="플랫폼" value={study.platforms} />
        <Row label="기술" value={study.tech} />
        <Row label="장르" value={study.genre} />
        <Row label="세부 장르" value={study.subgenre} />
        <Row label="그래픽" value={study.graphics} />
        <Row label="모집" value={study.total} />
        {study.week && <Row label="진행" value={study.week} />}
        <Row label="상태" value={study.status === "recruit" ? "모집중" : study.status === "active" ? "진행중" : "마감"} />
      </div>

      <p className="body-text" style={{fontSize:13}}>
        Discord 음성채널 + 깃 저장소 공유 + 매주 회고 세션 형태로 진행됩니다. 신청 후 운영자가 검토합니다.
      </p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        {study.status === "full"
          ? <button className="btn btn-ghost" disabled>대기열 등록</button>
          : <button className="btn btn-primary" onClick={() => toast(`'${study.title}' 프로젝트에 신청했습니다`, "신청")}>신청하기</button>}
      </div>
    </>
  );
};

const ToolModal = ({ tool }) => {
  const { close, open } = useUI();
  return (
    <>
      <div className="kicker">// tool</div>
      <h2>{tool.name}</h2>
      <p className="lede">{tool.cnt} · 커뮤니티에서 활발히 논의되는 도구</p>
      <p className="body-text">
        '{tool.name}' 관련 글을 검색해 봅니다. 게시판 통합 검색 결과로 이동합니다.
      </p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={close}>닫기</button>
        <button className="btn btn-primary"
                onClick={() => { close(); open("search", tool.name); }}>
          {tool.name} 검색 결과 보기 →
        </button>
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

const BOARD_OPTIONS = [
  { slug: "prompts", title: "프롬프트 라이브러리" },
  { slug: "showcase", title: "쇼케이스" },
  { slug: "workflow", title: "툴 / 워크플로" },
  { slug: "qna", title: "Q&A" },
  { slug: "design", title: "게임 디자인" },
  { slug: "art-sound", title: "AI 아트 & 사운드" },
  { slug: "release", title: "출시 & 마케팅" },
  { slug: "lounge", title: "자유게시판" },
  { slug: "illust", title: "일러스트 / 팬아트" },
  { slug: "cosplay", title: "코스프레" },
];

const NewPostModal = () => {
  const { toast, close, open } = useUI();
  const [form, setForm] = useUS({ boardSlug: "prompts", title: "", body: "", tag: "PROMPT" });
  const [busy, setBusy] = useUS(false);
  const [error, setError] = useUS(null);
  const [uploading, setUploading] = useUS(false);
  const taRef = React.useRef(null);

  const insertAtCursor = (insert) => {
    const ta = taRef.current;
    if (!ta) { setForm((f) => ({ ...f, body: f.body + insert })); return; }
    const start = ta.selectionStart ?? form.body.length;
    const end = ta.selectionEnd ?? start;
    const next = form.body.slice(0, start) + insert + form.body.slice(end);
    setForm((f) => ({ ...f, body: next }));
    setTimeout(() => {
      ta.focus();
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const wrapSelection = (before, after = before, placeholder = "") => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = form.body.slice(start, end) || placeholder;
    const next = form.body.slice(0, start) + before + sel + after + form.body.slice(end);
    setForm((f) => ({ ...f, body: next }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  };

  const onInsertLink = () => {
    const url = prompt("링크 URL을 입력하세요");
    if (!url) return;
    const label = prompt("링크 텍스트", url) || url;
    insertAtCursor(`[${label}](${url})`);
  };
  const onInsertImageUrl = () => {
    const url = prompt("이미지 URL을 입력하세요");
    if (!url) return;
    const alt = prompt("이미지 설명 (선택)", "") || "image";
    insertAtCursor(`\n![${alt}](${url})\n`);
  };

  const uploadAndInsert = async (file) => {
    if (!file || !file.type.startsWith("image/")) { toast("이미지 파일만 업로드 가능합니다", "오류"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("5MB 이하만 업로드 가능합니다", "오류"); return; }
    setUploading(true);
    try {
      const r = await window.PF_API.upload(file);
      insertAtCursor(`\n![${file.name || "image"}](${r.url})\n`);
      toast("이미지가 업로드되었습니다", "업로드");
    } catch (err) {
      const code = err?.data?.error;
      if (code === "login_required") open('login');
      else toast("업로드 실패: " + (err.message || ""), "오류");
    } finally { setUploading(false); }
  };

  const onFilePick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => inp.files?.[0] && uploadAndInsert(inp.files[0]);
    inp.click();
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        uploadAndInsert(item.getAsFile());
        return;
      }
    }
    // URL paste → wrap selection as markdown link
    const text = e.clipboardData?.getData("text") || "";
    if (/^https?:\/\/\S+$/.test(text.trim())) {
      const ta = taRef.current;
      if (ta && ta.selectionStart !== ta.selectionEnd) {
        e.preventDefault();
        const sel = form.body.slice(ta.selectionStart, ta.selectionEnd);
        const next = form.body.slice(0, ta.selectionStart) + `[${sel}](${text.trim()})` + form.body.slice(ta.selectionEnd);
        setForm((f) => ({ ...f, body: next }));
      }
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.title.trim() || !form.body.trim()) { setError("제목과 본문을 입력해주세요."); return; }
    setBusy(true);
    try {
      await window.PF_API.createPost
        ? window.PF_API.createPost(form)
        : (await fetch("https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
              "x-pf-token": window.PF_API._internal.getToken() || "",
            },
            body: JSON.stringify(form),
          })).json().then((d) => { if (d.error) throw d; return d; });
      close();
      toast("글이 발행되었습니다", "발행");
    } catch (err) {
      const code = err?.error || err?.data?.error;
      if (code === "login_required") { setError("로그인이 필요합니다."); open("login"); }
      else setError("발행 실패: " + (err.message || code || "오류"));
    } finally { setBusy(false); }
  };
  return (
    <>
      <div className="kicker">// 글쓰기</div>
      <h2>새 글 작성</h2>
      <label className="field"><label>보드</label>
        <select value={form.boardSlug} onChange={e => setForm({...form, boardSlug: e.target.value})}
                style={{width:'100%',padding:'10px 12px',background:'rgba(20,26,46,0.5)',border:'1px solid var(--line)',borderRadius:8,color:'var(--ink-0)',fontFamily:'inherit',fontSize:14}}>
          {BOARD_OPTIONS
            .filter((b) => {
              // Hide dark-only boards in light mode
              const theme = document.documentElement.getAttribute('data-theme') || 'light';
              const darkOnly = window.PF_THEME?.DARK_ONLY_BOARDS;
              return !(darkOnly && darkOnly.has(b.slug) && theme !== 'dark');
            })
            .map((b) => <option key={b.slug} value={b.slug}>{b.title}</option>)}
        </select>
      </label>
      <label className="field"><label>태그</label><input value={form.tag} onChange={e => setForm({...form, tag: e.target.value.toUpperCase()})} placeholder="PROMPT / SHOWCASE / WORKFLOW …" /></label>
      <label className="field"><label>제목</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="제목을 입력하세요" /></label>
      <div className="field">
        <label>본문 (마크다운 지원)</label>
        <div className="md-toolbar">
          <button type="button" onClick={() => wrapSelection("**", "**", "굵게")}><b>B</b></button>
          <button type="button" onClick={() => wrapSelection("*", "*", "기울임")}><i>I</i></button>
          <button type="button" onClick={() => wrapSelection("`", "`", "코드")} className="mono">{"<>"}</button>
          <button type="button" onClick={() => insertAtCursor("\n```\n코드 블록\n```\n")} className="mono">{"```"}</button>
          <button type="button" onClick={() => insertAtCursor("\n## 제목\n")}>H</button>
          <button type="button" onClick={() => insertAtCursor("\n- 항목\n")}>•</button>
          <span style={{flex:1}} />
          <button type="button" onClick={onInsertLink} title="링크 삽입">🔗 링크</button>
          <button type="button" onClick={onInsertImageUrl} title="이미지 URL 삽입">🖼 URL</button>
          <button type="button" onClick={onFilePick} disabled={uploading} title="이미지 업로드">
            {uploading ? "업로드 중…" : "📎 업로드"}
          </button>
        </div>
        <textarea ref={taRef} rows={10} value={form.body} onPaste={onPaste}
                  onChange={e => setForm({...form, body: e.target.value})}
                  placeholder="공유할 프롬프트, 코드, 또는 질문…&#10;&#10;이미지 붙여넣기 또는 URL 붙여넣기 자동 인식.&#10;링크/이미지/굵게 등은 위 툴바를 사용하세요." />
        <div style={{fontSize:11,color:"var(--ink-3)",marginTop:4,fontFamily:"JetBrains Mono, monospace"}}>
          ! 이미지 클립보드 붙여넣기 지원 · 텍스트 선택 후 URL 붙여넣기 = 자동 링크 변환
        </div>
      </div>
      {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}
      <div className="actions">
        <button className="btn btn-ghost" onClick={close} disabled={busy}>취소</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? "발행 중…" : "발행"}</button>
      </div>
    </>
  );
};

const STUDY_DURATIONS = ["단기 (3개월 이내)", "중기 (1년 이내)", "장기 (1년 이상)", "미정"];
const STUDY_STAGES = ["기획", "개발중", "베타", "출시", "운영"];
const STUDY_PLATFORMS = ["PC", "모바일", "콘솔", "웹", "VR/AR"];
const STUDY_TECH = ["Unity", "Godot", "Unreal", "Phaser.js", "Web/JS", "Python", "기타"];
const STUDY_GENRES = ["RPG", "액션", "어드벤처", "퍼즐", "시뮬", "전략", "캐주얼", "스포츠", "리듬"];
const STUDY_SUBGENRES = ["플랫포머", "로그라이크", "비주얼노벨", "샌드박스", "타워디펜스", "하이브리드", "기타"];
const STUDY_GRAPHICS = ["2D", "3D", "픽셀", "도트 3D", "수채화", "기타"];

const NewStudyModal = () => {
  const { toast, close, open } = useUI();
  const [form, setForm] = useUS({
    title: "",
    description: "",
    total: "0/10",
    duration: "중기 (1년 이내)",
    stage: "개발중",
    platforms: ["PC"],
    tech: "Unity",
    genre: "어드벤처",
    subgenre: "플랫포머",
    graphics: "2D",
    visibility: "public",
  });
  const [busy, setBusy] = useUS(false);
  const [error, setError] = useUS(null);

  const togglePlatform = (p) => {
    setForm((f) => {
      const has = f.platforms.includes(p);
      return { ...f, platforms: has ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] };
    });
  };

  const submit = async () => {
    setError(null);
    if (!form.title.trim()) { setError("프로젝트명을 입력해주세요."); return; }
    if (!form.platforms.length) { setError("플랫폼을 1개 이상 선택해주세요."); return; }
    setBusy(true);
    try {
      const r = await fetch("https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
          "x-pf-token": window.PF_API._internal.getToken() || "",
        },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw data;
      close();
      toast("프로젝트가 게시되었습니다", form.visibility === "private" ? "비공개" : "공개");
    } catch (err) {
      const code = err?.error;
      if (code === "login_required") { setError("로그인이 필요합니다."); open("login"); }
      else setError("게시 실패: " + (err.detail || code || "오류"));
    } finally { setBusy(false); }
  };

  // Compact 2-col grid for select fields
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 };
  const lbl = { fontSize: 11, color: "var(--ink-2)", letterSpacing: "0.06em", textTransform: "uppercase",
    fontFamily: "JetBrains Mono, monospace", marginBottom: 6, display: "block" };

  return (
    <>
      <div className="kicker">// 스터디 / 프로젝트 모집</div>
      <h2>새 프로젝트 등록</h2>
      <p className="lede">팀 빌딩이나 동료 모집을 위해 프로젝트 정보를 입력하세요.</p>

      <label className="field">
        <label>프로젝트명 *</label>
        <input value={form.title}
               onChange={e => setForm({...form, title: e.target.value})}
               placeholder="예) Corrupted [The Unreal Spanker]" />
      </label>

      <label className="field">
        <label>소개</label>
        <textarea rows={3} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="프로젝트 컨셉, 모집 포지션, 진행 방식 등을 적어주세요" />
      </label>

      <div style={grid2}>
        <div>
          <span style={lbl}>기간</span>
          <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <span style={lbl}>단계</span>
          <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginBottom: 10}}>
        <span style={lbl}>플랫폼 (복수 선택)</span>
        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
          {STUDY_PLATFORMS.map(p => {
            const active = form.platforms.includes(p);
            return (
              <button key={p} type="button" onClick={() => togglePlatform(p)}
                      style={{
                        padding: "6px 12px", borderRadius: 6,
                        background: active ? "rgba(60,227,255,0.12)" : "transparent",
                        border: "1px solid " + (active ? "rgba(60,227,255,0.4)" : "var(--line)"),
                        color: active ? "var(--cyan)" : "var(--ink-2)",
                        fontSize: 12, cursor: "pointer", fontFamily: "JetBrains Mono, monospace",
                      }}>{p}</button>
            );
          })}
        </div>
      </div>

      <div style={grid2}>
        <div>
          <span style={lbl}>기술</span>
          <select value={form.tech} onChange={e => setForm({...form, tech: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_TECH.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <span style={lbl}>그래픽</span>
          <select value={form.graphics} onChange={e => setForm({...form, graphics: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_GRAPHICS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div style={grid2}>
        <div>
          <span style={lbl}>장르</span>
          <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <span style={lbl}>세부 장르</span>
          <select value={form.subgenre} onChange={e => setForm({...form, subgenre: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            {STUDY_SUBGENRES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={grid2}>
        <label className="field" style={{margin: 0}}>
          <label>모집 정원</label>
          <input value={form.total} onChange={e => setForm({...form, total: e.target.value})} placeholder="예) 0/12" />
        </label>
        <div>
          <span style={lbl}>공개 범위</span>
          <select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})}
                  style={{width:"100%",padding:"10px 12px",background:"transparent",
                          border:"1px solid var(--line)",borderRadius:8,color:"var(--ink-0)",
                          fontFamily:"inherit",fontSize:13}}>
            <option value="public">공개</option>
            <option value="private">비공개 (작성자만)</option>
          </select>
        </div>
      </div>

      {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}

      <div className="actions">
        <button className="btn btn-ghost" onClick={close} disabled={busy}>취소</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? "게시 중…" : "공개하기"}</button>
      </div>
    </>
  );
};

const SearchModal = ({ initial }) => {
  const { toast, close } = useUI();
  const [q, setQ] = useUS(initial || "");
  const [results, setResults] = useUS([]);
  const [loading, setLoading] = useUS(false);

  // Debounced live search
  useUE(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/search?q=${encodeURIComponent(q)}`, {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
          },
        });
        const data = await r.json();
        setResults(data.results || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <div className="kicker">// 검색</div>
      <h2>커뮤니티 전체 검색</h2>
      <label className="field"><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="프롬프트, 게임, 스터디 제목…" /></label>
      <div style={{maxHeight: 320, overflowY: "auto"}}>
        {q.trim() === "" ? (
          <div style={{color: "var(--ink-3)", fontSize: 13, padding: "20px 0", textAlign: "center", fontFamily: "JetBrains Mono, monospace"}}>검색어를 입력하세요</div>
        ) : loading ? (
          <div style={{color: "var(--ink-3)", fontSize: 13, padding: "20px 0", textAlign: "center"}}>검색 중…</div>
        ) : results.length === 0 ? (
          <div style={{color: "var(--ink-3)", fontSize: 13, padding: "20px 0", textAlign: "center"}}>'{q}' 와 일치하는 결과가 없습니다</div>
        ) : results.map((r, i) => (
          <div key={r.id || i}
               onClick={async () => {
                 close();
                 if (r.kind === "post") {
                   // Navigate to the board first if known, then open the post modal.
                   if (r.board_slug) {
                     const ui2 = window.PF_UI;
                     // Use route hash so it works regardless of which view is mounted.
                     window.location.hash = "#board:" + r.board_slug;
                   }
                   // Hydrate full post + open modal.
                   try {
                     const resp = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/posts/${r.id}`, {
                       headers: {
                         apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         'x-pf-token': window.PF_API._internal.getToken() || '',
                       },
                     });
                     const data = await resp.json();
                     if (data.post) setTimeout(() => window.PF_UI.useUI && window.__pfOpenPost?.(data.post), 100);
                     // simpler: just dispatch event and let App handler open the modal
                     window.dispatchEvent(new CustomEvent('pf:open-post', { detail: data.post }));
                   } catch (e) { toast("게시글을 불러오지 못했습니다", "오류"); }
                 } else if (r.kind === "study") {
                   try {
                     const resp = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/studies/${r.id}`, {
                       headers: {
                         apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         'x-pf-token': window.PF_API._internal.getToken() || '',
                       },
                     });
                     const data = await resp.json();
                     if (data.study) window.dispatchEvent(new CustomEvent('pf:open-study', { detail: data.study }));
                     else toast("스터디를 찾지 못했습니다", "오류");
                   } catch (e) { toast("스터디를 불러오지 못했습니다", "오류"); }
                 } else if (r.kind === "game") {
                   window.dispatchEvent(new CustomEvent('pf:open-showcase', {
                     detail: { id: r.id, title: r.title, genre: r.sub, author: "@unknown" }
                   }));
                 }
               }}
               style={{padding: "10px 0", borderBottom: "1px solid var(--line)", cursor: "pointer"}}>
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
  const [busy, setBusy] = useUS(false);
  const [error, setError] = useUS(null);
  const submit = async () => {
    setError(null);
    if (!email.includes("@")) { setError("올바른 이메일을 입력해주세요."); return; }
    setBusy(true);
    try {
      await window.PF_API.subscribe(email);
      close();
      toast("구독되었습니다. 다음 월요일에 만나요!", "구독");
    } catch (err) {
      setError("구독 실패: " + (err.message || "오류"));
    } finally { setBusy(false); }
  };
  return (
    <>
      <div className="kicker">// 다이제스트 구독</div>
      <h2>매주 월요일 아침, 한 번에.</h2>
      <p className="lede">한국 AI 게임 씬에서 일어난 일들 — 릴리즈, 프롬프트, 스터디, 게임잼 — 8분 안에 읽도록 정리해 드립니다.</p>
      <label className="field"><label>이메일</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="you@studio.com" /></label>
      {error && <div style={{color:'var(--ember)', fontSize:13, marginBottom:8}}>{error}</div>}
      <div className="actions">
        <button className="btn btn-ghost" onClick={close} disabled={busy}>나중에</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? "처리 중…" : "구독하기"}</button>
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
  const session = window.PF_AUTH?.useSession?.() ?? { user: null };
  const me = session.user;
  const [tab, setTab] = useUS("bookmarks");
  const [bookmarks, setBookmarks] = useUS([]);

  // Load bookmarks when modal opens (if logged in).
  useUE(() => {
    let alive = true;
    if (!me) return;
    window.PF_API.myBookmarks().then((d) => { if (alive) setBookmarks(d.bookmarks || []); }).catch(() => {});
    return () => { alive = false; };
  }, [me?.id]);

  // Live computed stats from session.
  const points = me?.points ?? 0;
  const lvl = me?.level ?? null;
  const nxt = me?.next_level ?? null;
  const progress = nxt
    ? Math.min(100, Math.round(((points - (lvl?.min_points || 0)) / (nxt.min_points - (lvl?.min_points || 0))) * 100))
    : 100;

  const stats = [
    { n: "현재 포인트",   v: points.toLocaleString(),                    c: "var(--ember)" },
    { n: "레벨",          v: lvl ? `${lvl.icon} ${lvl.name}` : "—",     c: lvl ? `var(--${lvl.color})` : "var(--ink-2)" },
    { n: "다음 레벨까지", v: nxt ? `${(nxt.min_points - points).toLocaleString()}P` : "최고 레벨", c: "var(--cyan)" },
    { n: "찜한 글",       v: bookmarks.length.toString(),                c: "var(--violet)" },
  ];

  const myStudies = [
    { name: "Unity × LLM Agent 7기", note: "WEEK 0/8 · 다음 모임: 월 21:00", role: "참가자" },
    { name: "Claude Code 게임잼 클럽", note: "WEEK 4/12 · 매주 토요일", role: "운영자" },
  ];

  const tabs = [
    { id: "bookmarks", label: "찜한 글", count: bookmarks.length },
    { id: "studies",   label: "참여 스터디", count: myStudies.length },
  ];

  return (
    <>
      <div className="kicker">// 내 작업장 — 개인 대시보드</div>
      <h2>내 작업장</h2>
      <p className="lede">
        저장해 둔 프롬프트와 참여 중인 스터디를 한 곳에서 관리하고, 여기서 새 글이나 스터디를 바로 시작하세요.
      </p>

      {/* 통계 (4-column) */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12}}>
        {stats.map((s, i) => (
          <div key={i} style={{padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(20,26,46,0.4)"}}>
            <div style={{fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase"}}>{s.n}</div>
            <div style={{fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, marginTop: 2, color: s.c, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 레벨 진행도 */}
      {lvl && (
        <div style={{padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line-strong)",
                     background: `color-mix(in oklab, var(--${lvl.color}) 6%, transparent)`, marginBottom: 16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--ink-2)",marginBottom:6,fontFamily:"JetBrains Mono, monospace"}}>
            <span>{lvl.icon} {lvl.name}</span>
            {nxt
              ? <span>{points.toLocaleString()} / {nxt.min_points.toLocaleString()}P → {nxt.icon} {nxt.name}</span>
              : <span>최고 레벨 도달!</span>}
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:progress+"%",background:`var(--${lvl.color})`,transition:"width 700ms"}} />
          </div>
          {lvl.benefits && (
            <div style={{fontSize:11.5,color:"var(--ink-2)",marginTop:8,lineHeight:1.5}}>
              <b style={{color:`var(--${lvl.color})`}}>혜택:</b> {lvl.benefits}
            </div>
          )}
        </div>
      )}

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
        {tab === "bookmarks" && (
          bookmarks.length === 0 ? (
            <div style={{padding: "24px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13}}>
              아직 찜한 글이 없습니다. 마음에 드는 글에서 ★ 버튼을 눌러보세요.
            </div>
          ) : bookmarks.map((b, i) => (
            <div key={b.post_id || i}
                 onClick={async () => {
                   try {
                     const resp = await fetch(`https://etasxbaorwgjoofdxean.supabase.co/functions/v1/pf-api/posts/${b.post_id}`, {
                       headers: {
                         apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us',
                         'x-pf-token': window.PF_API._internal.getToken() || '',
                       },
                     });
                     const data = await resp.json();
                     if (data.post) { close(); window.dispatchEvent(new CustomEvent('pf:open-post', { detail: data.post })); }
                   } catch (err) { toast("불러오기 실패", "오류"); }
                 }}
                 style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)", cursor: "pointer", gap: 10}}>
              {b.image_url && <img src={b.image_url} alt="" style={{width:48,height:48,borderRadius:6,objectFit:"cover",border:"1px solid var(--line)",flexShrink:0}} />}
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 14, fontWeight: 500, color: "var(--ink-0)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{b.title}</div>
                <div style={{fontSize: 12, color: "var(--ink-3)", marginTop: 2, fontFamily: "JetBrains Mono, monospace"}}>{b.tag} · #{b.board_slug}</div>
              </div>
              <span style={{fontSize: 14, color: "var(--ember)", flexShrink:0}}>★</span>
            </div>
          ))
        )}
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
