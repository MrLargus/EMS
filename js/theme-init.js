(function () {
  const STORAGE_KEY = 'ems_theme';
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  const initial = saved || 'light';
  document.documentElement.classList.toggle('theme-dark', initial === 'dark');
  function applyToBody() {
    if (document.body) {
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add('theme-' + initial);
    }
  }
  if (document.body) {
    applyToBody();
  } else {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.body) {
        applyToBody();
        obs.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
})();