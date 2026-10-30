(function () {
  'use strict';

  function setupTabs(container) {
    const config = JSON.parse(container.dataset.tabs || '{}');
    const tabs = container.querySelectorAll('.doc-tab');
    const panes = document.querySelectorAll('.doc-pane');

    if (tabs.length === 0 || panes.length === 0) return;

    const defaultTab = config.defaultTab
      || container.querySelector('.doc-tab.active')?.dataset.tab
      || tabs[0].dataset.tab;

    const storageKey = config.storageKey || null;
    const validTabs = Array.from(tabs).map(t => t.dataset.tab);

    function activateTab(name) {
      if (!validTabs.includes(name)) name = defaultTab;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
      panes.forEach(p => {
        const isActive = p.id === 'pane-' + name;
        p.style.display = isActive ? 'block' : 'none';
        p.classList.toggle('active', isActive);
      });
    }

    let initialTab = defaultTab;
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && validTabs.includes(saved)) initialTab = saved;
      } catch (e) { /* ignore */ }
    }

    activateTab(initialTab);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab;
        activateTab(name);
        if (storageKey) {
          try { localStorage.setItem(storageKey, name); } catch (e) { /* ignore */ }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tabs]').forEach(setupTabs);
  });

  window.setupTabs = setupTabs;
})();