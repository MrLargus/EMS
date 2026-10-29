let examPassed = false;
const CHECKLIST_STORAGE_KEY = 'ems_checklist_progress';

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
  restoreChecklistProgress();
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
      label.innerHTML = `
        <input type="checkbox" name="chk_${bi}_${ii}">
        <span>${item}</span>
      `;
      form.appendChild(label);
    });
  });
}

function startExam() {
  const examBlock = document.getElementById('examBlock');
  if (!examBlock) return;

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
          <input type="checkbox" name="exam_${qi}_${ai}" value="${ai}">
          <span>${a}</span>
        </label>`;
      } else {
        html += `<label class="answer">
          <input type="radio" name="exam_${qi}" value="${ai}">
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
    totalPoints += correctSet.size;

    if (isMultiple) {
      q.answers.forEach((_, ai) => {
        const cb = document.querySelector(`input[name="exam_${qi}_${ai}"]`);
        if (cb && cb.checked && correctSet.has(ai)) correctPoints++;
      });
    } else {
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

  const finalBlock = document.getElementById('finalAuditBlock');
  if (finalBlock) {
    finalBlock.style.display = 'block';
    renderFinalAuditBlock();
  }
}

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
  clearChecklistProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const MAX_TRAINEES = 3;

function addTraineeInput() {
  const container = document.getElementById('traineeInputsContainer');
  if (!container) return;

  const currentCount = container.querySelectorAll('.trainee-row').length;
  if (currentCount >= MAX_TRAINEES) {
    showToast(`Максимум ${MAX_TRAINEES} стажёра за раз.`, 'error');
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

function saveChecklistProgress() {
  const checkboxes = {};
  document.querySelectorAll('#checklistForm input[type="checkbox"]').forEach(cb => {
    checkboxes[cb.name] = cb.checked;
  });

  const trainees = [];
  document.querySelectorAll('.trainee-row input').forEach(inp => {
    trainees.push(inp.value);
  });

  const state = { checkboxes, trainees, examPassed };

  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function restoreChecklistProgress() {
  let saved = null;
  try { saved = localStorage.getItem(CHECKLIST_STORAGE_KEY); } catch (e) { return; }
  if (!saved) return;

  let state;
  try { state = JSON.parse(saved); } catch (e) { return; }

  if (state.checkboxes) {
    Object.entries(state.checkboxes).forEach(([name, checked]) => {
      const cb = document.querySelector(`#checklistForm input[name="${name}"]`);
      if (cb) cb.checked = !!checked;
    });
  }

  if (Array.isArray(state.trainees) && state.trainees.length > 0) {
    const container = document.getElementById('traineeInputsContainer');
    if (container) {
      container.innerHTML = '';
      state.trainees.forEach(val => {
        addTraineeInput();
        const inputs = container.querySelectorAll('.trainee-row input');
        inputs[inputs.length - 1].value = val;
      });
    }
  }
}

function clearChecklistProgress() {
  try { localStorage.removeItem(CHECKLIST_STORAGE_KEY); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklistForm');
  if (form) form.addEventListener('change', saveChecklistProgress);
  const traineesContainer = document.getElementById('traineeInputsContainer');
  if (traineesContainer) traineesContainer.addEventListener('input', saveChecklistProgress);
});