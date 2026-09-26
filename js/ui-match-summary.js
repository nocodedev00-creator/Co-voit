/**
 * Co'Voit' - Calculs et Affichage de la Synthèse des Places & Modale Détails
 */

function calculateAndRenderSummary(rides, waiting) {
  const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const uniqueParticipants = new Set();

  let outwardSeats = 0;
  let returnSeats = 0;
  let outwardRdvPassengers = 0;
  let returnRdvPassengers = 0;
  let outwardRdvDrivers = 0;
  let returnRdvDrivers = 0;

  let outwardDirectDrivers = 0;
  let returnDirectDrivers = 0;
  let outwardDirectPassengers = 0;
  let returnDirectPassengers = 0;

  rides.forEach(r => {
    const dName = safeLower(r.driver_name);
    if (dName) uniqueParticipants.add(dName);

    const isDirect = toBool(r.is_direct);
    const offersOut = toBool(r.offers_outward);
    const offersRet = toBool(r.offers_return);

    const sOut = r.seats_outward !== undefined ? Number(r.seats_outward) : Number(r.seats_total || 0);
    const sRet = r.seats_return !== undefined ? Number(r.seats_return) : Number(r.seats_total || 0);

    const outPass = Array.isArray(r.outward_passengers) ? r.outward_passengers : [];
    const retPass = Array.isArray(r.return_passengers) ? r.return_passengers : [];

    outPass.forEach(p => {
      const pLower = safeLower(p);
      if (pLower) uniqueParticipants.add(pLower);
    });

    retPass.forEach(p => {
      const pLower = safeLower(p);
      if (pLower) uniqueParticipants.add(pLower);
    });

    if (isDirect) {
      if (offersOut) {
        outwardDirectDrivers++;
        outwardDirectPassengers += outPass.length;
      }
      if (offersRet) {
        returnDirectDrivers++;
        returnDirectPassengers += retPass.length;
      }
    } else {
      if (offersOut) {
        outwardRdvDrivers++;
        outwardSeats += sOut;
        outwardRdvPassengers += outPass.length;
      }
      if (offersRet) {
        returnRdvDrivers++;
        returnSeats += sRet;
        returnRdvPassengers += retPass.length;
      }
    }
  });

  let outwardWaiting = 0;
  let returnWaiting = 0;

  waiting.forEach(w => {
    if (w && w.player_name) {
      const wLower = safeLower(w.player_name);
      if (wLower) uniqueParticipants.add(wLower);
    }
    if (toBool(w.needs_outward)) outwardWaiting++;
    if (toBool(w.needs_return)) returnWaiting++;
  });

  const outwardRdvTotal = outwardRdvDrivers + outwardRdvPassengers + outwardWaiting;
  const returnRdvTotal = returnRdvDrivers + returnRdvPassengers + returnWaiting;

  const outwardDirectTotal = outwardDirectDrivers + outwardDirectPassengers;
  const returnDirectTotal = returnDirectDrivers + returnDirectPassengers;

  const outwardDemands = outwardRdvPassengers + outwardWaiting;
  const returnDemands = returnRdvPassengers + returnWaiting;

  const soldeOutward = outwardSeats - outwardDemands;
  const soldeReturn = returnSeats - returnDemands;

  const totalRespEl = document.getElementById('stat-total-respondents');
  if (totalRespEl) totalRespEl.textContent = `${uniqueParticipants.size} joueur(s)`;

  // ALLER
  const elOutRdv = document.getElementById('stat-outward-rdv-total');
  if (elOutRdv) elOutRdv.textContent = `${outwardRdvTotal} pers.`;

  const elOutDrivers = document.getElementById('stat-outward-drivers-count');
  if (elOutDrivers) elOutDrivers.textContent = outwardRdvDrivers;

  const elOutSeats = document.getElementById('stat-outward-seats-detail');
  if (elOutSeats) elOutSeats.textContent = outwardSeats;

  const elOutDirect = document.getElementById('stat-outward-direct-total');
  if (elOutDirect) elOutDirect.textContent = `${outwardDirectTotal} pers.`;

  // RETOUR
  const elRetRdv = document.getElementById('stat-return-rdv-total');
  if (elRetRdv) elRetRdv.textContent = `${returnRdvTotal} pers.`;

  const elRetDrivers = document.getElementById('stat-return-drivers-count');
  if (elRetDrivers) elRetDrivers.textContent = returnRdvDrivers;

  const elRetSeats = document.getElementById('stat-return-seats-detail');
  if (elRetSeats) elRetSeats.textContent = returnSeats;

  const elRetDirect = document.getElementById('stat-return-direct-total');
  if (elRetDirect) elRetDirect.textContent = `${returnDirectTotal} pers.`;

  // Badges Bilan
  const badgeOutward = document.getElementById('badge-bilan-outward');
  if (badgeOutward) {
    if (outwardRdvTotal === 0 && outwardSeats === 0) {
      badgeOutward.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 whitespace-nowrap shrink-0';
      badgeOutward.textContent = 'Aucun RDV';
    } else if (soldeOutward >= 0) {
      badgeOutward.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0';
      badgeOutward.textContent = soldeOutward === 0 ? 'Complet (0)' : `+${soldeOutward} libre${soldeOutward > 1 ? 's' : ''}`;
    } else {
      badgeOutward.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 whitespace-nowrap shrink-0';
      badgeOutward.textContent = `Manque ${Math.abs(soldeOutward)}`;
    }
  }

  const badgeReturn = document.getElementById('badge-bilan-return');
  if (badgeReturn) {
    if (returnRdvTotal === 0 && returnSeats === 0) {
      badgeReturn.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 whitespace-nowrap shrink-0';
      badgeReturn.textContent = 'Aucun RDV';
    } else if (soldeReturn >= 0) {
      badgeReturn.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0';
      badgeReturn.textContent = soldeReturn === 0 ? 'Complet (0)' : `+${soldeReturn} libre${soldeReturn > 1 ? 's' : ''}`;
    } else {
      badgeReturn.className = 'text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 whitespace-nowrap shrink-0';
      badgeReturn.textContent = `Manque ${Math.abs(soldeReturn)}`;
    }
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

