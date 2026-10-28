let examPassed = false;

function openChecklist() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('interviewWrapper').style.display = 'none';
  document.getElementById('checklistWrapper').style.display = 'block';

  const container = document.getElementById('traineeInputsContainer');
  if (container) {
    container.innerHTML = '';
    updateAddBtnVisibility();
  }

  buildChecklist();
  examPassed = false;
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

// ===== ЭКЗАМЕН =====

function startExam() {
  const examBlock = document.getElementById('examBlock');
  if (!examBlock) return;

  // Проверка чек-листа убрана — экзамен запускается сразу
  examBlock.style.display = 'block';
  buildExamQuestions();
  examBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildExamQuestions() {
  const container = document.getElementById('examQuestionsContainer');
  if (!container) return;
  container.innerHTML = '';

  examQuestions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'question';
    const isMultiple = q.type === 'multiple';
    let html = `<h3>${qi + 1}. ${q.text}</h3>`;

    q.answers.forEach((a, ai) => {
      if (isMultiple) {
        html += `<label class="answer">
          <input type="checkbox" name="exam_${qi}_${ai}" value="${ai}" style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 3px; accent-color: #1a3a6c;">
          <span>${a}</span>
        </label>`;
      } else {
        html += `<label class="answer">
          <input type="radio" name="exam_${qi}" value="${ai}" style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 3px; accent-color: #1a3a6c;">
          <span>${a}</span>
        </label>`;
      }
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}

function checkExam() {
  const resultEl = document.getElementById('examResult');
  if (!resultEl) return;

  let correctPoints = 0;
  let totalPoints = 0;

  examQuestions.forEach((q, qi) => {
    const isMultiple = q.type === 'multiple';
    const correctSet = new Set(q.correct);
    totalPoints += correctSet.size; // каждый правильный вариант = 1 балл

    if (isMultiple) {
      // Множественный выбор: считаем только правильные отмеченные чекбоксы
      q.answers.forEach((_, ai) => {
        const cb = document.querySelector(`input[name="exam_${qi}_${ai}"]`);
        if (cb && cb.checked && correctSet.has(ai)) {
          correctPoints++;
        }
      });
    } else {
      // Одиночный выбор: проверяем, что выбран ровно один правильный
      const checked = document.querySelector(`input[name="exam_${qi}"]:checked`);
      if (checked) {
        const selected = parseInt(checked.value);
        if (correctSet.has(selected)) correctPoints++;
      }
    }
  });

  const percent = totalPoints > 0 ? (correctPoints / totalPoints) * 100 : 0;
  const passed = percent >= 90;

  let bg, color, emoji, label;
  if (passed) {
    bg = '#d4edda'; color = '#155724'; emoji = '✅'; label = 'Экзамен сдан';
  } else {
    bg = '#f8d7da'; color = '#721c24'; emoji = '🔴'; label = 'Экзамен не сдан';
  }

  resultEl.innerHTML = `
    <div class="score">${emoji} Результат: ${correctPoints} из ${totalPoints} (${Math.round(percent)}%)</div>
    <div class="label">${label}</div>
    <div class="recommendation">${passed ? 'Интерн готов к самостоятельной работе.' : 'Необходимо повторить материал и попробовать снова.'}</div>
  `;
  resultEl.style.background = bg;
  resultEl.style.color = color;
  resultEl.style.padding = '25px';
  resultEl.style.borderRadius = '4px';
  resultEl.style.textAlign = 'center';
  resultEl.style.marginTop = '20px';
  resultEl.style.border = '1px solid rgba(0,0,0,0.1)';

  examPassed = passed;

  // Показываем финальный блок в любом случае (сдан или не сдан)
  const finalBlock = document.getElementById('finalAuditBlock');
  if (finalBlock) {
    finalBlock.style.display = 'block';
    renderFinalAuditBlock();
  }
}

// ===== ФИНАЛЬНЫЙ АУДИТ =====

function renderFinalAuditBlock() {
  const auditBlock = document.getElementById('finalAuditBlock');
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

  const traineeInputs = document.querySelectorAll('.trainee-row input');
  const trainees = [];
  traineeInputs.forEach(input => {
    const val = input.value.trim();
    if (val) {
      const formattedName = val.startsWith('@') ? val : `@${val}`;
      trainees.push(formattedName);
    }
  });
  const traineesString = trainees.join(' ');

  // Динамический статус на основе результата экзамена
  const examStatus = examPassed ? 'сдан' : 'не сдан';
  const positionLine = examPassed
    ? 'Переведён на должность: Мл. Фельдшер'
    : 'Отправлен на пересдачу';

  const text =
    `Стажёр: ${traineesString}\n` +
    `Должность: Интерн\n` +
    `Куратор: ${curatorText}\n` +
    `Результат экзамена: ${examStatus};\n` +
    `${positionLine}\n` +
    `Дата: ${dateStr}\n` +
    `@High staff`;

  copyText(text, '✅ Шаблон скопирован в буфер обмена!');

  setTimeout(() => {
    resetChecklist();
  }, 1500);
}

function resetChecklist() {
  document.querySelectorAll('#checklistForm input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('#examQuestionsContainer input').forEach(inp => inp.checked = false);

  const resultEl = document.getElementById('checklistResult');
  if (resultEl) { resultEl.innerHTML = ''; resultEl.removeAttribute('style'); }

  const examResult = document.getElementById('examResult');
  if (examResult) { examResult.innerHTML = ''; examResult.removeAttribute('style'); }

  const examBlock = document.getElementById('examBlock');
  if (examBlock) examBlock.style.display = 'none';

  const finalBlock = document.getElementById('finalAuditBlock');
  if (finalBlock) { finalBlock.innerHTML = ''; finalBlock.style.display = 'none'; }

  const container = document.getElementById('traineeInputsContainer');
  if (container) {
    container.innerHTML = '';
    updateAddBtnVisibility();
  }

  examPassed = false;
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
  row.innerHTML = `
    <input type="text" placeholder="Discord-логин стажёра" autocomplete="off">
    <button type="button" class="remove-trainee" onclick="removeTraineeInput(this)">✖</button>
  `;

  container.appendChild(row);
  updateAddBtnVisibility();
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
  btn.style.display = currentCount >= MAX_TRAINEES ? 'none' : 'flex';
}