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
  taskInlineInput: '.gantt_grid_editor_placeholder input[type="text"]',
  taskIdLabel: "div:nth-child(3) > div > label",

  // Context menu submenu trigger text
  addTaskMenuText: "Add Task",
};
