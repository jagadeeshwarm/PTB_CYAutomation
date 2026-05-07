import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import { dateOffset } from "../../../support/utils/dateUtils";

const SCHEDULE_NAME = `Automation_2_3_child_status_${dateOffset(0)}`;

const STATUS = {
  BLANK: "BLANK",
  WIP: "WIP",
  COMPLETED: "COMPLETED",
  HOLD: "HOLD",
};

describe("Status Test cases for 2 and 3 childs", () => {
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

  it("Step 1: Create a new schedule with current date", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 2: Create a parent task", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
  });

  it("Step 3: Create child1 and child2, then verify child1 status is blank", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.verifyTaskCount(3);
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.setStartDate(dateOffset(1));
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.BLANK);
  });

  it("Step 4: Update child2 to 16%, verify summary WIP, child1 blank, and child2 WIP", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setStartDate(dateOffset(1));
    taskCreationPage.setPercent(16);
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.WIP);
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.BLANK);
    taskCreationPage.verifyTaskStatusByRow(2, STATUS.WIP);
  });

  it("Step 5: Update child1 to 100%, verify child1 completed and parent percentage average", () => {
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.setPercent(100);
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.COMPLETED);
    taskCreationPage.verifyTaskPercentByRow(0, 58);
  });

  it("Step 6: Set child1 On Hold, verify parent and child1 Hold, child2 WIP", () => {
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.toggleOnHold();
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.HOLD);
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.HOLD);
    taskCreationPage.verifyTaskStatusByRow(2, STATUS.WIP);
  });

  it("Step 6a: Uncheck child1 On Hold and verify parent and child1 return to earlier status", () => {
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.toggleOnHold();
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.WIP);
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.COMPLETED);
  });

  it("Step 7: Update child2 duration to 10 days and verify parent duration is 10 days", () => {
    taskCreationPage.getTaskRows().eq(2).click();
    taskCreationPage.setDuration(10);
    taskCreationPage.verifyTaskDurationByRow(0, 10);
  });

  it("Step 8: Delete child1 and verify parent status is WIP", () => {
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.deleteViaSidePanel("New Task - 2");
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.WIP);
  });
});
