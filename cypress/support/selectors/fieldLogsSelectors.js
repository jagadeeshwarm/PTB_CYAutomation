// Selectors for the Field Logs module.
//
// Split into two groups:
//   FORM_TEMPLATE — building a Form Template (Project workspace > Templates tab).
//                   Kept separate so other specs that need a log/form template
//                   can reuse FormTemplatePage without pulling in log selectors.
//   FIELD_LOGS    — creating / sending / deleting a Log (Field Operations > Logs).
//
// Overlay-driven lists (cdk-overlay-NN ids in the recorded selectors) change on
// every render, so we target the visible overlay container instead — matching the
// existing convention in commonSelectors / coordinationFilesSelectors.

export const FORM_TEMPLATE = {
  // Project workspace nav tab — recorded id is project-specific, so we resolve
  // the tab by its visible label in the page object instead.
  templatesTabLabel: "Templates",

  // Templates index page — same primary "New" button class used across the app
  newTemplateButton: "button.indexnewbtn",

  // Form Template editor
  canvas: "#canvas",
  rightPanel: "app-edit-template-side-panel cmacs-side-panel",

  // Draggable source items in the right-side panel
  layoutItem: "#tables > app-draggable-item:nth-child(1) > div",
  checklistItem: "#selections > app-draggable-item:nth-child(1) > div",
  imageItem: "#additionalFields > app-draggable-item:nth-child(1) > div",

  // Document settings
  documentSettingsButton: "app-edit-template-menu .ant-col-xs-10 button:nth-child(4)",
  // Name field carries a unique class; the panel also has a Type Tags <input>,
  // so we must NOT use a generic "...input" selector (it matches both).
  templateNameInput: "app-page-settings input.home-selectEditor",
  typeTagsSelect: "app-page-settings cmacs-side-panel cmacs-select",
  // "Logs" option inside the Type Tags overlay dropdown
  typeTagsOptionLabel: "Logs",
};

export const FIELD_LOGS = {
  // Field Operations workspace name (used with dashboardPage.selectWorkspaceByName)
  workspaceName: "Field Operations",
  logsTabLabel: "Logs",

  // Logs index page — same primary "New" button class used across the app
  newLogButton: "button.indexnewbtn",

  // "Use Template" popup
  useTemplateSelect: "cmacs-modal .trans-model-body cmacs-select",
  useTemplateOkButton: "cmacs-modal .trans-model-footer button.ant-btn-primary",

  // Log editor — right panel Distribution List
  addUsersSelect: "app-log-distribution-list cmacs-user-dropdown cmacs-select",

  // Log editor action bar (3-dots, Send, Delete live in this button row)
  actionBar:
    "#logs-body div.logs-page-full > div:nth-child(2) > div",
  threeDotsTrigger:
    "#logs-body div.logs-page-full > div:nth-child(2) > div > button.ant-dropdown-trigger",
  sendButton:
    "#logs-body div.logs-page-full > div:nth-child(2) > div > button:nth-child(2)",
  deleteButton:
    "#logs-body div.logs-page-full > div:nth-child(2) > div > button:nth-child(3)",

  // 3-dots dropdown menu options (resolved by label in the visible overlay)
  menuReopenLabel: "Reopen",
  menuExportPdfLabel: "Export PDF",

  // Confirm popups (Send confirm, Reopen confirm) share the same primary footer button
  confirmPrimaryButton: "cmacs-modal .trans-model-footer button.ant-btn-primary",

  // Toast / message container (first: "Sending email", then "The email was successfully sent.")
  messageContainer: "cmacs-message-container cmacs-message",
  emailSentText: "The email was successfully sent.",
};
