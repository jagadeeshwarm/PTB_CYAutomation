import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import { COMMON } from "../../../support/selectors";

const SCHEDULE_NAME = "Automation_cashflow";

describe("Schedule - Cash Flow Verification", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project");
      dashboardPage.selectWorkspaceByIndex(5);
    });
  });

  it("Step 1: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 2: Create task + child, open Cash Flow tab, enter forecast 1000, verify reference amount", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");

    // Add a child to the task
    taskCreationPage.selectLastTask();
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length", 2);

    // Select the parent/summary task (Row 0) — must use getTaskRows().eq(0)
    // because selectFirstTask() targets gantt_row_task and skips project rows
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(500);
    sidePanelPage.open();

    // Navigate to the Cash Flow tab
    sidePanelPage.openCashFlowTab();

    // Enter forecast amount and submit
    sidePanelPage.setCashFlowForecast(1000);
    sidePanelPage.clickCashFlowAddValue();

    // Verify Reference Amount (balance value) shows 1000
    sidePanelPage.verifyCashFlowReferenceAmount("1000");
  });

  it("Step 3: Click Add Value again, fill popup (random month, value 100, note Cashflow1), confirm, verify actual value", () => {
    // Click Add Value a second time to open the cash flow entry popup
    sidePanelPage.clickCashFlowAddValue();

    // Select a month from the month/year picker
    sidePanelPage.selectCashFlowPopupMonth();

    // Enter value and note
    sidePanelPage.setCashFlowPopupValue(100);
    sidePanelPage.setCashFlowPopupNote("Cashflow1");

    // Confirm the popup
    sidePanelPage.confirmCashFlowPopup();

    // Verify Actual Value reflects the entered amount
    sidePanelPage.verifyCashFlowActualValue("100");
  });

  it("Step 4: Verify balance (1000-100=900), verify month entry, edit 100→400 (month read-only), confirm", () => {
    // Balance = Reference (1000) - Actual (100) = 900
    sidePanelPage.verifyCashFlowReferenceAmount("900");

    // The cashflow entry added in Step 3 should appear in the list
    sidePanelPage.verifyCashFlowListEntryVisible();

    // Open the edit popup for the first cashflow entry
    sidePanelPage.clickCashFlowEditIcon();

    // Month field must not be editable in edit mode
    sidePanelPage.verifyCashFlowPopupMonthNotEditable();

    // Clear the existing value (100) and enter 400
    sidePanelPage.editCashFlowPopupValue(400);

    // Confirm the edit
    sidePanelPage.confirmCashFlowPopup();
  });

  it("Step 4a: Verify updated balance (1000-400=600), then delete the cashflow entry", () => {
    // Balance = Reference (1000) - updated Actual (400) = 600
    sidePanelPage.verifyCashFlowReferenceAmount("600");

    // Delete the cashflow entry
    sidePanelPage.clickCashFlowDeleteIcon();
  });

  it("Step 5: Outdent child task, verify row-0 cashflow is editable and readable", () => {
    // Close the side panel so the row-click registers cleanly
    sidePanelPage.close();

    // Outdent the child (row-1) via right-click context menu
    // → row-0 is no longer a summary task after this
    taskCreationPage.outdentTaskAtRow(1);

    // Select the (now regular) task at row-0 and open its Cash Flow tab
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    // Verify the forecast input is NOT editable — row-0 is now a regular task,
    // only summary tasks allow cashflow forecast editing
    sidePanelPage.verifyCashFlowForecastNotEditable();

    // Verify the reference amount is still visible — "readable"
    sidePanelPage.verifyCashFlowReferenceVisible();
  });

  it("Step 5a: Indent child task back, verify cashflow is editable in row-0 (summary task)", () => {
    // Close side panel so the indent context menu is not blocked
    sidePanelPage.close();

    // Indent row-1 back under row-0 → row-0 becomes a summary task again
    taskCreationPage.indentTaskAtRow(1);

    // Select row-0 (now summary/parent task again) and check cashflow
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    // Verify the forecast input is still editable in the summary task
    sidePanelPage.verifyCashFlowForecastEditable();
  });

  it("Step 6: Add resource 'Jagadeeshwar M test' to row-0, verify after page reload", () => {
    // Close side panel, then select row-0 (Task-1 / summary task)
    sidePanelPage.close();
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();

    // Open the Resources tab in the side panel
    sidePanelPage.openResourcesTab();

    // Click the Add button to open the resource allocation popup
    sidePanelPage.clickResourcesAddButton();

    // Select "Jagadeeshwar M test" from the Resources dropdown
    sidePanelPage.selectResource("Jagadeeshwar M test");

    // Set allocation to 100 %
    sidePanelPage.setResourceAllocation(100);

    // Save the allocation
    sidePanelPage.saveResourceAllocation();

    // Reload page and wait for the gantt to re-render
    cy.reload();
    cy.get(".gantt_grid_data", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);

    // Re-open the side panel for row-0 and navigate to Resources tab
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openResourcesTab();

    // Click the section title and verify at least one resource name appears in the list
    sidePanelPage.verifyResourceInList();
  });

  it("Step 6a: Logout, login as Non-PM user, verify no Cash Flow tab in side panel", () => {
    // Close the side panel before logging out
    sidePanelPage.close();

    // --- Logout ---
    cy.get(COMMON.userMenuTrigger).click();
    cy.wait(500);
    cy.get(COMMON.logoutButton).click();
    cy.wait(2000);

    // --- Login as Non-PM user ---
    cy.fixture("users").then((users) => {
      loginPage.login(users.nonPmUser.email, users.nonPmUser.password);
    });
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();

    // --- Navigate to the same project and schedule ---
    dashboardPage.openProjectBySearch("Automation Project");
    dashboardPage.selectWorkspaceByIndex(5);
    schedulePage.openScheduleByName(SCHEDULE_NAME);

    // --- Click a task row and open the side panel ---
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();

    // --- Verify Cash Flow tab is NOT present for Non-PM user ---
    sidePanelPage.verifyNoCashFlowTab();
  });

  it("Step 7: Logout Non-PM user, login as PM user, delete the schedule", () => {
    // Close the side panel before logging out
    sidePanelPage.close();

    // --- Logout Non-PM user ---
    cy.get(COMMON.userMenuTrigger).click();
    cy.wait(500);
    cy.get(COMMON.logoutButton).click();
    cy.wait(2000);

    // --- Login as PM user ---
    cy.fixture("users").then((users) => {
      loginPage.login(users.testUser.email, users.testUser.password);
    });
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();

    // --- Navigate to the same project and schedule list ---
    dashboardPage.openProjectBySearch("Automation Project");
    dashboardPage.selectWorkspaceByIndex(5);

    // --- Delete the schedule and verify it no longer exists ---
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });

  // it("Step 5: Set forecast to -1000, add actual 100, verify balance adds (−1000+100=−900)", () => {
  //   // Clear the existing forecast and enter -1000
  //   sidePanelPage.setCashFlowForecast(-1000);
  //   sidePanelPage.clickCashFlowAddValue();

  //   // Open the Add Value popup (second click)
  //   sidePanelPage.clickCashFlowAddValue();

  //   // Fill the popup: pick a month, enter value 100, confirm
  //   sidePanelPage.selectCashFlowPopupMonth();
  //   sidePanelPage.setCashFlowPopupValue(100);
  //   sidePanelPage.confirmCashFlowPopup();

  //   // With a negative forecast the actual ADDS to the balance:
  //   // Balance = −1000 + 100 = −900
  //   sidePanelPage.verifyCashFlowReferenceAmount(-900);
  // });

  // [Superseded by Step 7] Delete schedule after PM user re-login
  // it("Step 6: Go back to schedule list, delete the created schedule, verify deleted", () => {
  //   schedulePage.goBackToScheduleList();
  //   schedulePage.deleteScheduleByName(SCHEDULE_NAME);
  //   schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  // });
});
