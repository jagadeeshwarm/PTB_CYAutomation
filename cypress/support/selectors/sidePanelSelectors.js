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

  // Tree view cells (with side panel open layout)
  taskTreeCell: ".gantt_grid_data .gantt_row_task .gantt_cell_tree",
  treeRowCell: (rowIdx, colIdx) =>
    `.gantt_grid_data > div:nth-child(${rowIdx}) > div:nth-child(${colIdx}) > div`,
};
