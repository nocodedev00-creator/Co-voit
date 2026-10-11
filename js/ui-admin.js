/**
 * Co'Voit' - Vue Administrateur & Gestion des Rencontres
 */

async function loadAdminDashboard() {
  if (!AppState.adminToken) return;

  try {
    const matches = await callServer('ctrlGetAdminMatches', AppState.adminToken);
    AppState.adminMatches = Array.isArray(matches) ? matches : [];
    renderAdminMatches(AppState.adminMatches);
  } catch (err) {
    showToast(err.message, 'error');
    // Si le token admin est invalide, afficher l'écran d'accès refusé
    const viewAdmin = document.getElementById('view-admin');
    const viewNoAccess = document.getElementById('view-no-access');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (viewNoAccess) viewNoAccess.classList.remove('hidden');
  }
}

function renderAdminMatches(matches) {
  const container = document.getElementById('admin-matches-list');
  if (!container) return;
  container.innerHTML = '';

  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-xs">
        Aucun match créé pour le moment. Cliquez sur le bouton ci-dessus pour planifier votre premier déplacement.
      </div>`;
    return;
  }

  matches.forEach(m => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-4 shadow-sm border-2 border-slate-200 space-y-3';

    const lockBadge = m.is_locked 
      ? `<span class="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">Verrouillé</span>`
      : `<span class="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">Ouvert</span>`;

    const hasAssignment = m.has_car_assignment !== false && m.has_car_assignment !== 'false';
    const modeBadge = hasAssignment
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">Répartition A/R</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">Comptage simple</span>`;

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            ${lockBadge}
            ${modeBadge}
            <span class="text-xs text-slate-500 font-bold">${formatShortDate(m.event_date)} à ${formatShortTime(m.departure_time)}</span>
          </div>
          <h3 class="font-black text-slate-900 text-sm mt-0.5">${escapeHtml(m.title)}</h3>
          <p class="text-xs text-slate-500 truncate">📍 ${escapeHtml(m.meeting_place)}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-xs border border-slate-200">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Voitures</span>
          <span class="font-black text-slate-900">${m.rides_count || 0}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Places A/R</span>
          <span class="font-black text-slate-900">${m.total_seats_outward || 0} / ${m.total_seats_return || 0}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Sans place</span>
          <span class="font-black ${m.waiting_count > 0 ? 'text-amber-600' : 'text-slate-900'}">${m.waiting_count || 0}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-1.5 pt-1">
        <button class="btn-match-edit btn-tap py-2.5 bg-amber-50 text-amber-900 hover:bg-amber-100 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-amber-300">
          <span>✏️</span> <span>Modifier</span>
        </button>
        <button class="btn-match-view btn-tap py-2.5 bg-blue-50 text-blue-800 hover:bg-blue-100 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-blue-200">
          <span>👁️</span> <span>Voir</span>
        </button>
        <button class="btn-match-copy-link btn-tap py-2.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-indigo-200">
          <span>🔗</span> <span>Lien joueur</span>
        </button>
        <button class="btn-match-share btn-tap py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-emerald-300">
          <span>💬</span> <span>WhatsApp</span>
        </button>
        <button class="btn-match-lock btn-tap py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-slate-300">
          <span>${m.is_locked ? '🔓' : '🔒'}</span> <span>${m.is_locked ? 'Déverrouiller' : 'Verrouiller'}</span>
        </button>
        <button class="btn-match-delete btn-tap py-2.5 bg-rose-50 text-rose-800 hover:bg-rose-100 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 border border-rose-300">
          <span>🗑️</span> <span>Supprimer</span>
        </button>
      </div>
    `;

    const btnEdit = card.querySelector('.btn-match-edit');
    if (btnEdit) {
      btnEdit.onclick = () => {
        document.getElementById('input-edit-match-id').value = m.id;
        document.getElementById('input-edit-match-title').value = m.title || '';
        let dateVal = '';
        if (m.event_date) {
          const s = String(m.event_date);
          if (s.includes('T')) dateVal = s.split('T')[0];
          else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) dateVal = s;
          else {
            const d = new Date(m.event_date);
            if (!isNaN(d.getTime())) dateVal = d.toISOString().split('T')[0];
          }
        }
        document.getElementById('input-edit-match-date').value = dateVal;
        document.getElementById('input-edit-match-time').value = formatShortTime(m.departure_time);
        document.getElementById('input-edit-match-place').value = m.meeting_place || '';
        const chk = document.getElementById('check-edit-has-car-assignment');
        if (chk) chk.checked = hasAssignment;
        openModal('modal-edit-match');
      };
    }

    card.querySelector('.btn-match-copy-link').onclick = () => {
      const playerUrl = buildAppUrl({ m: m.id });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(playerUrl).then(() => {
          showToast('Lien joueur copié !', 'success');
        }).catch(() => {
          prompt('Copiez ce lien :', playerUrl);
        });
      } else {
        prompt('Copiez ce lien :', playerUrl);
      }
    };

    card.querySelector('.btn-match-view').onclick = () => {
      window.open(buildAppUrl({ m: m.id }), '_blank');
    };

    const btnLock = card.querySelector('.btn-match-lock');
    btnLock.onclick = async () => {
      setButtonLoading(btnLock, true);
      try {
        await callServer('ctrlToggleMatchLock', AppState.adminToken, m.id, !m.is_locked);
        showToast(m.is_locked ? 'Match déverrouillé' : 'Match verrouillé', 'success');
        loadAdminDashboard();
      } catch (err) {
        showToast(err.message, 'error');
        setButtonLoading(btnLock, false);
      }
    };

    const btnShare = card.querySelector('.btn-match-share');
    btnShare.onclick = async () => {
      setButtonLoading(btnShare, true);
      try {
        const summary = await callServer('ctrlGetWhatsAppSummary', AppState.adminToken, m.id, AppState.webAppUrl, '');
        document.getElementById('textarea-whatsapp').value = summary;
        openModal('modal-whatsapp');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setButtonLoading(btnShare, false);
      }
    };

    const btnDelete = card.querySelector('.btn-match-delete');
    btnDelete.onclick = async () => {
      if (!confirm(`Supprimer définitivement "${m.title}" et toutes ses inscriptions ?`)) return;
      setButtonLoading(btnDelete, true);
      try {
        await callServer('ctrlDeleteMatch', AppState.adminToken, m.id);
        showToast('Match supprimé.', 'info');
        loadAdminDashboard();
      } catch (err) {
        showToast(err.message, 'error');
        setButtonLoading(btnDelete, false);
      }
    };

    container.appendChild(card);
  });
}

