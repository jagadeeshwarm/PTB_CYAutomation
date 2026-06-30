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

  // ── Side panel: real DOM (todo-side-panel) ────────────────────────────────
  // The open side panel is <todo-side-panel><cmacs-side-panel>. Its top tabset
  // carries "Overview" / "Essentials"; under Essentials, <app-todo-essentials>
  // has its own icon-only sub-tabset: [0] Summary, [1] Comments, [2] Attachment,
  // [3] History.
  sidePanel: "todo-side-panel",
  sidePanelContent: "todo-side-panel cmacs-side-panel .cmacs-side-panel-content",
  // Top-level tab labels.
  overviewTabText: "Overview",
  essentialsTabText: "Essentials",
  // Icon-only sub-tabs inside Essentials (Summary / Comments / Attachment / History).
  essentialsIconTabs:
    "todo-side-panel app-todo-essentials > cmacs-tabset .ant-tabs-nav-list .ant-tabs-tab",

  // ── Title field (Essentials > Summary) ────────────────────────────────────
  // Editable inputs live under app-todo-essentials; the Title field is located
  // dynamically by its current value rather than a brittle structural path.
  sidePanelEditableFields:
    "todo-side-panel app-todo-essentials input, todo-side-panel app-todo-essentials textarea",

  // ── Comments (Essentials > Comments) ──────────────────────────────────────
  // <app-comment-form> holds the "Add Comment" reveal button, a TinyMCE <editor>
  // (renders into an iframe), and the primary "Add" submit button.
  commentForm: "todo-side-panel app-comment-form",
  addCommentButtonText: "Add Comment",
  // TinyMCE editor iframe — its contenteditable <body> is the comment box.
  commentEditorIframe: "todo-side-panel app-comment-form editor iframe",
  commentAddButton:
    "todo-side-panel app-comment-form button.btn-form-primary.ant-btn-primary",
  // The comment list region (used to assert a posted comment is rendered).
  commentsContainer: "todo-side-panel todo-comments app-comments",

  // ── Attachments (Essentials > Attachment) ─────────────────────────────────
  uploadFilesButtonText: "Upload Files",
  attachmentFileInput: "todo-side-panel input[type='file']",

  // ── Created By (side panel) ───────────────────────────────────────────────
  createdByLabelText: "Created By",

  // ── Smart filter (board toolbar "Smart" dropdown) ─────────────────────────
  // The "Smart" trigger is a <button>; clicking it opens a cdk overlay of filter
  // checkboxes. "Created by me" is the first item, matched by text (overlay id
  // is dynamic).
  smartFilterControl:
    "app-todos-root todo-bar div.page-header-rightside > div > div:nth-child(1) > button",
  // The dropdown menu renders INLINE (not in a cdk overlay) as
  // div.smart-dropdown-content > ul.filternav > li ... label > span(text).
  smartFilterMenu: ".smart-dropdown-content",
  smartFilterCreatedByMeText: "Created by me",

  // ── Export menu (3-dots) ──────────────────────────────────────────────────
  // Reuses the board toolbar's "..." dropdown trigger; Excel / PDF items are
  // matched by text inside the visible overlay (overlay id is dynamic).
  exportExcelText: "Export Excel",
  exportPdfText: "Export PDF",

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
