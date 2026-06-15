// Parse the Project Info Sheet XLSX into per-section data that lines up with
// what the PIS UI renders. Used by TC03 to cross-validate that every value
// in the source XLSX shows up in the rendered checklist.
//
// XLSX structure (single sheet "Project Info Sheet"):
//   R1-R2  → page title + instructions (ignored)
//   "A | PROJECT OVERVIEW"     → section header row
//     R4-R8 → 2-pair key/value rows ([_, title1, value1, title2, value2, ...merged dups])
//   "B | PROJECT SCOPE"        → section header row
//     first row after header   → column headers
//     subsequent rows          → data rows with a leading index column ("1", "2", ...)
//   "C | KYC", "D | COMMERCIAL TERMS", ... → same tabular shape as B
//
// We expose three things:
//   parseXlsxSections(xlsxData) → [{ letter, title, rows }]
//   flattenSectionAPairs(rows)  → [[title, value], ...]  (handles 2-pair layout)
//   stripIndexCol(rows)         → rows with the leading index column removed

// Match a header cell like "  A  |  PROJECT OVERVIEW" — letter, pipe, title.
const SECTION_HEADER = /^\s*([A-Z])\s*\|\s*(.+?)\s*$/;

export function parseXlsxSections(xlsxData) {
  if (!xlsxData || !xlsxData.sheets || xlsxData.sheets.length === 0) return [];
  const sheet = xlsxData.sheets[0];
  const sections = [];
  let current = null;
  for (const row of sheet.rows) {
    // Section header rows have the "X | TITLE" pattern repeated across merged
    // columns. Detect by matching any cell.
    const headerCell = row.find((c) => SECTION_HEADER.test((c || "").trim()));
    if (headerCell) {
      const m = headerCell.match(SECTION_HEADER);
      current = { letter: m[1], title: m[2].trim(), rows: [] };
      sections.push(current);
      continue;
    }
    if (current) current.rows.push(row);
  }
  return sections;
}

// Section A renders each row as TWO independent (title, value) pairs side by
// side: [_, "Project Name *", "Central IKON", "Project Code *", "2524471", ...].
// Merged cells in the source duplicate the value into trailing columns, so we
// skip past any cell equal to the value we just consumed.
export function flattenSectionAPairs(rows) {
  const pairs = [];
  for (const row of rows) {
    let i = 0;
    while (i < row.length) {
      const title = (row[i] || "").trim();
      if (!title) {
        i++;
        continue;
      }
      const value = i + 1 < row.length ? (row[i + 1] || "").trim() : "";
      pairs.push([title, value]);
      i += 2;
      // Skip merged-cell duplicates of the value.
      while (i < row.length && (row[i] || "").trim() === value) i++;
    }
  }
  return pairs;
}

// Sections B/C/D have a leading index column ("", "1", "2", ...) that the PIS
// UI doesn't render. Strip it so column 0 lines up with the first PIS column.
export function stripIndexCol(rows) {
  return rows.map((r) => {
    if (r.length === 0) return r;
    const first = (r[0] || "").trim();
    if (first === "" || /^\d+$/.test(first)) return r.slice(1);
    return r;
  });
}

// De-duplicate trailing merged-cell artifacts in a single row. Cells produced
// by `exceljs` for a merged range repeat the same value across every covered
// column — collapse consecutive duplicates so we compare against actual data.
export function dedupTrailingDuplicates(row) {
  const out = [];
  for (let i = 0; i < row.length; i++) {
    const cur = (row[i] || "").trim();
    const prev = out.length > 0 ? (out[out.length - 1] || "").trim() : null;
    if (out.length > 0 && cur !== "" && cur === prev) continue;
    out.push(row[i]);
  }
  return out;
}
