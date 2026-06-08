// Selectors for Coordination > Workflows > To Dos (Kanban) module.
//
// Derived from the provided outer HTML. Notes:
//  - cdk-overlay-NN ids are dynamic per render, so dropdown lists are reached
//    via the visible overlay container (COMMON.overlayVisibleList).
//  - The New ToDo popup is a <cmacs-modal>; its inner fields are scoped by the
//    stable structural classes / component tags rather than the overlay id.
//  - Kanban columns key off data attributes:
//      header  -> .wx-column[data-column-header="<Key>"]
//      cell    -> .wx-column[data-drop-area="<StatusKey>:<userId>"]
//    IMPORTANT: the "Backlog" status is stored as "AssignedTo" in data-drop-area.

export const TODO_WORKFLOW = {
  // ── Top nav ───────────────────────────────────────────────────────────────
  workflowsTabLabel: "Workflows",

  // ── To Dos index ──────────────────────────────────────────────────────────
  newTodoButton: "app-todos-root button.indexnewbtn",

  // ── New ToDo popup (cmacs-modal) ──────────────────────────────────────────
  modal: "cmacs-modal .ant-modal-wrap.model-wrapper",
  // Left/center panel: the summary/title input
  titleInput:
    "cmacs-modal .cmacs-modal-helpful-center-panel cmacs-open-input input",
  // Right panel form (todo-create-info > form > div:nth-child(N))
  assignedToSelect:
    "cmacs-modal todo-create-info cmacs-user-dropdown-built-in cmacs-select",
  watchlistField: "cmacs-modal todo-create-info cmacs-watchlist",
  plannedStartDatePicker:
    "cmacs-modal todo-create-info form > div:nth-child(6) cmacs-date-picker",
  dueDatePicker:
    "cmacs-modal todo-create-info form > div:nth-child(7) cmacs-date-picker",
  originalEstimateInput:
    "cmacs-modal todo-create-info form > div:nth-child(8) input",
  categorySelect:
    "cmacs-modal todo-create-info form > div:nth-child(10) cmacs-select",
  subCategorySelect:
    "cmacs-modal todo-create-info form > div:nth-child(11) cmacs-select",
  createButton: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // Watchlist dropdown: the "+" (invite/add) icon, then a user list (overlays)
  watchlistAddIcon:
    ".cdk-overlay-container .cmacs-watchlist-dropdown-invite-guest i",

  // Date picker popup is the app's custom date-range-popup/date-table.
  datePopupTable: ".cdk-overlay-container date-range-popup date-table table",
  datePopupTodayCell: ".cdk-overlay-container td.ant-picker-cell-today",

  // ── Kanban board ──────────────────────────────────────────────────────────
  board: ".wx-kanban",
  card: ".wx-card",
  cardText: ".wx-card p", // card has <p> for number / title / category
  rowLabel: ".wx-row .wx-label[data-row-header]",
  // Column cell for a status (any user row). Use ^= because value is "Status:userId".
  statusColumn: (statusKey) => `.wx-column[data-drop-area^="${statusKey}:"]`,

  // ── Board toolbar ─────────────────────────────────────────────────────────
  moreOptionsButton:
    "todo-bar div.page-header-rightside > div > button.ant-btn.ant-dropdown-trigger.ant-btn-default.cmacs-btn-action.ant-btn-icon-only",
  completedColumnCheckbox:
    ".cdk-overlay-container ul:visible li.ant-dropdown-menu-item.ng-star-inserted > label",

  // ── Side panel (todo-details) ─────────────────────────────────────────────
  detailsPanel: "todo-details .todo-details-panel",
  sidePanelLabel: "todo-details .sidepanel-label-input",
  sidePanelSection: "todo-details .section-content",
  reassignLink: "todo-details a", // filtered by text "Reassign"

  // ── ToDo detail page (full view / new-tab target) ─────────────────────────
  detailPageStatusSection: "app-todo-essentials .section-content",
};

// Maps a UI status label to its data-drop-area key.
export const TODO_STATUS_KEY = {
  Backlog: "AssignedTo",
  Ready: "Ready",
  "In Progress": "InProgress",
  "On Hold": "OnHold",
  Completed: "Completed",
};
