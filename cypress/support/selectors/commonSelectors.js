// Shared selectors used across modules (modals, overlays, etc.)

export const COMMON = {
  // Generic Ant Design / CMACS modal
  modal: "cmacs-modal",
  modalCreationFooter: "cmacs-modal .creation-footer",
  modalTransFooter: "cmacs-modal .trans-model-footer",
  modalDangerButton: "cmacs-modal .trans-model-footer button.ant-btn-danger",
  scheduleModalDangerButton: "cmacs-modal .ant-btn-danger:visible",

  // CDK overlay container (Angular)
  overlayContainer: ".cdk-overlay-container",
  overlayVisibleList: ".cdk-overlay-container ul:visible",
  overlayList: ".cdk-overlay-container ul",
  overlayListItem: ".cdk-overlay-container li",

  // Ant Design spinner, present only while a nz-spin block is loading. Asserting
  // "not.exist" against it passes immediately when nothing is loading, so it's
  // safe to use as a settle-point even where a spinner never appears.
  loadingSpinner: ".ant-spin-spinning",

  // Notifications
  notificationClose: ".ant-notification-close",
  releaseModalCookie: "a.release-modal-cookie",

  // User nav — logout flow
  userMenuTrigger: "app-ptob-user-image > div",
  logoutButton: "app-user-overflow-menu div.user-project-info > button",
};
