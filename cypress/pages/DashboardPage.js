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

  openProjectBySearch(projectName) {
    this.waitForPageLoad();
    this.closeFavoritesIfPresent();
    this.searchProject(projectName);
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
