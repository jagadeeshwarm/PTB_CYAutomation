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

  // Cash Flow panel — all scoped under app-cash-flow-side-panel nz-spin
  cfPanel: "app-cash-flow-side-panel nz-spin > div > div",

  // Balance to Receive row (bottom summary)
  cfBalanceRow: "app-cash-flow-side-panel nz-spin > div > div > div.balance-row",

  // --- Forecast section ---
  cfForecastAddButton: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(4) > button",
  cfForecastTotal: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(5)",
  cfForecastList: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(6)",
  // Edit/Delete icons within forecast list entries (used with .find() on cfForecastList)
  cfForecastEditIcon: "div.cashflow-actions > i.iconUILarge-Edit.edit-icon",
  cfForecastDeleteIcon: "div.cashflow-actions > i.iconUILarge-Trash.delete-icon",

  // --- Actual Value section ---
  cfActualAddButton: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(8) > button",
  cfActualTotal: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(9)",
  cfActualList: "app-cash-flow-side-panel nz-spin > div > div > div:nth-child(10)",
  // Edit/Delete icons within actual list entries (used with .find() on cfActualList)
  cfActualEditIcon: "div.cashflow-actions > i.iconUILarge-Edit.edit-icon",
  cfActualDeleteIcon: "div.cashflow-actions > i.iconUILarge-Trash.delete-icon",

  // --- Add / Edit popup (shared by Forecast and Actual) ---
  cashFlowPopupMonthInput:
    "nz-modal-container .ant-modal-body div:nth-child(1) cmacs-month-picker input",
  cashFlowPopupValueInput:
    "nz-modal-container .ant-modal-body div:nth-child(2) > input",
  cashFlowPopupNoteInput:
    "nz-modal-container .ant-modal-body div:nth-child(3) > input",
  cashFlowPopupConfirmButton:
    "nz-modal-container .ant-modal-footer button.ant-btn-primary",

  // Legacy selectors kept for backward compatibility
  cashFlowForecastInput:
    "app-cash-flow-side-panel div:nth-child(3) cmacs-form-control input",
  cashFlowReferenceAmount:
    "app-cash-flow-side-panel div:nth-child(2) cmacs-form-control > div > div > span",
  cashFlowActualValue:
    "app-cash-flow-side-panel div:nth-child(4) cmacs-form-control > div > div > span",
  cashFlowAddValueButton:
    "app-cash-flow-side-panel div.section-content.cashflow-action-buttons > button",
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

  // --- Resources tab ---
  // 3rd tab in the side panel tabset
  resourcesTabItem: ":nth-child(3) > .ant-tabs-tab-btn",

  // Resources panel — Add button
  resourcesAddButton:
    ".resourceheader > .ant-row > .ant-col > .ant-btn",

  // Resource allocation popup (cmacs-modal with dynamic cdk-overlay ID — use stable ancestors)
  resourcesPopupDropdown:
    "cmacs-modal .ant-modal-body .cmacs-modal-helpful-center-panel div:nth-child(1) cmacs-select",
  resourcesDropdownList:
    ".cdk-overlay-container .ant-select-dropdown ul",
  resourcesPopupAllocationInput:
    "cmacs-modal .ant-modal-body .cmacs-modal-helpful-center-panel div:nth-child(2) cmacs-input-number input",
  resourcesPopupSaveButton: ".helpful-footer button.ant-btn-primary",

  // Resources verification — click the section title, then check the first list entry
  resourcesSectionTitle: ".sectiontitle",
  resourcesListFirstItem:
    ".section-content > :nth-child(1) > .text-overflow-ellipsis",

  // Tab nav wrapper — used to assert which tabs are (or are not) present
  sidePanelTabsNav:
    "app-pss-prop-side-panel cmacs-tabs-nav > div > div",
};
