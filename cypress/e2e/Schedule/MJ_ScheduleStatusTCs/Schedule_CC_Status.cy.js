import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import { dateOffset } from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.STATUS_CC;

const STATUS = {
  BLANK: "BLANK",
  OVERDUE: "OVERDUE",
  DELAYED: "DELAYED",
  WIP: "WIP",
  COMPLETED: "COMPLETED",
  HOLD: "HOLD",
};

describe("Schedule - Child of Child Task Status Verification", () => {
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

  it("Step 2: Create parent task, add child task, and add child task to the child task", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");

    // Click row 0 (parent) → add child. Row 1 (child) now exists.
    // NOTE: createTask() (which just clicks the top + button) does NOT add a
    // child when a row is selected — it has to be addChildViaPlusMenu() which
    // opens the + menu and explicitly clicks the Child option.
    taskCreationPage.selectTaskByRow(0);
    taskCreationPage.addChildViaPlusMenu();

    // Click the just-created child task → add child. Row 2 (child-of-child)
    // now exists. We use selectLastTask() (not selectTaskByRow(1)) because
    // immediately after addChild, the new row briefly enters inline-edit
    // state and loses the .gantt_row_task class — so .eq(1) finds nothing.
    // selectLastTask() uses .last() which tolerates that transient state.
    taskCreationPage.selectLastTask();
    taskCreationPage.addChildViaPlusMenu();

    taskCreationPage.getTaskCount().should("have.length", 3);
  });

  it("Step 3: Select child of child task - change start date to today + 1 - all tasks status BLANK", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setStartDate(dateOffset(1));
    taskCreationPage.verifyAllTasksStatus(STATUS.BLANK);
  });

  it("Step 4: Change start date to 10 days before today - all tasks status should be OVERDUE", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setStartDate(dateOffset(-10));
    taskCreationPage.verifyAllTasksStatus(STATUS.OVERDUE);
  });

  it("Step 5: Change duration to 10 days - all tasks status should be DELAYED", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setDuration(10);
    taskCreationPage.verifyAllTasksStatus(STATUS.DELAYED);
  });

  it("Step 6: Move end date 2 days earlier - status DELAYED, duration dynamic for all tasks", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.computeExpectedDurationAfterAdjust(-2).then((expectedDuration) => {
      taskCreationPage.adjustEndDate(-2);
      taskCreationPage.verifyAllTasksStatus(STATUS.DELAYED);
      taskCreationPage.verifyAllTasksDuration(expectedDuration);
    });
  });

  it("Step 7: Set % to 50 - all tasks status should be WIP", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setPercent(50);
    taskCreationPage.verifyAllTasksStatus(STATUS.WIP);
  });

  it("Step 8: Set % to 100 - all tasks status should be COMPLETED", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setPercent(100);
    taskCreationPage.verifyAllTasksStatus(STATUS.COMPLETED);
  });

  it("Step 9: Click On Hold checkbox - all tasks status should be HOLD", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.toggleOnHold();
    taskCreationPage.verifyAllTasksStatus(STATUS.HOLD);
  });

  it("Step 10: Go back to schedule list - Delete the created schedule - Validate deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
