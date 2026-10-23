let currentInterviewResult = null;
let selectedQuizQuestions = [];
let quizSectionElement = null;

function openInterviewTest() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('checklistWrapper').style.display = 'none';
  document.getElementById('interviewWrapper').style.display = 'block';

  buildInterviewQuiz();
  window.scrollTo(0, 0);
}

function buildInterviewQuiz() {
  const form = document.getElementById('interviewQuiz');
  form.innerHTML = '';
  quizSectionElement = null;

  selectedQuizQuestions = pickQuestionsFromEachBlock(riddleQuestions);

  interviewStructure.forEach((section, si) => {
    const blockTitle = document.createElement('div');
    blockTitle.className = 'block-title';
    blockTitle.textContent = section.block;
    form.appendChild(blockTitle);

    if (section.type === 'checklist') {
      section.items.forEach((item, ii) => {
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
          <input type="checkbox" name="chk_${si}_${ii}" style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 3px; accent-color: #1a3a6c;">
          <span>${item}</span>
        `;
        form.appendChild(label);
      });
    } else if (section.type === 'quiz') {
      const quizContainer = document.createElement('div');
      quizContainer.className = 'quiz-questions-container';

      selectedQuizQuestions.forEach((q, qi) => {
        const div = document.createElement('div');
        div.className = 'question';
        let html = `<h3>${qi + 1}. ${q.text}</h3>`;
        q.answers.forEach((a, ai) => {
          html += `<label class="answer">
            <input type="radio" name="quiz_${qi}" value="${ai}" style="width: 18px; height: 18px; flex-shrink: 0; margin-top: 3px; accent-color: #1a3a6c;">
            <span>${a}</span>
          </label>`;
        });
        div.innerHTML = html;
        quizContainer.appendChild(div);
      });

      form.appendChild(quizContainer);
      quizSectionElement = quizContainer;

      const quizCheckBlock = document.createElement('div');
      quizCheckBlock.style.marginTop = '15px';
      quizCheckBlock.style.marginBottom = '25px';
      quizCheckBlock.innerHTML = `
        <button type="button" class="gen-btn" onclick="checkQuizOnly()" style="margin-top: 0;">
          ✔️ Проверить вопросы
        </button>
        <div id="quizResult" style="margin-top: 15px;"></div>
      `;
      form.appendChild(quizCheckBlock);
    }
  });
}

function pickQuestionsFromEachBlock(allQuestions) {
  const groups = {};
  allQuestions.forEach(q => {
    const key = q.block || 'Без блока';
    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  });

  const result = [];
  Object.keys(groups).forEach(key => {
    const arr = groups[key];
    const randomIdx = Math.floor(Math.random() * arr.length);
    result.push(arr[randomIdx]);
  });

  const shuffled = shuffleArray(result);
  return shuffled.slice(0, 5);
}

function checkQuizOnly() {
  const formContainer = document.getElementById('interviewQuiz');
  const quizResultEl = document.getElementById('quizResult');

  let quizScore = 0;
  let quizTotal = selectedQuizQuestions.length;

  selectedQuizQuestions.forEach((q, qi) => {
    const checkedRadio = formContainer.querySelector(`input[name="quiz_${qi}"]:checked`);
    const selectedValue = checkedRadio ? parseInt(checkedRadio.value) : -1;

    const correct = q.correct[0];
    if (selectedValue === correct) quizScore += 1;
  });

  const percent = (quizScore / quizTotal) * 100;

  let bg, color, emoji, label;
  if (percent < 50) {
    bg = '#f8d7da'; color = '#721c24'; emoji = '🔴'; label = 'Кандидат не справился с вопросами';
  } else if (percent < 80) {
    bg = '#fff3cd'; color = '#856404'; emoji = '⚠️'; label = 'Кандидат ответил частично';
  } else {
    bg = '#d4edda'; color = '#155724'; emoji = '✅'; label = 'Кандидат отлично ответил на вопросы';
  }

  quizResultEl.innerHTML = `
    <div class="score">${emoji} Вопросы: ${quizScore} из ${quizTotal} (${Math.round(percent)}%)</div>
    <div class="label">${label}</div>
  `;
  quizResultEl.style.background = bg;
  quizResultEl.style.color = color;
  quizResultEl.style.padding = '20px';
  quizResultEl.style.borderRadius = '4px';
  quizResultEl.style.textAlign = 'center';
  quizResultEl.style.border = '1px solid rgba(0,0,0,0.1)';
  quizResultEl.classList.remove('flash');
  void quizResultEl.offsetWidth;
  quizResultEl.classList.add('flash');
  setTimeout(() => quizResultEl.classList.remove('flash'), 200);
}

function checkInterview() {
  const resultEl = document.getElementById('interviewResult');
  const formContainer = document.getElementById('interviewQuiz');

  let checklistScore = 0;
  let checklistTotal = 0;
  interviewStructure.forEach((section, si) => {
    if (section.type === 'checklist') {
      section.items.forEach((_, ii) => {
        checklistTotal++;
        const cb = formContainer.querySelector(`input[name="chk_${si}_${ii}"]`);
        if (cb && cb.checked) checklistScore++;
      });
    }
  });

  let quizScore = 0;
  let quizTotal = selectedQuizQuestions.length;
  selectedQuizQuestions.forEach((q, qi) => {
    const checkedRadio = formContainer.querySelector(`input[name="quiz_${qi}"]:checked`);
    const selectedValue = checkedRadio ? parseInt(checkedRadio.value) : -1;
    const correct = q.correct[0];
    if (selectedValue === correct) quizScore += 1;
  });

  const totalScore = checklistScore + quizScore;
  const totalItems = checklistTotal + quizTotal;
  const percent = (totalScore / totalItems) * 100;

  let rule;
  if (percent < 50) rule = interviewRules[0];
  else if (percent < 80) rule = interviewRules[1];
  else rule = interviewRules[2];

  resultEl.innerHTML = `
    <div class="score">${rule.emoji} Результат: ${totalScore} из ${totalItems} (${Math.round(percent)}%)</div>
    <div class="label">${rule.label}</div>
    <div class="recommendation">
      ${rule.recommendation}<br>
      <small>Чек-пункты: ${checklistScore} / ${checklistTotal} &nbsp;|&nbsp; Вопросы: ${quizScore} / ${quizTotal}</small>
    </div>
  `;
  resultEl.style.background = rule.bg;
  resultEl.style.color = rule.color;
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

  currentInterviewResult = { checklistScore, checklistTotal, quizScore, quizTotal, totalScore, totalItems, rule };
}

function resetInterview() {
  document.querySelectorAll('#interviewQuiz input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('#interviewQuiz input[type="radio"]').forEach(rb => rb.checked = false);
  document.getElementById('interviewResult').innerHTML = '';
  currentInterviewResult = null;
  selectedQuizQuestions = [];
  quizSectionElement = null;

  buildInterviewQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}