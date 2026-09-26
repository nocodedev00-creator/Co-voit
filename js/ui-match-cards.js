/**
 * Co'Voit' - Création et Rendu des Cartes Véhicules & Chips Passagers
 */

function createRideCardElement(ride, isLocked, waitingList) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl p-4 shadow-sm border-2 border-slate-300 space-y-3';

  const myName = safeLower(AppState.currentUser);
  const isDriver = myName && safeLower(ride.driver_name) === myName;
  const canDelete = isDriver || Boolean(AppState.adminToken);

  const waiting = Array.isArray(waitingList) ? waitingList : [];
  const myWait = myName ? waiting.find(w => safeLower(w.player_name) === myName) : null;
  const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const canJoinOutward = !myWait || toBool(myWait.needs_outward);
  const canJoinReturn = !myWait || toBool(myWait.needs_return);

  const outwardPass = Array.isArray(ride.outward_passengers) ? ride.outward_passengers : [];
  const returnPass = Array.isArray(ride.return_passengers) ? ride.return_passengers : [];

  const seatsOut = ride.seats_outward !== undefined ? ride.seats_outward : (ride.seats_total || 0);
  const seatsRet = ride.seats_return !== undefined ? ride.seats_return : (ride.seats_total || 0);

  const isDirectAlone = ride.is_direct && seatsOut === 0 && seatsRet === 0;

  const isDirectBadge = ride.is_direct 
    ? `<span class="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black px-2 py-0.5 rounded">${isDirectAlone ? 'Direct par ses moyens 📍' : 'Direct 📍'}</span>` 
    : '';

  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl ${isDirectAlone ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'} flex items-center justify-center font-bold text-lg">
          ${isDirectAlone ? '🚶' : '🚗'}
        </div>
        <div>
          <h3 class="font-black text-slate-900 text-sm">${escapeHtml(ride.driver_name)}</h3>
          <p class="text-[11px] text-slate-600 font-bold">
            ${isDirectAlone ? 'Véhicule personnel' : `Places passagers : ${seatsOut} Aller • ${seatsRet} Retour`}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${isDirectBadge}
        ${canDelete && !isLocked ? `
          <button class="btn-delete-ride p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50" title="Supprimer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>` : ''}
      </div>
    </div>

    ${!isDirectAlone ? `
      <div style="display:flex; flex-direction:row; gap:0.75rem; align-items:stretch;">
        ${ride.offers_outward ? `
          <div style="flex:1 1 0; min-width:0;" class="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-1.5">
            <div class="flex justify-between items-center font-black text-xs">
              <span class="text-blue-900">➡️ Aller</span>
              <span class="${outwardPass.length >= seatsOut ? 'text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded' : 'text-blue-700 font-black'}">${outwardPass.length} / ${seatsOut}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 outward-chips">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-sm">
                🚗 ${escapeHtml(ride.driver_name)}
              </span>
            </div>
            ${!isLocked ? `<div class="pt-1 outward-action"></div>` : ''}
          </div>
        ` : ''}

        ${ride.offers_return ? `
          <div style="flex:1 1 0; min-width:0;" class="p-2.5 bg-orange-50/80 rounded-xl border border-orange-300 text-xs space-y-1.5">
            <div class="flex justify-between items-center font-black text-xs">
              <span class="text-orange-900">⬅️ Retour</span>
              <span class="${returnPass.length >= seatsRet ? 'text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded' : 'text-orange-700 font-black'}">${returnPass.length} / ${seatsRet}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 return-chips">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-orange-500 text-white shadow-sm">
                🚗 ${escapeHtml(ride.driver_name)}
              </span>
            </div>
            ${!isLocked ? `<div class="pt-1 return-action"></div>` : ''}
          </div>
        ` : ''}
      </div>
    ` : ''}
  `;

  const deleteBtn = card.querySelector('.btn-delete-ride');
  if (deleteBtn) {
    deleteBtn.onclick = () => handleDeleteVehicle(ride.id, deleteBtn);
  }

  if (!isDirectAlone && ride.offers_outward) {
    const chipsContainer = card.querySelector('.outward-chips');
    outwardPass.forEach(pName => {
      chipsContainer.appendChild(createPassengerChip(ride.id, pName, 'outward', isLocked));
    });
    const freeOutward = Math.max(0, seatsOut - outwardPass.length);
    for (let i = 0; i < freeOutward; i++) {
      chipsContainer.appendChild(createFreeSeatChip('outward'));
    }

    const actionContainer = card.querySelector('.outward-action');
    if (actionContainer) {
      const isUserIn = myName && outwardPass.map(n => safeLower(n)).includes(myName);
      const isDriverHimself = myName && safeLower(ride.driver_name) === myName;
      if (!isUserIn && !isDriverHimself && outwardPass.length < seatsOut && canJoinOutward) {
        const joinBtn = document.createElement('button');
        joinBtn.className = 'btn-tap w-full py-2 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-black rounded-lg text-xs border-2 border-blue-200 shadow-sm';
        joinBtn.textContent = '+ Monter à l\'Aller';
        joinBtn.onclick = () => handleJoinRide(ride.id, 'outward', joinBtn);
        actionContainer.appendChild(joinBtn);
      }
    }
  }

  if (!isDirectAlone && ride.offers_return) {
    const chipsContainer = card.querySelector('.return-chips');
    returnPass.forEach(pName => {
      chipsContainer.appendChild(createPassengerChip(ride.id, pName, 'return', isLocked));
    });
    const freeReturn = Math.max(0, seatsRet - returnPass.length);
    for (let i = 0; i < freeReturn; i++) {
      chipsContainer.appendChild(createFreeSeatChip('return'));
    }

    const actionContainer = card.querySelector('.return-action');
    if (actionContainer) {
      const isUserIn = myName && returnPass.map(n => safeLower(n)).includes(myName);
      const isDriverHimself = myName && safeLower(ride.driver_name) === myName;
      if (!isUserIn && !isDriverHimself && returnPass.length < seatsRet && canJoinReturn) {
        const joinBtn = document.createElement('button');
        joinBtn.className = 'btn-tap w-full py-2 bg-orange-50/70 hover:bg-orange-100 text-orange-900 font-black rounded-lg text-xs border-2 border-orange-300 shadow-sm';
        joinBtn.textContent = '+ Monter au Retour';
        joinBtn.onclick = () => handleJoinRide(ride.id, 'return', joinBtn);
        actionContainer.appendChild(joinBtn);
      }
    }
  }

  return card;
}

function createPassengerChip(rideId, name, direction, isLocked) {
  const chip = document.createElement('span');
  const myName = safeLower(AppState.currentUser);
  const isMe = myName && safeLower(name) === myName;
  const canRemove = (isMe || Boolean(AppState.adminToken)) && !isLocked;

  chip.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-800'}`;
  chip.innerHTML = `
    <span>👤 ${escapeHtml(name)}</span>
    ${canRemove ? `<button class="btn-remove-pass opacity-75 hover:opacity-100 font-black ml-0.5">&times;</button>` : ''}
  `;

  if (canRemove) {
    const removeBtn = chip.querySelector('.btn-remove-pass');
    removeBtn.onclick = () => handleLeaveRide(rideId, name, direction, removeBtn);
  }
  return chip;
}

function createFreeSeatChip(direction) {
  const chip = document.createElement('span');
  const isOutward = direction === 'outward';
  chip.className = isOutward
    ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border-2 border-dashed border-blue-300 text-blue-500 bg-white/60'
    : 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border-2 border-dashed border-orange-300 text-orange-500 bg-white/60';
  chip.textContent = 'Libre';
  return chip;
}

