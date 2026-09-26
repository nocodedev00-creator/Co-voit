/**
 * Co'Voit' - Calculs et Affichage de la Synthèse des Places & Modale Détails
 */

function calculateAndRenderSummary(rides, waiting) {
  const uniqueParticipants = new Set();
  let directCount = 0;
  let outwardSeats = 0;
  let returnSeats = 0;
  let outwardDemands = 0;
  let returnDemands = 0;

  rides.forEach(r => {
    const dName = safeLower(r.driver_name);
    if (dName) uniqueParticipants.add(dName);

    if (r.is_direct) {
      directCount++;
    } else {
      if (r.offers_outward) outwardSeats += Number(r.seats_outward !== undefined ? r.seats_outward : (r.seats_total || 0));
      if (r.offers_return) returnSeats += Number(r.seats_return !== undefined ? r.seats_return : (r.seats_total || 0));
    }

    (r.outward_passengers || []).forEach(p => {
      const pLower = safeLower(p);
      if (pLower) uniqueParticipants.add(pLower);
      outwardDemands++;
    });

    (r.return_passengers || []).forEach(p => {
      const pLower = safeLower(p);
      if (pLower) uniqueParticipants.add(pLower);
      returnDemands++;
    });
  });

  waiting.forEach(w => {
    if (w && w.player_name) {
      const wLower = safeLower(w.player_name);
      if (wLower) uniqueParticipants.add(wLower);
    }
    if (w.needs_outward) outwardDemands++;
    if (w.needs_return) returnDemands++;
  });

  document.getElementById('stat-total-respondents').textContent = `${uniqueParticipants.size} joueur(s)`;
  document.getElementById('stat-direct-count').textContent = `${directCount} joueur(s)`;

  document.getElementById('stat-outward-seats').textContent = outwardSeats;
  document.getElementById('stat-outward-demands').textContent = outwardDemands;
  document.getElementById('stat-return-seats').textContent = returnSeats;
  document.getElementById('stat-return-demands').textContent = returnDemands;

  const soldeOutward = outwardSeats - outwardDemands;
  const soldeReturn = returnSeats - returnDemands;

  const badgeOutward = document.getElementById('badge-bilan-outward');
  if (soldeOutward >= 0) {
    badgeOutward.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0';
    badgeOutward.textContent = soldeOutward === 0 ? 'Complet (0)' : `+${soldeOutward} libre`;
  } else {
    badgeOutward.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 whitespace-nowrap shrink-0';
    badgeOutward.textContent = `Manque ${Math.abs(soldeOutward)}`;
  }

  const badgeReturn = document.getElementById('badge-bilan-return');
  if (soldeReturn >= 0) {
    badgeReturn.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0';
    badgeReturn.textContent = soldeReturn === 0 ? 'Complet (0)' : `+${soldeReturn} libre`;
  } else {
    badgeReturn.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 whitespace-nowrap shrink-0';
    badgeReturn.textContent = `Manque ${Math.abs(soldeReturn)}`;
  }
}

function openSummaryDetailsModal() {
  if (!AppState.currentMatchData) return;

  const rides = AppState.currentMatchData.rides || [];
  const waiting = AppState.currentMatchData.waiting_list || [];

  const rdvOutwardList = [];
  const directOutwardList = [];

  rides.forEach(r => {
    const driver = r.driver_name;
    const isDirect = Boolean(r.is_direct);
    const seatsOut = r.seats_outward !== undefined ? Number(r.seats_outward) : Number(r.seats_total || 0);

    if (r.offers_outward) {
      if (isDirect) {
        directOutwardList.push(`🚗 ${driver} ${seatsOut > 0 ? `(Voiture directe • ${seatsOut} pl.)` : '(Direct par ses moyens)'}`);
        (r.outward_passengers || []).forEach(p => directOutwardList.push(`👤 ${p} (avec ${driver})`));
      } else {
        rdvOutwardList.push(`🚗 ${driver} (Conducteur • ${seatsOut} pl.)`);
        (r.outward_passengers || []).forEach(p => rdvOutwardList.push(`👤 ${p} (avec ${driver})`));
      }
    }
  });

  waiting.forEach(w => {
    if (w && w.needs_outward) {
      rdvOutwardList.push(`⚠️ ${w.player_name} (Sans place Aller)`);
    }
  });

  const rdvReturnList = [];
  const directReturnList = [];

  rides.forEach(r => {
    const driver = r.driver_name;
    const isDirect = Boolean(r.is_direct);
    const seatsRet = r.seats_return !== undefined ? Number(r.seats_return) : Number(r.seats_total || 0);

    if (r.offers_return) {
      if (isDirect) {
        directReturnList.push(`🚗 ${driver} ${seatsRet > 0 ? `(Voiture directe • ${seatsRet} pl.)` : '(Direct par ses moyens)'}`);
        (r.return_passengers || []).forEach(p => directReturnList.push(`👤 ${p} (avec ${driver})`));
      } else {
        rdvReturnList.push(`🚗 ${driver} (Conducteur • ${seatsRet} pl.)`);
        (r.return_passengers || []).forEach(p => rdvReturnList.push(`👤 ${p} (avec ${driver})`));
      }
    }
  });

  waiting.forEach(w => {
    if (w && w.needs_return) {
      rdvReturnList.push(`⚠️ ${w.player_name} (Sans place Retour)`);
    }
  });

  document.getElementById('detail-count-rdv-outward').textContent = rdvOutwardList.length;
  document.getElementById('detail-count-direct-outward').textContent = directOutwardList.length;
  document.getElementById('detail-total-outward').textContent = `${rdvOutwardList.length + directOutwardList.length} joueur(s)`;

  renderChipsList('detail-list-rdv-outward', rdvOutwardList, 'bg-white text-blue-950 border-blue-200', 'Aucun joueur au RDV Aller');
  renderChipsList('detail-list-direct-outward', directOutwardList, 'bg-white text-slate-800 border-slate-300', 'Aucun joueur en direct Aller');

  document.getElementById('detail-count-rdv-return').textContent = rdvReturnList.length;
  document.getElementById('detail-count-direct-return').textContent = directReturnList.length;
  document.getElementById('detail-total-return').textContent = `${rdvReturnList.length + directReturnList.length} joueur(s)`;

  renderChipsList('detail-list-rdv-return', rdvReturnList, 'bg-white text-orange-950 border-orange-200', 'Aucun joueur au RDV Retour');
  renderChipsList('detail-list-direct-return', directReturnList, 'bg-white text-slate-800 border-slate-300', 'Aucun joueur en direct Retour');

  openModal('modal-summary-details');
}

function renderChipsList(containerId, list, chipClasses, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `<span class="text-[11px] text-slate-400 italic">${emptyText}</span>`;
    return;
  }

  list.forEach(item => {
    const span = document.createElement('span');
    span.className = `px-2.5 py-1 font-bold text-xs rounded-lg border shadow-sm ${chipClasses}`;
    span.textContent = item;
    container.appendChild(span);
  });
}

