import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import {
  addDays,
  nextWorkday,
  prevWorkday,
  formatDateMMDDYYYY,
  dateTimeFromDate,
  inputDateToTreeDate,
} from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.SIDE_PANEL;
const RENAMED_TASK = "Test Rename";
const CONSTRAINT_TYPE_OPTIONS = [
  "As Soon As Possible",
  "Must Start On",
  "Start No Later Than",
  "As Late As Possible",
  "Must Finish On",
  "Finish No Earlier Than",
  "Finish No Later Than",
  "Start No Earlier Than",
];

describe("Schedule - Side Panel Task Editing", () => {
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

  it("Step 2: Create a task in the schedule", () => {
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
  });

  it("Step 2a: Ensure all gantt columns are visible (unhide any hidden columns)", () => {
    taskCreationPage.ensureAllColumnsVisible();
  });

  it("Step 3: Rename task from side panel and verify in tree view", () => {
    taskCreationPage.selectTask("New Task");
    sidePanelPage.open();
    sidePanelPage.renameTask(RENAMED_TASK);
    sidePanelPage.verifyTaskNameInTree(RENAMED_TASK);
  });

  it("Step 4: Change duration from side panel (1D → 3D) and verify in tree view", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.setDuration(3);
    sidePanelPage.verifyDurationInTree(3);
  });

  it("Step 5: Change task Mode (Automatic → Manual) and verify in tree view + constraints not editable", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.setMode("Manual");
    sidePanelPage.verifyModeInTree("M");
    // In Manual mode, Constraint Type and Constraint Date must be disabled
    sidePanelPage.verifyConstraintsNotEditable();
  });

  it("Step 6: Change task Mode (Manual → Automatic) and verify in tree view", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.setMode("Automatic");
    sidePanelPage.verifyModeInTree("A");
  });

  it("Step 7: Set % completed to 50 → verify %; close side panel → verify Status WIP", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.setPercent(50);
    sidePanelPage.verifyPercentInSelectedRow(50);

    // Close side panel before checking status — without-side layout shifts the
    // status column. Use data-column-index attr (stable across layout shifts).
    sidePanelPage.close();
    taskCreationPage.selectTask(RENAMED_TASK);
    taskCreationPage.verifyTaskStatusByDataIndex("WIP");
  });

  it("Step 8: Click task → open side panel → change Start Date (today + 1 day, with time) → verify", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.open();
    // Snap to next workday so the assertion matches what the app stores
    const newStart = dateTimeFromDate(nextWorkday(addDays(1)), 9, 0, 0);
    sidePanelPage.setStartDateFromPanel(newStart);
    sidePanelPage.verifyStartDateInSelectedRow(
      inputDateToTreeDate(newStart.split(" ")[0]),
    );
  });

  it("Step 9: Change End Date (start date + 1 day, 17:00:00) and verify in tree view", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    // End date = current start date + 1 day (relative to the start set in Step 8)
    const startDate = nextWorkday(addDays(1)); // same base as Step 8
    const newEnd = dateTimeFromDate(prevWorkday(addDays(1, startDate)), 17, 0, 0);
    sidePanelPage.setEndDateFromPanel(newEnd);
    sidePanelPage.verifyEndDateInSelectedRow(
      inputDateToTreeDate(newEnd.split(" ")[0]),
    );
  });

  it("Step 10: Verify Constraint Type options, select Finish No Later Than, and verify in tree view", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    sidePanelPage.open();
    sidePanelPage.openConstraintTypeDropdown();
    sidePanelPage.verifyConstraintTypeOptions(CONSTRAINT_TYPE_OPTIONS);
    sidePanelPage.selectConstraintType("Finish No Later Than");
    sidePanelPage.verifyConstraintTypeInSelectedRow("FNLT");
  });

  it("Step 11: Change Constraint Date and verify in tree view", () => {
    taskCreationPage.selectTask(RENAMED_TASK);
    // "Finish No Later Than" is a deadline-type constraint → snaps to prevWorkday
    const newConstraintDate = formatDateMMDDYYYY(prevWorkday(addDays(2)));
    sidePanelPage.setConstraintDateFromPanel(newConstraintDate);
    sidePanelPage.verifyConstraintDateInSelectedRow(
      inputDateToTreeDate(newConstraintDate),
    );
  });
});
