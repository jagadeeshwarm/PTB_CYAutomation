// Selectors for Schedule smart filter actions.

export const SMART_FILTER = {
  filterButton:
    "app-pss-top-toolbar cmacs-button-group.pss-btn-group.filter button",
  filterPopup: "cmacs-modal app-saved-filter",
  filterSelectionDropdown:
    "cmacs-modal app-saved-filter > div > div:nth-child(1) > cmacs-select > div > div",
  filterSearchInput:
    ".cdk-overlay-container .ant-select-dropdown:visible .cmacs-select-search input",
  filterOption: ".cdk-overlay-container .ant-select-dropdown:visible li",
  applyButton: "cmacs-modal app-saved-filter > div > div:nth-child(1) > button",
  removeFilterIcon:
    "body > app-root > div > div > app-main-layout > div:nth-child(2) > app-content-layout > app-content-layout > app-gantt-root > nz-spin > div > div > div:nth-child(1) > div > app-pss-top-toolbar > div > div.toolbar-container > div > cmacs-button-group.pss-btn-group.filter.ant-btn-group.cmacs-btn-group.ng-star-inserted > button:nth-child(2) > i",
};
