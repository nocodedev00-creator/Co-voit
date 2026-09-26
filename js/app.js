/**
 * Co'Voit' - Initialisation & Liaison des Événements DOM
 */

document.addEventListener('DOMContentLoaded', () => {
  updateUserDisplay();

  const loader = document.getElementById('view-loading');
  if (loader) loader.classList.add('hidden');

  // Diagnostic API
  if (!APP_CONFIG.GOOGLE_API_URL || APP_CONFIG.GOOGLE_API_URL.includes('REMPLACEZ_PAR_VOTRE_ID')) {
    const errMsg = document.getElementById('init-error-message');
    if (errMsg) errMsg.innerHTML = "L'URL de l'API Google Apps Script n'est pas encore renseignée dans <code>js/config.js</code>.";
    document.getElementById('view-init-error')?.classList.remove('hidden');
  }

  // Aiguillage de la vue principale
  if (AppState.route === 'ADMIN') {
    document.getElementById('view-admin')?.classList.remove('hidden');
    loadAdminDashboard();
  } else if (AppState.route === 'MATCH') {
    document.getElementById('view-match')?.classList.remove('hidden');
    loadMatchDetails();
  } else {
    document.getElementById('view-no-access')?.classList.remove('hidden');
    const formLogin = document.getElementById('form-login-admin');
    if (formLogin) {
      formLogin.onsubmit = (e) => {
        e.preventDefault();
        const token = document.getElementById('input-login-admin-token')?.value.trim();
        if (token) window.location.href = `${window.location.origin}${window.location.pathname}?admin=${encodeURIComponent(token)}`;
      };
    }
  }

  // --- MODALE SYNTHÈSE DÉTAILLÉE ---
  const btnOpenSummaryDetails = document.getElementById('btn-open-summary-details');
  if (btnOpenSummaryDetails) btnOpenSummaryDetails.onclick = openSummaryDetailsModal;

  const backdropSummary = document.getElementById('backdrop-summary-details');
  if (backdropSummary) backdropSummary.onclick = () => closeModal('modal-summary-details');

  // --- MODALE IDENTITÉ DU JOUEUR ---
  const btnIdentityConfirm = document.getElementById('btn-identity-confirm');
  if (btnIdentityConfirm) btnIdentityConfirm.onclick = () => { closeModal('modal-identity'); loadMatchDetails(); };

  const btnIdentityChange = document.getElementById('btn-identity-change');
  if (btnIdentityChange) btnIdentityChange.onclick = () => {
    document.getElementById('identity-known-block').classList.add('hidden');
    document.getElementById('identity-unknown-block').classList.remove('hidden');
  };

  const formIdentity = document.getElementById('form-identity');
  if (formIdentity) formIdentity.onsubmit = (e) => {
    e.preventDefault();
    const inputName = document.getElementById('input-identity-name').value.trim();
    if (inputName) {
      setUsername(inputName);
      closeModal('modal-identity');
      showToast(`Bienvenue, ${inputName} !`, 'success');
      loadMatchDetails();
    }
  };

  // Fermeture des modales & actualisations
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.onclick = () => ['modal-create-match','modal-whatsapp','modal-add-car','modal-waiting','modal-summary-details'].forEach(closeModal);
  });

  const btnAdminRefresh = document.getElementById('btn-admin-refresh');
  if (btnAdminRefresh) btnAdminRefresh.onclick = loadAdminDashboard;
  const btnPlayerRefresh = document.getElementById('btn-player-refresh');
  if (btnPlayerRefresh) btnPlayerRefresh.onclick = loadMatchDetails;

  const btnChangeUser = document.getElementById('btn-change-username');
  if (btnChangeUser) btnChangeUser.onclick = () => {
    document.getElementById('input-identity-name').value = AppState.currentUser || '';
    document.getElementById('identity-known-block').classList.add('hidden');
    document.getElementById('identity-unknown-block').classList.remove('hidden');
    openModal('modal-identity');
  };

  // --- GESTION ADMIN : CRÉER UN MATCH ---
  const btnOpenCreate = document.getElementById('btn-open-create-match');
  if (btnOpenCreate) {
    btnOpenCreate.onclick = () => {
      document.getElementById('form-create-match')?.reset();
      openModal('modal-create-match');
    };
  }

  const formCreateMatch = document.getElementById('form-create-match');
  if (formCreateMatch) {
    formCreateMatch.onsubmit = async (e) => {
      e.preventDefault();
      const btnSubmit = document.getElementById('btn-submit-create-match');
      if (btnSubmit && btnSubmit.disabled) return;
      setButtonLoading(btnSubmit, true, 'Création...');

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
      } finally {
        setButtonLoading(btnSubmit, false);
      }
    };
  }

  // --- JOUEUR : PROPOSER UNE VOITURE ---
  const btnOpenAddCar = document.getElementById('btn-open-add-car');
  if (btnOpenAddCar) {
    btnOpenAddCar.onclick = () => {
      if (!AppState.currentUser) return checkUserIdentityFlow('Indique ton prénom pour proposer un véhicule.');
      document.getElementById('modal-car-title').textContent = 'Proposer un véhicule';
      document.getElementById('input-edit-ride-id').value = '';
      document.getElementById('input-car-driver').value = AppState.currentUser || '';
      document.getElementById('input-car-driver').disabled = false;
      document.getElementById('input-car-seats-outward').value = '3';
      document.getElementById('input-car-seats-return').value = '3';
      document.getElementById('check-car-direct').checked = false;
      const sOut = document.getElementById('input-car-seats-outward');
      const sRet = document.getElementById('input-car-seats-return');
      if (sRet) sRet.dataset.userTouched = 'false';
      if (sOut) sOut.dataset.userTouched = 'false';
      openModal('modal-add-car');
    };
  }

  // Synchronisation Aller -> Retour
  const seatsOutInput = document.getElementById('input-car-seats-outward');
  const seatsRetInput = document.getElementById('input-car-seats-return');
  if (seatsOutInput && seatsRetInput) {
    seatsOutInput.addEventListener('input', () => {
      if (seatsRetInput.dataset.userTouched !== 'true') seatsRetInput.value = seatsOutInput.value;
    });
    seatsRetInput.addEventListener('input', () => { seatsRetInput.dataset.userTouched = 'true'; });
  }

  // --- JOUEUR : DIRECT SUR PLACE ---
  const btnQuickDirect = document.getElementById('btn-quick-direct');
  if (btnQuickDirect) {
    btnQuickDirect.onclick = async () => {
      if (!AppState.currentUser) return checkUserIdentityFlow('Indique ton prénom pour signaler ton trajet direct.');
      if (btnQuickDirect.disabled) return;
      if (!confirm('Confirmer que vous allez directement au match par vos propres moyens (sans passer par le covoiturage) ?')) return;

      setButtonLoading(btnQuickDirect, true, 'Enregistrement...');
      const payload = { driver_name: AppState.currentUser, offers_outward: true, offers_return: true, seats_outward: 0, seats_return: 0, is_direct: true };
      try {
        await callServer('ctrlRegisterVehicle', AppState.matchId, payload);
        showToast('Enregistré : Direct par vos propres moyens !', 'success');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setButtonLoading(btnQuickDirect, false);
      }
    };
  }

  // Formulaire Proposer / Modifier Voiture
  const formAddCar = document.getElementById('form-add-car');
  if (formAddCar) {
    formAddCar.onsubmit = async (e) => {
      e.preventDefault();
      const btnSubmit = document.getElementById('btn-submit-add-car');
      if (btnSubmit && btnSubmit.disabled) return;

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
      if (!payload.offers_outward && !payload.offers_return) return showToast("Cochez au moins l'aller ou le retour.", 'error');

      setButtonLoading(btnSubmit, true, 'Enregistrement...');
      try {
        const action = editId ? 'ctrlUpdateVehicle' : 'ctrlRegisterVehicle';
        const args = editId ? [AppState.matchId, editId, driverName, payload] : [AppState.matchId, payload];
        await callServer(action, ...args);
        showToast(editId ? 'Véhicule mis à jour !' : 'Véhicule enregistré !', 'success');
        closeModal('modal-add-car');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setButtonLoading(btnSubmit, false);
      }
    };
  }

  // --- JOUEUR : LISTE D'ATTENTE ---
  const chkWaitOut = document.getElementById('check-wait-outward');
  const chkWaitRet = document.getElementById('check-wait-return');
  const hintWaitEl = document.getElementById('waiting-rule-hint');
  const updateWaitingHint = () => {
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
  };
  if (chkWaitOut && chkWaitRet) {
    chkWaitOut.onchange = updateWaitingHint;
    chkWaitRet.onchange = updateWaitingHint;
  }

  const btnOpenWaiting = document.getElementById('btn-open-waiting-list');
  if (btnOpenWaiting) {
    btnOpenWaiting.onclick = () => {
      if (!AppState.currentUser) return checkUserIdentityFlow("Indique ton prénom pour t'inscrire en liste d'attente.");
      document.getElementById('input-waiting-name').value = AppState.currentUser || '';
      updateWaitingHint();
      openModal('modal-waiting');
    };
  }

  const formWaiting = document.getElementById('form-waiting');
  if (formWaiting) {
    formWaiting.onsubmit = async (e) => {
      e.preventDefault();
      const btnSubmit = document.getElementById('btn-submit-waiting');
      if (btnSubmit && btnSubmit.disabled) return;

      const pName = document.getElementById('input-waiting-name').value.trim();
      if (!pName) return;
      setUsername(pName);

      const needsOut = chkWaitOut ? chkWaitOut.checked : false;
      const needsRet = chkWaitRet ? chkWaitRet.checked : false;
      if (!needsOut && !needsRet) return showToast('Sélectionnez au moins un trajet.', 'error');

      setButtonLoading(btnSubmit, true, 'Inscription...');
      try {
        if (needsOut && !needsRet) {
          await callServer('ctrlJoinWaitingList', AppState.matchId, pName, true, false);
          await callServer('ctrlRegisterVehicle', AppState.matchId, { driver_name: pName, offers_outward: false, offers_return: true, seats_outward: 0, seats_return: 0, is_direct: true });
          showToast('Inscrit : Recherche Aller & Direct pour le Retour !', 'success');
        } else if (!needsOut && needsRet) {
          await callServer('ctrlJoinWaitingList', AppState.matchId, pName, false, true);
          await callServer('ctrlRegisterVehicle', AppState.matchId, { driver_name: pName, offers_outward: true, offers_return: false, seats_outward: 0, seats_return: 0, is_direct: true });
          showToast('Inscrit : Direct pour l\'Aller & Recherche Retour !', 'success');
        } else {
          await callServer('ctrlJoinWaitingList', AppState.matchId, pName, true, true);
          const myDirect = (AppState.currentMatchData?.rides || []).find(r => safeLower(r.driver_name) === safeLower(pName) && r.is_direct);
          if (myDirect) { try { await callServer('ctrlDeleteVehicle', AppState.matchId, myDirect.id, pName, AppState.adminToken); } catch(err){} }
          showToast("Inscription en liste d'attente validée.", 'success');
        }
        closeModal('modal-waiting');
        loadMatchDetails();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setButtonLoading(btnSubmit, false);
      }
    };
  }

  // --- EXPORT WHATSAPP : COPIER DANS LE PRESSE-PAPIER ---
  const btnCopyWhatsApp = document.getElementById('btn-copy-whatsapp');
  if (btnCopyWhatsApp) {
    btnCopyWhatsApp.onclick = () => {
      const textarea = document.getElementById('textarea-whatsapp');
      const text = textarea ? textarea.value : '';
      const onCopied = () => showToast('Synthèse copiée dans le presse-papier !', 'success');
      navigator.clipboard?.writeText ? navigator.clipboard.writeText(text).then(onCopied).catch(() => { textarea?.select(); document.execCommand('copy'); onCopied(); }) : (textarea?.select(), document.execCommand('copy'), onCopied());
    };
  }
});
