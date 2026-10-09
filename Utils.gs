/**
 * Module utilitaire : Verrouillage concurrentiel, formateurs et template WhatsApp.
 */

function withScriptLock(callback, timeoutMs = 10000) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(timeoutMs);

  if (!hasLock) {
    throw new Error('Le serveur est actuellement sollicité. Veuillez réessayer dans quelques instants.');
  }

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function generateId(prefix = 'id') {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}${randomPart}`;
}

function formatDateFrench(isoDate) {
  if (!isoDate) return '';
  const parts = String(isoDate).split('T')[0].split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatShortTime(timeStr) {
  if (!timeStr && timeStr !== 0) return '--:--';
  if (timeStr instanceof Date && !isNaN(timeStr.getTime())) {
    const hh = String(timeStr.getHours()).padStart(2, '0');
    const mm = String(timeStr.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  const str = String(timeStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return '--:--';
  const match = str.match(/(\d{1,2})[:hH](\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  if (str.includes('T')) {
    const timePart = str.split('T')[1];
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }
  return str;
}

function formatWhatsAppSummary(match, rides, waitingList, publicUrl) {
  const dateFormatted = formatDateFrench(match.event_date);
  const timeFormatted = formatShortTime(match.departure_time);
  
  let text = `🚗 *COVOITURAGE : ${match.title.toUpperCase()}*\n`;
  text += `📅 ${dateFormatted} | ⏰ RDV : ${timeFormatted}\n`;
  text += `📍 ${match.meeting_place}\n\n`;

  // --- SECTION ALLER ---
  text += `➡️ *ALLER :*\n`;
  const outwardRides = rides.filter(r => r.offers_outward);
  if (outwardRides.length === 0) {
    text += `_Aucun véhicule déclaré pour l'aller_\n`;
  } else {
    outwardRides.forEach(r => {
      const passengers = Array.isArray(r.outward_passengers) ? r.outward_passengers : [];
      const passCount = passengers.length;
      const passList = passCount > 0 ? passengers.join(', ') : 'Aucun passager';
      const directBadge = r.is_direct ? ' (Direct 📍)' : '';
      const seats = r.seats_outward !== undefined ? r.seats_outward : (r.seats_total || 0);
      text += `• *${r.driver_name}*${directBadge} (${passCount}/${seats} pl.) : ${passList}\n`;
    });
  }

  const outwardWaiting = waitingList.filter(w => w.needs_outward).map(w => {
    const extra = Number(w.extra_passengers) || 0;
    return extra > 0 ? `${w.player_name} (+${extra})` : w.player_name;
  });
  if (outwardWaiting.length > 0) {
    text += `⚠️ *En attente de place Aller :* ${outwardWaiting.join(', ')}\n`;
  }

  text += `\n`;

  // --- SECTION RETOUR ---
  text += `⬅️ *RETOUR :*\n`;
  const returnRides = rides.filter(r => r.offers_return);
  if (returnRides.length === 0) {
    text += `_Aucun véhicule déclaré pour le retour_\n`;
  } else {
    returnRides.forEach(r => {
      const passengers = Array.isArray(r.return_passengers) ? r.return_passengers : [];
      const passCount = passengers.length;
      const passList = passCount > 0 ? passengers.join(', ') : 'Aucun passager';
      const directBadge = r.is_direct ? ' (Direct 📍)' : '';
      const seats = r.seats_return !== undefined ? r.seats_return : (r.seats_total || 0);
      text += `• *${r.driver_name}*${directBadge} (${passCount}/${seats} pl.) : ${passList}\n`;
    });
  }

  const returnWaiting = waitingList.filter(w => w.needs_return).map(w => {
    const extra = Number(w.extra_passengers) || 0;
    return extra > 0 ? `${w.player_name} (+${extra})` : w.player_name;
  });
  if (returnWaiting.length > 0) {
    text += `⚠️ *En attente de place Retour :* ${returnWaiting.join(', ')}\n`;
  }

  text += `\n🔗 *Inscription :* ${publicUrl}`;
  return text;
}

function responseSuccess(data = null) {
  return { success: true, data: data, error: null };
}

function responseError(message = 'Une erreur inattendue est survenue.') {
  return { success: false, data: null, error: String(message) };
}