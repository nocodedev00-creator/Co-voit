/**
 * Co'Voit' - Calculs et Affichage de la Synthèse des Places & Modale Détails
 */

function calculateAndRenderSummary(rides, waiting) {
  const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const uniqueParticipants = new Set();

  let outwardSeats = 0;
  let returnSeats = 0;

  const outwardRdvDrivers = new Set();
  const returnRdvDrivers = new Set();
  // Seekers = personnes (noms uniques) ayant besoin d'une place RDV
  const outwardRdvSeekers = new Set();
  const returnRdvSeekers = new Set();
  // Demands = nombre RÉEL de places demandées (1 personne + ses accompagnateurs)
  let outwardExtraDemands = 0;
  let returnExtraDemands = 0;

  const outwardDirectParticipants = new Set();
  const returnDirectParticipants = new Set();

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

    outPass.forEach(p => { const pl = safeLower(p); if (pl) uniqueParticipants.add(pl); });
    retPass.forEach(p => { const pl = safeLower(p); if (pl) uniqueParticipants.add(pl); });

    if (isDirect) {
      if (offersOut) {
        if (dName) outwardDirectParticipants.add(dName);
        outPass.forEach(p => { const pl = safeLower(p); if (pl) outwardDirectParticipants.add(pl); });
      }
      if (offersRet) {
        if (dName) returnDirectParticipants.add(dName);
        retPass.forEach(p => { const pl = safeLower(p); if (pl) returnDirectParticipants.add(pl); });
      }
    } else {
      if (offersOut) {
        if (dName) outwardRdvDrivers.add(dName);
        outwardSeats += sOut;
        outPass.forEach(p => { const pl = safeLower(p); if (pl) outwardRdvSeekers.add(pl); });
      } else if (dName) {
        outwardDirectParticipants.add(dName);
      }
      if (offersRet) {
        if (dName) returnRdvDrivers.add(dName);
        returnSeats += sRet;
        retPass.forEach(p => { const pl = safeLower(p); if (pl) returnRdvSeekers.add(pl); });
      } else if (dName) {
        returnDirectParticipants.add(dName);
      }
    }
  });

  let totalExtraParticipants = 0;
  // Liste d'attente : ajouter les demandeurs (1 personne = 1 entrée dans le Set)
  // + compteur de places supplémentaires pour les accompagnateurs
  waiting.forEach(w => {
    if (w && w.player_name) {
      const wLower = safeLower(w.player_name);
      if (wLower) {
        uniqueParticipants.add(wLower);
        const extra = Math.max(0, parseInt(w.extra_passengers, 10) || 0);
        totalExtraParticipants += extra;
        if (toBool(w.needs_outward)) {
          outwardRdvSeekers.add(wLower);
          outwardExtraDemands += extra; // places supplémentaires pour accompagnateurs
        }
        if (toBool(w.needs_return)) {
          returnRdvSeekers.add(wLower);
          returnExtraDemands += extra;
        }
      }
    }
  });

  // Au RDV = conducteurs au RDV + demandeurs de places au RDV + accompagnateurs
  const outwardRdvPeople = new Set([...outwardRdvDrivers, ...outwardRdvSeekers]);
  const returnRdvPeople = new Set([...returnRdvDrivers, ...returnRdvSeekers]);

  const outwardRdvTotal = outwardRdvPeople.size + outwardExtraDemands;
  const returnRdvTotal = returnRdvPeople.size + returnExtraDemands;

  // Demandes réelles = personnes en attente (Set) + leurs accompagnateurs (extra)
  // Les passagers déjà dans une voiture occupent des sièges → déjà déduits via outwardSeats
  const outwardDemands = outwardRdvSeekers.size + outwardExtraDemands;
  const returnDemands = returnRdvSeekers.size + returnExtraDemands;

  const soldeOutward = outwardSeats - outwardDemands;
  const soldeReturn = returnSeats - returnDemands;

  // Sécurité : une personne partant au RDV n'est jamais comptée en direct pour ce trajet
  outwardRdvPeople.forEach(name => outwardDirectParticipants.delete(name));
  returnRdvPeople.forEach(name => returnDirectParticipants.delete(name));

  const outwardDirectTotal = outwardDirectParticipants.size;
  const returnDirectTotal = returnDirectParticipants.size;

  const totalRespEl = document.getElementById('stat-total-respondents');
  if (totalRespEl) totalRespEl.textContent = `${uniqueParticipants.size + totalExtraParticipants} inscrit(s)`;

  // ALLER
  const elOutRdv = document.getElementById('stat-outward-rdv-total');
  if (elOutRdv) elOutRdv.textContent = `${outwardRdvTotal} pers.`;

  const elOutDrivers = document.getElementById('stat-outward-drivers-count');
  if (elOutDrivers) elOutDrivers.textContent = outwardRdvDrivers.size;

  const elOutSeats = document.getElementById('stat-outward-seats-detail');
  if (elOutSeats) elOutSeats.textContent = outwardSeats;

  const elOutDirect = document.getElementById('stat-outward-direct-total');
  if (elOutDirect) elOutDirect.textContent = `${outwardDirectTotal} pers.`;

  // RETOUR
  const elRetRdv = document.getElementById('stat-return-rdv-total');
  if (elRetRdv) elRetRdv.textContent = `${returnRdvTotal} pers.`;

  const elRetDrivers = document.getElementById('stat-return-drivers-count');
  if (elRetDrivers) elRetDrivers.textContent = returnRdvDrivers.size;

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

  // Verdicts Scindés Aller & Retour
  renderVerdictCard(document.getElementById('verdict-outward'), 'ALLER', '➡️', uniqueParticipants.size, outwardRdvTotal, outwardSeats, soldeOutward);
  renderVerdictCard(document.getElementById('verdict-return'), 'RETOUR', '⬅️', uniqueParticipants.size, returnRdvTotal, returnSeats, soldeReturn);
}

function renderVerdictCard(el, dirLabel, icon, participantsCount, rdvTotal, seats, solde) {
  if (!el) return;
  if (participantsCount === 0) {
    el.className = 'p-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold text-center';
    el.innerHTML = `<div class="font-black text-slate-700">${icon} ${dirLabel}</div><div class="text-[10px] text-slate-400 font-semibold pt-0.5">En attente</div>`;
  } else if (rdvTotal === 0 && seats === 0) {
    el.className = 'p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold text-center';
    el.innerHTML = `<div class="font-black text-slate-800">${icon} ${dirLabel}</div><div class="text-[10px] text-slate-500 font-semibold pt-0.5">Direct uniquement (0 RDV)</div>`;
  } else if (solde >= 0) {
    const rabText = solde > 0 ? `+${solde} libre${solde > 1 ? 's' : ''}` : 'Complet';
    el.className = 'p-2 rounded-xl bg-emerald-50 text-emerald-950 border-2 border-emerald-300 text-xs font-black text-center shadow-xs';
    el.innerHTML = `
      <div class="flex items-center justify-center gap-1 text-emerald-900 text-[11px] leading-tight font-black">
        <span>🟢</span> <span>${dirLabel} : Assez de places !</span>
      </div>
      <div class="text-[10px] font-bold text-emerald-700 pt-0.5">${rabText}</div>
    `;
  } else {
    const manque = Math.abs(solde);
    el.className = 'p-2 rounded-xl bg-rose-50 text-rose-950 border-2 border-rose-300 text-xs font-black text-center shadow-xs';
    el.innerHTML = `
      <div class="flex items-center justify-center gap-1 text-rose-900 text-[11px] leading-tight font-black">
        <span>🔴</span> <span>${dirLabel} : Manque ${manque} pl. !</span>
      </div>
      <div class="text-[10px] font-bold text-rose-700 pt-0.5">Conducteur requis</div>
    `;
  }
}

function buildLegDetails(rides, waiting, dir) {
  const isOut = dir === 'outward';
  const offersKey = isOut ? 'offers_outward' : 'offers_return';
  const seatsKey = isOut ? 'seats_outward' : 'seats_return';
  const passKey = isOut ? 'outward_passengers' : 'return_passengers';
  const needsKey = isOut ? 'needs_outward' : 'needs_return';

  const rdvList = [];
  const directList = [];
  const assigned = new Set();

  rides.forEach(r => {
    const driver = r.driver_name;
    const isDirect = Boolean(r.is_direct);
    const seats = r[seatsKey] !== undefined ? Number(r[seatsKey]) : Number(r.seats_total || 0);

    if (r[offersKey]) {
      if (isDirect) {
        directList.push(`🚗 ${driver} ${seats > 0 ? `(Voiture directe • ${seats} pl.)` : '(Direct par ses moyens)'}`);
        (r[passKey] || []).forEach(p => { directList.push(`👤 ${p} (avec ${driver})`); assigned.add(safeLower(p)); });
      } else {
        rdvList.push(`🚗 ${driver} (Conducteur • ${seats} pl.)`);
        (r[passKey] || []).forEach(p => { rdvList.push(`👤 ${p} (avec ${driver})`); assigned.add(safeLower(p)); });
      }
    } else if (!isDirect) {
      directList.push(`📍 ${driver} (Direct par ses moyens)`);
    }
  });

  waiting.forEach(w => {
    if (w && w[needsKey] && !assigned.has(safeLower(w.player_name))) {
      const extra = Number(w.extra_passengers) || 0;
      const extraTag = extra > 0 ? ` (+${extra} pers.)` : '';
      rdvList.push(`⚠️ ${w.player_name}${extraTag} (Sans place ${isOut ? 'Aller' : 'Retour'})`);
    }
  });

  return { rdvList, directList };
}

function openSummaryDetailsModal() {
  if (!AppState.currentMatchData) return;
  const rides = AppState.currentMatchData.rides || [];
  const waiting = AppState.currentMatchData.waiting_list || [];

  const out = buildLegDetails(rides, waiting, 'outward');
  const ret = buildLegDetails(rides, waiting, 'return');

  document.getElementById('detail-count-rdv-outward').textContent = out.rdvList.length;
  document.getElementById('detail-count-direct-outward').textContent = out.directList.length;
  document.getElementById('detail-total-outward').textContent = `${out.rdvList.length + out.directList.length} joueur(s)`;
  renderChipsList('detail-list-rdv-outward', out.rdvList, 'bg-white text-blue-950 border-blue-200', 'Aucun joueur au RDV Aller');
  renderChipsList('detail-list-direct-outward', out.directList, 'bg-white text-slate-800 border-slate-300', 'Aucun joueur en direct Aller');

  document.getElementById('detail-count-rdv-return').textContent = ret.rdvList.length;
  document.getElementById('detail-count-direct-return').textContent = ret.directList.length;
  document.getElementById('detail-total-return').textContent = `${ret.rdvList.length + ret.directList.length} joueur(s)`;
  renderChipsList('detail-list-rdv-return', ret.rdvList, 'bg-white text-orange-950 border-orange-200', 'Aucun joueur au RDV Retour');
  renderChipsList('detail-list-direct-return', ret.directList, 'bg-white text-slate-800 border-slate-300', 'Aucun joueur en direct Retour');

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

