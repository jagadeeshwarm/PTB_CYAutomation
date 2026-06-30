// Node-side xlsx helpers used by cy.task() — runs in the Cypress plugin process,
// NOT in the browser. Cypress test code calls these via cy.task("xlsxRead", ...).
//
// Backups: xlsxEditCell creates a `.bak` sibling once per file, so xlsxRestore
// can revert after the test (TC06 reupload flow).

const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// Read every sheet in the workbook and return a normalized structure:
// { sheets: [{ name, rows: [ [cell,cell,...], ... ] }] }
// rows are arrays of trimmed strings (empty cells become "").
async function xlsxRead({ path: filePath }) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`xlsxRead: file not found at ${absPath}`);
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(absPath);
  const sheets = [];
  workbook.eachSheet((worksheet) => {
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const cells = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value;
        let s;
        if (v == null) s = "";
        else if (typeof v === "object" && v.richText)
          s = v.richText.map((r) => r.text).join("");
        else if (typeof v === "object" && v.text) s = String(v.text);
        else if (typeof v === "object" && v.result != null) s = String(v.result);
        else s = String(v);
        cells.push(s.trim());
      });
      rows.push(cells);
    });
    sheets.push({ name: worksheet.name, rows });
  });
  return { sheets };
}

// Edit a single cell. Creates a one-shot .bak before the first edit so a later
// xlsxRestore() can revert. Returns the previous value.
async function xlsxEditCell({ path: filePath, sheet, row, col, newValue }) {
  const absPath = path.resolve(filePath);
  const backupPath = absPath + ".bak";
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(absPath, backupPath);
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(absPath);
  const ws = sheet ? workbook.getWorksheet(sheet) : workbook.worksheets[0];
  if (!ws) throw new Error(`xlsxEditCell: sheet '${sheet}' not found`);
  const targetCell = ws.getCell(row, col);
  const oldValue = targetCell.value;
  targetCell.value = newValue;
  await workbook.xlsx.writeFile(absPath);
  return { oldValue: oldValue == null ? "" : String(oldValue) };
}

// Return the absolute path of the most recently modified file in `dir` whose
// name ends with `ext` (e.g. ".xlsx"). Returns null if none. Used to locate a
// just-downloaded export without knowing its exact filename.
async function findLatestFile({ dir, ext }) {
  if (!fs.existsSync(dir)) return null;
  const matches = fs
    .readdirSync(dir)
    .filter((f) => (ext ? f.toLowerCase().endsWith(ext.toLowerCase()) : true))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return matches.length ? matches[0].full : null;
}

// Return the mtime (ms) of the most recently modified file in `dir` matching
// `ext`, or null if none. Used to detect a fresh download even when the export
// overwrites a fixed filename (e.g. "ToDos.xlsx") — the path stays the same but
// the mtime advances.
async function latestFileMtime({ dir, ext }) {
  const latest = await findLatestFile({ dir, ext });
  if (!latest) return null;
  return fs.statSync(latest).mtimeMs;
}

// Restore the file from .bak (created by xlsxEditCell). No-op if no backup.
async function xlsxRestore({ path: filePath }) {
  const absPath = path.resolve(filePath);
  const backupPath = absPath + ".bak";
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, absPath);
    fs.unlinkSync(backupPath);
    return { restored: true };
  }
  return { restored: false };
}

module.exports = {
  xlsxRead,
  xlsxEditCell,
  xlsxRestore,
  findLatestFile,
  latestFileMtime,
};
