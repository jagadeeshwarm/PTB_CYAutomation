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
