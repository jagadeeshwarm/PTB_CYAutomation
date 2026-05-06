import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import { dateOffset } from "../../../support/utils/dateUtils";

const SCHEDULE_NAME = `Automation_2_3_child_status_${dateOffset(0)}`;

const STATUS = {
  BLANK: "BLANK",
  WIP: "WIP",
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

  it("Step 3: Create child1 and child2, then verify parent status is blank", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.verifyTaskCount(3);
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.BLANK);
  });

  it("Step 4: Update child2 to 16%, verify parent WIP and child1 blank", () => {
    taskCreationPage.selectLastTask();
    taskCreationPage.setPercent(16);
    taskCreationPage.verifyTaskStatusByRow(0, STATUS.WIP);
    taskCreationPage.verifyTaskStatusByRow(1, STATUS.BLANK);
  });

  it("Step 5: Go back to schedule list - Delete the created schedule - Validate deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
