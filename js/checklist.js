function openChecklist() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('interviewWrapper').style.display = 'none';
  document.getElementById('checklistWrapper').style.display = 'block';

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
}

function resetChecklist() {
  document.querySelectorAll('#checklistForm input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('checklistResult').innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}