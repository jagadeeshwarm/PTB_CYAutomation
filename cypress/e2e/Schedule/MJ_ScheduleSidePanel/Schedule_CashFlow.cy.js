import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import { COMMON } from "../../../support/selectors";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.CASHFLOW;

describe("Cash Flow – Positive End-to-End Flow", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project");
      dashboardPage.selectWorkspaceByIndex(5);
    });
  });

  // ── Step 1: Login and Create Schedule ──────────────────────────────────

  it("Step 1a: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 1b: Create a Summary Task and a Child Task", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");

    // Add a child to make the first task a Summary Task
    taskCreationPage.selectLastTask();
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length", 2);
  });

  // ── Step 2: Add Forecast Value ─────────────────────────────────────────

  it("Step 2: Open Summary Task, navigate to Cash Flow tab, add Forecast €1,000 for Jun 2026", () => {
    // Select the parent/summary task (row 0)
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(500);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    // Add Forecast: Jun 2026, €1,000
    sidePanelPage.addForecastEntry("Jun 2026", 1000);

    // Verify
    sidePanelPage.verifyForecastTotal(1000);
    sidePanelPage.verifyForecastEntryCount(1);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 3: Add Actual Value ───────────────────────────────────────────

  it("Step 3: Add Actual Value €400 for Jun 2026", () => {
    sidePanelPage.addActualEntry("Jun 2026", 400);

    // Verify
    sidePanelPage.verifyActualTotal(400);
    sidePanelPage.verifyActualEntryCount(1);
    sidePanelPage.verifyBalanceToReceive(600);
  });

  // ── Step 4: Add Another Actual Value ───────────────────────────────────

  it("Step 4: Add another Actual Value €200 for Jul 2026", () => {
    sidePanelPage.addActualEntry("Jul 2026", 200);

    // Verify
    sidePanelPage.verifyActualTotal(600);
    sidePanelPage.verifyActualEntryCount(2);
    sidePanelPage.verifyBalanceToReceive(400);
  });

  // ── Step 5: Edit Actual Value ──────────────────────────────────────────

  it("Step 5: Edit the Jun 2026 actual entry from €400 to €500", () => {
    // Jun 2026 is the first actual entry (index 0)
    sidePanelPage.editActualEntry(0, 500);

    // Verify
    sidePanelPage.verifyActualTotal(700);
    sidePanelPage.verifyBalanceToReceive(300);
  });

  // ── Step 6: Add Another Forecast Entry ─────────────────────────────────

  it("Step 6: Add Forecast €1,500 for Aug 2026", () => {
    sidePanelPage.addForecastEntry("Aug 2026", 1500);

    // Verify
    sidePanelPage.verifyForecastTotal(2500);
    sidePanelPage.verifyForecastEntryCount(2);
    sidePanelPage.verifyBalanceToReceive(1800);
  });

  // ── Step 7: Delete a Forecast Entry ────────────────────────────────────

  it("Step 7: Delete the Jun 2026 forecast entry (€1,000)", () => {
    // Jun 2026 is the first forecast entry (index 0)
    sidePanelPage.deleteForecastEntry(0);

    // Verify
    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyForecastEntryCount(1);
    sidePanelPage.verifyBalanceToReceive(800);
  });

  // ── Step 8: Delete an Actual Entry ─────────────────────────────────────

  it("Step 8: Delete the Jul 2026 actual entry (€200)", () => {
    // After the Jun edit (€500), Jul (€200) is the second entry (index 1)
    sidePanelPage.deleteActualEntry(1);

    // Verify
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyActualEntryCount(1);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 9: Verify Data Persistence ────────────────────────────────────

  it("Step 9: Refresh the page and verify data persists", () => {
    cy.reload();
    cy.get(".gantt_grid_data", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);

    // Re-select the summary task and open Cash Flow tab
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(500);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    // Verify all values remain unchanged
    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyForecastEntryCount(1);
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyActualEntryCount(1);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 10: Outdent Child Task ────────────────────────────────────────

  it("Step 10: Outdent the child task and verify Cash Flow data is retained", () => {
    sidePanelPage.close();

    // Outdent the child (row 1)
    taskCreationPage.outdentTaskAtRow(1);

    // Select the summary task (row 0) and verify Cash Flow data
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 11: Indent Child Task Back ────────────────────────────────────

  it("Step 11: Indent the task back under the Summary Task and verify data intact", () => {
    sidePanelPage.close();

    // Indent row 1 back under row 0
    taskCreationPage.indentTaskAtRow(1);

    // Select the summary task (row 0) and verify Cash Flow data
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 12: Assign Resource ───────────────────────────────────────────

  it("Step 12: Assign a resource and verify Cash Flow values remain unchanged", () => {
    // Open Resources tab for the summary task
    sidePanelPage.openResourcesTab();
    sidePanelPage.clickResourcesAddButton();
    sidePanelPage.selectResource("User MJ");
    sidePanelPage.setResourceAllocation(100);
    sidePanelPage.saveResourceAllocation();

    // Reload and re-verify
    cy.reload();
    cy.get(".gantt_grid_data", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);

    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();

    // Verify resource persists
    sidePanelPage.openResourcesTab();
    sidePanelPage.verifyResourceInList();

    // Verify Cash Flow values unchanged
    sidePanelPage.openCashFlowTab();
    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 13: Permission Validation ─────────────────────────────────────

  it("Step 13a: Logout, login as Non-PM user, verify Cash Flow tab is not visible", () => {
    sidePanelPage.close();

    // Logout
    cy.get(COMMON.userMenuTrigger).click();
    cy.wait(500);
    cy.get(COMMON.logoutButton).click();
    cy.wait(2000);

    // Login as Non-PM user
    cy.fixture("users").then((users) => {
      loginPage.login(users.nonPmUser.email, users.nonPmUser.password);
    });
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();

    // Navigate to the same project and schedule
    dashboardPage.openProjectBySearch("Automation Project");
    dashboardPage.selectWorkspaceByIndex(5);
    schedulePage.openScheduleByName(SCHEDULE_NAME);

    // Open side panel and verify Cash Flow tab is NOT present
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.verifyNoCashFlowTab();
  });

  it("Step 13b: Logout Non-PM user, login as PM user, verify Cash Flow data is accessible", () => {
    sidePanelPage.close();

    // Logout Non-PM user
    cy.get(COMMON.userMenuTrigger).click();
    cy.wait(500);
    cy.get(COMMON.logoutButton).click();
    cy.wait(2000);

    // Login as PM user
    cy.fixture("users").then((users) => {
      loginPage.login(users.testUser.email, users.testUser.password);
    });
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();

    // Navigate to the same project and schedule
    dashboardPage.openProjectBySearch("Automation Project");
    dashboardPage.selectWorkspaceByIndex(5);
    schedulePage.openScheduleByName(SCHEDULE_NAME);

    // Open side panel and verify Cash Flow data still correct
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    sidePanelPage.open();
    sidePanelPage.openCashFlowTab();

    sidePanelPage.verifyForecastTotal(1500);
    sidePanelPage.verifyActualTotal(500);
    sidePanelPage.verifyBalanceToReceive(1000);
  });

  // ── Step 14: Delete Schedule ───────────────────────────────────────────

  it("Step 14: Delete the schedule and verify it is removed", () => {
    sidePanelPage.close();
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
