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

  openModal('modal-add-car');
}

async function handleJoinRide(rideId, direction, btn) {
  if (!AppState.currentUser) {
    checkUserIdentityFlow('Indique ton prénom pour rejoindre ce véhicule.');
    return;
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

