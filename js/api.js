/**
 * Co'Voit' - Pont Réseau / API Client
 * Remplace l'ancien google.script.run par un appel fetch() REST JSON standard.
 */

async function callServer(methodName, ...args) {
  const apiUrl = APP_CONFIG.GOOGLE_API_URL;

  if (!apiUrl || apiUrl.includes('REMPLACEZ_PAR_VOTRE_ID')) {
    throw new Error("L'URL de l'API Google Apps Script n'a pas encore été configurée dans js/config.js.");
  }

  const payload = JSON.stringify({
    action: methodName,
    args: args
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      // Utilisation de text/plain pour éviter les requêtes préliminaires OPTIONS (CORS preflight)
      // non prises en charge nativement par Google Apps Script
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau HTTP ${response.status} : ${response.statusText}`);
    }

    const json = await response.json();

    if (json && json.success === false) {
      throw new Error(json.error || 'Erreur retournée par le serveur.');
    }

    return json ? json.data : null;
  } catch (err) {
    console.error(`[API Error] Appel à ${methodName} échoué :`, err);
    throw new Error(err.message || 'Impossible de contacter le serveur.');
  }
}

