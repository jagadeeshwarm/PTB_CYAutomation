// Selectors for the Schedule Side Panel (task property editor)

// When the side panel is open the gantt uses a different (.ganttWidthWithSide) layout.
// Column positions in the visible tree differ from the without-side-panel view.
export const SIDEPANEL_TREE_COLUMNS = {
  NAME: 2,
  MODE: 4,
  DURATION: 7,
  PERCENT: 7,
  START_DATE: 8,
  END_DATE: 9,
  CONSTRAINT_TYPE: 15,
  CONSTRAINT_DATE: 16,
  STATUS: 19,
};

export const SIDEPANEL = {
  toggleButton: ".nav-sidebar-toggle-container .nav-sidebar-icon",

  // General Settings tab inputs
  taskNameInput: "#tasknamediv input",
  // Duration is the 1st form-item in the first row of the General Settings form
  durationFormControl:
    "app-pss-prop-general-setting-tab form .ant-row > div:nth-child(1) cmacs-form-control",
  durationInput:
    "app-pss-prop-general-setting-tab form .ant-row > div:nth-child(1) cmacs-form-control input",

  // Mode dropdown (2nd form-item in the first row of General Settings)
  modeDropdownTrigger:
    "app-pss-prop-general-setting-tab form .ant-row > div:nth-child(2) cmacs-select",
  modeDropdownOption: ".cdk-overlay-container .ant-select-dropdown li",

  // Constraint fields (read-only in Manual mode)
  constraintTypeSelect: "#constTypeDiv cmacs-select",
  constraintTypeOption: ".cdk-overlay-container .ant-select-dropdown li",
  constraintDatePicker:
    "app-pss-prop-general-setting-tab form > div:nth-child(7) cmacs-form-item cmacs-date-picker",

  // % Completed (slider + numeric input) — wrapper has unique class .percentdiv
  percentSlider: ".percentdiv cmacs-slider",
  percentInput: ".percentdiv cmacs-input-number input",

  // Start / End date pickers (form-item nth-child positions in General Settings)
  startDatePicker:
    "app-pss-prop-general-setting-tab form > div:nth-child(4) cmacs-date-picker",
  startDateInput:
    "app-pss-prop-general-setting-tab form > div:nth-child(4) cmacs-date-picker input",
  endDatePicker:
    "app-pss-prop-general-setting-tab form > div:nth-child(5) cmacs-date-picker",
  endDateInput:
    "app-pss-prop-general-setting-tab form > div:nth-child(5) cmacs-date-picker input",

  // OK button in the date+time calendar popup (stable parts of the dynamic overlay path)
  datePickerOkButton:
    ".cdk-overlay-container date-range-popup calendar-footer .ant-picker-ok button",

  // Selected-row tree cell — used for PERCENT/START/END/STATUS verifications
  selectedRowCell: (colIdx) =>
    `.gantt_grid_data .gantt_row.gantt_selected.gantt_row_task > div:nth-child(${colIdx})`,

  // Broader selected-row cell — matches task AND project rows (used after side panel tab switches)
  selectedAnyRowCell: (colIdx) =>
    `.gantt_grid_data .gantt_row.gantt_selected > div:nth-child(${colIdx}) > div`,

  // Tree view cells (with side panel open layout)
  taskTreeCell: ".gantt_grid_data .gantt_row_task .gantt_cell_tree",
  treeRowCell: (rowIdx, colIdx) =>
    `.gantt_grid_data > div:nth-child(${rowIdx}) > div:nth-child(${colIdx}) > div`,

  // --- Predecessor (Link) tab ---
  // The predecessor tab is the 2nd tab in the side panel tabset
  predecessorTabItem: "cmacs-tabs-nav .ant-tabs-tab:nth-child(2) .ant-tabs-tab-btn",

  // --- Cash Flow tab (identified by its Cost icon class) ---
  cashFlowTabItem: ".iconUILarge-Cost",

  // Cash Flow panel fields — all scoped to app-cash-flow-side-panel
  cashFlowForecastInput:
    "app-cash-flow-side-panel div:nth-child(3) cmacs-form-control input",
  cashFlowReferenceAmount:
    "app-cash-flow-side-panel div:nth-child(2) cmacs-form-control span",
  cashFlowActualValue:
    "app-cash-flow-side-panel div:nth-child(4) cmacs-form-control span",
  cashFlowAddValueButton:
    "app-cash-flow-side-panel .cashflow-action-buttons button",

  // Add Value popup (nz-modal-container is stable; cdk-overlay IDs are not)
  cashFlowPopupMonthInput:
    "nz-modal-container .ant-modal-body div:nth-child(1) cmacs-month-picker input",
  cashFlowPopupValueInput:
    "nz-modal-container .ant-modal-body :nth-child(2) > .ant-input",
  cashFlowPopupNoteInput:
    "nz-modal-container .ant-modal-body div:nth-child(3) input",
  cashFlowPopupConfirmButton:
    "nz-modal-container .ant-modal-footer button.ant-btn-primary",

  // Cash Flow list entries (first entry in the list)
  cashFlowListFirstEntry:
    "app-cash-flow-side-panel .cashflow-list div:nth-child(1)",
  cashFlowEditIcon:
    "app-cash-flow-side-panel .cashflow-list div:nth-child(1) .cashflow-actions i.iconUILarge-Edit.edit-icon",
  cashFlowDeleteIcon:
    "app-cash-flow-side-panel .cashflow-list div:nth-child(1) .cashflow-actions i.iconUILarge-Trash.delete-icon",
  predecessorAddButton:
    "app-dependency-side-panel div.section-content.predecessorheader div > div",
  predecessorModalTaskSelect: "cmacs-modal .ant-modal-body cmacs-select",
  predecessorModalSearchInput:
    ".ant-select-dropdown li.cmacs-select-search input",
  predecessorModalDropdownItem:
    ".ant-select-dropdown li.ant-select-dropdown-menu-item:not(.cmacs-select-search):visible",
  predecessorModalLagInput:
    "cmacs-modal .cmacs-modal-helpful-center-panel cmacs-input-number input",
  predecessorModalTypeCard: "cmacs-modal .ant-modal-body cmacs-card",
  predecessorModalSaveButton: ".helpful-footer button.ant-btn-primary",
};
