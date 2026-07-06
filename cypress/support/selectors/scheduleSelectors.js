// Selectors for the Schedule module (list view, creation, deletion, navigation)

export const SCHEDULE = {
  // Schedule list page
  newScheduleButton: "button.indexnewbtn",
  deleteScheduleButton: ".ant-btn-default.ng-star-inserted",
  scheduleListTable: "nz-table .ant-table-body table tbody",
  scheduleNameCell: "td.cmacs-table-cell-Name",

  // Create schedule modal
  scheduleNameInput: "cmacs-modal cmacs-open-input input",
  createScheduleButton: "cmacs-modal .creation-footer button:nth-child(3)",
  scheduleDatePicker: "cmacs-modal cmacs-date-picker",
  scheduleDatePickerClear: "cmacs-modal cmacs-date-picker .ant-picker-clear",

  // Schedule (gantt) header / breadcrumb
  scheduleBreadcrumbBack:
    "app-pss-top-toolbar .scheduletitle cmacs-breadcrumb cmacs-breadcrumb-item:nth-child(1) span a",

  // Schedule bar (list page) — the "…" (3-dots) actions button for the
  // currently-selected schedule.
  scheduleBarMoreButton:
    "app-pss-schedule-index app-pss-schedule-bar .ant-col-16 button:nth-child(1)",
  // Multi-select toggle — enables the per-row checkboxes.
  scheduleMultiSelectButton:
    "app-pss-schedule-index app-pss-schedule-bar .ant-col-16 button:nth-child(2)",
  // Per-row checkbox input (first column once multi-select is enabled).
  scheduleRowCheckbox: 'td:nth-child(1) input[type="checkbox"]',
  // Header "select all" checkbox (first column of the table header).
  scheduleSelectAllCheckbox:
    'app-pss-schedule-index nz-table .ant-table-header thead tr th:nth-child(1) input[type="checkbox"]',
  // Dropdown menu items (overlay id is dynamic — match by text with cy.contains)
  scheduleActionMenuItem: ".cdk-overlay-container .ant-dropdown-menu-item",
  // OK button on the "Mark as Primary" confirmation modal
  markPrimaryConfirmOk: "cmacs-modal .trans-model-footer button.ant-btn-primary",

  // Confirmation prompts
  primaryProjectScheduleText:
    "Are you sure you want to delete the primary project schedule",
};
