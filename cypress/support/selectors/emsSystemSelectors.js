// Selectors for the EMS (Element Management) > Building Models > System module.
//
// Conventions carried over from the Model module (see emsModelSelectors.js):
//  - dynamic ids (cdk-overlay-NN, per-render table guids, tr-<guid>) are never
//    used directly; rows/panels are reached via component tags + cmacs classes.
//  - the System Properties top tabs reuse the same bottom-pane-tab-custom tabset
//    as Model, so EMS_MODEL.topTabBtn / activeTabPane apply here too.
//  - card-meta action links (Add Article / Add Cost / Add Tracking Template /
//    Add Elements / Upload File) are CSS-clipped — click with force.
//
// ⚠ NEEDS-VERIFICATION markers below are best-guess selectors for HTML that was
//   not provided (module tab strip, Articles tab, Export Excel). Fix on 1st run.

export const EMS_SYSTEM = {
  // ── Module tab strip (Model / System / Drawing / Batch / Ticket) ────────────
  // Icon-only tabs inside app-ems-tree-container's tabset. switchModule() clicks
  // by index (Model=0, System=1, Drawing=2, Batch=3, Ticket=4).
  moduleTab:
    "app-ems-tree-container > div > cmacs-tabset > cmacs-tabs-nav .ant-tabs-tab-btn",

  // ── New System button ───────────────────────────────────────────────────────
  // Provided: #titleCardRight > button:nth-child(2). titleCardRight is a
  // duplicate-id container (see Model), so prefer aria-label if present.
  newSystemButton: "#titleCardRight > button:nth-child(2)",

  // ── System / sub-system tree ────────────────────────────────────────────────
  tree: "cmacs-tree.systemtree",
  treeNode: "cmacs-tree-node",
  treeNodeTitle: "app-matched-title .folder-name",
  nodeContextOverlay: ".cmacs-context-menu-overlay",
  // Right-click context menu (Add Sub System, …).
  systemContextMenu:
    ".cdk-overlay-container app-system-context-menu ul:visible",

  // ── General tab ─────────────────────────────────────────────────────────────
  generalPanel: "app-general-property-content-panel",
  // Each field lives in a .ant-col with a direct-child .model-label-style label
  // followed by an <input> (plain cmacs-input or cmacs-input-number wrapper).
  generalFieldCol: "app-general-property-content-panel .ant-col",

  // ── Articles tab ────────────────────────────────────────────────────────────
  articlesPanel: "app-articles-property-panel",
  addArticleText: "Add Article",
  // The editable article grid is the checkboxselect (non-hidden) compact table.
  articleRow:
    "app-articles-property-panel cmacs-compact-table[checkboxselect] tbody tr.ant-table-row",
  articleNameCell: "td.cmacs-compact-table-cell-Number",
  exportExcelBtn: "app-articles-property-panel button[aria-label='Export Excel']",

  // ── Edit Article popup ──────────────────────────────────────────────────────
  articleModal: "cmacs-modal .ant-modal-wrap.model-wrapper",
  articleNameInput: "cmacs-modal cmacs-open-input input",
  packagingUnitSelect: "cmacs-modal cmacs-select[value='packagingUnit']",
  uomTypeSelect: "cmacs-modal cmacs-select[value='uomType']",
  // Screen 1 numbers (Quantity/Price/Package Unit Size) + screen 2 property
  // fields are located by their .model-label-style label within the modal.
  modalFieldCol: "cmacs-modal .ant-col",
  articleFooterPrimary: "cmacs-modal .creation-footer button.ant-btn-primary",

  // ── Tracking Templates tab ──────────────────────────────────────────────────
  trackingPanel: "app-status-tracker-content-panel",
  addTrackingTemplateText: "Add Tracking Template",
  trackingRow:
    "app-status-tracker-content-panel tbody tr.cmacs-compact-table-editable-row",
  // Status popup (template picker)
  statusModalRow: "cmacs-modal .cmacs-compact-table-logs tbody tr.ant-table-row",
  statusModalCheckbox:
    "cmacs-modal .cmacs-compact-table-logs tbody tr.ant-table-row td.cmacs-compact-table-fst-td label.ant-checkbox-wrapper",
  // "Assign template to all elements associated to this subsystem" switch
  assignAllSwitch: "cmacs-modal .helpful-footer cmacs-switch button",
  statusModalSaveBtn: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // ── Elements tab ────────────────────────────────────────────────────────────
  elementsPanel: "app-element-list-property-panel",
  addElementsText: "Add Elements",
  elementRow: "app-element-list-property-panel tbody tr.ant-table-row",
  elementName: "app-element-list-property-panel .element-name",
  // Create New Elements popup
  createElementsModal: "cmacs-modal .ant-modal-wrap.model-wrapper",
  elementPrefixInput: "cmacs-modal input.cmacs-input-fix",
  elementsModalFieldCol: "cmacs-modal .cmacs-modal-helpful-center-panel .ant-col",
  elementsCopySwitch: "cmacs-modal cmacs-switch button.ant-switch",
  createElementsSaveBtn: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // ── Schuco-style data library (random pick per run) ─────────────────────────
  schucoSystems: [
    "AWS 75.SI+",
    "AWS 90.SI+",
    "FWS 50",
    "FWS 60",
    "ADS 70.HI",
    "USC 65",
  ],
  schucoVentTypes: [
    "Turn/Tilt",
    "Top-hung",
    "Side-hung",
    "Tilt-before-turn",
    "Parallel-opening",
  ],
};
