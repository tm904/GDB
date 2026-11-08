(() => {
  'use strict';

  // Exact University Database Schema & Data (Kemper / Eickler)
  const SEED_SQL = `
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS pruefen;
DROP TABLE IF EXISTS assistenten;
DROP TABLE IF EXISTS hoeren;
DROP TABLE IF EXISTS voraussetzen;
DROP TABLE IF EXISTS vorlesungen;
DROP TABLE IF EXISTS studenten;
DROP TABLE IF EXISTS professoren;

PRAGMA foreign_keys = ON;

CREATE TABLE professoren (
  persnr INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  rang TEXT NOT NULL,
  raum INTEGER
);

CREATE TABLE studenten (
  matrnr INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  semester INTEGER
);

CREATE TABLE vorlesungen (
  vorlnr INTEGER PRIMARY KEY,
  titel TEXT NOT NULL,
  sws INTEGER,
  gelesenvon INTEGER REFERENCES professoren(persnr)
);

CREATE TABLE voraussetzen (
  vorgaenger INTEGER REFERENCES vorlesungen(vorlnr),
  nachfolger INTEGER REFERENCES vorlesungen(vorlnr),
  PRIMARY KEY (vorgaenger, nachfolger)
);

CREATE TABLE hoeren (
  matrnr INTEGER REFERENCES studenten(matrnr),
  vorlnr INTEGER REFERENCES vorlesungen(vorlnr),
  PRIMARY KEY (matrnr, vorlnr)
);

CREATE TABLE assistenten (
  persnr INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  fachgebiet TEXT,
  boss INTEGER REFERENCES professoren(persnr)
);

CREATE TABLE pruefen (
  matrnr INTEGER REFERENCES studenten(matrnr),
  vorlnr INTEGER REFERENCES vorlesungen(vorlnr),
  persnr INTEGER REFERENCES professoren(persnr),
  note INTEGER,
  PRIMARY KEY (matrnr, vorlnr)
);

INSERT INTO professoren (persnr, name, rang, raum) VALUES
  (2125, 'Sokrates', 'C4', 226),
  (2126, 'Russel', 'C4', 232),
  (2127, 'Kopernikus', 'C3', 310),
  (2133, 'Popper', 'C3', 52),
  (2134, 'Augustinus', 'C3', 309),
  (2136, 'Curie', 'C4', 36),
  (2137, 'Kant', 'C4', 7);

INSERT INTO studenten (matrnr, name, semester) VALUES
  (24002, 'Xenokrates', 18),
  (25403, 'Jonas', 12),
  (26120, 'Fichte', 10),
  (26830, 'Aristoxenos', 8),
  (27550, 'Schopenhauer', 6),
  (28106, 'Carnap', 3),
  (29120, 'Theophrastos', 2),
  (29555, 'Feuerbach', 2);

INSERT INTO vorlesungen (vorlnr, titel, sws, gelesenvon) VALUES
  (5001, 'Grundzüge', 4, 2137),
  (5041, 'Ethik', 4, 2125),
  (5043, 'Erkenntnistheorie', 3, 2126),
  (5049, 'Mäeutik', 2, 2125),
  (4052, 'Logik', 4, 2125),
  (5052, 'Wissenschaftstheorie', 3, 2126),
  (5216, 'Bioethik', 2, 2126),
  (5259, 'Der Wiener Kreis', 2, 2133),
  (5022, 'Glaube und Wissen', 2, 2134),
  (4630, 'Die 3 Kritiken', 4, 2137);

INSERT INTO voraussetzen (vorgaenger, nachfolger) VALUES
  (5001, 5041),
  (5001, 5043),
  (5001, 5049),
  (5041, 5216),
  (5043, 5052),
  (5041, 5052),
  (5052, 5259);

INSERT INTO hoeren (matrnr, vorlnr) VALUES
  (26120, 5001),
  (27550, 5001),
  (27550, 4052),
  (28106, 5041),
  (28106, 5052),
  (28106, 5216),
  (28106, 5259),
  (29120, 5001),
  (29120, 5041),
  (29120, 5049),
  (29555, 5022),
  (25403, 5022),
  (29555, 5001);

INSERT INTO assistenten (persnr, name, fachgebiet, boss) VALUES
  (3002, 'Platon', 'Ideenlehre', 2125),
  (3003, 'Aristoteles', 'Syllogistik', 2125),
  (3004, 'Wittgenstein', 'Sprachtheorie', 2126),
  (3005, 'Rhetikus', 'Planetenbewegung', 2127),
  (3006, 'Newton', 'Keplersche Gesetze', 2127),
  (3007, 'Spinoza', 'Gott und Natur', 2134);

INSERT INTO pruefen (matrnr, vorlnr, persnr, note) VALUES
  (28106, 5001, 2126, 1),
  (25403, 5041, 2125, 2),
  (27550, 4630, 2137, 2);
`;

  const TABLE_META = [
    {
      name: 'professoren',
      pks: ['persnr'],
      fks: {}
    },
    {
      name: 'studenten',
      pks: ['matrnr'],
      fks: {}
    },
    {
      name: 'vorlesungen',
      pks: ['vorlnr'],
      fks: { gelesenvon: 'professoren.persnr' }
    },
    {
      name: 'voraussetzen',
      pks: ['vorgaenger', 'nachfolger'],
      fks: { vorgaenger: 'vorlesungen.vorlnr', nachfolger: 'vorlesungen.vorlnr' }
    },
    {
      name: 'hoeren',
      pks: ['matrnr', 'vorlnr'],
      fks: { matrnr: 'studenten.matrnr', vorlnr: 'vorlesungen.vorlnr' }
    },
    {
      name: 'assistenten',
      pks: ['persnr'],
      fks: { boss: 'professoren.persnr' }
    },
    {
      name: 'pruefen',
      pks: ['matrnr', 'vorlnr'],
      fks: {
        matrnr: 'studenten.matrnr',
        vorlnr: 'vorlesungen.vorlnr',
        persnr: 'professoren.persnr'
      }
    }
  ];

  const PRESETS = {
    all_prof: `SELECT persnr, name, rang, raum
FROM professoren
WHERE rang = 'C4'
ORDER BY name;`,

    vorl_prof: `SELECT v.vorlnr, v.titel, v.sws, p.name AS gelesenvon_name
FROM vorlesungen v
JOIN professoren p ON v.gelesenvon = p.persnr
ORDER BY v.vorlnr;`,

    student_hoeren: `SELECT s.name AS student, v.vorlnr, v.titel, v.sws
FROM studenten s
JOIN hoeren h ON s.matrnr = h.matrnr
JOIN vorlesungen v ON h.vorlnr = v.vorlnr
WHERE s.name = 'Carnap';`,

    sws_sum: `SELECT p.persnr, p.name, COALESCE(SUM(v.sws), 0) AS gesamt_sws
FROM professoren p
LEFT JOIN vorlesungen v ON p.persnr = v.gelesenvon
GROUP BY p.persnr, p.name
ORDER BY gesamt_sws DESC;`,

    voraussetzungen: `SELECT v1.titel AS vorgaenger_titel, v2.titel AS nachfolger_titel
FROM voraussetzen vs
JOIN vorlesungen v1 ON vs.vorgaenger = v1.vorlnr
JOIN vorlesungen v2 ON vs.nachfolger = v2.vorlnr;`,

    pruefungen_detail: `SELECT s.name AS student, v.titel AS vorlesung, p.name AS pruefer, pr.note
FROM pruefen pr
JOIN studenten s ON pr.matrnr = s.matrnr
JOIN vorlesungen v ON pr.vorlnr = v.vorlnr
JOIN professoren p ON pr.persnr = p.persnr;`,

    keine_vorl: `SELECT s.matrnr, s.name, s.semester
FROM studenten s
WHERE NOT EXISTS (
  SELECT 1 FROM hoeren h WHERE h.matrnr = s.matrnr
);`,

    assistenten_boss: `SELECT a.persnr, a.name AS assistent, a.fachgebiet, p.name AS boss_name
FROM assistenten a
JOIN professoren p ON a.boss = p.persnr
ORDER BY p.name, a.name;`
  };

  let SQL = null;
  let db = null;
  let lastResult = null;
  const queryHistory = [];

  // DOM References
  const statusEl = document.getElementById('db-status');
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnResetDb = document.getElementById('btn-reset-db');
  const btnTheme = document.getElementById('btn-theme');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const presetSelect = document.getElementById('preset-select');
  const sqlInput = document.getElementById('sql-input');
  const lineNumbers = document.getElementById('line-numbers');
  const resultContainer = document.getElementById('result-container');
  const resultMeta = document.getElementById('result-meta');
  const referenceGrid = document.getElementById('reference-grid');
  const schemaContainer = document.getElementById('schema-container');
  const tableSearch = document.getElementById('table-search');
  const historyList = document.getElementById('history-list');

  // Theme Initialization
  function initTheme() {
    const saved = localStorage.getItem('uni_sql_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  btnTheme.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('uni_sql_theme', next);
  });

  // Editor Line Numbers
  function updateLineNumbers() {
    const lines = sqlInput.value.split('\n').length;
    const nums = [];
    for (let i = 1; i <= lines; i++) {
      nums.push(i);
    }
    lineNumbers.textContent = nums.join('\n');
  }

  sqlInput.addEventListener('input', updateLineNumbers);
  sqlInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = sqlInput.scrollTop;
  });

  // Keyboard shortcuts in SQL editor
  sqlInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCurrentQuery();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
    }
  });

  function insertAtCursor(text) {
    const start = sqlInput.selectionStart;
    const end = sqlInput.selectionEnd;
    const val = sqlInput.value;
    sqlInput.value = val.substring(0, start) + text + val.substring(end);
    sqlInput.selectionStart = sqlInput.selectionEnd = start + text.length;
    sqlInput.focus();
    updateLineNumbers();
  }

  // Keyword chips
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      insertAtCursor(chip.getAttribute('data-insert'));
    });
  });

  // Presets
  presetSelect.addEventListener('change', () => {
    const key = presetSelect.value;
    if (key && PRESETS[key]) {
      sqlInput.value = PRESETS[key];
      updateLineNumbers();
      executeCurrentQuery();
    }
  });

  btnClear.addEventListener('click', () => {
    sqlInput.value = '';
    presetSelect.value = '';
    updateLineNumbers();
    sqlInput.focus();
  });

  btnRun.addEventListener('click', executeCurrentQuery);

  btnResetDb.addEventListener('click', () => {
    if (!SQL) return;
    resetDatabase();
    renderReferenceTables(tableSearch.value);
    resultMeta.textContent = 'Datenbank auf Ausgangszustand zurückgesetzt';
  });

  // Initialize SQL.js WASM locally
  async function initDatabaseEngine() {
    try {
      SQL = await window.initSqlJs({
        locateFile: (file) => file
      });
      resetDatabase();
      statusEl.textContent = '● Lokal bereit (WASM)';
      statusEl.className = 'status-pill ready';
      btnRun.disabled = false;
      renderReferenceTables();
      renderSchemaTab();
      executeCurrentQuery();
    } catch (err) {
      statusEl.textContent = 'Fehler beim Laden';
      statusEl.className = 'status-pill error';
      renderError('SQLite WebAssembly konnte nicht geladen werden: ' + err.message);
    }
  }

  function resetDatabase() {
    if (db) {
      db.close();
    }
    db = new SQL.Database();
    db.run(SEED_SQL);
  }

  // Build HTML table safely using DOM APIs (prevents XSS)
  function createDataTable(columns, values, metaConfig = null, searchFilter = '') {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    columns.forEach((colName) => {
      const th = document.createElement('th');
      const isPk = metaConfig && metaConfig.pks.includes(colName);
      const fkTarget = metaConfig && metaConfig.fks[colName];

      const span = document.createElement('span');
      span.textContent = colName;
      if (isPk) {
        span.className = 'pk-col';
        th.title = 'Primärschlüssel – Klicken zum Einfügen';
      } else {
        th.title = 'Klicken zum Einfügen';
      }
      th.appendChild(span);

      if (fkTarget) {
        const fkBadge = document.createElement('span');
        fkBadge.className = 'fk-badge';
        fkBadge.textContent = '→';
        fkBadge.title = 'Fremdschlüssel auf ' + fkTarget;
        th.appendChild(fkBadge);
      }

      th.addEventListener('click', () => {
        insertAtCursor(colName);
      });

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const normalizedFilter = searchFilter.trim().toLowerCase();

    values.forEach((row) => {
      const tr = document.createElement('tr');
      let rowMatches = false;

      row.forEach((cell) => {
        const td = document.createElement('td');
        if (cell === null || cell === undefined) {
          td.textContent = 'NULL';
          td.className = 'null-val';
        } else {
          const strVal = String(cell);
          td.textContent = strVal;
          if (typeof cell === 'number') {
            td.className = 'num';
          }
          if (normalizedFilter && strVal.toLowerCase().includes(normalizedFilter)) {
            rowMatches = true;
          }
        }
        tr.appendChild(td);
      });

      if (rowMatches) {
        tr.classList.add('row-match');
      }
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  // Execute SQL Query
  function executeCurrentQuery() {
    if (!db) return;
    const sql = sqlInput.value.trim();
    if (!sql) return;

    const t0 = performance.now();
    try {
      const results = db.exec(sql);
      const elapsedMs = (performance.now() - t0).toFixed(1);
      const rowsModified = db.getRowsModified();

      resultContainer.replaceChildren();

      if (results.length === 0) {
        lastResult = null;
        btnExportCsv.hidden = true;
        const info = document.createElement('div');
        info.className = 'info-box';
        info.textContent = `Abfrage erfolgreich ausgeführt (${elapsedMs} ms). Betroffene Zeilen: ${rowsModified}.`;
        resultContainer.appendChild(info);
        resultMeta.textContent = `OK (${elapsedMs} ms)`;
        addHistory(sql, `${rowsModified} geändert`, elapsedMs);
      } else {
        let totalRows = 0;
        results.forEach((res, idx) => {
          totalRows += res.values.length;
          if (results.length > 1) {
            const label = document.createElement('div');
            label.style.fontSize = '0.75rem';
            label.style.fontWeight = '600';
            label.style.margin = idx === 0 ? '0 0 0.35rem 0' : '0.85rem 0 0.35rem 0';
            label.textContent = `Ergebnis #${idx + 1} (${res.values.length} Zeilen)`;
            resultContainer.appendChild(label);
          }
          const tbl = createDataTable(res.columns, res.values);
          resultContainer.appendChild(tbl);
        });

        lastResult = results[results.length - 1];
        btnExportCsv.hidden = false;
        resultMeta.textContent = `${totalRows} ${totalRows === 1 ? 'Zeile' : 'Zeilen'} (${elapsedMs} ms)`;
        addHistory(sql, `${totalRows} Zeilen`, elapsedMs);
      }

      // Refresh reference tables in case user executed INSERT / UPDATE / DELETE / CREATE
      renderReferenceTables(tableSearch.value);
    } catch (err) {
      lastResult = null;
      btnExportCsv.hidden = true;
      resultMeta.textContent = 'SQL-Fehler';
      renderError(err.message);
    }
  }

  function renderError(msg) {
    resultContainer.replaceChildren();
    const errBox = document.createElement('div');
    errBox.className = 'error-box';
    errBox.textContent = '⚠ ' + msg;
    resultContainer.appendChild(errBox);
  }

  // Render all 7 reference tables (plus any user-created tables)
  function renderReferenceTables(filterText = '') {
    if (!db) return;
    referenceGrid.replaceChildren();

    const tablesRes = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    const existingNames = tablesRes.length ? tablesRes[0].values.map((r) => r[0]) : [];

    // Order according to classic sheet first, then any extra user tables
    const orderedNames = [
      ...TABLE_META.map((m) => m.name).filter((n) => existingNames.includes(n)),
      ...existingNames.filter((n) => !TABLE_META.some((m) => m.name === n))
    ];

    orderedNames.forEach((tableName) => {
      const meta = TABLE_META.find((m) => m.name === tableName) || {
        name: tableName,
        pks: [],
        fks: {}
      };

      const res = db.exec(`SELECT * FROM "${tableName.replace(/"/g, '""')}";`);
      let columns = [];
      let values = [];
      if (res.length > 0) {
        columns = res[0].columns;
        values = res[0].values;
      } else {
        const pragma = db.exec(`PRAGMA table_info("${tableName.replace(/"/g, '""')}");`);
        if (pragma.length > 0) {
          columns = pragma[0].values.map((r) => r[1]);
        }
      }

      const box = document.createElement('div');
      box.className = 'ref-table-box';

      const titleBar = document.createElement('div');
      titleBar.className = 'ref-table-title';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'ref-table-name';
      nameSpan.textContent = `${tableName} (${values.length})`;
      nameSpan.title = 'Klicken zum Einfügen des Tabellennamens';
      nameSpan.addEventListener('click', () => insertAtCursor(tableName));

      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'ref-query-btn';
      selectBtn.textContent = 'SELECT *';
      selectBtn.title = `SELECT * FROM ${tableName}; ausführen`;
      selectBtn.addEventListener('click', () => {
        sqlInput.value = `SELECT * FROM ${tableName};`;
        updateLineNumbers();
        executeCurrentQuery();
      });

      titleBar.appendChild(nameSpan);
      titleBar.appendChild(selectBtn);
      box.appendChild(titleBar);

      const scrollWrap = document.createElement('div');
      scrollWrap.className = 'ref-table-scroll';
      scrollWrap.appendChild(createDataTable(columns, values, meta, filterText));
      box.appendChild(scrollWrap);

      referenceGrid.appendChild(box);
    });
  }

  tableSearch.addEventListener('input', () => {
    renderReferenceTables(tableSearch.value);
  });

  // Render Schema & Relationships Overview
  function renderSchemaTab() {
    schemaContainer.replaceChildren();

    const relBox = document.createElement('div');
    relBox.className = 'schema-diagram';
    relBox.textContent = [
      'Fremdschlüssel-Beziehungen (Referenzielle Integrität aktiv):',
      '────────────────────────────────────────────────────────────',
      '• vorlesungen.gelesenvon   ──► professoren.persnr',
      '• assistenten.boss         ──► professoren.persnr',
      '• voraussetzen.vorgaenger  ──► vorlesungen.vorlnr',
      '• voraussetzen.nachfolger  ──► vorlesungen.vorlnr',
      '• hoeren.matrnr            ──► studenten.matrnr',
      '• hoeren.vorlnr            ──► vorlesungen.vorlnr',
      '• pruefen.matrnr           ──► studenten.matrnr',
      '• pruefen.vorlnr           ──► vorlesungen.vorlnr',
      '• pruefen.persnr           ──► professoren.persnr'
    ].join('\n');
    schemaContainer.appendChild(relBox);

    const listGrid = document.createElement('div');
    listGrid.className = 'schema-list';

    TABLE_META.forEach((meta) => {
      const pragma = db.exec(`PRAGMA table_info("${meta.name}");`);
      const card = document.createElement('div');
      card.className = 'schema-card';

      const h3 = document.createElement('h3');
      h3.textContent = meta.name;
      card.appendChild(h3);

      const ul = document.createElement('ul');
      ul.className = 'schema-cols';

      if (pragma.length > 0) {
        pragma[0].values.forEach((colRow) => {
          const colName = colRow[1];
          const colType = colRow[2];
          const isPk = meta.pks.includes(colName);
          const fk = meta.fks[colName];

          const li = document.createElement('li');
          const left = document.createElement('span');
          left.textContent = colName;
          if (isPk) left.className = 'pk-col';

          const right = document.createElement('span');
          right.style.color = 'var(--text-muted)';
          let suffix = colType;
          if (isPk) suffix += ' [PK]';
          if (fk) suffix += ` [FK → ${fk}]`;
          right.textContent = suffix;

          li.appendChild(left);
          li.appendChild(right);
          ul.appendChild(li);
        });
      }

      card.appendChild(ul);
      listGrid.appendChild(card);
    });

    schemaContainer.appendChild(listGrid);
  }

  // Tabs switching
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const target = btn.getAttribute('data-tab');
      document.getElementById('tab-tables').hidden = target !== 'tables';
      document.getElementById('tab-schema').hidden = target !== 'schema';
    });
  });

  // Query History
  function addHistory(sql, summary, ms) {
    const compact = sql.replace(/\s+/g, ' ').trim();
    if (queryHistory.length > 0 && queryHistory[0].sql === sql) {
      queryHistory[0].summary = summary;
      queryHistory[0].ms = ms;
    } else {
      queryHistory.unshift({ sql, compact, summary, ms });
      if (queryHistory.length > 15) queryHistory.pop();
    }
    renderHistory();
  }

  function renderHistory() {
    historyList.replaceChildren();
    if (queryHistory.length === 0) {
      const li = document.createElement('li');
      li.className = 'history-empty';
      li.textContent = 'Noch keine Abfragen ausgeführt.';
      historyList.appendChild(li);
      return;
    }

    queryHistory.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.title = 'Klicken, um diese Abfrage in den Editor zu laden';

      const codeSpan = document.createElement('span');
      codeSpan.className = 'history-sql';
      codeSpan.textContent = item.compact;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'history-meta';
      metaSpan.textContent = `${item.summary} · ${item.ms} ms`;

      li.appendChild(codeSpan);
      li.appendChild(metaSpan);

      li.addEventListener('click', () => {
        sqlInput.value = item.sql;
        updateLineNumbers();
        sqlInput.focus();
      });

      historyList.appendChild(li);
    });
  }

  btnClearHistory.addEventListener('click', () => {
    queryHistory.length = 0;
    renderHistory();
  });

  // CSV Export
  btnExportCsv.addEventListener('click', () => {
    if (!lastResult) return;
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const lines = [
      lastResult.columns.map(escapeCsv).join(','),
      ...lastResult.values.map((row) => row.map(escapeCsv).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abfrage_ergebnis.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Start
  initTheme();
  updateLineNumbers();
  initDatabaseEngine();
})();

