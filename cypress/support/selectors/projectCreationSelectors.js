// Selectors for the Project Creation / Import flow

export const PROJECT_CREATION = {
  // User menu & company switch
  userIcon:
    "body > app-root > div > div > app-main-layout > div.ng-star-inserted > div > app-nav-layout > div > div:nth-child(1) > div > div.main-nav-settings-area > div > app-ptob-user-image > div",
  companySearchInput:
    "app-user-overflow-menu div.user-project-info > div > div.grid > nz-input-group > input",
  companyCard:
    "app-user-overflow-menu div.user-project-info > div > div.company-scroll > div:nth-child(1)",
  switchPasswordInput:
    "cmacs-modal .trans-model-body nz-input-group > input",
  switchChangeButton:
    "cmacs-modal .trans-model-footer button.ant-btn-primary",

  // Import Project button and its file input
  importProjectButton:
    "information-panel > .ant-row > .ant-btn.ng-star-inserted",
  importProjectFileInput:
    "information-panel div.ant-row.advanced-button input[type='file']",

  // Advanced button (manual project creation)
  advancedButton:
    "information-panel > .ant-row > :nth-child(3)",

  // Project Type cards
  projectTypeNewBuilding:
    "general-information-panel div:nth-child(1) > div:nth-child(2) > div > div:nth-child(1) > cmacs-card",
  projectTypeRenovation:
    "general-information-panel div:nth-child(1) > div:nth-child(2) > div > div:nth-child(2) > cmacs-card",
  projectTypeAlteration:
    "general-information-panel div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > cmacs-card",
  projectTypeExtension:
    "general-information-panel div:nth-child(1) > div:nth-child(2) > div > div:nth-child(4) > cmacs-card",
  projectTypeDefineYourOwn:
    "general-information-panel div:nth-child(2) > div:nth-child(2) > input",

  // Basic Information (advanced mode after import)
  projectNumber: "basic-info-panel form > div > div:nth-child(6) input",
  statusDropdown:
    "basic-info-panel form > div > div:nth-child(5) cmacs-select > div > div",
  startDatePicker:
    "basic-info-panel form > div > div:nth-child(7) cmacs-date-picker",
  startDateClear:
    "basic-info-panel form > div > div:nth-child(7) cmacs-date-picker span.ant-picker-clear",

  // Location
  locationSearchInput:
    "app-address form div:nth-child(1) app-address-search input",
  locationDropdownList: "body > div:nth-child(14)",
  locationLine1:
    "app-address form > div:nth-child(2) > div:nth-child(1) input",
  locationCityTown:
    "app-address form > div:nth-child(3) > div:nth-child(1) input",
  locationState:
    "app-address form > div:nth-child(4) > div:nth-child(1) input",
  locationZipCode:
    "app-address form > div:nth-child(4) > div:nth-child(2) input",
  locationCountry:
    "app-address form > div:nth-child(5) > div input",

  // Sales
  bidTotal: "sales-panel div > div:nth-child(2) cmacs-input-number input",
  forecast: "sales-panel div > div:nth-child(3) cmacs-input-number input",
  currencyDropdown: "sales-panel div > div:nth-child(5) cmacs-select > div",

  // Folder Structure
  folderStructureTemplate: "documents-panel div cmacs-select > div",

  // Schedule Template
  scheduleTemplate: "schedule-panel div cmacs-select > div",

  // Teams
  teamsDropdown:
    "teams-panel div cmacs-search > cmacs-select > div.ant-select-selection",
  teamsDropdownList:
    "teams-panel div cmacs-search > cmacs-select > div.ant-select-dropdown",

  // Footer buttons
  nextButton: "cmacs-modal .creation-footer button.ant-btn-primary",
  createButton: "cmacs-modal .creation-footer button.ant-btn-primary",
  previousButton: "cmacs-modal .creation-footer button:nth-child(2)",
  cancelButton:
    "cmacs-modal .creation-footer button.floatleft.ant-btn-background-ghost",
};
