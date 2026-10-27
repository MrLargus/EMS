if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

function goToMenu() {
  document.getElementById('checklistWrapper').style.display = 'none';
  document.getElementById('interviewWrapper').style.display = 'none';
  document.getElementById('startScreen').style.display = 'block';
  window.scrollTo(0, 0);
}

// === Сохранение логина куратора ===
document.addEventListener('DOMContentLoaded', () => {
  const curatorInput = document.getElementById('globalCuratorInput');
  if (curatorInput) {
    // Восстанавливаем значение при загрузке
    const savedCurator = localStorage.getItem('ems_curator_login');
    if (savedCurator) {
      curatorInput.value = savedCurator;
    }

    // Сохраняем при каждом изменении
    curatorInput.addEventListener('input', (e) => {
      localStorage.setItem('ems_curator_login', e.target.value.trim());
    });
  }
});