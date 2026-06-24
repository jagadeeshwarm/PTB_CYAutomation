import { TIMESHEET, RESOURCE_USAGE } from "../../support/selectors";
import sidePanelPage from "./SidePanelPage";

class TimesheetPage {
  openTimesheetTab() {
    cy.get(TIMESHEET.tabIcon).click();
    cy.wait(500);
  }

  // Click "Add Timesheet", enter hours, and confirm.
  addTimesheet(hours) {
    cy.get(TIMESHEET.addButton).click();
    cy.wait(800);

    // Use {selectall}{backspace} — .clear() sends {del} which can trigger
    // the app's global "Delete Task" shortcut even inside a modal.
    cy.get(TIMESHEET.effortInput)
      .type("{selectall}{backspace}")
      .type(String(hours));
    cy.wait(300);

    cy.get(TIMESHEET.confirmButton).click();
    cy.wait(5000);
  }

  // Close side panel first (it overlays the toolbar), then open Resource Usage.
  openResourceUsage() {
    sidePanelPage.close();
    cy.get(RESOURCE_USAGE.resourceIcon).closest("button").click();
    cy.wait(5000);
    cy.contains(RESOURCE_USAGE.menuItems, "Resource Usage").click();
    cy.wait(1000);
  }

  // Resource Usage shows Group → Resource → Task, all collapsed at start.
  // Expand the group row to reveal the resource row, then expand the
  // resource row to reveal the task row, then verify the task row's
  // ACTUAL WORK cell matches the timesheet entry.
  expandResourceAndVerifyActualWork(resourceName, expectedHours) {
    const expectedText = `${expectedHours}h`;

    // 1. Expand the first collapsed row (group: Einkauf)
    cy.get(RESOURCE_USAGE.expandIcon).first().click();
    cy.wait(500);

    // 2. Expand the resource row (User MJ) — now visible after group expand
    cy.contains(RESOURCE_USAGE.resourceRows, resourceName)
      .find(RESOURCE_USAGE.expandIcon)
      .click();
    cy.wait(500);

    // 3. After two expansions the task is the 3rd row; verify its ACTUAL WORK
    cy.get(RESOURCE_USAGE.resourceRows)
      .eq(2)
      .find(RESOURCE_USAGE.actualWorkCell)
      .should("contain.text", expectedText);
  }
}

export default new TimesheetPage();
