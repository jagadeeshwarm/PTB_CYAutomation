// Selectors for the Checklist module and the Project Info Sheet (PIS) inside it.
// The PIS is rendered as a series of `cmacs-section` widgets, each containing
// a `cmacs-compact-table` with editable rows (Title, Value columns).

export const CHECKLIST = {
  // Navigation
  // Sidebar/menu item that opens the Checklist module. The app routes to
  // /app/.../checklist when this is clicked.
  sidebarItem: "app-nav-layout a[href*='checklist'], app-nav-layout [routerlink*='checklist']",

  // Checklist landing root
  root: "app-checklist-root",
  bar: "app-checklist-bar",

  // List of checklists (Project Info Sheet is one entry; opened by double-click).
  // The first row in the table is the PIS by default after import.
  listTable: "app-checklist-root nz-table table",
  listFirstRow: "app-checklist-root nz-table tbody tr.ant-table-row",

  // Reupload button — second button in the checklist top bar
  reuploadButton: "app-checklist-bar .button-bar button:nth-child(2)",
  // Hidden file input that the reupload button triggers
  reuploadFileInput: "app-checklist-bar input[type='file']",

  // === Project Info Sheet (PIS) — rendered after double-clicking the row ===
  // Top-level company / project address blocks (rendered as open-text widgets)
  companyAddressText:
    "app-form-company-address app-form-open-text h3 span, app-form-company-address app-form-open-text h3",
  projectAddressText:
    "app-form-project-address app-form-open-text h3 span, app-form-project-address app-form-open-text h3",

  // Every section header (A | PROJECT OVERVIEW, B | PROJECT SCOPE, etc.)
  // Their text lives in the section's title span.
  sectionTitleSpan: "cmacs-section .widget-container-bar-title span",
  // Each section that has a table inside (collapsed sections won't have one)
  sectionContainer: "cmacs-section .widget-container",

  // Compact table inside a section
  compactTable: "cmacs-compact-table",
  tableHead: "thead.ant-table-thead",
  tableHeadCells: "thead.ant-table-thead th",
  tableHeadCellText: ".cmacs-compact-table-overflow-cell-header",
  tableBody: "tbody.ant-table-tbody",
  tableRows:
    "tbody.ant-table-tbody tr.cmacs-compact-table-smart-table-smart-table-row, tbody.ant-table-tbody tr.cmacs-compact-table-smart-table-row",
  tableCells:
    "td.cmacs-editable-column .cmacs-compact-table-inline-cell, td.cmacs-editable-column .cmacs-compact-table-overflow-cell",

  // Editable inline cell inside a row (Title / Value content)
  inlineCell: ".cmacs-compact-table-inline-cell",
  cellEditIcon: ".iconUISmall-Edit.cmacs-compact-table-edit-icon",

  // Add-row icon (sticky left column of each row). Clicking it adds a new row
  // BELOW the row whose icon was clicked.
  addRowIcon: ".cmacs-compact-table-smart-table-hot-spot-row-add-icon",
  // Delete-row icon (sticky right column of each row).
  deleteRowIcon: ".cmacs-compact-table-smart-table-hot-spot-row-delete-icon",

  // Placeholder text that indicates a cell is empty / ready for input
  emptyCellPlaceholder: ".cmacs-compact-table-field-valid-placeholder",

  // Project deletion (Projects page → click card → delete)
  projectsPageUrlPart: "/app/projects",
};
