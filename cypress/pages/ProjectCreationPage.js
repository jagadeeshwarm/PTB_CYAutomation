import { PROJECT_CREATION, COMMON } from "../support/selectors";
import dashboardPage from "./DashboardPage";

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

  clickAdvanced() {
    cy.get(PROJECT_CREATION.advancedButton).click();
    cy.wait(5000);
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
    cy.get(typeMap[type] || typeMap["New Building"], { timeout: 15000 })
      .should("be.visible")
      .click();
    cy.wait(500);
  }

  // --- Navigation buttons ---

  clickNext() {
    cy.get(PROJECT_CREATION.nextButton).click();
    cy.wait(2000);
  }

  // Click Next and confirm the wizard reached `toPanel`. If it didn't — and
  // we're demonstrably still on `fromPanel` — click once more. Checking that
  // `fromPanel` is still mounted is what makes the retry safe: without it, a
  // slow-rendering `toPanel` would get a second click and skip a step.
  clickNextTo(fromPanel, toPanel) {
    cy.get(PROJECT_CREATION.nextButton).click();
    cy.wait(2000);
    cy.get("body").then(($body) => {
      const arrived = $body.find(toPanel).length > 0;
      const stillHere = $body.find(fromPanel).length > 0;
      if (!arrived && stillHere) {
        cy.log("[wizard] Next did not advance — retrying once");
        cy.get(PROJECT_CREATION.nextButton).click();
        cy.wait(2000);
      }
    });
    cy.get(toPanel, { timeout: 15000 }).should("exist");
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

  clearAndTypeProjectName(projectName) {
    cy.get(PROJECT_CREATION.projectName).clear().type(projectName);
    cy.wait(500);
  }

  // The Project Number field runs an async uniqueness validator on every
  // keystroke (POST /Project/IsProjectNumberValid). While any response is
  // outstanding the Angular form sits in PENDING state — the Next button stays
  // *enabled* but its handler silently no-ops, so the wizard never advances.
  // Type, then wait for the validator to go quiet before anyone clicks Next.
  clearAndTypeProjectNumber(projectNumber) {
    cy.intercept("POST", "**/IsProjectNumberValid*").as("projectNumberCheck");
    cy.get(PROJECT_CREATION.projectNumber).clear().type(projectNumber);
    // Guarantees at least one call was captured, so the alias below resolves.
    cy.wait("@projectNumberCheck");
    this._waitForProjectNumberIdle();
  }

  // Poll until every captured IsProjectNumberValid call has a response AND no
  // new call was issued since the previous poll — i.e. the debounced validator
  // has settled, not just answered the request we happened to catch first.
  _waitForProjectNumberIdle(prevTotal = -1, attempt = 0, maxAttempts = 20) {
    cy.wait(500);
    cy.get("@projectNumberCheck.all").then((calls) => {
      const total = calls.length;
      const answered = calls.every((c) => c.response);
      if (attempt >= maxAttempts) {
        cy.log("[wizard] project-number validator never settled — continuing");
        return;
      }
      if (answered && total === prevTotal) return;
      this._waitForProjectNumberIdle(total, attempt + 1, maxAttempts);
    });
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

  searchAndSelectLocation(searchText, selectionText) {
    cy.get(PROJECT_CREATION.locationSearchInput).clear().type(searchText);
    cy.wait(2000);
    cy.get(".pac-container .pac-item:visible").contains(selectionText).click();
    cy.wait(2000);
  }

  fillLocationFields(line1, city, state, zip, country) {
    cy.get(PROJECT_CREATION.locationLine1).clear().type(line1);
    cy.get(PROJECT_CREATION.locationCityTown).clear().type(city);
    cy.get(PROJECT_CREATION.locationState).clear().type(state);
    cy.get(PROJECT_CREATION.locationZipCode).clear().type(zip);
    cy.get(PROJECT_CREATION.locationCountry).clear().type(country);
    cy.wait(1000);
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
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .not(":has(input)")
      .first()
      .click();
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
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .not(":has(input)")
      .first()
      .click();
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

  // Opens the teams dropdown, types the team name into the search field to
  // filter the list, then clicks the match. Do NOT press {esc} — it closes
  // the wizard modal itself, not just the dropdown.
  selectTeam(teamName) {
    this.openTeamsDropdown();
    cy.get(PROJECT_CREATION.teamsSearchInput)
      .clear({ force: true })
      .type(teamName, { force: true });
    cy.wait(800);
    cy.get(PROJECT_CREATION.teamsDropdownList)
      .find("li")
      .contains(teamName)
      .click();
    cy.wait(800);
  }

  // --- Skip-template variants (TC01) ---
  // The Folder Structure and Schedule Template steps are optional after import.
  // The "Skip" action is just clickNext without selecting anything.
  skipFolderStructureTemplate() {
    this.clickNext();
  }

  skipScheduleTemplate() {
    this.clickNext();
  }

  // --- Project ID capture (after create) ---
  // After project creation the URL becomes /app/project/portal/<projectId>.
  // Extract the trailing UUID so subsequent test cases can deep-link.
  captureProjectIdFromUrl(alias = "projectId") {
    return cy.url().then((url) => {
      // Match a UUID-shaped segment anywhere in the path, prefer the last one.
      const matches = url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      const projectId = matches ? matches[matches.length - 1] : null;
      expect(projectId, `Captured project ID from URL: ${url}`).to.exist;
      // Return the chainable from cy.wrap so the alias is set BEFORE the
      // outer chain resolves. Don't return a sync value here — Cypress
      // disallows mixing sync returns with cy commands inside .then().
      return cy.wrap(projectId).as(alias);
    });
  }

  // --- Project deletion (TC08) ---
  // Navigate to the Projects page, click the project card matching the name,
  // and use the card's context menu / delete option.
  navigateToProjectsList() {
    cy.visit("/app/projects");
    cy.wait(2000);
    dashboardPage.waitForPageLoad();
    dashboardPage.closeFavoritesIfPresent();
    // The list lands on "Recently Opened" by default and search results only
    // render under the ACTIVE tab. Switch to "All" or both the delete lookup
    // and the post-delete assertion end up querying an empty list.
    dashboardPage.selectAllProjectsTab();
  }

  // Projects list → "All" tab → search for the project. Used both before the
  // delete (to find the card) and after it (to prove the card is really gone).
  findProjectInAllTab(projectIdentifier) {
    this.navigateToProjectsList();
    dashboardPage.searchProject(projectIdentifier);
  }

  // Click the card whose title contains the given project name/number.
  clickProjectCardByText(text) {
    cy.contains("app-project-card, .project-card, cmacs-card", text, {
      timeout: 20000,
    })
      .first()
      .click();
    cy.wait(1500);
  }

  // Open the more-actions menu on the project card and click Delete.
  // Then confirm in the danger modal. Selectors are intentionally broad —
  // the projects page UI varies across builds.
  deleteCurrentProject() {
    cy.get("body").then(($body) => {
      // Try a dedicated delete icon on the project header first
      const $deleteBtn = $body.find(
        "[data-test='project-delete'], button:has(i.iconUILarge-Trash), button:has(i.iconUISmall-Trash)",
      );
      if ($deleteBtn.length > 0) {
        cy.wrap($deleteBtn).first().click({ force: true });
      } else {
        // Fall back to a kebab/more menu then a Delete menu item
        cy.get("button:has(i.iconUILarge-Dots), button:has(i.iconUISmall-Dots)")
          .first()
          .click({ force: true });
        cy.wait(500);
        cy.contains(`${COMMON.overlayContainer} li, ${COMMON.overlayContainer} a`, /delete/i)
          .click({ force: true });
      }
    });
    cy.wait(500);
    // Confirm in danger modal
    cy.get(COMMON.modalDangerButton, { timeout: 10000 }).click();
    cy.wait(3000);
  }

  // Re-navigate to "All", search the project number again, and assert nothing
  // comes back. Searching first is what makes this a real assertion — asserting
  // absence on an unsearched "Recently Opened" tab passes trivially.
  verifyProjectNotInList(projectIdentifier) {
    this.findProjectInAllTab(projectIdentifier);
    cy.contains(projectIdentifier).should("not.exist");
  }
}

export default new ProjectCreationPage();
