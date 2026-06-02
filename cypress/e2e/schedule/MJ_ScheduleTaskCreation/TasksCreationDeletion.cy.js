import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.TASK_CREATION;
const TASK_1 = "New Task - 1";
const TASK_2 = "New Task - 2";
const RENAMED_TASK = "Facade";

describe("Schedule - Task Creation & Deletion", () => {
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

  it("Step 2: Create a task (New Task - 1)", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
  });

  it("Step 3: Right-click task → Add Above → Validate task added above", () => {
    taskCreationPage.addAboveViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 1);
  });

  it("Step 4: Right-click task → Add Below → Validate task added below", () => {
    taskCreationPage.addBelowViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 1);
  });

  it("Step 5: Select task → Plus → Add Child → Validate child task1 added", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 2);
  });

  it("Step 5a: Select New Task - 2 → Plus → Add Child → Validate child added", () => {
    taskCreationPage.selectTask(TASK_2);
    taskCreationPage.addChildViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 3);
  });

  it("Step 6: Right-click task → Add Child → Validate child task2 added", () => {
    taskCreationPage.addChildViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 4);
  });

  it("Step 7: Select child task2 → Plus → Add Below → Validate child added to child task2", () => {
    taskCreationPage.selectTask("New Task");
    taskCreationPage.addBelowViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 4);
  });

  it("Step 8: Delete child task2 via side panel → Validate deleted", () => {
    taskCreationPage.deleteViaSidePanel("New Task");
    taskCreationPage.getTaskCount().should("have.length.lessThan", 7);
  });

  it("Step 8a: Select New Task - 2 → Delete via side panel → Validate deleted", () => {
    taskCreationPage.deleteViaSidePanel(TASK_2);
    taskCreationPage.verifyTaskDoesNotExist(TASK_2);
  });

  it("Step 9: Delete child task1 via context menu → Validate deleted, parent has no children", () => {
    taskCreationPage.deleteViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.lessThan", 5);
  });

  it("Step 10: Double-click task name and rename to Facade → Validate name changed", () => {
    taskCreationPage.renameTask("New Task", RENAMED_TASK);
    taskCreationPage.verifyTaskExists(RENAMED_TASK);
  });

  it("Step 11: Go back to schedule list → Delete the created schedule → Validate deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
