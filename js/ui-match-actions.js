/**
 * Co'Voit' - Actions & Interactions du Match (Rejoindre, Quitter, Annuler)
 */

async function loadMatchDetails() {
  if (!AppState.matchId) return;

  try {
    const data = await callServer('ctrlGetMatchDetails', AppState.matchId);
    if (!data) return;
    AppState.currentMatchData = data;
    renderMatchView(data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateCarModalHint() {
  const chkOut = document.getElementById('check-offers-outward');
  const chkRet = document.getElementById('check-offers-return');
  const chkDir = document.getElementById('check-car-direct');
  const hintEl = document.getElementById('car-rule-hint');
  const seatsContainer = document.getElementById('container-car-seats');
  if (!hintEl || !chkOut || !chkRet || !chkDir) return;

  if (chkDir.checked) {
    hintEl.textContent = "📍 Trajet direct Aller ET Retour par vos propres moyens (sans passer par le RDV).";
    if (seatsContainer) seatsContainer.style.opacity = '0.4';
  } else {
    if (seatsContainer) seatsContainer.style.opacity = '1';
    if (chkOut.checked && chkRet.checked) {
      hintEl.textContent = "🚗 Conducteur au RDV pour l'Aller et le Retour.";
    } else if (chkOut.checked) {
      hintEl.textContent = "🚗 Conducteur à l'Aller • 📍 Retour automatiquement noté 'Direct sur place'.";
    } else if (chkRet.checked) {
      hintEl.textContent = "📍 Aller automatiquement noté 'Direct sur place' • 🚗 Conducteur au Retour.";
    } else {
      hintEl.textContent = "⚠️ Cochez au moins l'Aller ou le Retour.";
    }
  }
}

function openEditRideModal(ride) {
  document.getElementById('modal-car-title').textContent = 'Modifier mon véhicule';
  document.getElementById('input-edit-ride-id').value = ride.id;
  document.getElementById('input-car-driver').value = ride.driver_name;
  document.getElementById('input-car-driver').disabled = true;

  document.getElementById('check-offers-outward').checked = Boolean(ride.offers_outward);
  document.getElementById('check-offers-return').checked = Boolean(ride.offers_return);

  document.getElementById('input-car-seats-outward').value = ride.seats_outward !== undefined ? ride.seats_outward : (ride.seats_total || 2);
  document.getElementById('input-car-seats-return').value = ride.seats_return !== undefined ? ride.seats_return : (ride.seats_total || 1);
  document.getElementById('check-car-direct').checked = Boolean(ride.is_direct);

  const seatsRetEdit = document.getElementById('input-car-seats-return');
  if (seatsRetEdit) seatsRetEdit.dataset.userTouched = 'true';

  updateCarModalHint();
  openModal('modal-add-car');
}

async function handleJoinRide(rideId, direction, btn) {
  if (!AppState.currentUser) {
    checkUserIdentityFlow('Indique ton prénom pour rejoindre ce véhicule.');
    return;
  }

  const myName = safeLower(AppState.currentUser);
  const waitingList = AppState.currentMatchData?.waiting_list || [];
  const myWait = waitingList.find(w => safeLower(w.player_name) === myName);
  const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

  if (!myWait) {
    return showToast("Vous devez d'abord vous inscrire via le bouton 'Je cherche' pour pouvoir réserver une place.", 'error');
  }

  if (direction === 'outward' && !toBool(myWait.needs_outward)) {
    return showToast("Vous cherchez une place uniquement pour le retour : impossible de réserver l'aller.", 'error');
  }
  if (direction === 'return' && !toBool(myWait.needs_return)) {
    return showToast("Vous cherchez une place uniquement pour l'aller : impossible de réserver le retour.", 'error');
  }

  const allRides = AppState.currentMatchData?.rides || [];
  const myDirect = allRides.find(r => safeLower(r.driver_name) === myName && toBool(r.is_direct));
  if (myDirect) {
    if (direction === 'outward' && toBool(myDirect.offers_outward)) {
      return showToast("Vous êtes noté direct sur place pour l'aller : impossible de réserver une place au RDV.", 'error');
    }
    if (direction === 'return' && toBool(myDirect.offers_return)) {
      return showToast("Vous êtes noté direct sur place pour le retour : impossible de réserver une place au RDV.", 'error');
    }
  }

  setButtonLoading(btn, true, 'Inscription...');
  try {
    await callServer('ctrlJoinRide', AppState.matchId, rideId, AppState.currentUser, direction);
    showToast('Vous avez rejoint le véhicule !', 'success');
    loadMatchDetails();
  } catch (err) {
    showToast(err.message, 'error');
    setButtonLoading(btn, false);
  }
}

async function handleLeaveRide(rideId, playerName, direction, btn) {
  setButtonLoading(btn, true);
  try {
    await callServer('ctrlLeaveRide', AppState.matchId, rideId, playerName, direction);
    showToast('Passager retiré.', 'info');
    loadMatchDetails();
  } catch (err) {
    showToast(err.message, 'error');
    setButtonLoading(btn, false);
  }
}

async function handleDeleteVehicle(rideId, btn) {
  if (!confirm('Supprimer votre véhicule ? Les passagers inscrits basculeront automatiquement dans la liste "Besoin d\'une place".')) {
    return;
  }

  setButtonLoading(btn, true);
  try {
    await callServer('ctrlDeleteVehicle', AppState.matchId, rideId, AppState.currentUser, AppState.adminToken);
    showToast('Véhicule supprimé.', 'info');
    loadMatchDetails();
  } catch (err) {
    showToast(err.message, 'error');
    setButtonLoading(btn, false);
  }
}

async function handleLeaveWaitingList(waitingId, btn) {
  setButtonLoading(btn, true);
  try {
    await callServer('ctrlLeaveWaitingList', AppState.matchId, waitingId, AppState.currentUser, AppState.adminToken);
    showToast('Retiré de la liste d\'attente.', 'info');
    loadMatchDetails();
  } catch (err) {
    showToast(err.message, 'error');
    setButtonLoading(btn, false);
  }
}

function updateWaitingHint() {
  const chkWaitOut = document.getElementById('check-wait-outward');
  const chkWaitRet = document.getElementById('check-wait-return');
  const hintWaitEl = document.getElementById('waiting-rule-hint');
  if (!hintWaitEl || !chkWaitOut || !chkWaitRet) return;
  if (chkWaitOut.checked && chkWaitRet.checked) {
    hintWaitEl.textContent = "ℹ️ Recherche d'une place pour l'Aller ET le Retour.";
  } else if (chkWaitOut.checked) {
    hintWaitEl.textContent = "ℹ️ Recherche Aller : le retour sera automatiquement noté comme 'Direct sur place' 📍";
  } else if (chkWaitRet.checked) {
    hintWaitEl.textContent = "ℹ️ Recherche Retour : l'aller sera automatiquement noté comme 'Direct sur place' 📍";
  } else {
    hintWaitEl.textContent = "⚠️ Veuillez cocher au moins un trajet.";
  }
}

function openWaitingListModal() {
  if (!AppState.currentUser) return checkUserIdentityFlow("Indique ton prénom pour t'inscrire en liste d'attente.");
  const inputName = document.getElementById('input-waiting-name');
  if (inputName) inputName.value = AppState.currentUser || '';

  const waitingList = AppState.currentMatchData?.waiting_list || [];
  const myWait = waitingList.find(w => safeLower(w.player_name) === safeLower(AppState.currentUser));
  const selExtra = document.getElementById('select-waiting-extra');
  if (selExtra) {
    selExtra.value = myWait && myWait.extra_passengers ? String(myWait.extra_passengers) : '0';
  }

  updateWaitingHint();
  openModal('modal-waiting');
}

async function handleWaitingFormSubmit(e) {
  e.preventDefault();
  const btnSubmit = document.getElementById('btn-submit-waiting');
  if (btnSubmit && btnSubmit.disabled) return;

  const pName = document.getElementById('input-waiting-name')?.value.trim();
  if (!pName) return;
  setUsername(pName);

  const chkWaitOut = document.getElementById('check-wait-outward');
  const chkWaitRet = document.getElementById('check-wait-return');
  const needsOut = chkWaitOut ? chkWaitOut.checked : false;
  const needsRet = chkWaitRet ? chkWaitRet.checked : false;
  if (!needsOut && !needsRet) return showToast('Sélectionnez au moins un trajet.', 'error');

  const extraCount = parseInt(document.getElementById('select-waiting-extra')?.value || '0', 10);

  setButtonLoading(btnSubmit, true, 'Inscription...');
  try {
    if (needsOut && !needsRet) {
      await callServer('ctrlRegisterVehicle', AppState.matchId, { driver_name: pName, offers_outward: false, offers_return: true, seats_outward: 0, seats_return: 0, is_direct: true });
      await callServer('ctrlJoinWaitingList', AppState.matchId, pName, true, false, extraCount);
      showToast('Inscrit : Recherche Aller & Direct pour le Retour !', 'success');
    } else if (!needsOut && needsRet) {
      await callServer('ctrlRegisterVehicle', AppState.matchId, { driver_name: pName, offers_outward: true, offers_return: false, seats_outward: 0, seats_return: 0, is_direct: true });
      await callServer('ctrlJoinWaitingList', AppState.matchId, pName, false, true, extraCount);
      showToast("Inscrit : Direct pour l'Aller & Recherche Retour !", 'success');
    } else {
      const myDirect = (AppState.currentMatchData?.rides || []).find(r => safeLower(r.driver_name) === safeLower(pName) && r.is_direct);
      if (myDirect) { try { await callServer('ctrlDeleteVehicle', AppState.matchId, myDirect.id, pName, AppState.adminToken); } catch(err){} }
      await callServer('ctrlJoinWaitingList', AppState.matchId, pName, true, true, extraCount);
      showToast("Inscription en recherche de place validée.", 'success');
    }
    closeModal('modal-waiting');
    loadMatchDetails();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btnSubmit, false);
  }
}

