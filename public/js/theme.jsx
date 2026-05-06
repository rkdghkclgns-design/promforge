/* PromForge — light/dark theme manager.
   - Default = light. Persisted in localStorage (key: pf_theme).
   - Some boards (illust/cosplay/showcase) are gated to dark mode only.
   - Exposes window.PF_THEME with useTheme() hook + isDarkOnly(slug).
*/
(function () {
  const { useState, useEffect } = React;
  const KEY = "pf_theme";

  const DARK_ONLY_BOARDS = new Set(["illust", "cosplay", "showcase"]);
  const isDarkOnly = (slug) => DARK_ONLY_BOARDS.has(slug);

  const apply = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch { /* */ }
  };
  const get = () => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") return v;
    } catch { /* */ }
    return "light"; // default
  };

  // Apply on load (before React mounts) so the page never flashes wrong theme.
  apply(get());

  const listeners = new Set();
  const setTheme = (theme) => {
    if (theme !== "light" && theme !== "dark") return;
    apply(theme);
    listeners.forEach((fn) => fn(theme));
  };
  const toggle = () => setTheme(get() === "dark" ? "light" : "dark");

  const useTheme = () => {
    const [theme, setLocal] = useState(get());
    useEffect(() => {
      const fn = (t) => setLocal(t);
      listeners.add(fn);
      return () => listeners.delete(fn);
    }, []);
    return [theme, setTheme, toggle];
  };

  // Filters a list of board objects — drops dark-only boards in light mode.
  const filterBoards = (boards, theme) => {
    if (theme === "dark") return boards;
    return (boards || []).filter((b) => !isDarkOnly(b.slug || b.id));
  };

  // Theme toggle button used inside the nav.
  const ThemeToggle = () => {
    const [theme, , toggleTheme] = useTheme();
    return (
      <button className="pf-theme-toggle" onClick={toggleTheme}
              title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              aria-label="theme toggle">
        {theme === "dark" ? "☀" : "☾"}
      </button>
    );
  };

  window.PF_THEME = { useTheme, setTheme, toggle, isDarkOnly, filterBoards, ThemeToggle, DARK_ONLY_BOARDS };
})();
