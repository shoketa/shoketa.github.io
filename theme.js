const STORAGE_KEY = 'theme';
const html = document.documentElement;

function getPreferred() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function apply(theme) {
  html.classList.toggle('light', theme === 'light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '☽' : '☀';
}

document.addEventListener('DOMContentLoaded', () => {
  // Fade the page in now that DOM is ready and theme is already set
  document.body.style.opacity = '1';

  apply(getPreferred());

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = html.classList.contains('light') ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    document.body.classList.add('theme-transitioning');
    apply(next);
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);
  });
});
