/**
 * Co'Voit' - Pont Réseau / API Client
 * Gère les appels fetch(), la déduplication des requêtes en vol et l'indicateur global.
 */

// Registre des requêtes en vol (Anti-double-clic strict)
const inFlightRequests = new Map();

function showGlobalLoader(show) {
  let bar = document.getElementById('global-network-loader');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'global-network-loader';
    bar.className = 'fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 z-[9999] pointer-events-none transition-opacity duration-300';
    bar.style.display = 'none';
    document.body.appendChild(bar);
  }
  bar.style.display = show ? 'block' : 'none';
}

async function callServer(methodName, ...args) {
  const apiUrl = APP_CONFIG.GOOGLE_API_URL;

  if (!apiUrl || apiUrl.includes('REMPLACEZ_PAR_VOTRE_ID')) {
    throw new Error("L'URL de l'API Google Apps Script n'a pas encore été configurée dans js/config.js.");
  }

  // Clé d'idempotence pour dédupliquer les clics répétés
  const requestKey = `${methodName}::${JSON.stringify(args)}`;
  if (inFlightRequests.has(requestKey)) {
    console.warn(`[Anti-Double-Clic] Requête ${methodName} déjà en cours, réutilisation de la promesse active.`);
    return inFlightRequests.get(requestKey);
  }

  const payload = JSON.stringify({
    action: methodName,
    args: args
  });

  const requestPromise = (async () => {
    showGlobalLoader(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
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
    } finally {
      inFlightRequests.delete(requestKey);
      if (inFlightRequests.size === 0) {
        showGlobalLoader(false);
      }
    }
  })();

  inFlightRequests.set(requestKey, requestPromise);
  return requestPromise;
}
