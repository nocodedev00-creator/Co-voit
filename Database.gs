/**
 * Couche d'accès aux données (ORM léger sur Google Sheets avec auto-migration).
 */

const DB_SCHEMA = {
  CONFIG: {
    sheetName: 'CONFIG',
    headers: ['key', 'value']
  },
  MATCHES: {
    sheetName: 'MATCHES',
    headers: ['id', 'title', 'event_date', 'departure_time', 'meeting_place', 'is_locked', 'created_at']
  },
  RIDES: {
    sheetName: 'RIDES',
    headers: ['id', 'match_id', 'driver_name', 'is_direct', 'offers_outward', 'offers_return', 'seats_outward', 'seats_return', 'seats_total', 'outward_passengers', 'return_passengers', 'updated_at']
  },
  WAITING_LIST: {
    sheetName: 'WAITING_LIST',
    headers: ['id', 'match_id', 'player_name', 'needs_outward', 'needs_return', 'created_at']
  }
};

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Vérifie et ajoute les colonnes manquantes dans une feuille existante (Auto-migration).
 */
function syncSheetHeaders(sheetName, expectedHeaders) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() === 0) return;

  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  expectedHeaders.forEach(h => {
    if (!currentHeaders.includes(h)) {
      const newColIndex = sheet.getLastColumn() + 1;
      sheet.getRange(1, newColIndex).setValue(h).setFontWeight('bold');
      currentHeaders.push(h);
    }
  });
}

function initDatabase() {
  const ss = getSpreadsheet();

  Object.keys(DB_SCHEMA).forEach(tableKey => {
    const tableDef = DB_SCHEMA[tableKey];
    let sheet = ss.getSheetByName(tableDef.sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(tableDef.sheetName);
      sheet.appendRow(tableDef.headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, tableDef.headers.length).setFontWeight('bold');
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(tableDef.headers);
        sheet.setFrozenRows(1);
      } else {
        syncSheetHeaders(tableDef.sheetName, tableDef.headers);
      }
    }
  });

  const adminToken = getConfigValue('ADMIN_TOKEN');
  if (!adminToken) {
    const generatedToken = (Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)).toUpperCase();
    setConfigValue('ADMIN_TOKEN', generatedToken);
  }
}

function getConfigValue(key) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(DB_SCHEMA.CONFIG.sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(key)) {
      return String(data[i][1]);
    }
  }
  return null;
}

function setConfigValue(key, value) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(DB_SCHEMA.CONFIG.sheetName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(DB_SCHEMA.CONFIG.sheetName);
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(key)) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function getTableRecords(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  syncSheetHeaders(sheetName, DB_SCHEMA[sheetName].headers);

  const values = sheet.getDataRange().getValues();
  const displayValues = sheet.getDataRange().getDisplayValues();
  const headers = values[0];
  const records = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const displayRow = displayValues[r];
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      const header = headers[c];

      if (header === 'departure_time') {
        const disp = displayRow ? String(displayRow[c] || '').trim() : '';
        const matchDisp = disp.match(/(\d{1,2})[:hH](\d{2})/);
        const matchVal = (typeof val === 'string') ? val.match(/(\d{1,2})[:hH](\d{2})/) : null;

        if (matchDisp) {
          val = `${matchDisp[1].padStart(2, '0')}:${matchDisp[2]}`;
        } else if (matchVal) {
          val = `${matchVal[1].padStart(2, '0')}:${matchVal[2]}`;
        } else if (val instanceof Date) {
          const hh = String(val.getHours()).padStart(2, '0');
          const mm = String(val.getMinutes()).padStart(2, '0');
          val = `${hh}:${mm}`;
        } else {
          val = disp || String(val || '');
        }
      } else if (val instanceof Date) {
        if (header === 'created_at' || header === 'updated_at') {
          val = val.toISOString();
        } else {
          val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'Europe/Paris', 'yyyy-MM-dd');
        }
      }

      if (val === 'TRUE' || val === true) val = true;
      else if (val === 'FALSE' || val === false) val = false;

      if (header === 'outward_passengers' || header === 'return_passengers') {
        if (typeof val === 'string' && val.trim().startsWith('[')) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            val = [];
          }
        } else if (!Array.isArray(val)) {
          val = [];
        }
      }

      record[header] = val;
    }

    if (sheetName === DB_SCHEMA.RIDES.sheetName) {
      if (record.seats_outward === undefined || record.seats_outward === '') {
        record.seats_outward = record.seats_total || 0;
      }
      if (record.seats_return === undefined || record.seats_return === '') {
        record.seats_return = record.seats_total || 0;
      }
    }

    records.push(record);
  }
  return records;
}

function insertRecord(sheetName, recordObj) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(sheetName);
  }

  syncSheetHeaders(sheetName, DB_SCHEMA[sheetName].headers);

  const lastCol = sheet.getLastColumn();
  const headers = lastCol > 0 
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] 
    : DB_SCHEMA[sheetName].headers;

  const rowData = headers.map(header => {
    let val = recordObj[header];
    if (val === undefined || val === null) val = '';
    if (Array.isArray(val)) val = JSON.stringify(val);
    if (header === 'departure_time' && typeof val === 'string' && val.trim() !== '') {
      const timeMatch = val.match(/(\d{1,2})[:hH](\d{2})/);
      val = timeMatch ? `'${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : (val.startsWith("'") ? val : "'" + val);
    }
    return val;
  });

  sheet.appendRow(rowData);
  return recordObj;
}

function updateRecord(sheetName, id, updatesObj) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return false;

  syncSheetHeaders(sheetName, DB_SCHEMA[sheetName].headers);

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idColIndex = headers.indexOf('id');

  if (idColIndex === -1) return false;

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idColIndex]) === String(id)) {
      const rowIndex = r + 1;
      Object.keys(updatesObj).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          let val = updatesObj[key];
          if (Array.isArray(val)) val = JSON.stringify(val);
          if (key === 'departure_time' && typeof val === 'string' && val.trim() !== '') {
            const timeMatch = val.match(/(\d{1,2})[:hH](\d{2})/);
            val = timeMatch ? `'${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : (val.startsWith("'") ? val : "'" + val);
          }
          sheet.getRange(rowIndex, colIndex + 1).setValue(val);
        }
      });
      return true;
    }
  }
  return false;
}

function deleteRecord(sheetName, id) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return false;

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idColIndex = headers.indexOf('id');

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idColIndex]) === String(id)) {
      sheet.deleteRow(r + 1);
      return true;
    }
  }
  return false;
}

function deleteRecordsWhere(sheetName, columnKey, matchValue) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return;

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const colIndex = headers.indexOf(columnKey);
  if (colIndex === -1) return;

  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][colIndex]) === String(matchValue)) {
      sheet.deleteRow(r + 1);
    }
  }
}