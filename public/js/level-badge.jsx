/* PromForge — author level badge + bookmark icon helpers.
   Tiny inline components other JSX files reach via window.PF_BADGE.
*/
(function () {
  // <LevelBadge level={{id, name, icon, color}} role="user|admin" />
  function LevelBadge({ level, role, size = "sm", showName = true }) {
    if (role === "admin") {
      return React.createElement("span", {
        className: "pf-level-badge",
        style: {
          color: "var(--ember)",
          borderColor: "rgba(255, 138, 60, 0.4)",
          background: "rgba(255, 138, 60, 0.10)",
          fontSize: size === "lg" ? 11.5 : 10.5,
        },
      }, "★ ADMIN");
    }
    if (!level) return null;
    return React.createElement("span", {
      className: "pf-level-badge",
      title: `${level.name} 레벨`,
      style: {
        color: `var(--${level.color})`,
        borderColor: `color-mix(in oklab, var(--${level.color}) 35%, transparent)`,
        background: `color-mix(in oklab, var(--${level.color}) 8%, transparent)`,
        fontSize: size === "lg" ? 11.5 : 10.5,
      },
    },
      level.icon,
      showName ? React.createElement("span", { style: { marginLeft: 3 } }, level.name) : null,
    );
  }

  // Bookmark toggle button (controlled by parent state).
  function BookmarkButton({ active, count, onClick, busy, compact = false }) {
    return React.createElement("button", {
      className: "btn btn-ghost",
      onClick: (e) => { e.stopPropagation?.(); onClick && onClick(e); },
      disabled: busy,
      title: active ? "찜 해제" : "찜하기",
      style: compact
        ? { padding: "4px 8px", fontSize: 11, gap: 4 }
        : { padding: "8px 14px", fontSize: 13, gap: 6, color: active ? "var(--ember)" : undefined,
            borderColor: active ? "rgba(255,138,60,0.45)" : undefined,
            background: active ? "rgba(255,138,60,0.08)" : undefined },
    },
      active ? "★" : "☆",
      compact
        ? (count != null ? React.createElement("span", { style: { fontFamily: "JetBrains Mono, monospace" } }, count) : null)
        : ` 찜${count != null ? ` ${count}` : ""}`
    );
  }

  window.PF_BADGE = { LevelBadge, BookmarkButton };
})();
