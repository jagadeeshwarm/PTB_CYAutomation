// Selectors for the Planned vs Actual module (snapshot, comparison, filters)

export const PLANNED_VS_ACTUAL = {
  // Snapshot icon in the Gantt top toolbar (first button in the snapshot button group)
  snapshotIcon:
    "app-pss-top-toolbar cmacs-button-group.snapshot > button:nth-child(1)",

  // Planned vs Actual button (second button in the snapshot button group)
  plannedVsActualButton:
    "app-pss-top-toolbar cmacs-button-group.snapshot > button:nth-child(2)",

  // Snapshot dialog — name input (renames the snapshot)
  snapshotNameInput: "cmacs-modal cmacs-open-input input",

  // Snapshot dialog — description textarea
  snapshotDescriptionTextarea: "cmacs-modal cmacs-open-textarea textarea",

  // Save button in the snapshot dialog footer
  snapshotSaveButton: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // Close (X) button on modals — targets the button element, not the inner icon,
  // because jQuery :visible can miss zero-dimension <i> elements.
  snapshotPopupCloseIcon: "cmacs-modal .ant-modal-close .iconUILarge-Close",

  // Cancel button on the delete-confirmation dialog (trans-model-footer)
  deleteConfirmCancelButton:
    "cmacs-modal .trans-model-footer button.ant-btn-background-ghost",

  // ── PvA modal (before clicking Compare) ───────────────────────────
  showDifferencesCheckbox:
    "app-planned-vs-actual-modal label.ant-checkbox-wrapper",
  compareButton: "app-planned-vs-actual-modal button.ant-btn-primary",

  // ── PvA comparison view (after clicking Compare) ──────────────────
  pvaCloseButton: "full-size-popup .modal-header .closed-div button",
  pvaGanttRows:
    "full-size-popup .gantt_grid_data .gantt_row:not(.gantt_row_empty)",

  // ── PvA comparison toolbar – filter ───────────────────────────────
  pvaFilterButton:
    "full-size-popup cmacs-button-group.filter button:first-child",
  pvaFilterRemoveIcon:
    "full-size-popup cmacs-button-group.filter button:nth-child(2) i",

  // Filter modal (shared smart-filter component)
  filterPopup: "cmacs-modal app-saved-filter",
  filterSelectionDropdown:
    "cmacs-modal app-saved-filter > div > div:nth-child(1) > cmacs-select > div > div",
  filterSearchInput:
    ".cdk-overlay-container .ant-select-dropdown:visible .cmacs-select-search input",
  filterOption: ".cdk-overlay-container .ant-select-dropdown:visible li",
  filterApplyButton:
    "cmacs-modal app-saved-filter > div > div:nth-child(1) > button",
};
