// Selectors for Resource Assignment, Timesheet, and Resource Load views

export const RESOURCE_ASSIGN = {
  // Right-click context menu (use cy.contains() with text)
  contextMenuItems: ".cdk-overlay-container li",

  // Assign Resources/Teams modal
  modalComponent: "app-pss-task-assignmultipleresource",
  searchInput:
    "app-pss-task-assignmultipleresource input.ant-select-search__field",
  dropdownMenuItems:
    ".cdk-overlay-container li.ant-select-dropdown-menu-item",
  saveButton: ".helpful-footer button.ant-btn-primary",
};

export const TIMESHEET = {
  // Side panel Timesheet tab icon
  tabIcon: ".iconUILarge-Time",

  // Timesheet panel (inside side panel)
  component: "app-timesheet-side-panel",
  addButton: "app-timesheet-side-panel button.ant-btn-primary",

  // Time Tracking popup (cmacs-modal / ant-modal)
  effortInput: ".ant-modal-body .ant-input-number-input",
  confirmButton: ".ant-modal-footer button.ant-btn-primary",
};

export const RESOURCE_LOAD = {
  // Resource icon in top toolbar — use .closest('button') in Cypress
  resourceIcon: "app-pss-top-toolbar .iconUILarge-User",

  // Dropdown menu items
  menuItems: ".cdk-overlay-container li.ant-dropdown-menu-item",

  // Resource Load gantt grid (reuses the same dhtmlx gantt structure)
  nameColumnHeader: ".gantt_grid_head_name",
  workloadColumnHeader: ".gantt_grid_head_workload",
  resourceRows: ".gantt_grid_data .gantt_row.gantt_row_task",
  workloadCell: ".gantt_cell.gantt_last_cell",
};

export const RESOURCE_USAGE = {
  // Same resource icon and dropdown shared with RESOURCE_LOAD
  resourceIcon: "app-pss-top-toolbar .iconUILarge-User",
  menuItems: ".cdk-overlay-container li.ant-dropdown-menu-item",

  // Resource Usage gantt grid rows (all rows: group, resource, task)
  resourceRows: ".gantt_grid_data .gantt_row",

  // Expand toggle icon on a collapsed row (▶). dhtmlx gantt uses gantt_open
  // for collapsed rows (clicking opens them) and gantt_close for expanded rows.
  expandIcon: ".gantt_tree_icon.gantt_open",

  // ACTUAL WORK is the 3rd grid column: name=1, percentage=2, actualWork=3
  actualWorkCell: ".gantt_cell:nth-child(3)",
};
