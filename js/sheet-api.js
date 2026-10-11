/**
 * 2026 PNU Job Training - Google Sheets Live Data Integration API
 * Uses PapaParse to parse CSV from Google Sheets gviz API
 */
(function () {
  'use strict';

  // Google Sheets gviz CSV URL
  const GVIZ_CSV_URL = 'https://docs.google.com/spreadsheets/d/1F5nDh8rVL5PCrYB9JgMBB68OJjXiAtVdJpvqvkGnmUw/gviz/tq?tqx=out:csv&sheet=data';
  const LOCAL_BACKUP_CSV_URL = 'data_backup.csv';

  // Global in-memory cache
  window.PNU_TRAINING_DATA = null;

  /**
   * Fetch and parse training courses from Google Sheets (or fallback CSV)
   * @returns {Promise<Array<Object>>}
   */
  async function fetchTrainingData() {
    if (window.PNU_TRAINING_DATA) {
      return window.PNU_TRAINING_DATA;
    }

    // Append timestamp to prevent browser cache
    const liveUrl = `${GVIZ_CSV_URL}&_t=${Date.now()}`;

    try {
      console.log('[SheetAPI] Fetching live data from Google Sheets...');
      const response = await fetch(liveUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Google Sheets HTTP Error: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();

      // Check if Google returned an HTML login redirect
      if (csvText.trim().startsWith('<!DOCTYPE') || csvText.includes('<html')) {
        throw new Error('Google Sheets returned login page (restricted access)');
      }

      const parsed = parseCsv(csvText);
      if (parsed && parsed.length > 0) {
        console.log(`[SheetAPI] Successfully loaded ${parsed.length} courses from Google Sheets.`);
        window.PNU_TRAINING_DATA = parsed;
        return parsed;
      }
      throw new Error('Empty dataset from Google Sheets');
    } catch (err) {
      console.warn('[SheetAPI] Live sheet fetch failed or restricted. Loading local backup dataset...', err.message);
      return loadLocalBackup();
    }
  }

  /**
   * Load local backup CSV in case Google Sheet is offline or restricted
   */
  async function loadLocalBackup() {
    try {
      const response = await fetch(LOCAL_BACKUP_CSV_URL + '?_t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load backup CSV: ${response.status}`);
      }
      const csvText = await response.text();
      const parsed = parseCsv(csvText);
      console.log(`[SheetAPI] Successfully loaded ${parsed.length} courses from backup dataset.`);
      window.PNU_TRAINING_DATA = parsed;
      return parsed;
    } catch (fallbackErr) {
      console.error('[SheetAPI] Failed to load backup dataset:', fallbackErr);
      return [];
    }
  }

  /**
   * Parse CSV string with PapaParse
   * @param {string} csvText
   * @returns {Array<Object>}
   */
  function parseCsv(csvText) {
    if (typeof Papa === 'undefined') {
      console.error('[SheetAPI] PapaParse is not loaded!');
      return [];
    }

    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: function (h) {
        return h.trim().replace(/^[\uFEFF]/, ''); // Remove UTF-8 BOM
      }
    });

    if (results.errors && results.errors.length > 0) {
      console.warn('[SheetAPI] CSV parsing notices:', results.errors);
    }

    // Clean up empty fields and trim values
    return results.data
      .filter(row => row['과정코드'] && row['과정명'])
      .map(row => {
        const cleaned = {};
        for (const [k, v] of Object.entries(row)) {
          cleaned[k] = typeof v === 'string' ? v.trim() : v;
        }
        return cleaned;
      });
  }

  /**
   * Get single course by '과정코드'
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  async function getCourseByCode(code) {
    if (!code) return null;
    const data = await fetchTrainingData();
    const cleanCode = code.trim().toUpperCase();
    return data.find(c => c['과정코드'] && c['과정코드'].trim().toUpperCase() === cleanCode) || null;
  }

  // Export to window
  window.fetchTrainingData = fetchTrainingData;
  window.getCourseByCode = getCourseByCode;
})();
