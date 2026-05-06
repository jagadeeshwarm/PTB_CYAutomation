// Selectors for Task operations within a Schedule (gantt grid, toolbar, menus)

export const TASK = {
  // Toolbar
  plusButton: "app-pss-left-toolbar div.plusbutton",
  sidePanelDeleteButton: "#Delete",

  // Gantt grid
  ganttGridData: ".gantt_grid_data",
  ganttCell: ".gantt_grid_data .gantt_cell",
  ganttRows: ".gantt_grid_data .gantt_row:not(.gantt_row_empty)",
  ganttTaskRows: ".gantt_grid_data .gantt_row.gantt_row_task",
  ganttSelectedRow: ".gantt_grid_data .gantt_row.gantt_selected.gantt_row_task",

  // Inline editor inputs
  taskInlineInput: '.gantt_grid_editor_placeholder input[type="text"]',
  taskDateInput: '.gantt_grid_editor_placeholder input[type="date"]',
  taskNumberInput: '.gantt_grid_editor_placeholder input[type="number"]',

  // Misc
  taskIdLabel: "div:nth-child(3) > div > label",
  addTaskMenuText: "Add Task",

  // Gantt top-toolbar (3-dots / more menu)
  topToolbarMoreButton:
    "app-pss-top-toolbar .toolbar-container > div > button:nth-child(3)",

  // Show / Hide Columns menu option (text-based — overlay ID is dynamic)
  showColumnsMenuText: "Show Columns",

  // Hidden columns show an EyeSlash icon; visible ones show Eye.
  // We click the EyeSlash to toggle the column to visible (it becomes Eye).
  hiddenColumnIcon:
    ".cmacs-custom-hide-show > .movespan > .iconUILarge-EyeSlash",
  visibleColumnIcon: ".cmacs-custom-hide-show > .movespan > .iconUILarge-Eye",

  // Save button in the Show Columns dialog
  showColumnsSaveButton: ".ant-btn-primary > .ng-star-inserted",

  // Status label of the selected task row, located by data-column-index attr
  // (more stable than nth-child since it survives layout shifts)
  selectedRowStatusByDataIndex:
    'body > app-root > div > div > app-main-layout > div:nth-child(2) > app-content-layout > app-content-layout > app-gantt-root > nz-spin > div > div > div.ant-row.gantt-container.ant-row-start > app-pss-gantt > div.gantt-height.ganttWidthWithoutSide > div > div.gantt_layout_cell.gantt_layout.gantt_layout_y.gridCell_cell.gantt_layout_cell_border_right > div.gantt_layout_cell.grid_cell.gantt_layout_cell_border_transparent.gantt_layout_outer_scroll.gantt_layout_outer_scroll_horizontal.gantt_layout_outer_scroll.gantt_layout_outer_scroll_vertical.gantt_layout_cell_border_bottom > div > div > div.gantt_grid_data > div.gantt_row.gantt_selected.gantt_row_task > div:nth-child(19) > div',
};

// Column indices in the Gantt grid (1-based, matches :nth-child).
// Adjust these if your application's column layout differs.
export const TASK_COLUMNS = {
  ID: 3,
  NAME: 4,
  DURATION: 5,
  START_DATE: 6,
  END_DATE: 7,
  PERCENT: 8,
  STATUS: 12,
  ON_HOLD: 13,
};
