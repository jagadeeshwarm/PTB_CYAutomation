// Selectors for the Coordination > Files module

export const COORDINATION_FILES = {
  // ── Toolbar buttons ──────────────────────────────────────────────────────
  uploadButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button:nth-child(1)",
  downloadButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button:nth-child(2)",
  addFolderButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button.ant-btn.ant-dropdown-trigger.ant-btn-default.cmacs-btn-action.ant-btn-icon-only.ng-star-inserted",
  shareButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button:nth-child(4)",
  deleteButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button:nth-child(5)",
  renameButton:
    "app-document-view-toolbar div.actionbuttons.floatright > button:nth-child(6)",

  // ── Upload dropdown options ──────────────────────────────────────────────
  uploadFileOption: ".cdk-overlay-container ul:visible > li:nth-child(1)",
  uploadFolderOption: ".cdk-overlay-container ul:visible > li:nth-child(2)",
  uploadTemplateOptions: ".cdk-overlay-container ul:visible > li",

  // ── Import Template modal ────────────────────────────────────────────────
  folderStructureTemplateDropdown:
    "cmacs-modal div.cmacs-modal-helpful-center-panel cmacs-select > div",
  folderStructureTemplateList: ".cdk-overlay-container div:visible",
  expandFolder:
    "cmacs-modal cmacs-tree > ul > cmacs-tree-node > li > div > span.ant-tree-switcher.ng-star-inserted",
  templateCheckbox:
    "cmacs-modal cmacs-tree > ul > cmacs-tree-node > li > div > span.ant-tree-checkbox.ng-star-inserted > span",
  importButton:
    "cmacs-modal div.helpful-footer button.ant-btn-primary.ng-star-inserted",

  // ── Add Folder ───────────────────────────────────────────────────────────
  newFolderOption: ".cdk-overlay-container ul:visible > li > a",
  newFolderInput: "#newFolderInput",
  newFolderOkButton:
    "cmacs-modal div.trans-model-footer button.ant-btn-primary.ng-star-inserted",

  // ── File / Folder list in center panel ───────────────────────────────────
  foldersList:
    "app-document-view-icons > div > div:nth-child(2)",
  folderCard:
    "app-document-view-icons > div > div:nth-child(2) > div > cmacs-list nz-spin div div cmacs-card > div",
  filesList:
    "app-document-view-icons > div > div:nth-child(4)",
  fileCard:
    "app-document-view-icons > div > div:nth-child(4) .document-cards > .ant-card-body > .cmacs-card-big-file-meta > .cmacs-card-icon-wrapper",

  // ── Share modal ──────────────────────────────────────────────────────────
  shareOnlyFiles:
    "cmacs-modal app-document-share-type div:nth-child(2) > div > div > div:nth-child(1) > cmacs-card",
  shareFoldersAndFiles:
    "cmacs-modal app-document-share-type div:nth-child(2) > div > div > div:nth-child(2) > cmacs-card",
  shareNextButton:
    "cmacs-modal div.creation-footer button.ant-btn-primary.ng-star-inserted",

  // Document tree (file selection)
  documentTreeExpand:
    "cmacs-modal app-document-tree cmacs-tree > ul > cmacs-tree-node > li > div > span.ant-tree-switcher.ng-star-inserted",
  documentTreeCheckbox:
    "cmacs-modal app-document-tree cmacs-tree > ul > cmacs-tree-node > li > ul > cmacs-tree-node.ng-star-inserted > li > div > span.ant-tree-checkbox.ng-star-inserted > span",

  // Share settings
  shareTitle:
    "app-document-share-settings > :nth-child(1) > :nth-child(1) > :nth-child(2) > .ant-col > input.ant-input",
  sharePassword:
    "cmacs-modal app-document-share-settings div.model-margin > div:nth-child(1) > input",
  shareExpirationDate:
    "cmacs-modal app-document-share-settings div.model-margin > div.ant-col-11.ant-col-offset-2 > cmacs-date-picker",
  shareIncludeDownloadLink:
    "cmacs-modal app-document-share-settings div:nth-child(3) > div.ant-col-11.ant-col-offset-2 > nz-switch > button",

  // Get shareable link
  getShareableLinkTab:
    "cmacs-modal app-document-share-info",
  getShareableLinkRadio:
    "cmacs-modal div.radio-buttons cmacs-radio-group > label:nth-child(2) > span.ant-radio > input",
  shareableLink:
    "cmacs-modal app-document-share-info div.shared-link-box > span > a",

  // Share review
  shareReviewInfo:
    "cmacs-modal app-document-share-review div:nth-child(2) > cmacs-tabset > div",
  shareReviewDocumentsTab:
    "cmacs-modal app-document-share-review cmacs-tabs-nav div.ant-tabs-tab.ng-star-inserted",
  shareReviewDocumentContent:
    "cmacs-modal app-document-share-review div:nth-child(2) > cmacs-tabset > div",
  shareViaPTBButton:
    "cmacs-modal div.creation-footer button:nth-child(3)",

  // ── Shared link page ──────────────────────────────────────────────────────
  sharedPasswordInput:
    "app-shared-redirect form cmacs-input-group input",
  sharedAccessButton:
    "app-shared-redirect form > div:nth-child(2) > button",
  sharedFilesGrid:
    "#CUSTOMFILESGRID nz-table nz-spin div div nz-table-inner-scroll div.ant-table-body",

  // ── File viewer / Version ──────────────────────────────────────────────────
  versionDropdown:
    "app-document-viewer-topbar div.versioncompare cmacs-select > div > div",
  versionList: ".cdk-overlay-container div:visible",
  viewerCanvas:
    "#app-viewer-container-page-container-paper-1 > div > canvas.upper-canvas",

  // ── Navigation ───────────────────────────────────────────────────────────
  rootFolderSidebar: "app-documents-root div.left-panel span:first-child",

  // ── Rename modal ─────────────────────────────────────────────────────────
  renameInput: "cmacs-modal input",
  renameOkButton:
    "cmacs-modal div.trans-model-footer button.ant-btn-primary.ng-star-inserted",
};
