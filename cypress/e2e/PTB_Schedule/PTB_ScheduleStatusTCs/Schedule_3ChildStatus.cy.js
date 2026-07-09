import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import {
  addDays,
  dateOffset,
  prevWorkday,
  diffCalendarDays,
} from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.STATUS_3CHILD;

const STATUS = {
  OVERDUE: "OVERDUE",
  DELAYED: "DELAYED",
};

describe("Schedule - 3 Child Status Verification", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project");
      dashboardPage.selectWorkspaceByIndex(5);
      schedulePage.createSchedule(SCHEDULE_NAME);
      cy.contains(SCHEDULE_NAME).should("be.visible");
    });
  });

  it("Step 1: Create a parent task with child1, child2, and child3, then verify all three children are added", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");

    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();

    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();

    taskCreationPage.selectTask("New Task");
    taskCreationPage.addChildViaPlusMenu();

    taskCreationPage.verifyTaskCount(4);
  });

  it("Step 2: Change child1 end date to start date + 2 days and verify summary duration and end date", () => {
    taskCreationPage.getTaskRows().eq(1).click();
    taskCreationPage.adjustEndDate(2);

    // adjustEndDate(2) adds 2 calendar days to today (the default task end).
    // If the result lands on Sat/Sun the app snaps back to Friday (prevWorkday).
    // Duration = snapped_end − today + 1 calendar days.
    const today = new Date();
    const adjustedEnd = prevWorkday(addDays(2, today));
    const expectedDuration = diffCalendarDays(today, adjustedEnd) + 1;

    taskCreationPage.verifyTaskDurationByRow(0, expectedDuration);
    taskCreationPage.verifyTaskEndDatesEqual(0, 1);
  });

  it("Step 3: Change child3 start date to current date - 3 days and verify overdue status and delayed days", () => {
    taskCreationPage.getTaskRows().eq(3).click();
    taskCreationPage.setStartDate(dateOffset(-3));

    taskCreationPage.verifyTaskStatusByRow(3, STATUS.OVERDUE);
    // Delayed days = working days from the task's (weekend-snapped) end date up
    // to today. Derive the expectation from the end date the app actually shows
    // so weekend snapping / duration behaviour can't make it drift.
    taskCreationPage.verifyDelayedMatchesEndByRow(3);
  });

  it("Step 4: Change child3 end date to today + 4 days, verify Delayed status, then add task below parent via context menu", () => {
    // Set child3 end date to today + 4 (absolute). App snaps to prevWorkday if it lands on a weekend.
    taskCreationPage.getTaskRows().eq(3).click();
    taskCreationPage.setEndDate(dateOffset(4));
    taskCreationPage.verifyTaskStatusByRow(3, STATUS.DELAYED);

    // Select then right-click the parent/summary row (index 0) → Add Task → Below
    taskCreationPage.getTaskRows().eq(0).click();
    cy.wait(300);
    taskCreationPage.getTaskRows().eq(0).rightclick();
    cy.wait(500);
    taskCreationPage.openAddTaskSubmenu();
    taskCreationPage.clickSubmenuOption(2);
  });

  it("Step 5: Indent new task as child4, verify 4 children under parent, then outdent and verify 3 children", () => {
    // Right-click the newly added task (last row) and indent it under the parent
    taskCreationPage.rightClickLastTask();
    cy.get('[name="indent"] > .iconspan').click();
    cy.wait(500);
    // Parent should now have 4 children (4 rows with non-zero tree indent)
    taskCreationPage.verifyIndentedTaskCount(4);

    // Right-click child4 (still the last row) and outdent it back to sibling level
    taskCreationPage.rightClickLastTask();
    cy.get('[name="outdent"] > .iconspan').click();
    cy.wait(500);
    // Parent should now have only 3 children
    taskCreationPage.verifyIndentedTaskCount(3);
  });

  it("Step 6: Delete the schedule and verify it no longer exists", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
