import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import { dateOffset } from "../../../support/utils/dateUtils";

const SCHEDULE_NAME = "Automation_status_check";

const STATUS = {
  BLANK: "BLANK",
  OVERDUE: "OVERDUE",
  DELAYED: "DELAYED",
  WIP: "WIP",
  COMPLETED: "COMPLETED",
  HOLD: "HOLD",
};

describe("Schedule - Task Status Verification", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProject(0);
      dashboardPage.selectWorkspaceByIndex(5);
    });
  });

  it("Step 1: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 2: Create a new task in the schedule", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
  });

  it("Step 3: Change start date to next day → status should be BLANK", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.setStartDate(dateOffset(1));
    taskCreationPage.verifyTaskStatus(STATUS.BLANK);
  });

  it("Step 4: Change start date to 10 days before today → status should be OVERDUE", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.setStartDate(dateOffset(-10));
    taskCreationPage.verifyTaskStatus(STATUS.OVERDUE);
  });

  it("Step 5: Change duration to 10 days → status should be DELAYED", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.setDuration(10);
    taskCreationPage.verifyTaskStatus(STATUS.DELAYED);
  });

  it("Step 6: Move end date 2 days earlier → status DELAYED, duration 8 days", () => {
    taskCreationPage.selectTask("New Task");
    // Read current end date from the cell and shift by -2 days (relative, not absolute)
    taskCreationPage.adjustEndDate(-2);
    taskCreationPage.verifyTaskStatus(STATUS.DELAYED);
    taskCreationPage.verifyDuration(8);
  });

  it("Step 7: Set % to 50 → status should be WIP", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.setPercent(50);
    taskCreationPage.verifyTaskStatus(STATUS.WIP);
  });

  it("Step 8: Set % to 100 → status should be COMPLETED", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.setPercent(100);
    taskCreationPage.verifyTaskStatus(STATUS.COMPLETED);
  });

  it("Step 9: Click On Hold checkbox → status should be HOLD", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.toggleOnHold();
    taskCreationPage.verifyTaskStatus(STATUS.HOLD);
  });
});
