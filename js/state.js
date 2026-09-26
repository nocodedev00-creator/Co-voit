/**
 * Co'Voit' - État Global de l'Application & Routage URL Autonome
 */

// Extraction des paramètres d'URL (lecture native côté navigateur)
const queryParams = new URLSearchParams(window.location.search);
const initialMatchId = queryParams.get('m') ? queryParams.get('m').trim() : null;
const initialAdminToken = queryParams.get('admin') ? queryParams.get('admin').trim() : null;

// Détermination de la vue initiale selon l'URL
let initialRoute = 'NO_ACCESS';
if (initialAdminToken) {
  initialRoute = 'ADMIN';
} else if (initialMatchId) {
  initialRoute = 'MATCH';
}

const AppState = {
  route: initialRoute,
  matchId: initialMatchId,
  adminToken: initialAdminToken,
  webAppUrl: window.location.origin + window.location.pathname,
  currentUser: localStorage.getItem('covoid_username') || '',
  currentMatchData: null,
  adminMatches: []
};

/**
 * Construit une URL propre de partage (vers GitHub Pages) sans dépendance à Google.
 * @param {Object} extraParams - Paramètres d'URL (ex: { m: 'matchId' }).
 * @returns {string} URL complète.
 */
function buildAppUrl(extraParams = {}) {
  const base = AppState.webAppUrl || (window.location.origin + window.location.pathname);
  const params = new URLSearchParams();
  Object.keys(extraParams).forEach(key => {
    const val = extraParams[key];
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, val);
    }
  });

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

