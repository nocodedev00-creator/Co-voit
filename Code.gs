/**
 * Point d'entrée de la Web App Google Apps Script.
 */

/**
 * Traite les requêtes HTTP GET et orchestre le routage vers Index.html.
 */
function doGet(e) {
  const params = e ? e.parameter : {};
  const adminToken = params.admin ? String(params.admin).trim() : null;
  const matchId = params.m ? String(params.m).trim() : null;
  // authuser : index du compte Google (0, 1, 2...) pour forcer le bon compte
  // dans les navigateurs multi-comptes (évite l'écran de sélection / erreur Drive).
  const authUser = params.authuser !== undefined && params.authuser !== null && params.authuser !== ''
    ? String(params.authuser).trim()
    : null;

  // 1. Initialiser le classeur si les feuilles sont manquantes.
  //    Encapsulé : une erreur d'init ne doit JAMAIS empêcher l'affichage de la page.
  let initError = null;
  try {
    initDatabase();
  } catch (err) {
    initError = err.message;
  }

  // 2. Déterminer la route serveur
  let currentRoute = 'NO_ACCESS';
  let serverAdminToken = null;
  try {
    serverAdminToken = getConfigValue('ADMIN_TOKEN');
  } catch (err) {
    if (!initError) initError = err.message;
  }

  if (adminToken && serverAdminToken && adminToken === serverAdminToken) {
    currentRoute = 'ADMIN';
  } else if (matchId) {
    currentRoute = 'MATCH';
  }

  // 3. Récupérer l'URL de la Web App de façon défensive (peut être null avant déploiement)
  let webAppUrl = '';
  try {
    webAppUrl = ScriptApp.getService().getUrl() || '';
  } catch (err) {
    webAppUrl = '';
  }

  // 4. Préparer l'objet d'injection dans le template HTML
  const template = HtmlService.createTemplateFromFile('Index');
  template.serverRouting = {
    route: currentRoute,
    matchId: matchId,
    adminToken: adminToken,
    webAppUrl: webAppUrl,
    authUser: authUser,
    initError: initError
  };

  return template.evaluate()
    .setTitle("Co'Voit' - Covoiturage Club")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper d'inclusion de fichiers partiels HTML/CSS/JS.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}