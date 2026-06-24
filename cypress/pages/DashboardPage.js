import { DASHBOARD, COMMON } from "../support/selectors";

class DashboardPage {
  get projectCards() {
    return cy.get(DASHBOARD.projectCards);
  }

  get workspaceSelector() {
    return cy.get(DASHBOARD.workspaceSelector);
  }

  openProject(index) {
    this.projectCards.eq(index).dblclick();
    cy.wait(2000);
  }

  waitForPageLoad() {
    // First attempt — check if dashboard loaded
    cy.wait(2000);
    cy.get("body").then(($body) => {
      if ($body.find(DASHBOARD.projectListHeader).length === 0) {
        // Dashboard not loaded — hard reload and retry once
        cy.reload(true);
        cy.wait(2000);
      }
    });
    // Final assertion — if still missing after retry, this throws the real error
    cy.get(DASHBOARD.projectListHeader, { timeout: 15000 }).should("exist");
    cy.wait(1000);
  }

  closeFavoritesIfPresent() {
    cy.get("body").then(($body) => {
      const $closeBtn = $body.find(".iconUISmall-Close:visible");
      if ($closeBtn.length > 0) {
        cy.wrap($closeBtn.first()).click();
        cy.wait(500);
      }
    });
  }

  // Default landing tab after login is "Recently Opened". Switch to "All"
  // so search covers every project in the company.
  selectAllProjectsTab() {
    cy.get("body").then(($body) => {
      if ($body.find(DASHBOARD.projectsAllTab).length > 0) {
        cy.get(DASHBOARD.projectsAllTab).first().click();
        cy.wait(1000);
      }
    });
  }

  searchProject(projectName) {
    cy.get(DASHBOARD.searchIcon).click();
    cy.wait(500);
    cy.get(DASHBOARD.searchInput).type(projectName);
    cy.get(DASHBOARD.activeSearchIcon).click();
    cy.wait(1500);
  }

  openSearchedProject(projectName) {
    // Exact match only: cy.contains() is a substring match, so "Automation
    // Project" would otherwise open the "Automation Project 2" card. We pick the
    // card that has a leaf element whose trimmed text equals the name exactly.
    cy.get(DASHBOARD.searchedProjectCard)
      .filter((_i, card) =>
        Cypress.$(card)
          .find("*")
          .toArray()
          .some(
            (el) =>
              el.childElementCount === 0 &&
              el.textContent.trim() === projectName
          )
      )
      .first()
      .find(DASHBOARD.searchedProjectCardBody)
      .dblclick();
    cy.wait(2000);
  }

  /**
   * Switch to the "All" projects tab if the tab strip is present. Search results
   * only render under the active tab, and the default ("Recently Opened") may
   * not contain the target project — so "All" is required to find it.
   */
  selectAllProjectsTabIfPresent() {
    cy.get("body").then(($body) => {
      const $all = [
        ...$body.find(`${DASHBOARD.projectTabBtn}:visible`),
      ].find((el) => el.textContent.trim() === "All");
      if ($all) {
        cy.wrap($all).click();
        cy.wait(1500);
      }
    });
  }

  openProjectBySearch(projectName) {
    this.waitForPageLoad();
    this.closeFavoritesIfPresent();
    this.selectAllProjectsTab();
    this.searchProject(projectName);
    // New dashboard: results are tab-scoped; "All" surfaces every match.
    this.selectAllProjectsTabIfPresent();
    this.openSearchedProject(projectName);
  }

  selectWorkspaceByIndex(childIndex) {
    this.workspaceSelector.click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul li:nth-child(${childIndex})`)
      .last()
      .click();
    cy.wait(2000);
  }

  selectWorkspaceByName(workspaceName) {
    this.workspaceSelector.click();
    cy.wait(500);
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .contains(workspaceName)
      .click();
    cy.wait(2000);
  }
}

export default new DashboardPage();
