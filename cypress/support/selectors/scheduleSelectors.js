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

  // Confirmation prompts
  primaryProjectScheduleText:
    "Are you sure you want to delete the primary project schedule",
};
