import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import smartFilterPage from "../../../pages/schedule/SmartFilterPage";

const SCHEDULE_NAME = "Automation_smart_filters";
const TASK_COUNT = 10;
const WIP_STATUS = "WIP";
const HOLD_STATUS = "Hold";
const WIP_TASKS = ["New Task - 1", "New Task - 2"];
const HOLD_TASKS = ["New Task - 3", "New Task - 4"];

describe("Schedule - Smart Filters", () => {
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

  it("Step 2: Create 10 tasks for the current start date", () => {
    for (let index = 0; index < TASK_COUNT; index += 1) {
      taskCreationPage.createTask();
    }

    taskCreationPage.ensureAllColumnsVisible();
    taskCreationPage.verifyTaskCount(TASK_COUNT);
  });

  it("Step 3: Click Task 1 (Row 0), update % to 10%, and verify status is WIP", () => {
    taskCreationPage.setPercentForRow(0, 10);
    taskCreationPage.verifyTaskStatus(WIP_STATUS);
  });

  it("Step 4: Click Task 2 (Row 1), update % to 10%, and verify status is WIP", () => {
    taskCreationPage.setPercentForRow(1, 10);
    taskCreationPage.verifyTaskStatus(WIP_STATUS);
  });

  it("Step 5-7: Apply WIP filter, verify WIP rows, and remove filter", () => {
    smartFilterPage.applyFilter(WIP_STATUS);
    taskCreationPage.verifyVisibleRowsByNameAndStatus(WIP_TASKS, WIP_STATUS);
    smartFilterPage.removeAppliedFilter();
  });

  it("Step 8: Click On Hold checkbox for Task 3 (Row 2) and Task 4 (Row 3)", () => {
    taskCreationPage.toggleOnHoldByRow(2);
    taskCreationPage.toggleOnHoldByRow(3);
  });

  it("Step 9-11: Apply Hold filter, verify Hold rows, and remove filter", () => {
    smartFilterPage.applyFilter(HOLD_STATUS);
    taskCreationPage.verifyVisibleRowsByNameAndStatus(HOLD_TASKS, HOLD_STATUS);
    smartFilterPage.removeAppliedFilter();
  });
});
