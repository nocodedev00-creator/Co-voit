/**
 * Co'Voit' - Orchestration et Rendu Visuel Principal de la Vue Match
 */

function renderMatchView(data) {
  if (!data || !data.match) return;

  const match = data.match;
  const rides = Array.isArray(data.rides) ? data.rides : [];
  const waiting = Array.isArray(data.waiting_list) ? data.waiting_list : [];

  document.getElementById('match-title-display').textContent = match.title;
  document.getElementById('match-date-display').textContent = formatShortDate(match.event_date);
  document.getElementById('match-time-display').textContent = formatShortTime(match.departure_time);
  document.getElementById('match-place-display').textContent = match.meeting_place;

  const statusBadge = document.getElementById('match-status-badge');
  const bannerLocked = document.getElementById('banner-locked');
  const actionsContainer = document.getElementById('match-actions-container');

  if (match.is_locked) {
    statusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300 shrink-0';
    statusBadge.textContent = 'Verrouillé';
    bannerLocked.classList.remove('hidden');
    actionsContainer.classList.add('opacity-50', 'pointer-events-none');
  } else {
    statusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0';
    statusBadge.textContent = 'Ouvert';
    bannerLocked.classList.add('hidden');
    actionsContainer.classList.remove('opacity-50', 'pointer-events-none');
  }

  calculateAndRenderSummary(rides, waiting);
  renderUserCurrentStatus(rides, waiting, match.is_locked);

  const ridesContainer = document.getElementById('rides-list-container');
  document.getElementById('rides-count-badge').textContent = rides.length;
  ridesContainer.innerHTML = '';

  if (rides.length === 0) {
    ridesContainer.innerHTML = `
      <div class="p-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-xs">
        Aucun véhicule proposé pour le moment. Soyez le premier !
      </div>`;
  } else {
    rides.forEach(ride => {
      ridesContainer.appendChild(createRideCardElement(ride, match.is_locked, waiting));
    });
  }

  const waitingContainer = document.getElementById('waiting-list-container');
  document.getElementById('waiting-count-badge').textContent = waiting.length;
  waitingContainer.innerHTML = '';

  if (waiting.length === 0) {
    waitingContainer.innerHTML = `<span class="text-xs text-slate-500 font-bold italic">Aucun joueur au RDV à véhiculer</span>`;
  } else {
    waiting.forEach(item => {
      const chip = document.createElement('div');
      const pNameSafe = safeLower(item.player_name);
      const myNameSafe = safeLower(AppState.currentUser);
      const isMe = myNameSafe && pNameSafe === myNameSafe;
      
      chip.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs ${isMe ? 'bg-blue-600 text-white border-2 border-blue-800' : 'bg-white text-blue-950 border border-blue-300'}`;

      const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
      const nOut = toBool(item.needs_outward);
      const nRet = toBool(item.needs_return);
      let needTag = '';
      if (nOut && nRet) needTag = 'Aller-Ret';
      else if (nOut) needTag = 'Aller';
      else if (nRet) needTag = 'Retour';

      chip.innerHTML = `
        <span>${escapeHtml(item.player_name)} (${needTag})</span>
        ${isMe || AppState.adminToken ? `<button class="btn-remove-waiting text-blue-800 hover:text-rose-600 font-black ml-1 text-sm leading-none" data-id="${item.id}">&times;</button>` : ''}
      `;

      const removeBtn = chip.querySelector('.btn-remove-waiting');
      if (removeBtn) {
        removeBtn.onclick = () => handleLeaveWaitingList(item.id, removeBtn);
      }

      waitingContainer.appendChild(chip);
    });
  }
}

function renderUserCurrentStatus(rides, waiting, isLocked) {
  const statusCard = document.getElementById('user-status-card');
  const descEl = document.getElementById('user-status-description');
  const actionsEl = document.getElementById('user-status-actions');

  if (!AppState.currentUser) {
    statusCard.classList.add('hidden');
    document.getElementById('match-actions-container')?.classList.remove('hidden');
    return;
  }

  const myName = safeLower(AppState.currentUser);
  actionsEl.innerHTML = '';
  const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

  // Recherche des participations
  const myRide = rides.find(r => safeLower(r.driver_name) === myName);
  const myOutPassengerRide = rides.find(r => (r.outward_passengers || []).map(p => safeLower(p)).includes(myName));
  const myRetPassengerRide = rides.find(r => (r.return_passengers || []).map(p => safeLower(p)).includes(myName));
  const myWait = waiting.find(w => safeLower(w.player_name) === myName);

  let outLabel = null;
  let retLabel = null;

  // Statut ALLER
  if (myRide && toBool(myRide.offers_outward)) {
    if (toBool(myRide.is_direct) && Number(myRide.seats_total || 0) === 0) {
      outLabel = 'Direct sur place 📍';
    } else {
      const sOut = myRide.seats_outward !== undefined ? myRide.seats_outward : myRide.seats_total;
      outLabel = `Conducteur (${sOut} pl.) 🚗`;
    }
  } else if (myOutPassengerRide) {
    outLabel = `Passager de <strong>${escapeHtml(myOutPassengerRide.driver_name)}</strong>`;
  } else if (myWait && toBool(myWait.needs_outward)) {
    outLabel = 'Présent au RDV (place demandée) 🙋';
  }

  // Statut RETOUR
  if (myRide && toBool(myRide.offers_return)) {
    if (toBool(myRide.is_direct) && Number(myRide.seats_total || 0) === 0) {
      retLabel = 'Direct sur place 📍';
    } else {
      const sRet = myRide.seats_return !== undefined ? myRide.seats_return : myRide.seats_total;
      retLabel = `Conducteur (${sRet} pl.) 🚗`;
    }
  } else if (myRetPassengerRide) {
    retLabel = `Passager de <strong>${escapeHtml(myRetPassengerRide.driver_name)}</strong>`;
  } else if (myWait && toBool(myWait.needs_return)) {
    retLabel = 'Présent au RDV (place demandée) 🙋';
  }

  // Si aucune participation
  if (!outLabel && !retLabel) {
    statusCard.classList.add('hidden');
    document.getElementById('match-actions-container')?.classList.remove('hidden');
    return;
  }

  const isWaitingOnly = Boolean(myWait && !myOutPassengerRide && !myRetPassengerRide && !myRide);

  statusCard.classList.remove('hidden');
  document.getElementById('match-actions-container')?.classList.add('hidden');
  descEl.innerHTML = `
    <div class="space-y-1">
      <div>➡️ <strong>Aller :</strong> ${outLabel || '<span class="text-slate-400 font-semibold italic">Non inscrit</span>'}</div>
      <div>⬅️ <strong>Retour :</strong> ${retLabel || '<span class="text-slate-400 font-semibold italic">Non inscrit</span>'}</div>
    </div>
    ${isWaitingOnly ? `
      <div class="mt-2.5 p-2.5 bg-blue-100/90 border border-blue-300 rounded-xl text-[11px] text-blue-950 font-bold flex items-start gap-2 shadow-xs">
        <span class="text-sm">✅</span>
        <span><strong>Inscription au RDV confirmée !</strong> Vous pourrez vous répartir sur le parking le jour J, ou réserver un siège dès maintenant ci-dessous.</span>
      </div>
    ` : ''}
  `;

  if (isLocked) return;

  // Boutons d'action contextuels
  if (myRide) {
    if (!toBool(myRide.is_direct) || Number(myRide.seats_total || 0) > 0) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-tap py-2 px-3 bg-blue-600 text-white hover:bg-blue-700 font-black rounded-xl text-xs flex items-center gap-1 shadow-sm';
      editBtn.innerHTML = `<span>✏️</span> <span>Modifier mes places</span>`;
      editBtn.onclick = () => openEditRideModal(myRide);
      actionsEl.appendChild(editBtn);
    }

    const delRideBtn = document.createElement('button');
    delRideBtn.className = 'btn-tap py-2 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-300';
    delRideBtn.innerHTML = `<span>🗑️</span> <span>Annuler ${toBool(myRide.is_direct) ? 'trajet direct' : 'mon véhicule'}</span>`;
    delRideBtn.onclick = () => handleDeleteVehicle(myRide.id, delRideBtn);
    actionsEl.appendChild(delRideBtn);
  }

  if (myOutPassengerRide) {
    const leaveOutBtn = document.createElement('button');
    leaveOutBtn.className = 'btn-tap py-1.5 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-lg text-xs border border-rose-300';
    leaveOutBtn.textContent = `Quitter l'Aller (${myOutPassengerRide.driver_name})`;
    leaveOutBtn.onclick = () => handleLeaveRide(myOutPassengerRide.id, AppState.currentUser, 'outward', leaveOutBtn);
    actionsEl.appendChild(leaveOutBtn);
  }

  if (myRetPassengerRide && myRetPassengerRide.id !== myOutPassengerRide?.id) {
    const leaveRetBtn = document.createElement('button');
    leaveRetBtn.className = 'btn-tap py-1.5 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-lg text-xs border border-rose-300';
    leaveRetBtn.textContent = `Quitter le Retour (${myRetPassengerRide.driver_name})`;
    leaveRetBtn.onclick = () => handleLeaveRide(myRetPassengerRide.id, AppState.currentUser, 'return', leaveRetBtn);
    actionsEl.appendChild(leaveRetBtn);
  } else if (myRetPassengerRide) {
    const leaveRetBtn = document.createElement('button');
    leaveRetBtn.className = 'btn-tap py-1.5 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-lg text-xs border border-rose-300';
    leaveRetBtn.textContent = `Quitter le Retour (${myRetPassengerRide.driver_name})`;
    leaveRetBtn.onclick = () => handleLeaveRide(myRetPassengerRide.id, AppState.currentUser, 'return', leaveRetBtn);
    actionsEl.appendChild(leaveRetBtn);
  }

  if (myWait) {
    const cancelWaitBtn = document.createElement('button');
    cancelWaitBtn.className = 'btn-tap py-2 px-3 bg-amber-200 text-amber-950 hover:bg-amber-300 font-bold rounded-xl text-xs border border-amber-400';
    cancelWaitBtn.textContent = "Me retirer de la liste d'attente";
    cancelWaitBtn.onclick = () => handleLeaveWaitingList(myWait.id, cancelWaitBtn);
    actionsEl.appendChild(cancelWaitBtn);
  }
}

