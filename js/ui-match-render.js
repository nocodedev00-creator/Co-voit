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
    waitingContainer.innerHTML = `<span class="text-xs text-amber-900/70 font-bold italic">Personne en attente de véhicule</span>`;
  } else {
    waiting.forEach(item => {
      const chip = document.createElement('div');
      const pNameSafe = safeLower(item.player_name);
      const myNameSafe = safeLower(AppState.currentUser);
      const isMe = myNameSafe && pNameSafe === myNameSafe;
      
      chip.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${isMe ? 'bg-amber-400 text-amber-950 border-2 border-amber-600' : 'bg-white text-amber-950 border border-amber-300'}`;

      const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
      const nOut = toBool(item.needs_outward);
      const nRet = toBool(item.needs_return);
      let needTag = '';
      if (nOut && nRet) needTag = 'Aller-Ret';
      else if (nOut) needTag = 'Aller';
      else if (nRet) needTag = 'Retour';

      chip.innerHTML = `
        <span>${escapeHtml(item.player_name)} (${needTag})</span>
        ${isMe || AppState.adminToken ? `<button class="btn-remove-waiting text-amber-800 hover:text-rose-600 font-black ml-1 text-sm leading-none" data-id="${item.id}">&times;</button>` : ''}
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
    return;
  }

  const myName = safeLower(AppState.currentUser);
  actionsEl.innerHTML = '';

  // Cas 1 : Conducteur
  const myRide = rides.find(r => safeLower(r.driver_name) === myName);
  if (myRide) {
    statusCard.classList.remove('hidden');
    if (myRide.is_direct && myRide.seats_total === 0) {
      descEl.innerHTML = `Tu vas <strong>directement sur place par tes propres moyens</strong>.`;
    } else {
      const out = myRide.seats_outward !== undefined ? myRide.seats_outward : myRide.seats_total;
      const ret = myRide.seats_return !== undefined ? myRide.seats_return : myRide.seats_total;
      descEl.innerHTML = `Tu proposes ta voiture (<strong>${out} pl. Aller</strong> / <strong>${ret} pl. Retour</strong>)${myRide.is_direct ? ' • Direct 📍' : ''}.`;
    }

    if (!isLocked) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-tap py-2 px-3 bg-blue-600 text-white hover:bg-blue-700 font-black rounded-xl text-xs flex items-center gap-1 shadow-sm';
      editBtn.innerHTML = `<span>✏️</span> <span>Modifier mes places</span>`;
      editBtn.onclick = () => openEditRideModal(myRide);
      actionsEl.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-tap py-2 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-300';
      deleteBtn.innerHTML = `<span>🗑️</span> <span>Annuler</span>`;
      deleteBtn.onclick = () => handleDeleteVehicle(myRide.id, deleteBtn);
      actionsEl.appendChild(deleteBtn);
    }
    return;
  }

  // Cas 2 : Passager
  const passengerRides = [];
  rides.forEach(r => {
    const inOut = (r.outward_passengers || []).map(p => safeLower(p)).includes(myName);
    const inRet = (r.return_passengers || []).map(p => safeLower(p)).includes(myName);
    if (inOut || inRet) {
      passengerRides.push({ ride: r, inOut, inRet });
    }
  });

  if (passengerRides.length > 0) {
    statusCard.classList.remove('hidden');
    let text = 'Inscrit comme passager :<br>';
    passengerRides.forEach(pr => {
      const segments = [];
      if (pr.inOut) segments.push('Aller');
      if (pr.inRet) segments.push('Retour');
      text += `• Voiture de <strong>${escapeHtml(pr.ride.driver_name)}</strong> (${segments.join(', ')})<br>`;
    });
    descEl.innerHTML = text;

    if (!isLocked) {
      passengerRides.forEach(pr => {
        if (pr.inOut) {
          const btn = document.createElement('button');
          btn.className = 'btn-tap py-1.5 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-lg text-xs border border-rose-300';
          btn.textContent = `Quitter l'Aller (${pr.ride.driver_name})`;
          btn.onclick = () => handleLeaveRide(pr.ride.id, AppState.currentUser, 'outward', btn);
          actionsEl.appendChild(btn);
        }
        if (pr.inRet) {
          const btn = document.createElement('button');
          btn.className = 'btn-tap py-1.5 px-3 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold rounded-lg text-xs border border-rose-300';
          btn.textContent = `Quitter le Retour (${pr.ride.driver_name})`;
          btn.onclick = () => handleLeaveRide(pr.ride.id, AppState.currentUser, 'return', btn);
          actionsEl.appendChild(btn);
        }
      });
    }
    return;
  }

  // Cas 3 : En liste d'attente
  const myWait = waiting.find(w => safeLower(w.player_name) === myName);
  if (myWait) {
    statusCard.classList.remove('hidden');
    const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
    const needsOut = toBool(myWait.needs_outward);
    const needsRet = toBool(myWait.needs_return);
    let needText = '';
    if (needsOut && needsRet) needText = 'Aller et Retour';
    else if (needsOut) needText = 'Aller uniquement';
    else needText = 'Retour uniquement';

    descEl.innerHTML = `Tu es <strong>en recherche d'une place</strong> (${needText}).`;

    if (!isLocked) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn-tap py-2 px-3 bg-amber-200 text-amber-950 hover:bg-amber-300 font-bold rounded-xl text-xs border border-amber-400';
      cancelBtn.textContent = "Me retirer de la liste";
      cancelBtn.onclick = () => handleLeaveWaitingList(myWait.id, cancelBtn);
      actionsEl.appendChild(cancelBtn);
    }
    return;
  }

  statusCard.classList.add('hidden');
}

