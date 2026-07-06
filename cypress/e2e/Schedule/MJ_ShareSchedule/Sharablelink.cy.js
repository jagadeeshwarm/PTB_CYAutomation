import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sharePage from "../../../pages/schedule/SharePage";
import { dateOffset } from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.SHARE;
const TASK_COUNT = 16;

// Task name helper — id N maps to grid row index N-1.
const TASK = (id) => `New Task - ${id}`;
const ALL_TASKS = Array.from({ length: TASK_COUNT }, (_, i) => TASK(i + 1));

// PUBLIC-ticked task ids (2,4,6,8,10,12,13,14,15,16) → row indices id-1.
const PUBLIC_TASK_IDS = [2, 4, 6, 8, 10, 12, 13, 14, 15, 16];
const PUBLIC_TASKS = PUBLIC_TASK_IDS.map(TASK);
const PUBLIC_ROWS = PUBLIC_TASK_IDS.map((id) => id - 1);

// Only New Task - 1 and New Task - 2 resolve to the "Delayed" status.
const DELAYED_TASKS = [TASK(1), TASK(2)];
// Of the delayed tasks, only New Task - 2 is also PUBLIC-ticked.
const PUBLIC_AND_DELAYED_TASKS = [TASK(2)];

// Full-grid row indices (0-based, id-1) for the two milestone tasks (11, 12).
const MILESTONE_ROWS = [10, 11];

describe("Schedule - Share (Sharable Link)", () => {
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

  it("Step 1: Create a schedule with 16 tasks", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");

    for (let index = 0; index < TASK_COUNT; index += 1) {
      taskCreationPage.createTask();
    }

    taskCreationPage.ensureAllColumnsVisible();
    taskCreationPage.verifyTaskCount(TASK_COUNT);
  });

  it("Step 1a: Configure statuses to match the attachment", () => {
    // Tasks 1 & 2 → Delayed (start in past, end in future, 0%)
    taskCreationPage.adjustStartAndEndDatesForRow(0, -5, 5);
    taskCreationPage.verifyTaskStatus("DELAYED");
    taskCreationPage.adjustStartAndEndDatesForRow(1, -5, 5);
    taskCreationPage.verifyTaskStatus("DELAYED");

    // Tasks 3 & 4 → OverDue (start & end in past, 0%)
    taskCreationPage.setStartDateForRow(2, dateOffset(-4));
    taskCreationPage.verifyTaskStatus("OVERDUE");
    taskCreationPage.setStartDateForRow(3, dateOffset(-4));
    taskCreationPage.verifyTaskStatus("OVERDUE");

    // Tasks 5 & 6 → BLANK (start in future, 0%)
    taskCreationPage.setStartDateForRow(4, dateOffset(1));
    taskCreationPage.verifyTaskStatus("BLANK");
    taskCreationPage.setStartDateForRow(5, dateOffset(1));
    taskCreationPage.verifyTaskStatus("BLANK");

    // Tasks 7 & 8 → WIP (% between 1-99)
    taskCreationPage.setPercentForRow(6, 20);
    taskCreationPage.verifyTaskStatus("WIP");
    taskCreationPage.setPercentForRow(7, 40);
    taskCreationPage.verifyTaskStatus("WIP");

    // Tasks 9 & 10 → Completed (% = 100)
    taskCreationPage.setPercentForRow(8, 100);
    taskCreationPage.verifyTaskStatus("COMPLETED");
    taskCreationPage.setPercentForRow(9, 100);
    taskCreationPage.verifyTaskStatus("COMPLETED");

    // Tasks 11 & 12 → OverDue now (start in past, 0%). They are converted to
    // 0D milestones later in Step 1c — doing it here would drop them out of the
    // gantt_row_task set and shift every subsequent row index.
    taskCreationPage.setStartDateForRow(10, dateOffset(-2));
    taskCreationPage.verifyTaskStatus("OVERDUE");
    taskCreationPage.setStartDateForRow(11, dateOffset(-2));
    taskCreationPage.verifyTaskStatus("OVERDUE");

    // Tasks 13 & 14 → Hold (% set, then On-Hold ticked)
    taskCreationPage.setPercentForRow(12, 20);
    taskCreationPage.toggleOnHoldByRow(12);
    taskCreationPage.verifyTaskStatus("HOLD");
    taskCreationPage.setPercentForRow(13, 40);
    taskCreationPage.toggleOnHoldByRow(13);
    taskCreationPage.verifyTaskStatus("HOLD");

    // Tasks 15 & 16 → OverDue (start in past, 0%). Task 16 is indented under
    // task 15 later in Step 1c.
    taskCreationPage.setStartDateForRow(14, dateOffset(-4));
    taskCreationPage.verifyTaskStatus("OVERDUE");
    taskCreationPage.setStartDateForRow(15, dateOffset(-4));
    taskCreationPage.verifyTaskStatus("OVERDUE");
  });

  it("Step 1b: Tick the PUBLIC checkbox for the required tasks", () => {
    // Done while every row is still a plain task, so togglePublicByRow's
    // ganttTaskRows index still equals id-1 for each target row.
    PUBLIC_ROWS.forEach((rowIndex) => {
      taskCreationPage.togglePublicByRow(rowIndex);
    });
  });

  it("Step 1c: Convert tasks 11 & 12 to milestones and indent task 16 under 15", () => {
    // Structural changes come LAST: milestones (gantt_row_milestone) and the
    // folder parent (gantt_row_project) drop out of gantt_row_task, so any
    // earlier row-index operation would land on the wrong task once these exist.
    // convertRowToMilestone / indentTaskAtRow both index the full row set, which
    // stays stable.
    MILESTONE_ROWS.forEach((rowIndex) => {
      taskCreationPage.convertRowToMilestone(rowIndex);
    });

    taskCreationPage.indentTaskAtRow(15);
    taskCreationPage.verifyIndentedTaskCount(1);
    taskCreationPage.verifyTaskCount(TASK_COUNT);
  });

  it("Step 2-5: Share (All) → open link → all 16 tasks are visible", () => {
    sharePage.openShareModal();
    sharePage.getShareableLink().then((link) => {
      sharePage.visitSharedLinkAndVerify(link, () => {
        sharePage.verifySharedTaskNames(ALL_TASKS);
      });
    });
  });

  it("Step 6: Change New Task - 16 % to 20 and verify it in the shared schedule", () => {
    // Select by name — row-index helpers are unreliable now that milestones and
    // the folder parent have left the gantt_row_task set.
    taskCreationPage.selectTask(TASK(16));
    taskCreationPage.setPercentForSelectedTask(20);

    sharePage.openShareModal();
    sharePage.getShareableLink().then((link) => {
      sharePage.visitSharedLinkAndVerify(link, () => {
        sharePage.verifySharedTaskPercent(TASK(16), 20);
      });
    });
  });

  it("Step 7-10: Share (Public) → only PUBLIC-ticked tasks are visible", () => {
    sharePage.openShareModal();
    sharePage.selectPublicScope();
    sharePage.getShareableLink().then((link) => {
      sharePage.visitSharedLinkAndVerify(link, () => {
        sharePage.verifySharedTaskNames(PUBLIC_TASKS);
      });
    });
  });

  it("Step 11-12: Apply Delayed filter → share (All) → only delayed tasks are visible", () => {
    sharePage.applyDelayedFilter();

    sharePage.openShareModal();
    sharePage.getShareableLink().then((link) => {
      sharePage.visitSharedLinkAndVerify(link, () => {
        sharePage.verifySharedTaskNames(DELAYED_TASKS);
      });
    });
  });

  it("Step 13-14: Delayed filter + share (Public) → only public delayed task is visible", () => {
    // Returning from the previous shared-link visit reloaded the schedule, so
    // re-apply the Delayed filter before sharing with the Public scope.
    sharePage.applyDelayedFilter();

    sharePage.openShareModal();
    sharePage.selectPublicScope();
    sharePage.getShareableLink().then((link) => {
      sharePage.visitSharedLinkAndVerify(link, () => {
        sharePage.verifySharedTaskNames(PUBLIC_AND_DELAYED_TASKS);
      });
    });
  });

  it("Step 15: Go back to schedule list → delete the created schedule", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
