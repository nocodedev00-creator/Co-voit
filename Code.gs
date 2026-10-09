/**
 * Point d'entrée API REST pour la Web App Google Apps Script.
 * Répond en JSON aux requêtes du front-end hébergé sur GitHub Pages.
 */

/**
 * Traite les requêtes HTTP POST (méthode principale appelée par le site).
 */
function doPost(e) {
  return handleApiRequest(e);
}

/**
 * Traite les requêtes HTTP GET (consultation ou test API).
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e);
  }
  return createJsonResponse(responseSuccess({ status: "API Co'Voit' opérationnelle", timestamp: new Date().toISOString() }));
}

/**
 * Orchestrateur central des requêtes API JSON.
 */
function handleApiRequest(e) {
  // 1. Initialiser le classeur si les feuilles sont manquantes
  try {
    initDatabase();
  } catch (err) {
    return createJsonResponse(responseError("Erreur d'initialisation de la base : " + err.message));
  }

  // 2. Extraire l'action et les arguments
  let action = null;
  let args = [];

  try {
    if (e && e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      action = data.action;
      args = Array.isArray(data.args) ? data.args : [];
    } else if (e && e.parameter && e.parameter.action) {
      action = e.parameter.action;
      if (e.parameter.args) {
        args = JSON.parse(e.parameter.args);
      }
    }
  } catch (err) {
    return createJsonResponse(responseError("Données de requête invalides : " + err.message));
  }

  if (!action) {
    return createJsonResponse(responseSuccess({ status: "API Co'Voit' connectée", timestamp: new Date().toISOString() }));
  }

  // 3. Aiguillage vers les contrôleurs
  try {
    let result;
    switch (action) {
      case 'ctrlVerifyAdminToken':
        result = ctrlVerifyAdminToken(args[0]);
        break;
      case 'ctrlGetAdminMatches':
        result = ctrlGetAdminMatches(args[0]);
        break;
      case 'ctrlCreateMatch':
        result = ctrlCreateMatch(args[0], args[1]);
        break;
      case 'ctrlToggleMatchLock':
        result = ctrlToggleMatchLock(args[0], args[1], args[2]);
        break;
      case 'ctrlDeleteMatch':
        result = ctrlDeleteMatch(args[0], args[1]);
        break;
      case 'ctrlGetWhatsAppSummary':
        result = ctrlGetWhatsAppSummary(args[0], args[1], args[2], args[3]);
        break;
      case 'ctrlGetMatchDetails':
        result = ctrlGetMatchDetails(args[0]);
        break;
      case 'ctrlRegisterVehicle':
        result = ctrlRegisterVehicle(args[0], args[1]);
        break;
      case 'ctrlUpdateVehicle':
        result = ctrlUpdateVehicle(args[0], args[1], args[2], args[3]);
        break;
      case 'ctrlDeleteVehicle':
        result = ctrlDeleteVehicle(args[0], args[1], args[2], args[3]);
        break;
      case 'ctrlJoinRide':
        result = ctrlJoinRide(args[0], args[1], args[2], args[3]);
        break;
      case 'ctrlLeaveRide':
        result = ctrlLeaveRide(args[0], args[1], args[2], args[3]);
        break;
      case 'ctrlJoinWaitingList':
        result = ctrlJoinWaitingList(args[0], args[1], args[2], args[3], args[4]);
        break;
      case 'ctrlLeaveWaitingList':
        result = ctrlLeaveWaitingList(args[0], args[1], args[2], args[3]);
        break;
      default:
        result = responseError("Action non reconnue : " + action);
    }
    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse(responseError(err.message));
  }
}

/**
 * Formate et retourne une réponse HTTP avec le type MIME JSON.
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}