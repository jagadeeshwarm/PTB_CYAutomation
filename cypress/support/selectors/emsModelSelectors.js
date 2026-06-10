// Selectors for the EMS (Element Management) > Building Models > Model module.
//
// Notes:
//  - Dynamic ids (cdk-overlay-NN, the per-render table guids, tr-[object Object])
//    are NEVER used directly. Tables/rows are reached via their Angular component
//    tag (app-status-tracker-content-panel, app-cost-content-panel, …) and the
//    stable cmacs cell classes (cmacs-compact-table-cell-<Field>).
//  - Dropdown overlays are reached via COMMON.overlayVisibleList.
//  - The Node Properties tabs (General / Status Tracker / Tags / To Dos /
//    Documents / Cost / Tickets) live in the top-level tabset that carries the
//    `bottom-pane-tab-custom` class — inner panels have their own tabsets, so we
//    scope to that class to avoid matching nested tabs.

export const EMS_MODEL = {
  // ── Workspace / module ─────────────────────────────────────────────────────
  workspaceName: "Element Management",
  buildingModelsTabLabel: "Building Models",

  // ── EMS home screen (Building Structure list) ───────────────────────────────
  emsNewButton: ".indexnewbtn", // "New" on the EMS home list
  emsTable: ".ant-table-body", // the EMS structures list table
  emsHomeDeleteBtn:
    "app-structure-root app-home-bar .button-bar button:nth-child(3)",
  emsRowCheckbox: "input.ant-checkbox-input",

  // ── Create Building Structure popup ─────────────────────────────────────────
  createStructureModal: "cmacs-modal",
  createStructureNameInput: "cmacs-modal input.ant-input",
  createStructureSaveText: "Save",

  // ── Model tree panel ───────────────────────────────────────────────────────
  // Model panel header has 4 icon buttons, each in its own (duplicate-id)
  // #titleCardRight div: New / More / Sort / Refresh. The '+' is "New".
  newButton: "#titleCard button[aria-label='New']",
  tree: "cmacs-tree.modal-tree",
  treeNode: "cmacs-tree-node",
  treeNodeTitle: "app-matched-title .folder-name",
  // Each tree node row carries a .cmacs-context-menu-overlay div stretched over
  // it that captures the right-click — target IT, not the inner title span.
  nodeContextOverlay: ".cmacs-context-menu-overlay",
  // Context menu shown on right-click of a tree node.
  contextMenu: ".cdk-overlay-container ul.cmacs-context-menu:visible",

  // ── Bottom pane (Node Properties) ──────────────────────────────────────────
  bottomPane: "#bottom-pane-area",
  // Top-level tab buttons only (scoped to the bottom-pane-tab-custom tabset).
  topTabBtn:
    "#bottom-pane-area cmacs-tabset.bottom-pane-tab-custom > cmacs-tabs-nav .ant-tabs-tab-btn",
  activeTabPane:
    "#bottom-pane-area cmacs-tabset.bottom-pane-tab-custom > div .ant-tabs-tabpane-active",

  // ── General tab ────────────────────────────────────────────────────────────
  generalPanel: "app-general-property-content-panel",
  nodeNameInput: "app-general-property-content-panel input.cmacs-input-fix",
  nodeStatusTag: "app-general-property-content-panel cmacs-tag span",
  derivedStatusSwitch:
    "app-general-property-content-panel nz-switch button.ant-switch",

  // ── Status Tracker tab ─────────────────────────────────────────────────────
  statusPanel: "app-status-tracker-content-panel",
  addManualStatusText: "Add Manual Status",
  // "Add Manual Status" card link — inner tabset's ACTIVE pane only (a hidden
  // duplicate may exist in the inactive Tracking pane). Matched by structure,
  // then filtered by the "Add Manual Status" text at click time.
  addManualStatusLink:
    "app-status-tracker-content-panel .ant-tabs-tabpane-active .ems_panel_right_border cmacs-card .ant-card-body cmacs-card-meta .ant-card-meta-title",
  // Editable data rows only (excludes the zero-height nz-table-measure-row).
  manualStatusRow:
    "app-status-tracker-content-panel tbody tr.cmacs-compact-table-editable-row",
  manualStatusNameCell: "td.cmacs-compact-table-cell-Name",
  manualStatusStatusCell: "td.cmacs-compact-table-cell-Status",
  manualStatusCheckbox:
    "td.cmacs-compact-table-fst-td input.ant-checkbox-input",
  manualStatusDeleteBtn:
    "app-status-tracker-content-panel th button[aria-label='Delete']",

  // ── To Dos tab ─────────────────────────────────────────────────────────────
  // The "Add To Do" link is reached by text within the active tab pane.
  addToDoText: "Add To Do",

  // ── Documents tab ──────────────────────────────────────────────────────────
  docPanel: "app-document-content-panel",
  uploadFileText: "Upload File",
  projectFilesText: "Project Files / Folders",
  // "Upload File" anchor inside the panel's nz-upload — NOT contains() text:
  // the panel also holds "Project Files / Folders" and a text match can land
  // on a shared wrapper, misclicking the wrong link.
  docUploadFileLink: "app-document-content-panel nz-upload a",
  // The nz-upload's own hidden file input (page-wide there are several).
  docFileInput: "app-document-content-panel nz-upload input[type='file']",
  // "Project Files / Folders" button (cmacs-card in the panel).
  docProjectFilesBtn:
    "app-document-content-panel .ems_panel_right_border cmacs-card .ant-card-body button",
  // "Select folders" / "Select Files" modal: project folder tree + Save.
  // Checkbox enablement varies (file picker disables Root Folder; folder
  // picker may not), so pick enabled checkboxes at runtime.
  selectFilesModal: "cmacs-modal",
  selectFilesTreeCheckbox: "cmacs-modal .ant-tree-checkbox",
  selectFilesTreeSwitcher: "cmacs-modal .ant-tree-switcher",
  // Hidden file input used by nz-upload elsewhere (ticket popup).
  fileInput: "input[type='file']",
  // Documents table — any uploaded file/folder row name.
  docName: "app-document-content-panel .document-name",
  docFolderIcon: "app-document-content-panel img[src*='Folder']",

  // ── Cost tab ───────────────────────────────────────────────────────────────
  costPanel: "app-cost-content-panel",
  addCostText: "Add Cost",
  // "Add Cost" card link (same card-meta structure as Add Manual Status).
  // Matched by structure, then filtered by the "Add Cost" text at click time.
  addCostLink:
    "app-cost-content-panel .ems_panel_right_border cmacs-card .ant-card-body cmacs-card-meta .ant-card-meta-title",
  // The editable cost grid is the non-hidden compact table in the panel.
  costRow:
    "app-cost-content-panel cmacs-compact-table:not([hidden]) tbody tr.ant-table-row",
  costQuantityCell: "td.cmacs-compact-table-cell-Measure",
  costPerUnitCell: "td.cmacs-compact-table-cell-CostPerUnit",
  costTotalCell: "td.cmacs-compact-table-cell-CostPerInstance",
  inlineCell: ".cmacs-compact-table-inline-cell",

  // ── Tickets tab ────────────────────────────────────────────────────────────
  ticketPanel: "app-defect-property-panel",
  createTicketText: "Create New Ticket",
  ticketRow: "app-defect-property-panel tbody tr.ant-table-row",
  ticketTitleCell: "td.cmacs-compact-table-cell-Title",

  // Create New Ticket popup (cmacs-modal > app-defect-create-info)
  ticketModal: "cmacs-modal .ant-modal-wrap.model-wrapper",
  ticketTitleInput:
    "cmacs-modal app-defect-create-info cmacs-open-input input",
  ticketAssigneeSelect:
    "cmacs-modal app-defect-create-info cmacs-select[formcontrolname='Assignee']",
  ticketCategorySelect:
    "cmacs-modal app-defect-create-info cmacs-select[formcontrolname='Category']",
  ticketTypeSelect:
    "cmacs-modal app-defect-create-info cmacs-select[formcontrolname='TicketType']",
  ticketFooterPrimary:
    "cmacs-modal .creation-footer button.ant-btn-primary",
  ticketUploadButton:
    "cmacs-modal app-defect-create-documents nz-upload button",

  // Tickets module header text (verified after navigating off the panel).
  ticketsModuleHeader: "Tickets",
};
