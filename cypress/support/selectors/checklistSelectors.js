// Selectors for the Checklist module and the Project Info Sheet (PIS) inside it.
// The PIS is rendered as a series of `cmacs-section` widgets, each containing
// a `cmacs-compact-table` with editable rows (Title, Value columns).

export const CHECKLIST = {
  // Navigation
  // Sidebar/menu item that opens the Checklist module. The app routes to
  // /app/.../checklist when this is clicked.
  sidebarItem: "app-nav-layout a[href*='checklist'], app-nav-layout [routerlink*='checklist']",

  // Top bar main menu container — holds the module links (Home / Schedules /
  // Checklist / ...). When the viewport is narrow, less-used links collapse
  // into a 3-dots overflow menu.
  topBarMainMenu:
    "app-nav-layout > div > div:nth-child(1) > div > div.main-nav-main-menu",
  // 3-dots overflow toggle (last clickable child of the main menu). Clicking
  // it opens a CDK overlay containing the hidden menu items.
  topBarOverflowToggle:
    "div.main-nav-main-menu > div:has(i[class*='Dots']), div.main-nav-main-menu .iconUILarge-Dots, div.main-nav-main-menu .iconUISmall-Dots",
  // List items inside the visible overflow overlay.
  topBarOverflowList: ".cdk-overlay-container ul:visible li",

  // Secondary top bar (the row directly under the main nav). On some viewport
  // widths / role combinations, the Checklist link appears here instead of in
  // the main bar — sometimes directly, sometimes inside its own 3-dots menu.
  secondaryMenu: ".secondary-menu-area",
  // 3-dots overflow toggle inside the secondary top bar.
  secondaryMenuOverflowToggle:
    ".secondary-menu-area i[class*='Dots'], .secondary-menu-area [class*='dots']:not(i)",

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
  // Top-level company / project address blocks. Each widget wraps its address
  // text in an h3 (with an inner span carrying the styled color). We anchor on
  // the Angular component tag so the selector survives any project-specific
  // dynamic ids upstream in the tree.
  companyAddressText: "app-form-company-address h3",
  projectAddressText: "app-form-project-address h3",

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

  // First two editable columns of a row (Title=cell-1, Value=cell-2). The
  // pencil-icon edit affordance is `i` inside `> div > div`. We use these
  // when adding/editing rows because the edit icon only renders on hover.
  titleCell: "td.cmacs-editable-column.cmacs-compact-table-cell-1",
  valueCell: "td.cmacs-editable-column.cmacs-compact-table-cell-2",
  titleCellEditIcon: "td.cmacs-editable-column.cmacs-compact-table-cell-1 i",
  valueCellEditIcon: "td.cmacs-editable-column.cmacs-compact-table-cell-2 i",

  // Add-row icon (sticky left column of each row). Clicking it adds a new row
  // BELOW the row whose icon was clicked. The icon is the `<i>` child of the
  // hot-spot td — we also accept the legacy "-icon" class form and the td
  // itself so this stays robust across DOM revisions.
  addRowIcon:
    "td.cmacs-compact-table-smart-table-hot-spot-row-add > i, .cmacs-compact-table-smart-table-hot-spot-row-add-icon, td.cmacs-compact-table-smart-table-hot-spot-row-add",
  // Delete-row icon (sticky right column of each row). Same dual-pattern.
  deleteRowIcon:
    "td.cmacs-compact-table-smart-table-hot-spot-row-delete > i, .cmacs-compact-table-smart-table-hot-spot-row-delete-icon, td.cmacs-compact-table-smart-table-hot-spot-row-delete",

  // Placeholder text that indicates a cell is empty / ready for input
  emptyCellPlaceholder: ".cmacs-compact-table-field-valid-placeholder",

  // Project deletion (Projects page → click card → delete)
  projectsPageUrlPart: "/app/projects",
};
