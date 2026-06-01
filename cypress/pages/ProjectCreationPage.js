import { PROJECT_CREATION, COMMON } from "../support/selectors";

class ProjectCreationPage {
  // --- Company switching ---

  clickUserIcon() {
    cy.get(PROJECT_CREATION.userIcon).click();
    cy.wait(1000);
  }

  searchCompany(companyName) {
    cy.get(PROJECT_CREATION.companySearchInput).clear().type(companyName);
    cy.wait(1000);
  }

  selectFirstCompanyCard() {
    cy.get(PROJECT_CREATION.companyCard).click();
    cy.wait(2000);
  }

  enterSwitchPassword(password) {
    cy.get(PROJECT_CREATION.switchPasswordInput).clear().type(password);
    cy.wait(500);
  }

  clickChangeButton() {
    cy.get(PROJECT_CREATION.switchChangeButton).click();
    cy.wait(5000);
  }

  switchCompany(companyName, password) {
    this.clickUserIcon();
    this.searchCompany(companyName);
    this.selectFirstCompanyCard();
    this.enterSwitchPassword(password);
    this.clickChangeButton();
  }

  // --- New Project / Import flow ---

  clickNewButton() {
    cy.contains("button", /new/i).click();
    cy.wait(2000);
  }

  clickImportProject() {
    cy.get(PROJECT_CREATION.importProjectButton).first().click();
    cy.wait(1000);
  }

  importProjectFile(fixtureFileName) {
    // The Import Project button triggers a native file dialog.
    // Cypress cannot interact with native dialogs, so we attach the file
    // directly to the hidden file input that the button controls.
    cy.get("cmacs-modal input[type='file']").last().selectFile(
      `cypress/fixtures/${fixtureFileName}`,
      { force: true }
    );
    cy.wait(5000);
  }

  // --- Project Type ---

  selectProjectType(type) {
    const typeMap = {
      "New Building": PROJECT_CREATION.projectTypeNewBuilding,
      Renovation: PROJECT_CREATION.projectTypeRenovation,
      Alteration: PROJECT_CREATION.projectTypeAlteration,
      Extension: PROJECT_CREATION.projectTypeExtension,
    };
    cy.get(typeMap[type] || typeMap["New Building"]).click();
    cy.wait(500);
  }

  // --- Navigation buttons ---

  clickNext() {
    cy.get(PROJECT_CREATION.nextButton).click();
    cy.wait(2000);
  }

  clickCreate() {
    cy.get(PROJECT_CREATION.createButton).click();
    cy.wait(5000);
  }

  clickPrevious() {
    cy.get(PROJECT_CREATION.previousButton).click();
    cy.wait(1000);
  }

  clickCancel() {
    cy.get(PROJECT_CREATION.cancelButton).click();
    cy.wait(1000);
  }

  // --- Basic Information ---

  clearAndTypeProjectNumber(projectNumber) {
    cy.get(PROJECT_CREATION.projectNumber).clear().type(projectNumber);
    cy.wait(500);
  }

  selectStatus(statusText) {
    cy.get(PROJECT_CREATION.statusDropdown).click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} div:visible`)
      .contains(statusText)
      .click();
    cy.wait(500);
  }

  clearStartDate() {
    cy.get(PROJECT_CREATION.startDatePicker).trigger("mouseenter");
    cy.wait(300);
    cy.get(PROJECT_CREATION.startDateClear).click({ force: true });
    cy.wait(500);
  }

  selectCurrentStartDate() {
    cy.get(PROJECT_CREATION.startDatePicker).click();
    cy.wait(500);
    cy.get(".ant-picker-dropdown:visible .ant-picker-cell-today").click();
    cy.wait(500);
  }

  // --- Location ---

  searchLocation(locationText) {
    cy.get(PROJECT_CREATION.locationSearchInput).clear().type(locationText);
    cy.wait(2000);
  }

  selectLocationFromDropdown(locationLabel) {
    cy.get(COMMON.overlayContainer)
      .find("li:visible, div:visible")
      .contains(locationLabel)
      .click();
    cy.wait(2000);
  }

  setLocation(searchText, selectionLabel) {
    this.searchLocation(searchText);
    this.selectLocationFromDropdown(selectionLabel);
  }

  // --- Sales ---

  verifyBidTotal(expectedValue) {
    cy.get(PROJECT_CREATION.bidTotal).should("have.value", expectedValue);
  }

  verifyForecast(expectedValue) {
    cy.get(PROJECT_CREATION.forecast).should("have.value", expectedValue);
  }

  verifyCurrency(expectedCurrency) {
    cy.get(PROJECT_CREATION.currencyDropdown).should(
      "contain.text",
      expectedCurrency
    );
  }

  // --- Folder Structure ---

  selectFolderStructureTemplate(templateName) {
    cy.get(PROJECT_CREATION.folderStructureTemplate).click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .contains(templateName)
      .click();
    cy.wait(1000);
  }

  selectFirstFolderStructureTemplate() {
    cy.get(PROJECT_CREATION.folderStructureTemplate).click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul:visible li`).first().click();
    cy.wait(1000);
  }

  // --- Schedule Template ---

  selectScheduleTemplate(templateName) {
    cy.get(PROJECT_CREATION.scheduleTemplate).click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .contains(templateName)
      .click();
    cy.wait(1000);
  }

  selectFirstScheduleTemplate() {
    cy.get(PROJECT_CREATION.scheduleTemplate).click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul:visible li`).first().click();
    cy.wait(1000);
  }

  // --- Teams ---

  openTeamsDropdown() {
    cy.get(PROJECT_CREATION.teamsDropdown).click();
    cy.wait(500);
  }

  selectAllTeams() {
    this.openTeamsDropdown();
    cy.get(PROJECT_CREATION.teamsDropdownList)
      .find("li:visible")
      .contains(/select all/i)
      .click();
    cy.wait(1000);
  }
}

export default new ProjectCreationPage();
