import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";

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

  it("Step 5: Set forecast to -1000, add actual 100, verify balance adds (−1000+100=−900)", () => {
    // Clear the existing forecast and enter -1000
    sidePanelPage.setCashFlowForecast(-1000);
    sidePanelPage.clickCashFlowAddValue();

    // Open the Add Value popup (second click)
    sidePanelPage.clickCashFlowAddValue();

    // Fill the popup: pick a month, enter value 100, confirm
    sidePanelPage.selectCashFlowPopupMonth();
    sidePanelPage.setCashFlowPopupValue(100);
    sidePanelPage.confirmCashFlowPopup();

    // With a negative forecast the actual ADDS to the balance:
    // Balance = −1000 + 100 = −900
    sidePanelPage.verifyCashFlowReferenceAmount(-900);
  });

  it("Step 6: Go back to schedule list, delete the created schedule, verify deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
