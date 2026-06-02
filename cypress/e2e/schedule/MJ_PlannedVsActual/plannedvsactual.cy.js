import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import plannedVsActualPage from "../../../pages/schedule/PlannedVsActualPage";

import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.PLANNED_ACTUAL;
const PARENT_TASK_1 = "New Task";
const PARENT_TASK_2 = "New Task - 2";
const SNAPSHOT_NAME = "Automation_Snapshot_1";
const SNAPSHOT_DESCRIPTION =
  "Snapshot captured by automation for Planned vs Actual baseline";

describe("Planned vs Actual - Snapshot Creation", () => {
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

  it("Step 1a: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 1b: Add first standalone task", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists(PARENT_TASK_1);
  });

  it("Step 1c: Add second standalone task (below first)", () => {
    taskCreationPage.addBelowViaContextMenu(PARENT_TASK_1);
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 1);
  });

  it("Step 1d: Add third standalone task (below second)", () => {
    taskCreationPage.addBelowViaContextMenu(PARENT_TASK_2);
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 2);
  });

  it("Step 1e: Add a child task under first parent task", () => {
    taskCreationPage.addChildViaContextMenu(PARENT_TASK_1);
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 3);
  });

  it("Step 1f: Add a child task under second parent task", () => {
    taskCreationPage.addChildViaContextMenu(PARENT_TASK_2);
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 4);
  });

  it("Step 2: Create a snapshot - rename, add description, save and close popup", () => {
    plannedVsActualPage.createSnapshot(SNAPSHOT_NAME, SNAPSHOT_DESCRIPTION);
  });
});
