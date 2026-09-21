/**
 * Point d'entrée de la Web App Google Apps Script.
 */

/**
 * Traite les requêtes HTTP GET et orchestre le routage vers Index.html.
 */
function doGet(e) {
  // 1. Initialiser le classeur si les feuilles sont manquantes
  initDatabase();

  const params = e ? e.parameter : {};
  const adminToken = params.admin ? String(params.admin).trim() : null;
  const matchId = params.m ? String(params.m).trim() : null;

  // 2. Déterminer la route serveur
  let currentRoute = 'NO_ACCESS';
  let serverAdminToken = getConfigValue('ADMIN_TOKEN');

  if (adminToken && adminToken === serverAdminToken) {
    currentRoute = 'ADMIN';
  } else if (matchId) {
    currentRoute = 'MATCH';
  }

  // 3. Préparer l'objet d'injection dans le template HTML
  const template = HtmlService.createTemplateFromFile('Index');
  template.serverRouting = {
    route: currentRoute,
    matchId: matchId,
    adminToken: adminToken,
    webAppUrl: ScriptApp.getService().getUrl()
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