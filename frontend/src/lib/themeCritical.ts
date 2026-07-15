/**
 * Critical theme CSS, inlined into the HTML by the root layout.
 *
 * This is the single source of truth for the Verity design tokens
 * (globals.css deliberately does not redefine them). Because it ships
 * inside the document itself, the page keeps its obsidian/gold look and
 * readable text even if an external CSS chunk fails to load — e.g. during
 * CDN propagation right after a deploy, which otherwise renders the app
 * as unstyled black-on-white.
 */
export const THEME_CRITICAL_CSS = `
:root{
  --bg:#0b0a08;--bg-2:#14120d;--text:#f4f1e8;--text-2:#ddd8cb;--muted:#a29d8f;
  --faint:#8a8474;--faint-2:#5c574b;--fg-rgb:244,241,232;
  --accent:#e2c178;--accent-2:#b98a2f;--accent-3:#b4a0e8;--on-accent:#14120d;
  --accent-rgb:226,193,120;--accent2-rgb:185,138,47;--accent3-rgb:180,160,232;
  --up:#10b981;--down:#e5484d;--warn:#f5a623;
  --up-rgb:16,185,129;--down-rgb:229,72,77;--warn-rgb:245,166,35;--faint-rgb:138,132,116;
  --shadow-card:0 8px 32px rgba(0,0,0,0.35);
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1);
}
html.light{
  --bg:#f6f3ea;--bg-2:#fdfbf5;--text:#1d1a13;--text-2:#3a362b;--muted:#6b6557;
  --faint:#6e6858;--faint-2:#8c8676;--fg-rgb:29,26,19;
  --accent:#9a7b24;--accent-2:#7a5e14;--accent-3:#6d4fc3;--on-accent:#fffdf5;
  --accent-rgb:154,123,36;--accent2-rgb:122,94,20;--accent3-rgb:109,79,195;
  --up:#147a52;--down:#c03538;--warn:#a96a0a;
  --up-rgb:20,122,82;--down-rgb:192,53,56;--warn-rgb:169,106,10;--faint-rgb:110,104,88;
  --shadow-card:0 8px 32px rgba(29,26,19,0.08);
}
body{
  font-family:var(--font-sans),"Inter",system-ui,sans-serif;
  background:var(--bg);color:var(--text);
  -webkit-font-smoothing:antialiased;min-height:100vh;margin:0;
  transition:background-color .3s ease,color .3s ease;
}
.font-display{font-family:var(--font-display),Georgia,serif}
.gradient-text{
  background:linear-gradient(135deg,var(--accent),var(--accent-2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
`;
