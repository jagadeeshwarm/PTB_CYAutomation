// Selectors for the EMS (Element Management) > Building Models > Drawing module.
//
// Module switching reuses EMS_SYSTEM.moduleTab (the app-ems-tree-container
// tabset, clicked by index: Model=0, System=1, Drawing=2).
//
// ⚠ NEEDS-VERIFICATION markers: HTML not provided for these — best guesses to
//   be confirmed on first run (Upload Drawing file input, Tags "Add Tag" button
//   + Tags table, and the download API endpoints).

export const EMS_DRAWING = {
  // ── Drawing tree toolbar ────────────────────────────────────────────────────
  addButton: "#titleCardRight > button", // '+' (provided)
  // First dropdown from '+': "Add Folder" / "Add Drawing". It pops out of an
  // overflow:hidden panel so Cypress flags the <ul> as not :visible — match it
  // WITHOUT :visible and force-click the item (force fires the handler on
  // clipped elements, same as the card-meta action links).
  addMenu: "ul.ant-dropdown-menu",

  // ── Drawing tree (folders + drawing files) ──────────────────────────────────
  tree: ".responsivetree cmacs-tree",
  treeNode: "cmacs-tree-node",
  treeNodeTitle: "app-matched-title .folder-name",
  nodeContextOverlay: ".cmacs-context-menu-overlay",
  folderIcon: "i.iconUILarge-Folder",
  // Right-click context menu on a folder (Create Folder / Upload Drawing / …).
  drawingContextMenu:
    ".cdk-overlay-container app-drawing-context-menu ul:visible",
  // ⚠ NEEDS-VERIFICATION: file input used by "Upload Drawing".
  fileInput: "input[type='file']",

  // ── Drawing viewer (canvas in the middle) ───────────────────────────────────
  // The embedpdf/pdfium viewer renders to a <canvas> without a stable class, so
  // match any canvas (the drawing area is the only canvas on screen here).
  canvas: "canvas",
  // Folder expand/collapse switcher (open the folder to reveal its drawings).
  treeSwitcher: ".ant-tree-switcher",
  treeSwitcherClosed: ".ant-tree-switcher_close",

  // ── Drawing left side menu (icons) ──────────────────────────────────────────
  sideMenu: ".cmacs-menu-side-bar",
  sideMenuChevronDown:
    ".cmacs-menu-side-bar .viewerside-panel-arrow .iconArrowLarge-Chevron-Down",
  historyIcon: ".cmacs-menu-side-bar i.iconArrowLarge-History",
  downloadIcon: ".cmacs-menu-side-bar i.iconArrowLarge-Download",
  // Expandable Downloads panel links.
  downloadWithAnnotationsText: "Download With Annotations",
  pdfDownloadText: "PDF Download",
  downloadLink: ".ems-right-expandable .downloaddiv a",
  // "Download With Annotations" opens a modal (page Start/End) with a Download
  // button; PDF Download fires its API directly (no modal).
  downloadModalConfirmBtn: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // ── Annotation History popup ────────────────────────────────────────────────
  annotationModal: "cmacs-modal",
  annotationRow: "cmacs-modal .cmacs-compact-table-logs tbody tr.ant-table-row",
  annotationTextCell: "td.cmacs-compact-table-cell-Text",
  annotationSaveBtn: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // ── Tags tab (Model node properties) ────────────────────────────────────────
  tagsPanel: "app-tags-content-panel",
  addTagText: "Add Tag",
  // "Add Tag" card link — clipped .ant-card-meta-title (force-click), filtered
  // by text at click time.
  addTagLink: "app-tags-content-panel .ant-card-meta-title",
  // Tag rows land in the dedicated tagtable; Document cell holds the drawing name.
  tagsTableRow:
    "app-tags-content-panel cmacs-compact-table.tagtable tbody tr.ant-table-row",

  // ── Download API endpoints (verify the request fires) ───────────────────────
  downloadApiPattern:
    "**/Annotation/DownloadDocumentWithAnnotationsPageRange/**",
  pdfApiPattern: "**/DocumentVersion/**/PDF/PresignedUrlStatus**",

  // ── Schuco-style element names (random pick per run) ────────────────────────
  schucoElements: [
    "AWS 75 Vent",
    "FWS 50 Mullion",
    "FWS 60 Transom",
    "ADS 70 Door Leaf",
    "USC 65 Unit",
  ],
};
