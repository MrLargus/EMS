(function () {
  'use strict';
  const STORAGE_KEY = 'ems_theme';
  const body = document.body;
  const toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add('theme-' + theme);
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function syncTheme() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!saved) saved = 'light';
    const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
    if (currentTheme !== saved) applyTheme(saved);
  }

  syncTheme();
  window.addEventListener('pageshow', syncTheme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = body.classList.contains('theme-dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
})();