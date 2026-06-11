import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import resourceAssignPage from "../../../pages/schedule/ResourceAssignPage";
import timesheetPage from "../../../pages/schedule/TimesheetPage";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.RESOURCES;
const TASK_COUNT = 5;
const ASSIGNED_TASK = "New Task - 1";
const RESOURCE_NAME = "User MJ";
const TIMESHEET_HOURS = 5;

// ─── PM Phase: Setup ─────────────────────────────────────────────────────────

describe("Schedule - Resources and Timesheet", () => {
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

  it("Step 1: Create a schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 2: Create 5 tasks", () => {
    for (let i = 0; i < TASK_COUNT; i++) {
      taskCreationPage.createTask();
    }
    taskCreationPage.verifyTaskCount(TASK_COUNT);
  });

  it("Step 3: Assign usermj to Task 1 via right-click context menu", () => {
    resourceAssignPage.assignResourceViaContextMenu(ASSIGNED_TASK, RESOURCE_NAME);
  });

  // ─── Non-PM Phase: Verification ──────────────────────────────────────────

  it("Step 4: Switch to non-PM user (usermj)", () => {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.nonPmUser.email, users.nonPmUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
    });
  });

  it("Step 5: Open Automation Project and navigate to the schedule as usermj", () => {
    dashboardPage.openProjectBySearch("Automation Project");
    dashboardPage.selectWorkspaceByIndex(5);
    schedulePage.openScheduleByName(SCHEDULE_NAME);
  });

  it("Step 6: Verify non-PM user has no Delete button in the left toolbar", () => {
    cy.get("#Delete").should("not.exist");
  });

  it("Step 7: Verify only the assigned task is visible (not all 5)", () => {
    taskCreationPage.verifyTaskCount(1);
    taskCreationPage.verifyTaskExists(ASSIGNED_TASK);
  });

  it("Step 8: Select Task 1 and open the side panel", () => {
    taskCreationPage.selectTask(ASSIGNED_TASK);
    sidePanelPage.open();
  });

  it("Step 9: Open Timesheet tab and add a timesheet entry", () => {
    timesheetPage.openTimesheetTab();
    timesheetPage.addTimesheet(TIMESHEET_HOURS);
  });

  it("Step 10: Open Resource Usage, expand resource row, and verify ACTUAL WORK matches timesheet entry", () => {
    timesheetPage.openResourceUsage();
    timesheetPage.expandResourceAndVerifyActualWork(RESOURCE_NAME, TIMESHEET_HOURS);
  });

  // ─── PM Phase: Cleanup ────────────────────────────────────────────────────

  it("Step 11: Switch back to PM for cleanup", () => {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project");
      dashboardPage.selectWorkspaceByIndex(5);
    });
  });

  it("Step 12: Delete the schedule (cleanup)", () => {
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
  });
});
