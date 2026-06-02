import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.PREDECESSOR;

describe("Schedule - Predecessor Side Panel", () => {
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

  it("Step 2: Create 5 tasks and add a child task to 3 of them", () => {
    // Create the first task
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");

    // Add 4 more tasks below → 5 tasks total
    taskCreationPage.selectLastTask();
    taskCreationPage.addBelowViaPlusMenu();
    taskCreationPage.selectLastTask();
    taskCreationPage.addBelowViaPlusMenu();
    taskCreationPage.selectLastTask();
    taskCreationPage.addBelowViaPlusMenu();
    taskCreationPage.selectLastTask();
    taskCreationPage.addBelowViaPlusMenu();
    taskCreationPage.getTaskCount().should("have.length", 5);

    // Add child to task 1 (row index 0) → 6 rows total; task 2 shifts to row index 2
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(500);
    taskCreationPage.addChildViaPlusMenu();

    // Add child to task 2 (now at row index 2) → 7 rows total; task 3 shifts to row index 4
    taskCreationPage.getTaskRows().eq(2).click();
    cy.wait(500);
    taskCreationPage.addChildViaPlusMenu();

    // Add child to task 3 (now at row index 4) → 8 rows total
    taskCreationPage.getTaskRows().eq(4).click();
    cy.wait(500);
    taskCreationPage.addChildViaPlusMenu();

    // 5 original tasks + 3 children = 8 rows total
    taskCreationPage.getTaskCount().should("have.length", 8);
    // 3 indented (child) rows
    taskCreationPage.verifyIndentedTaskCount(3);
  });

  it("Step 3: Select Child 1 of Task 1, add Finish-Start predecessor (Child 2 ID 3), verify status", () => {
    // Row index 1 = Child 1 of Task 1 (Task 1 is at 0, its child is at 1)
    taskCreationPage.getTaskRows().eq(1).click();
    cy.wait(500);
    sidePanelPage.open();

    // Navigate to the Predecessor (Link) tab in the side panel
    sidePanelPage.openPredecessorTab();

    // Click the Add button in the predecessor section
    sidePanelPage.clickAddPredecessorButton();

    // Predecessor 1: Child 2 (ID 3) → Finish-Start
    sidePanelPage.searchAndSelectPredecessorTask(3);
    sidePanelPage.selectPredecessorType("Finish-Start");
    sidePanelPage.savePredecessorModal();

    // Predecessor 2: Task ID 4 → Start-Start
    sidePanelPage.clickAddPredecessorButton();
    sidePanelPage.searchAndSelectPredecessorTask(4);
    sidePanelPage.selectPredecessorType("Start-Start");
    sidePanelPage.savePredecessorModal();

    // Verify the status cell of the selected row is rendered
    // Column 9 is the STATUS position in the ganttWidthWithSide layout
    sidePanelPage.verifyStatusInGanttRow(9);
  });

  it("Step 4: Select ID-4 (row 3), add predecessor ID-5 with 4D lag, Finish-Finish, verify status", () => {
    // Row index 3 = ID-4 (child of Task 2)
    taskCreationPage.getTaskRows().eq(3).click();
    cy.wait(500);
    sidePanelPage.open();

    sidePanelPage.openPredecessorTab();
    sidePanelPage.clickAddPredecessorButton();

    // Search and select task ID 5
    sidePanelPage.searchAndSelectPredecessorTask(5);

    // Set lag of 4 days
    sidePanelPage.setLagDays(4);

    // Select Finish-Finish type (nth-child(6) in the type grid)
    sidePanelPage.selectPredecessorType("Finish-Finish");

    sidePanelPage.savePredecessorModal();

    sidePanelPage.verifyStatusInGanttRow(9);
  });

  it("Step 5: Select ID-7 (row 6), add predecessor ID-8, Start-Finish, verify status", () => {
    // Row index 6 = ID-7 (Task 4)
    taskCreationPage.getTaskRows().eq(6).click();
    cy.wait(500);
    sidePanelPage.open();

    sidePanelPage.openPredecessorTab();
    sidePanelPage.clickAddPredecessorButton();

    // Search and select task ID 8
    sidePanelPage.searchAndSelectPredecessorTask(8);

    // Select Start-Finish type
    sidePanelPage.selectPredecessorType("Start-Finish");

    sidePanelPage.savePredecessorModal();

    sidePanelPage.verifyStatusInGanttRow(9);
  });

  it("Step 6: Go back to schedule list, delete the created schedule, verify deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
