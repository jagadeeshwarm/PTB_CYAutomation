import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import smartFilterPage from "../../../pages/schedule/SmartFilterPage";
import { dateOffset } from "../../../support/utils/dateUtils";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.SMART_FILTER;
const TASK_COUNT = 10;
const WIP_STATUS = "WIP";
const HOLD_STATUS = "Hold";
const COMPLETED_STATUS = "COMPLETED";
const OVERDUE_STATUS = "OverDue";
const DELAYED_STATUS = "Delayed";
const COMPLETED_FILTER_SEARCH = "Completed";
const COMPLETED_FILTER_OPTION = "Completed Task";
const OVERDUE_FILTER_VALUE = "OverDue";
const DELAYED_FILTER_VALUE = "Delayed";
const PUBLIC_FILTER_VALUE = "Public";
const WIP_TASKS = ["New Task - 1", "New Task - 2"];
const HOLD_TASKS = ["New Task - 3", "New Task - 4"];
const COMPLETED_TASKS = ["New Task - 5", "New Task - 6"];
const OVERDUE_TASKS = ["New Task - 7", "New Task - 8"];
const DELAYED_TASKS = ["New Task - 9", "New Task - 10"];
const PUBLIC_TASKS = ["New Task - 1", "New Task - 2"];

const validateSmartFilter = ({
  searchText,
  optionText = searchText,
  taskNames,
  expectedStatus,
}) => {
  smartFilterPage.applyFilter(searchText, optionText);

  if (expectedStatus) {
    taskCreationPage.verifyVisibleRowsByNameAndStatus(
      taskNames,
      expectedStatus,
    );
  } else {
    taskCreationPage.verifyVisibleRowsByName(taskNames);
  }

  smartFilterPage.removeAppliedFilter();
};

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

  it("Step 5: Click On Hold checkbox for Task 3 (Row 2) and Task 4 (Row 3)", () => {
    taskCreationPage.toggleOnHoldByRow(2);
    taskCreationPage.toggleOnHoldByRow(3);
  });

  it("Step 6: Update Task 5 (Row 4) and Task 6 (Row 5) % to 100%", () => {
    taskCreationPage.setPercentForRow(4, 100);
    taskCreationPage.verifyTaskStatus(COMPLETED_STATUS);
    taskCreationPage.setPercentForRow(5, 100);
    taskCreationPage.verifyTaskStatus(COMPLETED_STATUS);
  });

  it("Step 7: Move Task 7 (Row 6) and Task 8 (Row 7) start dates back 4 days", () => {
    const overdueStartDate = dateOffset(-4);

    taskCreationPage.setStartDateForRow(6, overdueStartDate);
    taskCreationPage.verifyTaskStatus(OVERDUE_STATUS);
    taskCreationPage.setStartDateForRow(7, overdueStartDate);
    taskCreationPage.verifyTaskStatus(OVERDUE_STATUS);
  });

  it("Step 8: Move Task 9 (Row 8) and Task 10 (Row 9) start/end dates", () => {
    taskCreationPage.adjustStartAndEndDatesForRow(8, -5, 5);
    taskCreationPage.verifyTaskStatus(DELAYED_STATUS);
    taskCreationPage.adjustStartAndEndDatesForRow(9, -5, 5);
    taskCreationPage.verifyTaskStatus(DELAYED_STATUS);
  });

  it("Step 9: Click Public checkbox for Task 1 (Row 0) and Task 2 (Row 1)", () => {
    taskCreationPage.togglePublicByRow(0);
    taskCreationPage.togglePublicByRow(1);
  });

  it("Step 10: Validate WIP, Hold, Completed, OverDue, Delayed, and Public filters", () => {
    validateSmartFilter({
      searchText: WIP_STATUS,
      taskNames: WIP_TASKS,
      expectedStatus: WIP_STATUS,
    });
    validateSmartFilter({
      searchText: HOLD_STATUS,
      taskNames: HOLD_TASKS,
      expectedStatus: HOLD_STATUS,
    });
    validateSmartFilter({
      searchText: COMPLETED_FILTER_SEARCH,
      optionText: COMPLETED_FILTER_OPTION,
      taskNames: COMPLETED_TASKS,
      expectedStatus: COMPLETED_STATUS,
    });
    validateSmartFilter({
      searchText: OVERDUE_FILTER_VALUE,
      taskNames: OVERDUE_TASKS,
      expectedStatus: OVERDUE_STATUS,
    });
    validateSmartFilter({
      searchText: DELAYED_FILTER_VALUE,
      taskNames: DELAYED_TASKS,
      expectedStatus: DELAYED_STATUS,
    });
    validateSmartFilter({
      searchText: PUBLIC_FILTER_VALUE,
      taskNames: PUBLIC_TASKS,
    });
  });

  it("Step 11: Go back to schedule list → Delete the created schedule → Validate deleted", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
