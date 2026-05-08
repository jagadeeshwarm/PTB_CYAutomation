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

  // Notifications
  notificationClose: ".ant-notification-close",
  releaseModalCookie: "a.release-modal-cookie",

  // User nav — logout flow
  userMenuTrigger: "app-ptob-user-image > div",
  logoutButton: "app-user-overflow-menu div.user-project-info > button",
};
