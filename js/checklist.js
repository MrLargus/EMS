function openChecklist() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('interviewWrapper').style.display = 'none';
  document.getElementById('checklistWrapper').style.display = 'block';

  // При открытии полей стажёров нет, показываем кнопку добавления
  const container = document.getElementById('traineeInputsContainer');
  if (container) {
    container.innerHTML = '';
    updateAddBtnVisibility();
  }

  buildChecklist();
  window.scrollTo(0, 0);
}

function buildChecklist() {
  const form = document.getElementById('checklistForm');
  form.innerHTML = '';

  checklistData.forEach((block, bi) => {
    const blockTitle = document.createElement('div');
    blockTitle.className = 'block-title';
    blockTitle.textContent = block.block;
    form.appendChild(blockTitle);

    block.items.forEach((item, ii) => {
      const label = document.createElement('label');
      label.className = 'answer';
      label.style.display = 'flex';
      label.style.alignItems = 'flex-start';
      label.style.gap = '12px';
      label.style.margin = '8px 0';
      label.style.padding = '14px';
      label.style.background = '#f8fafc';
      label.style.border = '1px solid #dce1e6';
      label.style.borderRadius = '4px';
      label.style.cursor = 'pointer';
      label.innerHTML = `
        <input type="checkbox" name="chk_${bi}_${ii}" style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 3px; accent-color: #1a3a6c;">
        <span>${item}</span>
      `;
      form.appendChild(label);
    });
  });
}

function checkChecklist() {
  const resultEl = document.getElementById('checklistResult');

  const allCheckboxes = document.querySelectorAll('#checklistForm input[type="checkbox"]');
  let checkedCount = 0;
  allCheckboxes.forEach(cb => { if (cb.checked) checkedCount++; });

  const total = allCheckboxes.length;
  const percent = (checkedCount / total) * 100;

  let bg, color, emoji, label, recommendation;

  if (percent < 50) {
    bg = '#f8d7da'; color = '#721c24'; emoji = '🔴';
    label = 'Стажировка не завершена';
    recommendation = 'Пройдено менее половины пунктов. Необходимо продолжить обучение.';
  } else if (percent < 90) {
    bg = '#fff3cd'; color = '#856404'; emoji = '⚠️';
    label = 'Стажировка почти завершена';
    recommendation = 'Осталось несколько пунктов. Проверьте, все ли важные темы пройдены.';
  } else {
    bg = '#d4edda'; color = '#155724'; emoji = '✅';
    label = 'Стажировка пройдена';
    recommendation = 'Все пункты выполнены. Интерн готов к самостоятельной работе.';
  }

  resultEl.innerHTML = `
    <div class="score">${emoji} Прогресс: ${checkedCount} из ${total} (${Math.round(percent)}%)</div>
    <div class="label">${label}</div>
    <div class="recommendation">${recommendation}</div>
  `;
  resultEl.style.background = bg;
  resultEl.style.color = color;
  resultEl.style.padding = '25px';
  resultEl.style.borderRadius = '4px';
  resultEl.style.textAlign = 'center';
  resultEl.style.marginTop = '30px';
  resultEl.style.border = '1px solid rgba(0,0,0,0.1)';
  resultEl.style.opacity = '1';
  resultEl.classList.remove('flash');
  void resultEl.offsetWidth;
  resultEl.classList.add('flash');
  setTimeout(() => resultEl.classList.remove('flash'), 200);

  // Показываем блок аудита
  renderChecklistAuditBlock();
}

// ===== КАДРОВЫЙ АУДИТ ДЛЯ СТАЖИРОВКИ =====

function renderChecklistAuditBlock() {
  const auditBlock = document.getElementById('checklistAuditBlock');
  if (!auditBlock) return;

  auditBlock.innerHTML = `
    <div class="audit-card">
      <div class="audit-title">📋 Кадровый аудит (Стажировка)</div>
      <div class="audit-subtitle">Скопируйте шаблон и вставьте в кадровый аудит</div>

      <div class="form-actions" style="margin-top: 0;">
        <button type="button" class="gen-btn" onclick="copyChecklistAuditText()" style="margin-top: 0;">
          📋 Скопировать шаблон
        </button>
      </div>
      <div id="copyStatus" class="copy-status"></div>
    </div>
  `;
  auditBlock.style.display = 'block';
}

function copyChecklistAuditText() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateStr = `${dd}.${mm}.${yyyy}`;

  const curatorLogin = localStorage.getItem('ems_curator_login') || '';
  const curatorText = curatorLogin ? `@${curatorLogin}` : '';

  // Собираем всех введенных стажёров
  const traineeInputs = document.querySelectorAll('.trainee-row input');
  const trainees = [];
  
  traineeInputs.forEach(input => {
    const val = input.value.trim();
    if (val) {
      // Добавляем @, если его еще нет в начале строки
      const formattedName = val.startsWith('@') ? val : `@${val}`;
      trainees.push(formattedName);
    }
  });

  // Объединяем всех стажёров через запятую и пробел
  const traineesString = trainees.join(' ');

  // Формируем единый текст аудита
  const text =
    `Имя: ${traineesString}\n` +
    `Должность: Интерн\n` +
    `Куратор: ${curatorText}\n` +
    `Переведён на должность: Мл. Фельдшер\n` +
    `Дата: ${dateStr}\n` +
    `@High staff`;

  copyText(text, '✅ Шаблон скопирован в буфер обмена!');

  // Очищаем форму после копирования (с задержкой, чтобы увидеть уведомление)
  setTimeout(() => {
    resetChecklist();
  }, 1500);
}

function resetChecklist() {
  document.querySelectorAll('#checklistForm input[type="checkbox"]').forEach(cb => cb.checked = false);

  // Очищаем результат и убираем его стили
  const resultEl = document.getElementById('checklistResult');
  resultEl.innerHTML = '';
  resultEl.removeAttribute('style');

  // Скрываем блок аудита
  const auditBlock = document.getElementById('checklistAuditBlock');
  if (auditBlock) {
    auditBlock.innerHTML = '';
    auditBlock.style.display = 'none';
  }

  // Очищаем стажёров (оставляем пустой контейнер, полей нет)
  const container = document.getElementById('traineeInputsContainer');
  if (container) {
    container.innerHTML = '';
    updateAddBtnVisibility();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ФУНКЦИИ УПРАВЛЕНИЯ СТАЖЁРАМИ =====
const MAX_TRAINEES = 3;

function addTraineeInput() {
  const container = document.getElementById('traineeInputsContainer');
  if (!container) return;

  const currentCount = container.querySelectorAll('.trainee-row').length;
  if (currentCount >= MAX_TRAINEES) {
    alert(`Максимум ${MAX_TRAINEES} стажёра за раз.`);
    return;
  }

  const row = document.createElement('div');
  row.className = 'trainee-row';
  
  // ТЕПЕРЬ КРЕСТИК ЕСТЬ ВСЕГДА
  row.innerHTML = `
    <input type="text" placeholder="Discord-логин стажёра" autocomplete="off">
    <button type="button" class="remove-trainee" onclick="removeTraineeInput(this)">✖</button>
  `;

  container.appendChild(row);
  updateAddBtnVisibility();
  
  // Фокус на новое поле
  const newInput = row.querySelector('input');
  if (newInput) newInput.focus();
}

function removeTraineeInput(btn) {
  const container = document.getElementById('traineeInputsContainer');
  if (!container) return;

  const row = btn.closest('.trainee-row');
  if (row) {
    row.remove();
    updateAddBtnVisibility();
  }
}

function updateAddBtnVisibility() {
  const container = document.getElementById('traineeInputsContainer');
  const btn = document.getElementById('addTraineeBtn');
  if (!container || !btn) return;

  const currentCount = container.querySelectorAll('.trainee-row').length;

  // Если достигли лимита — прячем кнопку, иначе показываем
  btn.style.display = currentCount >= MAX_TRAINEES ? 'none' : 'flex';
}