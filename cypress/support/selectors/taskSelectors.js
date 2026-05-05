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
