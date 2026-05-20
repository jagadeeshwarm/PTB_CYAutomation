// Selectors for the Planned vs Actual module (snapshot creation, rename, save)

export const PLANNED_VS_ACTUAL = {
  // Snapshot icon in the Gantt top toolbar (first button in the snapshot button group)
  snapshotIcon:
    "app-pss-top-toolbar cmacs-button-group.snapshot > button:nth-child(1)",

  // Snapshot dialog — name input (renames the snapshot)
  snapshotNameInput: "cmacs-modal cmacs-open-input input",

  // Snapshot dialog — description textarea
  snapshotDescriptionTextarea: "cmacs-modal cmacs-open-textarea textarea",

  // Save button in the snapshot dialog footer
  snapshotSaveButton: "cmacs-modal .helpful-footer button.ant-btn-primary",

  // Close icon (X) on the success/info popup that appears after save
  snapshotPopupCloseIcon: "cmacs-modal .ant-modal-wrap button > span > i",
};
