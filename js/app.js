/**
 * Co'Voit' - Initialisation & Liaison des Événements DOM
 */

document.addEventListener('DOMContentLoaded', () => {
  updateUserDisplay();

  const loader = document.getElementById('view-loading');
  if (loader) loader.classList.add('hidden');

  // Diagnostic : Vérifier si l'URL de l'API Apps Script est configurée
  if (!APP_CONFIG.GOOGLE_API_URL || APP_CONFIG.GOOGLE_API_URL.includes('REMPLACEZ_PAR_VOTRE_ID')) {
    const errBox = document.getElementById('view-init-error');
    const errMsg = document.getElementById('init-error-message');
    if (errBox && errMsg) {
      errMsg.innerHTML = "L'URL de votre Web App Google Apps Script n'est pas encore renseignée dans <code>js/config.js</code>. Veuillez y coller l'URL de déploiement (se terminant par /exec).";
      errBox.classList.remove('hidden');
    }
  }

  // Aiguillage de la vue principale
  if (AppState.route === 'ADMIN') {
    document.getElementById('view-admin').classList.remove('hidden');
    loadAdminDashboard();
  } else if (AppState.route === 'MATCH') {
    document.getElementById('view-match').classList.remove('hidden');
    loadMatchDetails();
  } else {
    document.getElementById('view-no-access').classList.remove('hidden');
  }

  // --- MODALE SYNTHÈSE DÉTAILLÉE ---
  const btnOpenSummaryDetails = document.getElementById('btn-open-summary-details');
  if (btnOpenSummaryDetails) btnOpenSummaryDetails.onclick = openSummaryDetailsModal;

  const backdropSummary = document.getElementById('backdrop-summary-details');
  if (backdropSummary) backdropSummary.onclick = () => closeModal('modal-summary-details');

  // --- MODALE IDENTITÉ DU JOUEUR ---
  const btnIdentityConfirm = document.getElementById('btn-identity-confirm');
  if (btnIdentityConfirm) {
    btnIdentityConfirm.onclick = () => {
      closeModal('modal-identity');
      loadMatchDetails();
    };
  }

  const btnIdentityChange = document.getElementById('btn-identity-change');
  if (btnIdentityChange) {
    btnIdentityChange.onclick = () => {
      document.getElementById('identity-known-block').classList.add('hidden');
      document.getElementById('identity-unknown-block').classList.remove('hidden');
    };
  }

  const formIdentity = document.getElementById('form-identity');
  if (formIdentity) {
    formIdentity.onsubmit = (e) => {
      e.preventDefault();
      const inputName = document.getElementById('input-identity-name').value.trim();
      if (inputName) {
        setUsername(inputName);
        closeModal('modal-identity');
        showToast(`Bienvenue, ${inputName} !`, 'success');
        loadMatchDetails();
      }
    };
  }

  // Fermeture des modales
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.onclick = () => {
      closeModal('modal-create-match');
      closeModal('modal-whatsapp');
      closeModal('modal-add-car');
      closeModal('modal-waiting');
      closeModal('modal-summary-details');
    };
  });

  // Boutons d'actualisation
  const btnAdminRefresh = document.getElementById('btn-admin-refresh');
  if (btnAdminRefresh) btnAdminRefresh.onclick = loadAdminDashboard;

  const btnPlayerRefresh = document.getElementById('btn-player-refresh');
  if (btnPlayerRefresh) btnPlayerRefresh.onclick = loadMatchDetails;

  const btnChangeUser = document.getElementById('btn-change-username');
  if (btnChangeUser) {
    btnChangeUser.onclick = () => {
      document.getElementById('input-identity-name').value = AppState.currentUser || '';
      document.getElementById('identity-known-block').classList.add('hidden');
      document.getElementById('identity-unknown-block').classList.remove('hidden');
      openModal('modal-identity');
    };
  }

  // --- GESTION ADMIN : CRÉER UN MATCH ---
  const btnOpenCreate = document.getElementById('btn-open-create-match');
  if (btnOpenCreate) {
    btnOpenCreate.onclick = () => {
      document.getElementById('form-create-match').reset();
      openModal('modal-create-match');
    };
  }

  const formCreateMatch = document.getElementById('form-create-match');
  if (formCreateMatch) {
    formCreateMatch.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('input-match-title').value,
        event_date: document.getElementById('input-match-date').value,
        departure_time: document.getElementById('input-match-time').value,
        meeting_place: document.getElementById('input-match-place').value
      };

      try {
        await callServer('ctrlCreateMatch', AppState.adminToken, payload);
        showToast('Match créé avec succès !', 'success');
        closeModal('modal-create-match');
        loadAdminDashboard();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  // --- JOUEUR : PROPOSER UNE VOITURE ---
  const btnOpenAddCar = document.getElementById('btn-open-add-car');
  if (btnOpenAddCar) {
    btnOpenAddCar.onclick = () => {
      if (!AppState.currentUser) {
        checkUserIdentityFlow('Indique ton prénom pour proposer un véhicule.');
        return;
      }
      document.getElementById('modal-car-title').textContent = 'Proposer un véhicule';
      document.getElementById('input-edit-ride-id').value = '';
      document.getElementById('input-car-driver').value = AppState.currentUser || '';
      document.getElementById('input-car-driver').disabled = false;
      document.getElementById('input-car-seats-outward').value = '3';
      document.getElementById('input-car-seats-return').value = '3';
      document.getElementById('check-car-direct').checked = false;

      const seatsOut = document.getElementById('input-car-seats-outward');
      const seatsRet = document.getElementById('input-car-seats-return');
      if (seatsRet) seatsRet.dataset.userTouched = 'false';
      if (seatsOut) seatsOut.dataset.userTouched = 'false';
      openModal('modal-add-car');
    };
  }

  // Synchronisation Aller -> Retour
  const seatsOutInput = document.getElementById('input-car-seats-outward');
  const seatsRetInput = document.getElementById('input-car-seats-return');
  if (seatsOutInput && seatsRetInput) {
    seatsOutInput.addEventListener('input', () => {
      if (seatsRetInput.dataset.userTouched !== 'true') {
        seatsRetInput.value = seatsOutInput.value;
      }
    });
    seatsRetInput.addEventListener('input', () => {
      seatsRetInput.dataset.userTouched = 'true';
    });
  }

  // --- JOUEUR : DIRECT SUR PLACE ---
  const btnQuickDirect = document.getElementById('btn-quick-direct');
  if (btnQuickDirect) {
    btnQuickDirect.onclick = async () => {
      if (!AppState.currentUser) {
        checkUserIdentityFlow('Indique ton prénom pour signaler ton trajet direct.');
        return;
      }
      if (!confirm('Confirmer que vous allez directement au match par vos propres moyens (sans passer par le covoiturage) ?')) {
        return;
      }
      const payload = {
        driver_name: AppState.currentUser,
        offers_outward: true,
        offers_return: true,
        seats_outward: 0,
        seats_return: 0,
        is_direct: true
      };
      try {
        await callServer('ctrlRegisterVehicle', AppState.matchId, payload);
        showToast('Enregistré : Direct par vos propres moyens !', 'success');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  // Formulaire Proposer / Modifier Voiture
  const formAddCar = document.getElementById('form-add-car');
  if (formAddCar) {
    formAddCar.onsubmit = async (e) => {
      e.preventDefault();
      const editId = document.getElementById('input-edit-ride-id').value;
      const driverName = document.getElementById('input-car-driver').value.trim();
      if (!driverName) return;
      setUsername(driverName);

      const payload = {
        driver_name: driverName,
        offers_outward: document.getElementById('check-offers-outward').checked,
        offers_return: document.getElementById('check-offers-return').checked,
        seats_outward: parseInt(document.getElementById('input-car-seats-outward').value, 10) || 0,
        seats_return: parseInt(document.getElementById('input-car-seats-return').value, 10) || 0,
        is_direct: document.getElementById('check-car-direct').checked,
        adminToken: AppState.adminToken
      };

      if (!payload.offers_outward && !payload.offers_return) {
        showToast("Cochez au moins l'aller ou le retour.", 'error');
        return;
      }

      try {
        if (editId) {
          await callServer('ctrlUpdateVehicle', AppState.matchId, editId, driverName, payload);
          showToast('Véhicule mis à jour !', 'success');
        } else {
          await callServer('ctrlRegisterVehicle', AppState.matchId, payload);
          showToast('Véhicule enregistré !', 'success');
        }
        closeModal('modal-add-car');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  // --- JOUEUR : LISTE D'ATTENTE ---
  const btnOpenWaiting = document.getElementById('btn-open-waiting-list');
  if (btnOpenWaiting) {
    btnOpenWaiting.onclick = () => {
      if (!AppState.currentUser) {
        checkUserIdentityFlow("Indique ton prénom pour t'inscrire en liste d'attente.");
        return;
      }
      document.getElementById('input-waiting-name').value = AppState.currentUser || '';
      openModal('modal-waiting');
    };
  }

  const formWaiting = document.getElementById('form-waiting');
  if (formWaiting) {
    formWaiting.onsubmit = async (e) => {
      e.preventDefault();
      const pName = document.getElementById('input-waiting-name').value.trim();
      if (!pName) return;
      setUsername(pName);

      const needsOut = document.getElementById('check-wait-outward').checked;
      const needsRet = document.getElementById('check-wait-return').checked;

      if (!needsOut && !needsRet) {
        showToast('Sélectionnez au moins un trajet.', 'error');
        return;
      }

      try {
        await callServer('ctrlJoinWaitingList', AppState.matchId, pName, needsOut, needsRet);
        showToast("Inscription en liste d'attente validée.", 'success');
        closeModal('modal-waiting');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  // --- EXPORT WHATSAPP : COPIER DANS LE PRESSE-PAPIER ---
  const btnCopyWhatsApp = document.getElementById('btn-copy-whatsapp');
  if (btnCopyWhatsApp) {
    btnCopyWhatsApp.onclick = () => {
      const textarea = document.getElementById('textarea-whatsapp');
      const text = textarea.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Synthèse copiée dans le presse-papier !', 'success');
        }).catch(() => {
          textarea.select();
          document.execCommand('copy');
          showToast('Synthèse copiée dans le presse-papier !', 'success');
        });
      } else {
        textarea.select();
        document.execCommand('copy');
        showToast('Synthèse copiée dans le presse-papier !', 'success');
      }
    };
  }
});

