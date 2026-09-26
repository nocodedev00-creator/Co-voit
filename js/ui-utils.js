/**
 * Co'Voit' - Utilitaires UI, Notifications, Formatage & Gestion d'Identité
 */

function safeLower(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().toLowerCase();
}

function formatShortDate(dateStr) {
  if (!dateStr) return '--/--/--';
  const clean = String(dateStr).split('T')[0].split('-');
  if (clean.length === 3) {
    const yearShort = clean[0].slice(-2);
    return `${clean[2]}/${clean[1]}/${yearShort}`;
  }
  return dateStr;
}

function formatShortTime(timeStr) {
  if (!timeStr && timeStr !== 0) return '--:--';

  // Cas 1 : chaîne "HH:MM" ou "HH:MM:SS"
  const str = String(timeStr);
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }

  // Cas 2 : objet Date (Google Sheets renvoie souvent une date complète pour une heure)
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  return str;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colorClasses = {
    info: 'bg-slate-900 text-white border border-slate-700',
    success: 'bg-emerald-600 text-white shadow-emerald-200',
    error: 'bg-rose-600 text-white shadow-rose-200'
  }[type] || 'bg-slate-900 text-white';

  toast.className = `${colorClasses} toast-enter px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center justify-between gap-3 pointer-events-auto max-w-xs`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="opacity-75 hover:opacity-100">&times;</button>
  `;

  toast.querySelector('button').onclick = () => toast.remove();
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function setUsername(name) {
  AppState.currentUser = String(name || '').trim();
  localStorage.setItem('covoid_username', AppState.currentUser);
  updateUserDisplay();
}

function updateUserDisplay() {
  const display = document.getElementById('display-current-user');
  if (display) {
    display.textContent = AppState.currentUser || 'Visiteur';
  }
}

/**
 * Ouvre la modale d'identité UNIQUEMENT lorsqu'une action le requiert.
 * La consultation de la vue Match est libre (lecture seule).
 * @param {string} [reason] - Message contextuel expliquant pourquoi l'identité est demandée.
 */
function checkUserIdentityFlow(reason) {
  if (AppState.route !== 'MATCH') return;

  const knownBlock = document.getElementById('identity-known-block');
  const unknownBlock = document.getElementById('identity-unknown-block');
  const knownName = document.getElementById('identity-known-name');
  const reasonEl = document.getElementById('identity-reason');

  if (reasonEl) {
    reasonEl.textContent = reason || 'Indique ton prénom pour participer.';
  }

  if (AppState.currentUser) {
    knownName.textContent = AppState.currentUser;
    knownBlock.classList.remove('hidden');
    unknownBlock.classList.add('hidden');
  } else {
    knownBlock.classList.add('hidden');
    unknownBlock.classList.remove('hidden');
  }

  openModal('modal-identity');
}

/**
 * Affiche un état de chargement sur un bouton (désactivation + spinner).
 * @param {HTMLElement} btn - Bouton ciblé.
 * @param {boolean} isLoading - Active/désactive l'état.
 * @param {string} [loadingText] - Texte affiché pendant le chargement.
 */
function setButtonLoading(btn, isLoading, loadingText) {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('opacity-60', 'pointer-events-none');
    btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-fast"></span>${loadingText ? `<span class="ml-1">${escapeHtml(loadingText)}</span>` : ''}`;
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-60', 'pointer-events-none');
    if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
  }
}

