// ===== Вспомогательные функции =====

function capitalizeName(str) {
  return str.trim().toLowerCase().split(/\s+/)
    .map(word => word.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-'))
    .join(' ');
}

function copyText(text, successMessage) {
  const copyStatus = document.getElementById('copyStatus');
  if (!copyStatus) return;
  const showSuccess = () => {
    copyStatus.textContent = successMessage;
    setTimeout(() => copyStatus.textContent = '', 3000);
  };
  navigator.clipboard.writeText(text).then(showSuccess).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showSuccess();
  });
}