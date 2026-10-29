// ===== Вспомогательные функции =====

function capitalizeName(str) {
  return str.trim().toLowerCase().split(/\s+/)
    .map(word => word.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-'))
    .join(' ');
}

function copyText(text, successMessage = '✅ Скопировано!') {
  const showSuccess = () => {
    if (typeof showToast === 'function') {
      showToast(successMessage);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(showSuccess).catch(() => {
      fallbackCopy(text, showSuccess);
    });
  } else {
    fallbackCopy(text, showSuccess);
  }
}

function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (typeof onSuccess === 'function') onSuccess();
  } catch (e) {
    console.error('Не удалось скопировать текст', e);
  }
  document.body.removeChild(ta);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.classList.remove('toast-success', 'toast-error', 'toast-info');
  toast.classList.add('toast-' + type);
  toast.textContent = message;

  if (toast._hideTimer) clearTimeout(toast._hideTimer);

  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}