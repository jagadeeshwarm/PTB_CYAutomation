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

  // Import Project button (from the New modal right panel)
  importProjectButton:
    "information-panel div.ant-row.advanced-button > button.ant-btn-default",

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

  // Basic Information
  projectName:
    "simple-basic-info-panel form div:nth-child(1) div.ant-col-10 cmacs-open-input > input",
  uploadFileButton:
    "simple-basic-info-panel form div:nth-child(1) div.ant-col-12 app-upload-file nz-upload button",
  description: "#tinymce",
  projectNumber: "basic-info-panel form > div > div:nth-child(6) input",
  statusDropdown: "basic-info-panel form > div > div:nth-child(5) cmacs-select > div > div",
  startDatePicker: "basic-info-panel form > div > div:nth-child(7) cmacs-date-picker",
  startDateClear:
    "basic-info-panel form > div > div:nth-child(7) cmacs-date-picker span.ant-picker-clear",
  fulfillmentDatePicker:
    "basic-info-panel form > div > div:nth-child(8) cmacs-date-picker",
  buildingTypeDropdown:
    "basic-info-panel form > div > div:nth-child(9) cmacs-select > div",
  metricSystem: "basic-info-panel form > div > div:nth-child(11) cmacs-card",
  imperialSystem: "basic-info-panel form > div > div:nth-child(12) cmacs-card",
  externalProjectNumber:
    "basic-info-panel form > div > div:nth-child(13) input",

  // Location
  locationSearchInput:
    "app-address form div:nth-child(1) app-address-search input",

  // Sales
  bidTotal: "sales-panel div > div:nth-child(2) cmacs-input-number input",
  forecast: "sales-panel div > div:nth-child(3) cmacs-input-number input",
  currencyDropdown: "sales-panel div > div:nth-child(5) cmacs-select > div",

  // Folder Structure
  folderStructureTemplate: "documents-panel div cmacs-select > div",

  // Schedule Template
  scheduleTemplate: "schedule-panel div cmacs-select > div",

  // Teams
  teamsDropdown: "teams-panel div cmacs-search > cmacs-select > div.ant-select-selection",
  teamsDropdownList:
    "teams-panel div cmacs-search > cmacs-select > div.ant-select-dropdown",

  // Footer buttons
  nextButton:
    "cmacs-modal .creation-footer button.ant-btn-primary",
  createButton:
    "cmacs-modal .creation-footer button.ant-btn-primary",
  previousButton:
    "cmacs-modal .creation-footer button:nth-child(2)",
  cancelButton:
    "cmacs-modal .creation-footer button.floatleft.ant-btn-background-ghost",

  // Essentials side panel
  essentialsTab:
    "app-project-side-panel cmacs-tabs-nav div.ant-tabs-tab-active > div",
  essentialsProjectDetails:
    "app-essentials-panel cmacs-tabset div.ant-tabs-tabpane-active",
};
