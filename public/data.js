/* PromForge data — community content seed */

const PF_DATA = {
  stats: [
    { num: "12,480", unit: "+", label: "포지 멤버" },
    { num: "1,247", unit: "", label: "공유된 게임 프롬프트" },
    { num: "346", unit: "", label: "릴리즈된 커뮤니티 게임" },
    { num: "82", unit: "", label: "진행중인 스터디" },
  ],

  ticker: [
    { type: "신규", text: "지난 24시간 동안 공유된 프롬프트 38건" },
    { type: "릴리즈", text: "@neon_kim 의 'Pixel Drifter' 베타 공개" },
    { type: "스터디", text: "Unity + LLM Agent 스터디 7기 모집중" },
    { type: "이슈", text: "Cursor Composer 새 모델 적용 — 영향 분석" },
    { type: "쇼케이스", text: "이주의 게임: '안개의 도서관' (RPG / 텍스트)" },
    { type: "팁", text: "프롬프트에 게임 디자인 문서를 첨부할 때의 토큰 절약 패턴" },
  ],

  boards: [
    { id: "prompt", color: "cyan", title: "프롬프트 라이브러리", desc: "검증된 게임 제작 프롬프트와 시스템 메시지", posts: 482, today: 14, glyph: "spark" },
    { id: "showcase", color: "ember", title: "쇼케이스", desc: "내가 만든 게임을 자랑하고 피드백 받기", posts: 327, today: 9, glyph: "trophy" },
    { id: "tools", color: "violet", title: "툴 & 워크플로", desc: "Cursor, Claude, Unity, Godot 연동 가이드", posts: 218, today: 11, glyph: "tool" },
    { id: "qna", color: "green", title: "Q&A", desc: "막힌 부분, 같이 풀어요. 코드/디자인 모두 환영", posts: 1142, today: 26, glyph: "help" },
    { id: "design", color: "cyan", title: "게임 디자인", desc: "메커닉, 레벨, 내러티브에 관한 토론", posts: 286, today: 7, glyph: "grid" },
    { id: "art", color: "ember", title: "AI 아트 & 사운드", desc: "Stable Diffusion, Suno, ElevenLabs 활용", posts: 195, today: 4, glyph: "palette" },
    { id: "release", color: "violet", title: "출시 & 마케팅", desc: "Steam, itch.io, App Store 런칭 후기", posts: 88, today: 2, glyph: "send" },
    { id: "free", color: "green", title: "자유게시판", desc: "잡담, 회고, 업계 뉴스, 모임 공지", posts: 612, today: 18, glyph: "chat" },
  ],

  posts: {
    hot: [
      { tag: "PROMPT", color: "cyan", title: "Claude로 로그라이크 던전을 절차적으로 생성하는 시스템 프롬프트 v3", author: "ember.kim", time: "2시간 전", views: 1247, likes: 86, replies: 24, hot: true, badge: "검증됨" },
      { tag: "SHOWCASE", color: "ember", title: "[릴리즈] '안개의 도서관' — 텍스트 어드벤처, 4주간 GPT로 제작", author: "min.dev", time: "5시간 전", views: 982, likes: 142, replies: 38, hot: true, badge: "이주의" },
      { tag: "WORKFLOW", color: "violet", title: "Unity + Cursor Composer로 보스전 패턴을 한 번에 구현하는 법", author: "sora_h", time: "어제", views: 2104, likes: 178, replies: 52, badge: "튜토리얼" },
      { tag: "Q&A", color: "green", title: "AI에게 게임 밸런싱을 맡길 때, 어떤 데이터를 함께 주시나요?", author: "rookiedev", time: "어제", views: 446, likes: 12, replies: 31 },
      { tag: "DESIGN", color: "cyan", title: "LLM이 NPC 대사를 쓸 때 톤 일관성을 유지하는 5가지 패턴", author: "cassi.j", time: "2일 전", views: 1820, likes: 211, replies: 47, hot: true },
      { tag: "TOOLS", color: "violet", title: "Godot 4.3 + Ollama 로컬 모델로 인디 게임 만들기 — 워크플로 정리", author: "j_park", time: "2일 전", views: 1132, likes: 94, replies: 19 },
      { tag: "ART", color: "ember", title: "SDXL로 픽셀 스프라이트 일관성 확보하기 — LoRA 학습 후기", author: "pixie", time: "3일 전", views: 678, likes: 58, replies: 14 },
      { tag: "FREE", color: "green", title: "'AI 게임' 이라는 카테고리는 결국 살아남을까요? 같이 얘기해봐요", author: "yoon.lab", time: "3일 전", views: 540, likes: 34, replies: 62 },
    ],
    latest: [
      { tag: "Q&A", color: "green", title: "Cursor에서 게임 프로젝트 indexing이 자꾸 끊깁니다 (해결 ✅)", author: "newbie22", time: "12분 전", views: 18, likes: 1, replies: 3 },
      { tag: "PROMPT", color: "cyan", title: "스토리텔링용 — 한국어 RPG 마스터 페르소나 (4096 토큰)", author: "talesmith", time: "38분 전", views: 84, likes: 9, replies: 2 },
      { tag: "RELEASE", color: "violet", title: "itch.io 첫 출시 후기, 24시간 다운로드 412회", author: "indie_seo", time: "1시간 전", views: 156, likes: 22, replies: 8 },
      { tag: "TOOLS", color: "violet", title: "Anthropic API 캐시 활용 — 게임 컨텍스트 토큰 70% 절약", author: "ember.kim", time: "1시간 전", views: 312, likes: 48, replies: 11, badge: "검증됨" },
      { tag: "SHOWCASE", color: "ember", title: "[WIP] 어드벤처 카드 게임 'Forge & Forge' — 시스템 시연 영상", author: "noir.studio", time: "2시간 전", views: 220, likes: 35, replies: 9 },
      { tag: "DESIGN", color: "cyan", title: "프롬프트 만으로 가능한 게임 장르의 한계는 어디인가", author: "doodle", time: "3시간 전", views: 412, likes: 28, replies: 22 },
      { tag: "PROMPT", color: "cyan", title: "Claude Code로 Phaser.js 미니게임 자동 생성 — JSON 기반 spec", author: "sora_h", time: "4시간 전", views: 488, likes: 41, replies: 7 },
      { tag: "FREE", color: "green", title: "주말 게임잼 같이 하실 분 — 토픽: '소리 없는 세계'", author: "moodlight", time: "5시간 전", views: 96, likes: 14, replies: 18 },
    ]
  },

  showcases: [
    { id: "fog", title: "안개의 도서관", genre: "Text RPG · GPT-4", author: "@min.dev", note: "Pick of the week", featured: true, hue: "ember" },
    { id: "drift", title: "Pixel Drifter", genre: "Roguelike · Claude + Godot", author: "@neon_kim" },
    { id: "forge", title: "Forge & Forge", genre: "Card Battler · WIP", author: "@noir.studio" },
    { id: "echo", title: "Echo Garden", genre: "Cozy Sim · Cursor", author: "@bloom" },
    { id: "stack", title: "STACK//RUN", genre: "Endless Runner · Phaser", author: "@sora_h" },
  ],

  studies: [
    {
      title: "Unity × LLM Agent 7기",
      desc: "NPC 대사·행동을 실시간 LLM으로 처리하는 게임 만들기. 매주 월·목 9PM, 8주 코스.",
      status: "recruit", week: "WEEK 0/8",
      members: ["EK", "SH", "MI", "JP"],
      total: "12 / 20",
    },
    {
      title: "Claude Code 게임잼 클럽",
      desc: "주말마다 작은 미니게임을 처음부터 끝까지 — 프롬프트, 코드, 빌드까지 회고.",
      status: "active", week: "WEEK 4/12",
      members: ["NK", "PX", "BL", "TS"],
      total: "16 / 16",
    },
    {
      title: "Procedural World 리서치",
      desc: "절차 생성과 LLM의 결합. 논문 리뷰 + 프로토타입 + 매주 발표.",
      status: "active", week: "WEEK 6/10",
      members: ["CJ", "DD", "YR"],
      total: "9 / 12",
    },
    {
      title: "GameDesign 101 with AI",
      desc: "디자인 다큐먼트부터 메커닉 프로토타이핑까지 AI를 활용하는 입문 스터디.",
      status: "recruit", week: "WEEK 0/6",
      members: ["RD", "ML", "DL"],
      total: "7 / 16",
    },
    {
      title: "Steam Release Sprint",
      desc: "Steam 출시까지 6주 — 빌드, 페이지, 마케팅, QA. 출시 경험자가 멘토.",
      status: "full", week: "WEEK 2/6",
      members: ["IS", "JK", "NS", "MD"],
      total: "10 / 10",
    },
    {
      title: "Sound & Music with AI",
      desc: "Suno, ElevenLabs, Udio로 게임 사운드 디자인. 격주 토요일 10AM.",
      status: "recruit", week: "WEEK 0/8",
      members: ["MD", "PX"],
      total: "5 / 12",
    },
  ],

  ranking: [
    { name: "ember.kim", role: "Prompt Engineer", pts: "12,480", color: "#ff8a3c" },
    { name: "sora_h", role: "Unity Indie", pts: "9,820", color: "#3ce3ff" },
    { name: "min.dev", role: "Narrative Dev", pts: "8,154", color: "#ffd166" },
    { name: "cassi.j", role: "Game Designer", pts: "7,612", color: "#9a8cff" },
    { name: "neon_kim", role: "Godot Coder", pts: "6,940", color: "#6ee7a0" },
    { name: "j_park", role: "Tools Engineer", pts: "5,288", color: "#ff5a1f" },
    { name: "pixie", role: "AI Artist", pts: "4,720", color: "#7defff" },
  ],

  activity: [
    { who: "ember.kim", color: "#ff8a3c", action: "님이 새 프롬프트", obj: "Roguelike Dungeon Generator v3", time: "2분 전" },
    { who: "noir.studio", color: "#9a8cff", action: "님이 쇼케이스에", obj: "Forge & Forge — 시연 영상", time: "12분 전" },
    { who: "rookiedev", color: "#6ee7a0", action: "님이 질문을 올렸습니다", obj: "AI 밸런싱 데이터 구성", time: "27분 전" },
    { who: "sora_h", color: "#3ce3ff", action: "님이 스터디", obj: "Unity × LLM Agent 7기", time: "1시간 전", suffix: " 모집을 시작했습니다" },
    { who: "min.dev", color: "#ffd166", action: "님이 게임", obj: "안개의 도서관", time: "3시간 전", suffix: " 을 릴리즈했습니다" },
    { who: "pixie", color: "#7defff", action: "님이 답글을 달았습니다 →", obj: "SDXL 픽셀 일관성", time: "4시간 전" },
  ],

  tools: [
    { name: "Claude", cnt: "428 posts" },
    { name: "Cursor", cnt: "362 posts" },
    { name: "GPT-4o", cnt: "294 posts" },
    { name: "Unity", cnt: "256 posts" },
    { name: "Godot", cnt: "189 posts" },
    { name: "Phaser.js", cnt: "144 posts" },
    { name: "SDXL", cnt: "118 posts" },
    { name: "Suno", cnt: "97 posts" },
    { name: "Ollama", cnt: "83 posts" },
    { name: "ElevenLabs", cnt: "71 posts" },
    { name: "Stable Audio", cnt: "62 posts" },
    { name: "Anthropic API", cnt: "229 posts" },
  ],
};

window.PF_DATA = PF_DATA;
