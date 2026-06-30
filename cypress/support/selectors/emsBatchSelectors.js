// Selectors for the EMS (Element Management) > Building Models > Batch module
// and the cross-module Tracking page (app-element-status-root / app-qc-index-grid)
// reached from the header navigation.
//
// Conventions (same as Model / System / Drawing modules):
//  - dynamic ids (cdk-overlay-NN, per-render guids, tr-<guid>, the Tracking
//    tab's UUID id) are NEVER used directly — rows/panels/tabs are reached via
//    component tags, cmacs classes, and visible text.
//  - card-meta action links (Attach Elements) are CSS-clipped — click with force.
//  - dropdown menu items use a real click (force only hovers them).
//
// Module switching reuses EMS_SYSTEM.moduleTab (Model=0, System=1, Drawing=2,
// Batch=3, Ticket=4).
//
// ⚠ NEEDS-VERIFICATION markers: best-guess for HTML the spec author hadn't
//   captured for every state (e.g. Batch '+' button button index inside the
//   Model panel header, Tracking nav label text). Fix on first run.

export const EMS_BATCH = {
  // ── Header / top navigation ────────────────────────────────────────────────
  // Tracking page is a separate top-level workspace section, sibling to
  // Building Models. The provided selector "#ebcc4807-…" is a dynamic id —
  // navigate by visible nav-link text instead.
  trackingNavLabel: "Tracking",

  // ── Batch panel header ('+' to create a new batch) ─────────────────────────
  // Same titleCard / titleCardRight container used by Model ('+'=New). For
  // Batch, the '+' is the first (and only) action button rendered in the
  // panel's title bar.
  batchNewButton: "#titleCardRight button",

  // ── Batch list (inside app-batch) ──────────────────────────────────────────
  // The batch list is NOT an ant-table — it renders auto-named items
  // ("Batch_1", "Batch_2", …) as list rows inside app-batch > div > nz-spin.
  // Match rows by their visible name pattern at runtime (see EmsBatchPage).
  batchPanel: "app-batch",
  batchListContainer: "app-batch nz-spin",
  // Regex used to identify a batch row by its visible name.
  batchNameRegex: /^Batch_\d+$/,

  // ── Batch Properties (bottom pane) ─────────────────────────────────────────
  // The bottom-pane tabset is shared with Model — Elements is the 2nd tab.
  // Tabs are matched by visible label via EMS_MODEL.topTabBtn at click time.
  elementsTabLabel: "Elements",

  // ── Elements tab — Attach Elements ─────────────────────────────────────────
  // Same component as System's Add Elements panel; the second card-meta entry
  // is "Attach Elements" (System's "Add Elements" is the first one).
  elementsPanel: "app-element-list-property-panel",
  attachElementsText: "Attach Elements",
  // The clipped card-meta titles — filter by text at click time.
  elementsCardMetaTitle:
    "app-element-list-property-panel .ant-card-meta-title",

  // ── Attach EMS Nodes modal ─────────────────────────────────────────────────
  attachModal: "cmacs-modal .ant-modal-wrap.model-wrapper",
  // The node tree on the LEFT (when present) and the helpful center-panel that
  // holds the searchable EMS node tree.
  attachNodeTree:
    "cmacs-modal .cmacs-modal-helpful-center-panel cmacs-tree",
  attachNodeTreeNode:
    "cmacs-modal .cmacs-modal-helpful-center-panel cmacs-tree cmacs-tree-node",
  // Each tree row's checkbox label wrapper (ant-tree-checkbox is the span; the
  // click target is its wrapper for reliable event dispatch).
  attachNodeCheckbox:
    "cmacs-modal .cmacs-modal-helpful-center-panel cmacs-tree-node .ant-tree-checkbox",
  // Primary button in the modal footer ("Attach EMS Nodes").
  attachConfirmBtn:
    "cmacs-modal .ant-modal-footer.helpful-footer button.ant-btn-primary",

  // ── Batch Properties Elements table (after attach) ─────────────────────────
  // The Elements panel renders TWO cmacs-compact-table elements — one is
  // hidden (display: none, used as a template/placeholder) and one is visible
  // with the actual data. Scope to the non-hidden table so clicks land on the
  // real cells (same `:not([hidden])` pattern used by Cost / System grids).
  batchElementsRow:
    "app-element-list-property-panel cmacs-compact-table:not([hidden]):visible tbody tr.ant-table-row",
  // Status cell (BatchStatus column) — inline editable. The td itself isn't
  // the click target; the actual handler sits on its CHILD div (the wrapper
  // around the displayed value). Two real clicks on this div = highlight, then
  // open the dropdown editor.
  batchStatusCell:
    "td.cmacs-editable-column.cmacs-compact-table-cell-BatchStatus",
  batchStatusCellInner:
    "td.cmacs-editable-column.cmacs-compact-table-cell-BatchStatus > div",
  batchStatusInlineCell: ".cmacs-compact-table-inline-cell",
  // First-column checkbox of an Element row.
  batchElementRowCheckbox:
    "app-element-list-property-panel tbody tr.ant-table-row td.ant-table-cell-fix-left label.ant-checkbox-wrapper",

  // ── Tracking page (app-element-status-root) ────────────────────────────────
  // Top tabset on the Tracking page (Model / Batch).
  trackingTabBtn:
    "app-qc-index-grid .qc-tabset cmacs-tabs-nav .ant-tabs-tab-btn",
  trackingModelTabLabel: "Model",
  trackingBatchTabLabel: "Batch",
  // The active tab pane (rows live here).
  trackingActivePane:
    "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active",
  // Generic table row in the active Tracking pane.
  trackingRow:
    "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active tbody tr.ant-table-row",
  // Click the .ant-checkbox-inner span — the visible square a real user clicks.
  // ng-zorro's wrapper handler fires ONCE and calls preventDefault() so the
  // native input toggle doesn't double-fire (which is what made earlier
  // attempts on .ant-checkbox / .ant-checkbox-wrapper / input.ant-checkbox-
  // input select then immediately deselect).
  trackingRowCheckbox:
    "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active tbody tr.ant-table-row td.ant-table-cell-fix-left .ant-checkbox-inner",
  trackingHeaderCheckbox:
    "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active thead th.ant-table-cell-fix-left .ant-checkbox-inner",

  // Tracking page button bar (right side of header).
  trackingButtonBar:
    "app-qc-index-grid .index-action-button .button-bar",
  // The action buttons carry aria-labels. The "QR scanner icon" the spec
  // refers to IS the "Print QR Codes" button — it's disabled until rows are
  // selected (Step 9), and then opens the QR Code popup. Target by aria-label
  // (nth-child shifts release-to-release).
  trackingQrButton:
    "app-qc-index-grid .index-action-button .button-bar button[aria-label*='QR']:not([disabled])",
  trackingImportTemplateButton:
    "app-qc-index-grid .index-action-button .button-bar button[aria-label*='Import']:not([disabled])",

  // ── Tracking Templates picker modal (opened by Import Template) ────────────
  // First-column checkbox in the picker's compact-table.
  templatePickerCheckbox:
    "cmacs-modal td.cmacs-compact-table-fst-td label.ant-checkbox-wrapper",
  templatePickerSaveBtn:
    "cmacs-modal .ant-modal-footer.helpful-footer button.ant-btn-primary",
  // Header text used to find the Tracking Templates column by index (the td
  // class name varies across releases, so resolve the column dynamically).
  trackingTemplateColumnHeader: "Tracking Template",

  // ── QR Code full-size popup ────────────────────────────────────────────────
  // Two distinct root components show up here: app-qr-code-pagesetup in the
  // Model-tab flow, app-bunk-qrcode-pagesetup in the Batch-tab flow. Both
  // share the same internal layout, so every QR selector matches either root
  // via :is() so the same helpers drive both contexts.
  qrPopup: "app-qc-index-grid full-size-popup",
  qrPagesetup: "app-qr-code-pagesetup, app-bunk-qrcode-pagesetup",
  // Template tab (default) > "Select Template(s)" cmacs-select trigger.
  qrSelectTemplateTrigger:
    ":is(app-qr-code-pagesetup, app-bunk-qrcode-pagesetup) .content-page-left-side-panel cmacs-select",
  // Template Title input — the first text input on the Template tab.
  qrTemplateNameInput:
    ":is(app-qr-code-pagesetup, app-bunk-qrcode-pagesetup) .content-page-left-side-panel .ant-tabs-tabpane-active input[type='text']",
  // Save button on the QR sidebar's Template tab.
  qrTemplateSaveBtn:
    ":is(app-qr-code-pagesetup, app-bunk-qrcode-pagesetup) .content-page-left-side-panel button.ant-btn-primary",
  // Top-right "Print QR Codes" icon — the only default-styled icon-only
  // button in the actionbuttons row. Clicking it triggers window.print().
  qrPrintButton:
    ":is(app-qr-code-pagesetup, app-bunk-qrcode-pagesetup) .actionbuttons button.ant-btn-default.cmacs-btn-action.ant-btn-icon-only",
  // The X close button in the modal header (closed-div area).
  qrCloseButton:
    "app-qc-index-grid full-size-popup .modal-header .closed-div button",
};
