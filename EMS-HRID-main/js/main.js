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

// === ПРИКОЛ С ИНПУТОМ ===
let clickAttempts = 0;
let isAnimating = false;

const insults = [
  "ХЕРург моржовый",
  "Джумайсымба",
  "ХЕРург с заниженным образованием",
  "Пьян",
  "Абонент не абонент",
  "Скайли осуждает тебя"
];

function isCuratorLoginFilled() {
  const input = document.getElementById('globalCuratorInput');
  return input && input.value.trim().length > 0;
}

function triggerCuratorError(level) {
  const group = document.getElementById('curatorGroup');
  if (!group) return;

  group.classList.remove('error-shake-1', 'error-shake-2', 'error-shake-3');
  void group.offsetWidth; // Триггер рефлоу

  if (level === 1) group.classList.add('error-shake-1');
  if (level === 2) group.classList.add('error-shake-2');
  if (level === 3) group.classList.add('error-shake-3');

  setTimeout(() => {
    group.classList.remove('error-shake-1', 'error-shake-2', 'error-shake-3');
  }, 600);
}

function showFingers(count) {
  const overlay = document.getElementById('jokeOverlay');
  overlay.innerHTML = '';
  overlay.style.display = 'block';

  if (count === 1) {
    overlay.innerHTML = `<div class="joke-finger finger-top-left">👆</div>`;
  } else if (count === 2) {
    overlay.innerHTML = `
      <div class="joke-finger finger-top-left">👆</div>
      <div class="joke-finger finger-top-right">👆</div>
    `;
  }

  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  }, 1000);
}

function handleMenuClick(actionName) {
  // Если уже идет анимация — игнорируем клик
  if (isAnimating) return;

  if (isCuratorLoginFilled()) {
    if (actionName === 'test') window.openInterviewTest();
    if (actionName === 'checklist') window.openChecklist();
    return;
  }

  isAnimating = true;
  clickAttempts++;

  let blockDuration = 600;

  if (clickAttempts === 1) {
    triggerCuratorError(1);
  }
  else if (clickAttempts === 2) {
    triggerCuratorError(2);
    showFingers(1);
    blockDuration = 1000;
  }
  else if (clickAttempts === 3) {
    triggerCuratorError(3);
    showFingers(2);
    blockDuration = 1000;
  }
  else if (clickAttempts >= 4) {
    blockDuration = 1800;

    const group = document.getElementById('curatorGroup');
    const overlay = document.getElementById('jokeOverlay');

    group.style.opacity = '0';
    overlay.style.display = 'block';
    overlay.innerHTML = `<div class="joke-emoji">😐</div>`;

    setTimeout(() => {
      overlay.innerHTML = `<div class="joke-emoji">😑</div>`;
    }, 800);

    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.innerHTML = '';
      group.style.opacity = '1';

      const randomInsult = insults[Math.floor(Math.random() * insults.length)];
      const input = document.getElementById('globalCuratorInput');
      input.value = randomInsult;

      localStorage.setItem('ems_curator_login', randomInsult);

      clickAttempts = 0;
      isAnimating = false; // Снимаем блокировку перед переходом

      // Впускаем пользователя
      if (actionName === 'test') window.openInterviewTest();
      if (actionName === 'checklist') window.openChecklist();
    }, 1800);
    
    return; // ВАЖНО: выходим из функции, чтобы не сработал нижний таймер
  }

  // Снимаем блокировку для 1, 2 и 3 кликов
  setTimeout(() => {
    isAnimating = false;
  }, blockDuration);
}

// === Инициализация при загрузке ===
document.addEventListener('DOMContentLoaded', () => {
  // Сбрасываем счетчик кликов при обновлении страницы
  clickAttempts = 0;
  isAnimating = false;

  const curatorInput = document.getElementById('globalCuratorInput');
  if (curatorInput) {
    const savedCurator = localStorage.getItem('ems_curator_login');
    if (savedCurator) {
      curatorInput.value = savedCurator;
    }

    curatorInput.addEventListener('input', (e) => {
      localStorage.setItem('ems_curator_login', e.target.value.trim());
    });
  }
});

// Обертки для кнопок (должны передавать строки!)
function tryOpenInterviewTest() {
  handleMenuClick('test');
}

function tryOpenChecklist() {
  handleMenuClick('checklist');
}
