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

  closeDefaultFavorites() {
    cy.get("body").then(($body) => {
      const $favoritesTag = $body
        .find(DASHBOARD.defaultFavoritesTag)
        .filter(":visible");

      if ($favoritesTag.length > 0) {
        cy.wrap($favoritesTag.first())
          .find(DASHBOARD.defaultFavoritesCloseIcon)
          .click();
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
    cy.contains(DASHBOARD.searchedProjectCard, projectName)
      .find(DASHBOARD.searchedProjectCardBody)
      .dblclick();
    cy.wait(2000);
  }


  openProjectBySearch(projectName) {
    this.closeDefaultFavorites();
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
}

export default new DashboardPage();
