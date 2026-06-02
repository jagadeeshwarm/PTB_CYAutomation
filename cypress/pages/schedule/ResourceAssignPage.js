import { TASK, RESOURCE_ASSIGN } from "../../support/selectors";

class ResourceAssignPage {
  // Left-click to select task, right-click to open context menu,
  // choose "Assign Resources/Teams", search by display name,
  // select from dropdown, and save.
  assignResourceViaContextMenu(taskName, resourceName) {
    cy.contains(TASK.ganttCell, taskName).click();
    cy.wait(300);
    cy.contains(TASK.ganttCell, taskName).rightclick();
    cy.wait(500);

    cy.contains(RESOURCE_ASSIGN.contextMenuItems, "Assign Resources/Teams").click();
    cy.wait(800);

    cy.get(RESOURCE_ASSIGN.searchInput).type(resourceName);
    cy.wait(800);

    cy.contains(RESOURCE_ASSIGN.dropdownMenuItems, resourceName).click();
    cy.wait(500);

    // The CDK overlay backdrop remains open after selecting the resource,
    // blocking normal clicks. Use { force: true } to click through it.
    cy.get(RESOURCE_ASSIGN.saveButton).click({ force: true });
    cy.wait(1000);
  }
}

export default new ResourceAssignPage();
