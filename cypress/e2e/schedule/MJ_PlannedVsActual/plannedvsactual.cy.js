import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import plannedVsActualPage from "../../../pages/schedule/PlannedVsActualPage";
import { dateOffset } from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.PLANNED_ACTUAL;
const SNAPSHOT_NAME = "Automation_Snapshot_1";
const SNAPSHOT_DESCRIPTION =
  "Snapshot captured by automation for Planned vs Actual baseline";

const TASK_1 = "New Task";
const TASK_2 = "New Task - 2";
const TASK_3 = "New Task - 3";
const TASK_4 = "New Task - 4";
const TASK_5 = "New Task - 5";
const TASK_6 = "New Task - 6";
const TASK_7 = "New Task - 7";
const TASK_8 = "New Task - 8";
const TOTAL_TASKS = 8;

const STATUS = {
  BLANK: "BLANK",
  OVERDUE: "OVERDUE",
  DELAYED: "DELAYED",
  WIP: "WIP",
  COMPLETED: "COMPLETED",
  HOLD: "HOLD",
};

describe("Planned vs Actual - Complete Test", () => {
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

  // ── Step 1: Create schedule and tasks ─────────────────────────────

  it("Step 1a: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  it("Step 1b: Add first 3 standalone tasks", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists(TASK_1);

    taskCreationPage.addBelowViaContextMenu(TASK_1);
    taskCreationPage.verifyTaskExists(TASK_2);

    taskCreationPage.addBelowViaContextMenu(TASK_2);
    taskCreationPage.verifyTaskExists(TASK_3);
  });

  it("Step 1c: Add Task 4 below Task 3, then add child Task 5 under Task 4", () => {
    taskCreationPage.addBelowViaContextMenu(TASK_3);
    taskCreationPage.verifyTaskExists(TASK_4);

    taskCreationPage.addChildViaContextMenu(TASK_4);
    taskCreationPage.verifyTaskExists(TASK_5);
  });

  it("Step 1d: Add Task 6 below Task 4, then add child Task 7 under Task 6", () => {
    taskCreationPage.addBelowViaContextMenu(TASK_4);
    taskCreationPage.verifyTaskExists(TASK_6);

    taskCreationPage.addChildViaContextMenu(TASK_6);
    taskCreationPage.verifyTaskExists(TASK_7);
  });

  it("Step 1e: Add Task 8 below Task 6", () => {
    taskCreationPage.addBelowViaContextMenu(TASK_6);
    taskCreationPage.verifyTaskExists(TASK_8);
    taskCreationPage.getTaskCount().should("have.length", TOTAL_TASKS);
  });

  // ── Step 2: Snapshot ──────────────────────────────────────────────

  it("Step 2: Create a snapshot with name and description", () => {
    plannedVsActualPage.createSnapshot(SNAPSHOT_NAME, SNAPSHOT_DESCRIPTION);
  });

  // ── Step 3: Ensure columns visible ────────────────────────────────

  it("Step 3: Ensure all columns are visible for editing", () => {
    plannedVsActualPage.closeSnapshotPopup();
    taskCreationPage.ensureAllColumnsVisible();
  });

  // ── Step 4: Edit tasks to produce different statuses ──────────────

  it("Step 4a: Task 1 (row 0) - extend end date forward", () => {
    taskCreationPage.selectTaskByRow(0);
    taskCreationPage.scrollGanttLeft();
    taskCreationPage.setEndDate(dateOffset(5));
    taskCreationPage.scrollGanttRight();
  });

  it("Step 4b: Task 2 (row 1) - move start date 1 day earlier → OverDue", () => {
    taskCreationPage.setStartDateForRow(1, dateOffset(-1));
    taskCreationPage.verifyTaskStatus(STATUS.OVERDUE);
  });

  it("Step 4c: Task 3 (row 2) - move start date 1 day earlier + set duration 2 → Delayed", () => {
    taskCreationPage.setStartDateForRow(2, dateOffset(-1));
    taskCreationPage.selectTaskByRow(2);
    taskCreationPage.scrollGanttLeft();
    taskCreationPage.setDuration(2);
    taskCreationPage.scrollGanttRight();
    taskCreationPage.verifyTaskStatus(STATUS.DELAYED);
  });

  it("Step 4d: Task 5 (child of Task 4) - set % to 100 → Completed", () => {
    // Use name-based selection because ganttTaskRows skips parent/project rows,
    // so row indices don't match the visual order when parent tasks exist.
    taskCreationPage.selectTask(TASK_5);
    taskCreationPage.setPercentForSelectedTask(100);
    taskCreationPage.verifyTaskStatus(STATUS.COMPLETED);
  });

  it("Step 4e: Task 7 (child of Task 6) - set % to 25 → WIP", () => {
    taskCreationPage.selectTask(TASK_7);
    taskCreationPage.setPercentForSelectedTask(25);
    taskCreationPage.verifyTaskStatus(STATUS.WIP);
  });

  it("Step 4f: Task 8 - toggle On Hold → Hold", () => {
    taskCreationPage.scrollGanttRight();
    taskCreationPage.selectTask(TASK_8);
    taskCreationPage.toggleOnHold();
    taskCreationPage.verifyTaskStatus(STATUS.HOLD);
  });

  // ── Step 5: PvA with Show Differences ─────────────────────────────

  it("Step 5a: Open Planned vs Actual, check Show Differences, and Compare", () => {
    plannedVsActualPage.openPlannedVsActual();
    plannedVsActualPage.checkShowDifferences();
    plannedVsActualPage.clickCompare();
  });

  it("Step 5b: Verify only tasks with date/duration changes appear", () => {
    plannedVsActualPage.verifyPvaRowCount(3);
    plannedVsActualPage.verifyPvaTaskName(0, TASK_1);
    plannedVsActualPage.verifyPvaTaskName(1, TASK_2);
    plannedVsActualPage.verifyPvaTaskName(2, TASK_3);
  });

  it("Step 5c: Verify P.START vs A.START for tasks with start-date changes", () => {
    // Task 1 start unchanged, Tasks 2 & 3 start moved earlier
    plannedVsActualPage.verifyPlannedVsActualSame(0, "start");
    plannedVsActualPage.verifyPlannedVsActualDiffers(1, "start");
    plannedVsActualPage.verifyPlannedVsActualDiffers(2, "start");
  });

  it("Step 5d: Verify P.END vs A.END for tasks with end-date changes", () => {
    // Task 1 end extended forward
    plannedVsActualPage.verifyPlannedVsActualDiffers(0, "end");
    // Task 2 end also shifted — app keeps duration 1D and auto-adjusts end
    // when start moves earlier (05 Jun → 04 Jun, so end 05 Jun → 04 Jun)
    plannedVsActualPage.verifyPlannedVsActualDiffers(1, "end");
    // Task 3 end unchanged (duration was manually increased to 2D instead)
    plannedVsActualPage.verifyPlannedVsActualSame(2, "end");
  });

  it("Step 5e: Verify P.DURAT vs A.DURAT for tasks with duration changes", () => {
    // Task 1 duration increased, Task 2 unchanged, Task 3 duration set to 2
    plannedVsActualPage.verifyPlannedVsActualDiffers(0, "duration");
    plannedVsActualPage.verifyPlannedVsActualSame(1, "duration");
    plannedVsActualPage.verifyPlannedVsActualDiffers(2, "duration");
  });

  it("Step 5f: Verify delta is shown for tasks with changes", () => {
    plannedVsActualPage.verifyPvaDeltaNotEmpty(0);
    plannedVsActualPage.verifyPvaDeltaNotEmpty(1);
    plannedVsActualPage.verifyPvaDeltaNotEmpty(2);
  });

  it("Step 5g: Close the PvA comparison", () => {
    plannedVsActualPage.closePvaComparison();
  });

  // ── Step 6: PvA without Show Differences ──────────────────────────

  it("Step 6a: Open PvA, uncheck Show Differences, and Compare", () => {
    plannedVsActualPage.openPlannedVsActual();
    plannedVsActualPage.uncheckShowDifferences();
    plannedVsActualPage.clickCompare();
  });

  it("Step 6b: Verify all 8 tasks appear", () => {
    plannedVsActualPage.verifyPvaRowCount(TOTAL_TASKS);
  });

  it("Step 6c: Verify status of edited tasks", () => {
    // Row 0 = Task 1 (no status), Row 1 = Task 2 (OverDue), etc.
    plannedVsActualPage.verifyPvaStatus(1, STATUS.OVERDUE);
    plannedVsActualPage.verifyPvaStatus(2, STATUS.DELAYED);
    plannedVsActualPage.verifyPvaStatus(3, STATUS.COMPLETED);
    plannedVsActualPage.verifyPvaStatus(4, STATUS.COMPLETED);
    plannedVsActualPage.verifyPvaStatus(5, STATUS.WIP);
    plannedVsActualPage.verifyPvaStatus(6, STATUS.WIP);
    plannedVsActualPage.verifyPvaStatus(7, STATUS.HOLD);
  });

  it("Step 6d: Verify percentage of edited tasks", () => {
    plannedVsActualPage.verifyPvaPercent(3, 100);
    plannedVsActualPage.verifyPvaPercent(4, 100);
    plannedVsActualPage.verifyPvaPercent(5, 25);
    plannedVsActualPage.verifyPvaPercent(6, 25);
  });

  // ── Step 7: Filters inside PvA comparison ─────────────────────────

  it("Step 7a: Filter by Delayed and verify", () => {
    plannedVsActualPage.applyPvaStatusFilter("Delayed");
    plannedVsActualPage.verifyPvaRowCount(1);
    plannedVsActualPage.verifyPvaTaskName(0, TASK_3);
    plannedVsActualPage.verifyPvaStatus(0, STATUS.DELAYED);
    plannedVsActualPage.removePvaFilter();
  });

  it("Step 7b: Filter by OverDue and verify", () => {
    plannedVsActualPage.applyPvaStatusFilter("OverDue");
    plannedVsActualPage.verifyPvaRowCount(1);
    plannedVsActualPage.verifyPvaTaskName(0, TASK_2);
    plannedVsActualPage.verifyPvaStatus(0, STATUS.OVERDUE);
    plannedVsActualPage.removePvaFilter();
  });

  it("Step 7c: Filter by WIP and verify", () => {
    plannedVsActualPage.applyPvaStatusFilter("WIP");
    plannedVsActualPage.verifyPvaRowCount(2);
    plannedVsActualPage.verifyPvaStatus(0, STATUS.WIP);
    plannedVsActualPage.verifyPvaStatus(1, STATUS.WIP);
    plannedVsActualPage.removePvaFilter();
  });

  it("Step 7d: Filter by Hold and verify", () => {
    plannedVsActualPage.applyPvaStatusFilter("Hold");
    plannedVsActualPage.verifyPvaRowCount(1);
    plannedVsActualPage.verifyPvaTaskName(0, TASK_8);
    plannedVsActualPage.verifyPvaStatus(0, STATUS.HOLD);
    plannedVsActualPage.removePvaFilter();
  });

  it("Step 7e: Filter by Completed and verify", () => {
    plannedVsActualPage.applyPvaStatusFilter("Completed", "Completed Task");
    plannedVsActualPage.verifyPvaRowCount(2);
    plannedVsActualPage.verifyPvaStatus(0, STATUS.COMPLETED);
    plannedVsActualPage.verifyPvaStatus(1, STATUS.COMPLETED);
    plannedVsActualPage.removePvaFilter();
  });

  // ── Step 8: Cleanup ───────────────────────────────────────────────

  it("Step 8: Close PvA, go back to schedule list, delete schedule", () => {
    plannedVsActualPage.closePvaComparison();
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
