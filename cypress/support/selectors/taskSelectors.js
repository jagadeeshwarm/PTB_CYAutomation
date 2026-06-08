// Selectors for Task operations within a Schedule (gantt grid, toolbar, menus)

export const TASK = {
  // Toolbar
  plusButton: "app-pss-left-toolbar div.plusbutton",
  sidePanelDeleteButton: "#Delete",

  // Gantt grid
  ganttGridScale: ".gantt_grid_scale",
  ganttGridData: ".gantt_grid_data",
  ganttCell: ".gantt_grid_data .gantt_cell",
  ganttRows: ".gantt_grid_data .gantt_row:not(.gantt_row_empty)",
  ganttTaskRows: ".gantt_grid_data .gantt_row.gantt_row_task",
  ganttSelectedRow: ".gantt_grid_data .gantt_row.gantt_selected.gantt_row_task",
  ganttScrollbar:
    "body > app-root > div > div > app-main-layout > div:nth-child(2) > app-content-layout > app-content-layout > app-gantt-root > nz-spin > div > div > div.ant-row.gantt-container.ant-row-start > app-pss-gantt > div.gantt-height.ganttWidthWithoutSide > div > div.gantt_layout_cell.gantt_layout.gantt_layout_y.gridCell_cell.gantt_layout_cell_border_right > div.gantt_layout_cell.gridScroll_cell > div > div",
  ganttScrollbarFallback:
    "app-pss-gantt .gantt_layout_cell.gridScroll_cell > div > div",

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

  // Status label of the selected task row, kept for legacy callers.
  selectedRowStatusByDataIndex:
    ".gantt_grid_data .gantt_row.gantt_selected.gantt_row_task [data-column-index='Status']",
};

// Column indices in the Gantt grid (1-based, matches :nth-child).
// These are fallback values only — prefer dynamic resolution via TASK_COLUMN_HEADERS.
export const TASK_COLUMNS = {
  ID: 3,
  NAME: 4,
  DURATION: 5,
  START_DATE: 6,
  END_DATE: 7,
  PERCENT: 8,
  STATUS: 12,
  DELAYED: 13,
  ON_HOLD: 14,
};

// Gantt column header class selectors — used to resolve the real column index
// at runtime so tests stay correct even when columns are reordered or hidden.
export const TASK_COLUMN_HEADERS = {
  DURATION:  ".gantt_grid_head_DurationString",
  START_DATE: ".gantt_grid_head_start_date",
  END_DATE:  ".gantt_grid_head_end_date",
  PERCENT:   ".gantt_grid_head_progress",
  LINK:      ".gantt_grid_head_Predecessor",
  STATUS:    ".gantt_grid_head_Status",
  ON_HOLD:   ".gantt_grid_head_OnHold",
  DELAYED:   ".gantt_grid_head_DelayedInDays",
};
