// Selectors for the Schedule "Share" flow (share modal + read-only shared gantt).
//
// The share modal opens from the top-toolbar "More" (3-dots) menu — reuse
// TASK.topToolbarMoreButton to open it. CDK overlay IDs (#cdk-overlay-50 etc.)
// are dynamic, so we target stable component/class hooks instead.

export const SHARE = {
  // "More" menu overlay list — first visible list holds the "Share" item.
  moreMenuList: ".cdk-overlay-container ul:visible",

  // Share settings modal
  shareModal: "cmacs-modal app-share-settings",

  // "Get shareable link" trigger (copies the URL to the clipboard on click).
  // The box holds multiple spans (link text + "Link Settings" dropdown), so the
  // page object narrows this to the link span by text via cy.contains().
  getShareableLink: "app-share-settings .shared-link-box span",

  // Scope radio group: label 1 = All (default), label 2 = Public
  scopePublicLabel: "app-share-settings cmacs-radio-group label:nth-child(2)",
  scopePublicInput: "app-share-settings cmacs-radio-group label:nth-child(2) input",

  // "Link Settings" dropdown-arrow button in the share box — reveals the #dvPwd
  // panel below (password, expiration date, resource-view toggle).
  linkSettingsToggle: "app-share-settings .shared-link-box > div > button",

  // Advanced link-settings panel (#dvPwd is a stable id on the revealed block).
  linkPasswordInput: "#dvPwd .model-margin > div:first-child input",
  linkExpirationPicker: "#dvPwd .model-margin cmacs-date-picker",
  linkExpirationInput: "#dvPwd .model-margin cmacs-date-picker input",
  resourceViewSwitch: "#dvPwd cmacs-switch button",

  // Password prompt shown when opening a password-protected shared link.
  // Target the stable trans-model hooks, not the dynamic cdk-overlay id.
  sharedLinkPasswordInput: "cmacs-modal .trans-model-body input",
  sharedLinkPasswordSubmit:
    "cmacs-modal .trans-model-footer button.ant-btn-primary",

  // Close the share modal
  modalClose: "cmacs-modal .ant-modal-close",

  // Read-only gantt rendered when the shared link is opened
  readOnlyGantt: "app-pss-read-only-gantt",
  readOnlyRows: "app-pss-read-only-gantt .gantt_grid_data .gantt_row",
  readOnlyTitleCell: '[data-column-name="text"] label',
  readOnlyPercentCell: '[data-column-name="PercentCompleteInt"] label',
};
