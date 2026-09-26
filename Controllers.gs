/**
 * Endpoints serveur appelés via google.script.run (Co'Voit' - Version Complète).
 */

// Helper sécurisé de normalisation de texte
function safeLower(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().toLowerCase();
}

// ==========================================
// 1. ENDPOINTS ADMINISTRATEUR
// ==========================================

function ctrlVerifyAdminToken(token) {
  try {
    const validToken = getConfigValue('ADMIN_TOKEN');
    if (!token || !validToken || String(token).trim() !== String(validToken).trim()) {
      return responseError('Token administrateur invalide.');
    }
    return responseSuccess({ valid: true });
  } catch (err) {
    return responseError(err.message);
  }
}

function ctrlGetAdminMatches(adminToken) {
  try {
    const auth = ctrlVerifyAdminToken(adminToken);
    if (!auth.success) return auth;

    const matches = getTableRecords(DB_SCHEMA.MATCHES.sheetName);
    const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName);
    const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName);

    const enrichedMatches = matches.map(m => {
      const matchRides = rides.filter(r => r.match_id === m.id);
      const matchWaiting = waiting.filter(w => w.match_id === m.id);

      let totalSeatsOutward = 0;
      let totalSeatsReturn = 0;

      matchRides.forEach(r => {
        if (r.offers_outward) totalSeatsOutward += Number(r.seats_outward !== undefined ? r.seats_outward : (r.seats_total || 0));
        if (r.offers_return) totalSeatsReturn += Number(r.seats_return !== undefined ? r.seats_return : (r.seats_total || 0));
      });

      return {
        ...m,
        rides_count: matchRides.length,
        total_seats_outward: totalSeatsOutward,
        total_seats_return: totalSeatsReturn,
        waiting_count: matchWaiting.length
      };
    });

    enrichedMatches.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    return responseSuccess(enrichedMatches);
  } catch (err) {
    return responseError(err.message);
  }
}

function ctrlCreateMatch(adminToken, payload) {
  return withScriptLock(() => {
    try {
      const auth = ctrlVerifyAdminToken(adminToken);
      if (!auth.success) return auth;

      if (!payload || !payload.title || !payload.event_date || !payload.departure_time || !payload.meeting_place) {
        return responseError('Tous les champs obligatoires doivent être renseignés.');
      }

      const newMatch = {
        id: generateId('m'),
        title: String(payload.title).trim(),
        event_date: String(payload.event_date),
        departure_time: String(payload.departure_time),
        meeting_place: String(payload.meeting_place).trim(),
        is_locked: false,
        created_at: new Date().toISOString()
      };

      insertRecord(DB_SCHEMA.MATCHES.sheetName, newMatch);
      return responseSuccess(newMatch);
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlToggleMatchLock(adminToken, matchId, isLocked) {
  return withScriptLock(() => {
    try {
      const auth = ctrlVerifyAdminToken(adminToken);
      if (!auth.success) return auth;

      const updated = updateRecord(DB_SCHEMA.MATCHES.sheetName, matchId, { is_locked: Boolean(isLocked) });
      if (!updated) return responseError('Match introuvable.');
      return responseSuccess({ id: matchId, is_locked: Boolean(isLocked) });
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlDeleteMatch(adminToken, matchId) {
  return withScriptLock(() => {
    try {
      const auth = ctrlVerifyAdminToken(adminToken);
      if (!auth.success) return auth;

      deleteRecord(DB_SCHEMA.MATCHES.sheetName, matchId);
      deleteRecordsWhere(DB_SCHEMA.RIDES.sheetName, 'match_id', matchId);
      deleteRecordsWhere(DB_SCHEMA.WAITING_LIST.sheetName, 'match_id', matchId);

      return responseSuccess({ deletedId: matchId });
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlGetWhatsAppSummary(adminToken, matchId, webAppUrl, authUser) {
  try {
    const auth = ctrlVerifyAdminToken(adminToken);
    if (!auth.success) return auth;

    const matches = getTableRecords(DB_SCHEMA.MATCHES.sheetName);
    const match = matches.find(m => m.id === matchId);
    if (!match) return responseError('Match introuvable.');

    const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName).filter(r => r.match_id === matchId);
    const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName).filter(w => w.match_id === matchId);

    // Construction de l'URL publique en propageant authuser (multi-comptes Google)
    let publicUrl = `${webAppUrl}?m=${matchId}`;
    if (authUser !== undefined && authUser !== null && String(authUser).trim() !== '') {
      publicUrl += `&authuser=${encodeURIComponent(String(authUser).trim())}`;
    }

    const text = formatWhatsAppSummary(match, rides, waiting, publicUrl);

    return responseSuccess(text);
  } catch (err) {
    return responseError(err.message);
  }
}

// ==========================================
// 2. ENDPOINTS JOUEURS & PUBLIC
// ==========================================

function ctrlGetMatchDetails(matchId) {
  try {
    const matches = getTableRecords(DB_SCHEMA.MATCHES.sheetName);
    const match = matches.find(m => m.id === matchId);

    if (!match) {
      return responseError('Le match demandé est introuvable ou a été supprimé.');
    }

    const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName).filter(r => r.match_id === matchId);
    const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName).filter(w => w.match_id === matchId);

    return responseSuccess({
      match: match,
      rides: rides,
      waiting_list: waiting
    });
  } catch (err) {
    return responseError(err.message);
  }
}

function ctrlRegisterVehicle(matchId, payload) {
  return withScriptLock(() => {
    try {
      const match = getTableRecords(DB_SCHEMA.MATCHES.sheetName).find(m => m.id === matchId);
      if (!match) return responseError('Match introuvable.');
      if (match.is_locked) return responseError('Les inscriptions pour ce match sont verrouillées.');

      const driverName = String(payload.driver_name || '').trim();
      if (!driverName) return responseError('Le prénom du conducteur est obligatoire.');

      const isDirect = Boolean(payload.is_direct);
      const seatsOutward = isDirect && Number(payload.seats_outward) <= 0 ? 0 : Math.max(0, parseInt(payload.seats_outward, 10) || 0);
      const seatsReturn = isDirect && Number(payload.seats_return) <= 0 ? 0 : Math.max(0, parseInt(payload.seats_return, 10) || 0);
      const offersOutward = Boolean(payload.offers_outward);
      const offersReturn = Boolean(payload.offers_return);

      // Si le conducteur était passager dans d'autres voitures, on le retire automatiquement
      const allRides = getTableRecords(DB_SCHEMA.RIDES.sheetName).filter(r => r.match_id === matchId);
      allRides.forEach(otherRide => {
        if (safeLower(otherRide.driver_name) !== safeLower(driverName)) {
          let newOut = (otherRide.outward_passengers || []).filter(p => safeLower(p) !== safeLower(driverName));
          let newRet = (otherRide.return_passengers || []).filter(p => safeLower(p) !== safeLower(driverName));

          if (newOut.length !== (otherRide.outward_passengers || []).length || newRet.length !== (otherRide.return_passengers || []).length) {
            updateRecord(DB_SCHEMA.RIDES.sheetName, otherRide.id, {
              outward_passengers: newOut,
              return_passengers: newRet,
              updated_at: new Date().toISOString()
            });
          }
        }
      });

      // Si le joueur avait déjà enregistré un véhicule, mise à jour
      const userRide = allRides.find(r => safeLower(r.driver_name) === safeLower(driverName));
      if (userRide) {
        updateRecord(DB_SCHEMA.RIDES.sheetName, userRide.id, {
          seats_outward: seatsOutward,
          seats_return: seatsReturn,
          seats_total: Math.max(seatsOutward, seatsReturn),
          is_direct: isDirect,
          offers_outward: offersOutward,
          offers_return: offersReturn,
          updated_at: new Date().toISOString()
        });
        return responseSuccess(userRide);
      }

      const newRide = {
        id: generateId('r'),
        match_id: matchId,
        driver_name: driverName,
        is_direct: isDirect,
        offers_outward: offersOutward,
        offers_return: offersReturn,
        seats_outward: seatsOutward,
        seats_return: seatsReturn,
        seats_total: Math.max(seatsOutward, seatsReturn),
        outward_passengers: [],
        return_passengers: [],
        updated_at: new Date().toISOString()
      };

      insertRecord(DB_SCHEMA.RIDES.sheetName, newRide);

      // Retrait automatique de la liste d'attente
      const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName).filter(w => w.match_id === matchId);
      const existingWait = waiting.find(w => safeLower(w.player_name) === safeLower(driverName));
      if (existingWait) {
        deleteRecord(DB_SCHEMA.WAITING_LIST.sheetName, existingWait.id);
      }

      return responseSuccess(newRide);
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlUpdateVehicle(matchId, rideId, playerName, payload) {
  return withScriptLock(() => {
    try {
      const match = getTableRecords(DB_SCHEMA.MATCHES.sheetName).find(m => m.id === matchId);
      if (!match) return responseError('Match introuvable.');
      if (match.is_locked) return responseError('Les inscriptions sont verrouillées.');

      const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName);
      const ride = rides.find(r => r.id === rideId && r.match_id === matchId);
      if (!ride) return responseError('Véhicule introuvable.');

      const isAdmin = payload.adminToken && payload.adminToken === getConfigValue('ADMIN_TOKEN');
      const isOwner = playerName && safeLower(ride.driver_name) === safeLower(playerName);

      if (!isAdmin && !isOwner) {
        return responseError("Vous n'êtes pas autorisé à modifier ce véhicule.");
      }

      const seatsOut = Math.max(0, parseInt(payload.seats_outward, 10) || 0);
      const seatsRet = Math.max(0, parseInt(payload.seats_return, 10) || 0);

      const updates = {
        offers_outward: Boolean(payload.offers_outward),
        offers_return: Boolean(payload.offers_return),
        seats_outward: seatsOut,
        seats_return: seatsRet,
        seats_total: Math.max(seatsOut, seatsRet),
        is_direct: Boolean(payload.is_direct),
        updated_at: new Date().toISOString()
      };

      updateRecord(DB_SCHEMA.RIDES.sheetName, rideId, updates);
      return responseSuccess(updates);
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlDeleteVehicle(matchId, rideId, playerName, adminToken) {
  return withScriptLock(() => {
    try {
      const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName);
      const ride = rides.find(r => r.id === rideId && r.match_id === matchId);
      if (!ride) return responseError('Véhicule introuvable.');

      const isAdmin = adminToken && adminToken === getConfigValue('ADMIN_TOKEN');
      const isOwner = playerName && safeLower(ride.driver_name) === safeLower(playerName);

      if (!isAdmin && !isOwner) {
        return responseError("Vous n'êtes pas autorisé à supprimer ce véhicule.");
      }

      const outwardPassengers = Array.isArray(ride.outward_passengers) ? ride.outward_passengers : [];
      const returnPassengers = Array.isArray(ride.return_passengers) ? ride.return_passengers : [];
      const allPassengers = Array.from(new Set([...outwardPassengers, ...returnPassengers]));

      allPassengers.forEach(pName => {
        insertRecord(DB_SCHEMA.WAITING_LIST.sheetName, {
          id: generateId('w'),
          match_id: matchId,
          player_name: pName,
          needs_outward: outwardPassengers.includes(pName),
          needs_return: returnPassengers.includes(pName),
          created_at: new Date().toISOString()
        });
      });

      deleteRecord(DB_SCHEMA.RIDES.sheetName, rideId);
      return responseSuccess({ deletedRideId: rideId, migratedPassengers: allPassengers });
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlJoinRide(matchId, rideId, playerName, direction) {
  return withScriptLock(() => {
    try {
      const match = getTableRecords(DB_SCHEMA.MATCHES.sheetName).find(m => m.id === matchId);
      if (!match) return responseError('Match introuvable.');
      if (match.is_locked) return responseError('Les inscriptions sont verrouillées.');

      const cleanName = String(playerName || '').trim();
      if (!cleanName) return responseError('Prénom requis.');

      const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName);
      const ride = rides.find(r => r.id === rideId && r.match_id === matchId);
      if (!ride) return responseError('Véhicule introuvable.');

      if (safeLower(ride.driver_name) === safeLower(cleanName)) {
        return responseError('Vous êtes déjà le conducteur de ce véhicule.');
      }

      if (direction === 'outward' && !ride.offers_outward) return responseError("Ce véhicule n'assure pas l'aller.");
      if (direction === 'return' && !ride.offers_return) return responseError("Ce véhicule n'assure pas le retour.");

      // Restriction liste d'attente : l'utilisateur doit obligatoirement avoir choisi "Je cherche"
      // (être en liste d'attente) pour ce trajet afin de pouvoir monter dans un véhicule.
      const waitingForUser = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName)
        .filter(w => w.match_id === matchId)
        .find(w => safeLower(w.player_name) === safeLower(cleanName));
      if (!waitingForUser) {
        return responseError("Vous devez d'abord vous inscrire via le bouton 'Je cherche' pour pouvoir réserver une place.");
      }
      const needsOut = waitingForUser.needs_outward === true || waitingForUser.needs_outward === 'true';
      const needsRet = waitingForUser.needs_return === true || waitingForUser.needs_return === 'true';
      if (direction === 'outward' && !needsOut) {
        return responseError("Vous cherchez une place uniquement pour le retour : impossible de rejoindre l'aller.");
      }
      if (direction === 'return' && !needsRet) {
        return responseError("Vous cherchez une place uniquement pour l'aller : impossible de rejoindre le retour.");
      }

      // Restriction direct : si le joueur est noté direct sur place pour ce trajet, il ne peut pas rejoindre un véhicule
      const userDirectRide = rides.find(r => r.match_id === matchId && safeLower(r.driver_name) === safeLower(cleanName) && r.is_direct);
      if (userDirectRide) {
        const offersOut = userDirectRide.offers_outward === true || userDirectRide.offers_outward === 'true';
        const offersRet = userDirectRide.offers_return === true || userDirectRide.offers_return === 'true';
        if (direction === 'outward' && offersOut) {
          return responseError("Vous êtes déjà noté direct sur place pour l'aller : impossible de rejoindre l'aller.");
        }
        if (direction === 'return' && offersRet) {
          return responseError("Vous êtes déjà noté direct sur place pour le retour : impossible de rejoindre le retour.");
        }
      }


      const passengers = direction === 'outward' ? (ride.outward_passengers || []) : (ride.return_passengers || []);
      const seatCapacity = direction === 'outward' 
        ? (ride.seats_outward !== undefined ? Number(ride.seats_outward) : Number(ride.seats_total || 0)) 
        : (ride.seats_return !== undefined ? Number(ride.seats_return) : Number(ride.seats_total || 0));

      if (passengers.map(p => safeLower(p)).includes(safeLower(cleanName))) {
        return responseError('Vous êtes déjà inscrit dans ce véhicule pour ce trajet.');
      }

      if (passengers.length >= seatCapacity) {
        return responseError('Ce véhicule est complet pour ce trajet.');
      }

      rides.filter(r => r.match_id === matchId).forEach(r => {
        const list = direction === 'outward' ? (r.outward_passengers || []) : (r.return_passengers || []);
        if (list.map(p => safeLower(p)).includes(safeLower(cleanName))) {
          throw new Error(`Vous êtes déjà inscrit dans la voiture de ${r.driver_name} pour ce trajet.`);
        }
      });

      passengers.push(cleanName);

      const updateData = { updated_at: new Date().toISOString() };
      if (direction === 'outward') updateData.outward_passengers = passengers;
      else updateData.return_passengers = passengers;

      updateRecord(DB_SCHEMA.RIDES.sheetName, rideId, updateData);

      const waitingList = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName).filter(w => w.match_id === matchId);
      const userWaiting = waitingList.find(w => safeLower(w.player_name) === safeLower(cleanName));

      if (userWaiting) {
        if (direction === 'outward' && !userWaiting.needs_return) {
          deleteRecord(DB_SCHEMA.WAITING_LIST.sheetName, userWaiting.id);
        } else if (direction === 'return' && !userWaiting.needs_outward) {
          deleteRecord(DB_SCHEMA.WAITING_LIST.sheetName, userWaiting.id);
        } else {
          const updates = {};
          if (direction === 'outward') updates.needs_outward = false;
          if (direction === 'return') updates.needs_return = false;
          updateRecord(DB_SCHEMA.WAITING_LIST.sheetName, userWaiting.id, updates);
        }
      }

      return responseSuccess({ rideId, direction, passengers });
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlLeaveRide(matchId, rideId, playerName, direction) {
  return withScriptLock(() => {
    try {
      const match = getTableRecords(DB_SCHEMA.MATCHES.sheetName).find(m => m.id === matchId);
      if (!match) return responseError('Match introuvable.');
      if (match.is_locked) return responseError('Les inscriptions sont verrouillées.');

      const cleanName = safeLower(playerName);
      const rides = getTableRecords(DB_SCHEMA.RIDES.sheetName);
      const ride = rides.find(r => r.id === rideId && r.match_id === matchId);
      if (!ride) return responseError('Véhicule introuvable.');

      let passengers = direction === 'outward' ? (ride.outward_passengers || []) : (ride.return_passengers || []);
      passengers = passengers.filter(name => safeLower(name) !== cleanName);

      const updateData = { updated_at: new Date().toISOString() };
      if (direction === 'outward') updateData.outward_passengers = passengers;
      else updateData.return_passengers = passengers;

      updateRecord(DB_SCHEMA.RIDES.sheetName, rideId, updateData);
      return responseSuccess({ rideId, direction, passengers });
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlJoinWaitingList(matchId, playerName, needsOutward, needsReturn) {
  return withScriptLock(() => {
    try {
      const match = getTableRecords(DB_SCHEMA.MATCHES.sheetName).find(m => m.id === matchId);
      if (!match) return responseError('Match introuvable.');
      if (match.is_locked) return responseError('Les inscriptions sont verrouillées.');

      const cleanName = String(playerName || '').trim();
      if (!cleanName) return responseError('Prénom requis.');
      if (!needsOutward && !needsReturn) return responseError('Sélectionnez au moins un trajet.');

      const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName).filter(w => w.match_id === matchId);
      const existing = waiting.find(w => safeLower(w.player_name) === safeLower(cleanName));

      if (existing) {
        updateRecord(DB_SCHEMA.WAITING_LIST.sheetName, existing.id, {
          needs_outward: Boolean(needsOutward),
          needs_return: Boolean(needsReturn)
        });
        return responseSuccess(existing);
      }

      const newWait = {
        id: generateId('w'),
        match_id: matchId,
        player_name: cleanName,
        needs_outward: Boolean(needsOutward),
        needs_return: Boolean(needsReturn),
        created_at: new Date().toISOString()
      };

      insertRecord(DB_SCHEMA.WAITING_LIST.sheetName, newWait);
      return responseSuccess(newWait);
    } catch (err) {
      return responseError(err.message);
    }
  });
}

function ctrlLeaveWaitingList(matchId, waitingId, playerName, adminToken) {
  return withScriptLock(() => {
    try {
      const waiting = getTableRecords(DB_SCHEMA.WAITING_LIST.sheetName);
      const item = waiting.find(w => w.id === waitingId && w.match_id === matchId);
      if (!item) return responseError('Enregistrement introuvable.');

      const isAdmin = adminToken && adminToken === getConfigValue('ADMIN_TOKEN');
      const isOwner = playerName && safeLower(item.player_name) === safeLower(playerName);

      if (!isAdmin && !isOwner) {
        return responseError('Action non autorisée.');
      }

      deleteRecord(DB_SCHEMA.WAITING_LIST.sheetName, waitingId);
      return responseSuccess({ deletedWaitingId: waitingId });
    } catch (err) {
      return responseError(err.message);
    }
  });
}