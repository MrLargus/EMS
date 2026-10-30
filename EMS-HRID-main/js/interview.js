let currentInterviewResult = null;
let selectedQuizQuestions = [];
let quizSectionElement = null;

let extraQuestionsAdded = 0;
let medicalQuestionsAdded = 0;

const MAX_EXTRA_QUESTIONS = 3;
const MAX_MEDICAL_QUESTIONS = 3;
const MAIN_QUESTIONS_COUNT = 5;
const FIXED_FIRST_INDEX = 0;

const INTERVIEW_STORAGE_KEY = 'ems_interview_progress';

function openInterviewTest() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('checklistWrapper').style.display = 'none';
    document.getElementById('interviewWrapper').style.display = 'block';

    buildInterviewQuiz();
    restoreInterviewProgress();
    window.scrollTo(0, 0);
}

function buildInterviewQuiz() {
    const form = document.getElementById('interviewQuiz');
    form.innerHTML = '';
    quizSectionElement = null;
    extraQuestionsAdded = 0;
    medicalQuestionsAdded = 0;

    selectedQuizQuestions = buildMainQuestions();

    interviewStructure.forEach((section, si) => {
        const blockTitle = document.createElement('div');
        blockTitle.className = 'block-title';
        blockTitle.textContent = section.block;
        form.appendChild(blockTitle);

        if (section.type === 'checklist') {
            section.items.forEach((item, ii) => {
                const label = document.createElement('label');
                label.className = 'answer';
                label.innerHTML = `
          <input type="checkbox" name="chk_${si}_${ii}">
          <span>${item}</span>
        `;
                form.appendChild(label);
            });
        } else if (section.type === 'quiz') {
            const quizContainer = document.createElement('div');
            quizContainer.className = 'quiz-questions-container';
            quizContainer.id = 'quizQuestionsContainer';

            selectedQuizQuestions.forEach((q, qi) => {
                quizContainer.appendChild(createQuestionElement(q, qi));
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
        <div class="quiz-action-row" style="display: none; margin-top: 10px; gap: 10px; flex-direction: row; flex-wrap: wrap;">
          <button type="button" class="gen-btn" id="extraQuestionBtn" onclick="addExtraQuestion()" style="margin-top: 0; display: none; flex: 1; min-width: 200px;">
            ➕ Дополнительный вопрос
          </button>
          <button type="button" class="gen-btn" id="medicalQuestionBtn" onclick="addMedicalQuestion()" style="margin-top: 0; display: none; flex: 1; min-width: 200px;">
            🩺 Вопрос на знание медицины
          </button>
        </div>
        <div id="quizResult" style="margin-top: 15px;"></div>
      `;
            form.appendChild(quizCheckBlock);
        }
    });
}

function createQuestionElement(q, index) {
    const div = document.createElement('div');
    div.className = 'question';
    div.dataset.quizIndex = index;
    let html = `<h3>${index + 1}. ${q.text}</h3>`;
    q.answers.forEach((a, ai) => {
        html += `<label class="answer">
      <input type="radio" name="quiz_${index}" value="${ai}">
      <span>${a}</span>
    </label>`;
    });
    div.innerHTML = html;
    return div;
}

function buildMainQuestions() {
    const result = [];
    const fixedQuestion = riddleQuestions[FIXED_FIRST_INDEX];
    result.push(fixedQuestion);
    const usedIndices = new Set([FIXED_FIRST_INDEX]);

    const groups = {};
    riddleQuestions.forEach((q, i) => {
        if (i === FIXED_FIRST_INDEX) return;
        if (q.block.includes('Знание медицины')) return;
        const key = q.block;
        if (!groups[key]) groups[key] = [];
        groups[key].push({ q, idx: i });
    });

    Object.keys(groups).forEach(key => {
        const arr = groups[key];
        const pick = arr[Math.floor(Math.random() * arr.length)];
        result.push(pick.q);
        usedIndices.add(pick.idx);
    });

    if (result.length < MAIN_QUESTIONS_COUNT) {
        const extraPool = riddleQuestions
            .map((q, i) => ({ q, idx: i }))
            .filter(item => !usedIndices.has(item.idx) && !item.q.block.includes('Знание медицины'));
        const shuffled = shuffleArray(extraPool);
        while (result.length < MAIN_QUESTIONS_COUNT && shuffled.length > 0) {
            const pick = shuffled.pop();
            result.push(pick.q);
            usedIndices.add(pick.idx);
        }
    }

    const tail = result.slice(1);
    const shuffledTail = shuffleArray(tail);
    return [result[0], ...shuffledTail].slice(0, MAIN_QUESTIONS_COUNT);
}

function getUsedQuestionIndices() {
    const used = new Set();
    selectedQuizQuestions.forEach(q => {
        const idx = riddleQuestions.indexOf(q);
        if (idx !== -1) used.add(idx);
    });
    return used;
}

function addExtraQuestion() {
    if (extraQuestionsAdded >= MAX_EXTRA_QUESTIONS) {
        showToast(`Больше ${MAX_EXTRA_QUESTIONS} дополнительных вопросов задавать нельзя.`, 'error');
        return;
    }

    const usedIndices = getUsedQuestionIndices();
    const availableIndices = riddleQuestions
        .map((q, i) => ({ q, idx: i }))
        .filter(item => !usedIndices.has(item.idx) && !item.q.block.includes('Знание медицины'))
        .map(item => item.idx);

    if (availableIndices.length === 0) {
        showToast('Все дополнительные вопросы (кроме медицины) уже заданы.', 'info');
        return;
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const newQuestion = riddleQuestions[randomIndex];
    selectedQuizQuestions.push(newQuestion);
    extraQuestionsAdded++;

    appendQuestionToContainer(newQuestion, selectedQuizQuestions.length - 1);
    updateExtraButtonsVisibility();
    saveInterviewProgress();
}

function addMedicalQuestion() {
    if (medicalQuestionsAdded >= MAX_MEDICAL_QUESTIONS) {
        showToast(`Больше ${MAX_MEDICAL_QUESTIONS} медицинских вопросов задавать нельзя.`, 'error');
        return;
    }

    const usedIndices = getUsedQuestionIndices();
    const availableIndices = riddleQuestions
        .map((q, i) => ({ q, idx: i }))
        .filter(item => !usedIndices.has(item.idx) && item.q.block.includes('Знание медицины'))
        .map(item => item.idx);

    if (availableIndices.length === 0) {
        showToast('Все медицинские вопросы уже заданы.', 'info');
        return;
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const newQuestion = riddleQuestions[randomIndex];
    selectedQuizQuestions.push(newQuestion);
    medicalQuestionsAdded++;

    appendQuestionToContainer(newQuestion, selectedQuizQuestions.length - 1);
    updateExtraButtonsVisibility();
    saveInterviewProgress();
}

function appendQuestionToContainer(q, index) {
    const quizContainer = document.getElementById('quizQuestionsContainer');
    if (!quizContainer) return;
    const el = createQuestionElement(q, index);
    quizContainer.appendChild(el);
    setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
}

function updateExtraButtonsVisibility() {
    const extraBtn = document.getElementById('extraQuestionBtn');
    const medBtn = document.getElementById('medicalQuestionBtn');
    const actionRow = document.querySelector('.quiz-action-row');
    if (!extraBtn || !medBtn) return;

    const correctCount = countCorrectQuizAnswers();
    const percent = (Math.min(correctCount, MAIN_QUESTIONS_COUNT) / MAIN_QUESTIONS_COUNT) * 100;
    const showAnyButton = percent < 80;

    const usedIndices = getUsedQuestionIndices();
    const hasExtra = riddleQuestions.some(
        (q, i) => !usedIndices.has(i) && !q.block.includes('Знание медицины')
    );
    const hasMedical = riddleQuestions.some(
        (q, i) => !usedIndices.has(i) && q.block.includes('Знание медицины')
    );

    const canExtra = showAnyButton && extraQuestionsAdded < MAX_EXTRA_QUESTIONS && hasExtra;
    const canMedical = showAnyButton && medicalQuestionsAdded < MAX_MEDICAL_QUESTIONS && hasMedical;

    extraBtn.style.display = canExtra ? 'block' : 'none';
    medBtn.style.display = canMedical ? 'block' : 'none';

    if (actionRow) {
        actionRow.style.display = (canExtra || canMedical) ? 'flex' : 'none';
    }
}

function countCorrectQuizAnswers() {
    const formContainer = document.getElementById('interviewQuiz');
    let correct = 0;
    selectedQuizQuestions.forEach((q, qi) => {
        const checkedRadio = formContainer.querySelector(`input[name="quiz_${qi}"]:checked`);
        const selectedValue = checkedRadio ? parseInt(checkedRadio.value) : -1;
        if (selectedValue === q.correct[0]) correct++;
    });
    return correct;
}

function checkQuizOnly() {
    const quizResultEl = document.getElementById('quizResult');

    const correctCount = countCorrectQuizAnswers();
    const totalAsked = selectedQuizQuestions.length;
    const finalScore = Math.min(correctCount, MAIN_QUESTIONS_COUNT);
    const percent = (finalScore / MAIN_QUESTIONS_COUNT) * 100;

    let bg, color, emoji, label;
    if (percent < 50) {
        bg = '#f8d7da'; color = '#721c24'; emoji = '🔴'; label = 'Кандидат не справился с вопросами';
    } else if (percent < 80) {
        bg = '#fff3cd'; color = '#856404'; emoji = '⚠️'; label = 'Кандидат ответил частично';
    } else {
        bg = '#d4edda'; color = '#155724'; emoji = '✅'; label = 'Кандидат отлично ответил на вопросы';
    }

    let details = `Правильных: ${correctCount} из ${totalAsked} заданных (итог: ${finalScore} / ${MAIN_QUESTIONS_COUNT})`;
    if (extraQuestionsAdded > 0 || medicalQuestionsAdded > 0) {
        details += `<br><small>Доп. вопросов: ${extraQuestionsAdded} / ${MAX_EXTRA_QUESTIONS} &nbsp;|&nbsp; Медицинских: ${medicalQuestionsAdded} / ${MAX_MEDICAL_QUESTIONS}</small>`;
    }

    quizResultEl.innerHTML = `
    <div class="score">${emoji} Вопросы: ${finalScore} из ${MAIN_QUESTIONS_COUNT} (${Math.round(percent)}%)</div>
    <div class="label">${label}</div>
    <div style="margin-top: 8px; font-size: 13px; opacity: 0.85;">${details}</div>
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

    updateExtraButtonsVisibility();
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

    const correctQuizCount = countCorrectQuizAnswers();
    const finalQuizScore = Math.min(correctQuizCount, MAIN_QUESTIONS_COUNT);
    const quizTotal = MAIN_QUESTIONS_COUNT;

    const totalScore = checklistScore + finalQuizScore;
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
      <small>Чек-пункты: ${checklistScore} / ${checklistTotal} &nbsp;|&nbsp; Вопросы: ${finalQuizScore} / ${quizTotal}</small>
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

    currentInterviewResult = { checklistScore, checklistTotal, finalQuizScore, quizTotal, totalScore, totalItems, rule };

    renderAuditBlock();
}

function resetInterview() {
    document.querySelectorAll('#interviewQuiz input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#interviewQuiz input[type="radio"]').forEach(rb => rb.checked = false);

    const interviewResultEl = document.getElementById('interviewResult');
    interviewResultEl.innerHTML = '';
    interviewResultEl.removeAttribute('style');

    const quizResultEl = document.getElementById('quizResult');
    if (quizResultEl) {
        quizResultEl.innerHTML = '';
        quizResultEl.removeAttribute('style');
    }

    const auditBlock = document.getElementById('auditBlock');
    if (auditBlock) {
        auditBlock.innerHTML = '';
        auditBlock.style.display = 'none';
    }

    currentInterviewResult = null;
    selectedQuizQuestions = [];
    quizSectionElement = null;
    extraQuestionsAdded = 0;
    medicalQuestionsAdded = 0;

    clearInterviewProgress();
    buildInterviewQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAuditBlock() {
    const auditBlock = document.getElementById('auditBlock');
    if (!auditBlock) return;

    auditBlock.innerHTML = `
      <div class="audit-card">
        <div class="audit-title">📋 Кадровый аудит</div>
        <div class="audit-subtitle">Скопируйте шаблон и вставьте в кадровый аудит</div>

        <div class="form-actions" style="margin-top: 0;">
          <button type="button" class="gen-btn" onclick="copyAuditText()" style="margin-top: 0;">
            📋 Скопировать шаблон
          </button>
        </div>
      </div>
    `;
    auditBlock.style.display = 'block';
}

function copyAuditText() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}.${mm}.${yyyy}`;

    const curatorLogin = localStorage.getItem('ems_curator_login') || '';

    const text =
        `Имя: \n` +
        `Должность: Интерн\n` +
        `Куратор: @${curatorLogin}\n` +
        `Дата: ${dateStr}\n` +
        `@High staff`;

    copyText(text, '✅ Шаблон скопирован в буфер обмена!');

    setTimeout(() => {
        resetInterview();
    }, 1500);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveInterviewProgress() {
    const checks = {};
    document.querySelectorAll('#interviewQuiz input[type="checkbox"]').forEach(cb => {
        checks[cb.name] = cb.checked;
    });

    const radios = {};
    document.querySelectorAll('#interviewQuiz input[type="radio"]:checked').forEach(rb => {
        radios[rb.name] = rb.value;
    });

    const state = {
        questionIndices: selectedQuizQuestions.map(q => riddleQuestions.indexOf(q)),
        extraQuestionsAdded,
        medicalQuestionsAdded,
        checks,
        radios
    };

    try {
        localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
}

function restoreInterviewProgress() {
    let saved = null;
    try { saved = localStorage.getItem(INTERVIEW_STORAGE_KEY); } catch (e) { return; }
    if (!saved) return;

    let state;
    try { state = JSON.parse(saved); } catch (e) { return; }

    if (Array.isArray(state.questionIndices) && state.questionIndices.length > 0) {
        const restored = state.questionIndices
            .map(idx => riddleQuestions[idx])
            .filter(Boolean);
        if (restored.length === state.questionIndices.length) {
            selectedQuizQuestions = restored;
            extraQuestionsAdded = state.extraQuestionsAdded || 0;
            medicalQuestionsAdded = state.medicalQuestionsAdded || 0;

            const quizContainer = document.getElementById('quizQuestionsContainer');
            if (quizContainer) {
                quizContainer.innerHTML = '';
                selectedQuizQuestions.forEach((q, qi) => {
                    quizContainer.appendChild(createQuestionElement(q, qi));
                });
            }
        }
    }

    if (state.checks) {
        Object.entries(state.checks).forEach(([name, checked]) => {
            const cb = document.querySelector(`#interviewQuiz input[name="${name}"]`);
            if (cb) cb.checked = !!checked;
        });
    }

    if (state.radios) {
        Object.entries(state.radios).forEach(([name, value]) => {
            const rb = document.querySelector(`#interviewQuiz input[name="${name}"][value="${value}"]`);
            if (rb) rb.checked = true;
        });
    }
}

function clearInterviewProgress() {
    try { localStorage.removeItem(INTERVIEW_STORAGE_KEY); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('interviewQuiz');
    if (form) {
        form.addEventListener('change', saveInterviewProgress);
    }
});