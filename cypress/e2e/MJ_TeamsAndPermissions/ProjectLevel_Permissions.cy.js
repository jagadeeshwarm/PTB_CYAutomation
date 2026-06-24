import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import coordinationFilesPage from "../../pages/coordination/CoordinationFilesPage";
import schedulePage from "../../pages/schedule/SchedulePage";
import taskCreationPage from "../../pages/schedule/TaskCreationPage";
import { COMMON } from "../../support/selectors";

// ── Top-bar navigation ids ────────────────────────────────────────────────
const TEAMS_TAB_ID = "#ebcc4797-25e1-11eb-a808-062b5ca8a154";
const PERMISSIONS_TAB_ID = "#ec9eb74f-25e1-11eb-a808-062b5ca8a154";

// ── Teams panel ────────────────────────────────────────────────────────────
const NEW_TEAM_BUTTON =
  "team-bar div.button-bar button.indexnewbtn.ant-btn-primary";
const TEAM_NAME_INPUT = "team-bar input";
const TEAMS_LEFT_PANEL_ITEM = ".menu-container ul.company-menu li.tree-item";
const CONTACTS_SEARCH_INPUT =
  "app-teams-root cmacs-search input, app-teams-root input[type='text']";
const CONTACTS_LIST_ITEM = "app-teams-root cdk-virtual-scroll-viewport li, app-teams-root .contact-card";
const TEAM_MEMBERS_DROPZONE = "team-bar + div, app-teams-root .members-list";
const TEAM_OPTIONS_MENU = ".menu-container ul.company-menu li.ant-menu-item-selected .iconUILarge-Three-Dots, .menu-container li.ant-menu-item-selected i[class*='Three-Dots']";
const TEAM_DELETE_OPTION = `${COMMON.overlayContainer} li:contains('Delete')`;

// ── Permissions module ─────────────────────────────────────────────────────
const PERMISSIONS_TEAMS_PANEL_ITEM =
  ".menu-container ul.company-menu li.tree-item";
const DOCUMENTS_TABLE =
  "app-permission-root cmacs-tabset div.ant-tabs-tabpane-active app-document-permission";
const DOCUMENT_ROW =
  "app-document-permission tbody tr.ant-table-row";
const PERMISSION_CELL =
  "td.cmacs-editable-column.cmacs-compact-table-cell-groupPermissionCode > div > div";
const PERMISSION_DROPDOWN_ITEM = `${COMMON.overlayContainer} li:visible`;

// Schedule tab in permissions
const PERMISSIONS_SCHEDULE_TAB =
  "app-permission-root cmacs-tabs-nav div.ant-tabs-tab:nth-child(2)";
const SCHEDULE_PERMISSION_DROPDOWN =
  "app-permission-root cmacs-tabset div.ant-tabs-tabpane-active cmacs-select > div";
const SCHEDULE_TASK_ROW =
  "app-permission-root cmacs-compact-table.permsch tbody tr.ant-table-row";
const SCHEDULE_TASK_PERMISSION_CELL =
  "td.cmacs-editable-column.cmacs-compact-table-cell-permission > div > div";

// ── Test data ──────────────────────────────────────────────────────────────
const TEAM_NAME = "MJ";
const TEAM_MEMBERS = ["MJ", "Michael J"];
const PROJECT_NAME = "Automation Project 3";

const SCHEDULE_NAME = `Permission_Schedule_${Date.now()}`;
const RENAMED_TASK_2 = `Renamed_Task_2_${Date.now()}`;

const FOLDER_1_FILES = [
  {
    contents: "cypress/fixtures/upload-test-folder/FolderFile1.txt",
    fileName: "perm-folder-1/FolderFile1.txt",
  },
];
const FOLDER_2_FILES = [
  {
    contents: "cypress/fixtures/upload-test-folder/SubFolder1/SubFile1.txt",
    fileName: "perm-folder-2/SubFile1.txt",
  },
];

describe("Project-Level Teams & Permissions (MJ)", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
      loginAsAdmin(users);
      dashboardPage.openProjectBySearch(PROJECT_NAME);
    });
  });

  // ── Step 1: Create new team "MJ" ─────────────────────────────────────────

  it("Step 1: Navigate to Teams and create a new team named MJ", () => {
    cy.get(TEAMS_TAB_ID).click();
    cy.wait(2000);
    cy.get(NEW_TEAM_BUTTON).click();
    cy.wait(1500);
    cy.get(TEAM_NAME_INPUT).last().clear().type(`${TEAM_NAME}{enter}`);
    cy.wait(1500);
    cy.get(TEAMS_LEFT_PANEL_ITEM).should("contain.text", TEAM_NAME);
  });

  // ── Step 2: Drag/drop members from Contacts into the new team ────────────

  it("Step 2: Search and add MJ and Michael J to the team", () => {
    cy.get(TEAMS_LEFT_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1000);

    TEAM_MEMBERS.forEach((memberName) => {
      cy.get("body").then(($body) => {
        const $search = $body.find(CONTACTS_SEARCH_INPUT).filter(":visible");
        if ($search.length > 0) {
          cy.wrap($search.first()).clear().type(memberName);
          cy.wait(800);
        }
      });

      cy.contains(CONTACTS_LIST_ITEM, memberName, { matchCase: false })
        .first()
        .then(($source) => {
          cy.get(TEAM_MEMBERS_DROPZONE).first().then(($target) => {
            const sourceRect = $source[0].getBoundingClientRect();
            const targetRect = $target[0].getBoundingClientRect();

            cy.wrap($source)
              .trigger("mousedown", { which: 1, force: true })
              .trigger("dragstart", { force: true })
              .trigger("drag", { force: true });

            cy.wrap($target)
              .trigger("dragenter", { force: true })
              .trigger("dragover", {
                clientX: targetRect.left + 20,
                clientY: targetRect.top + 20,
                force: true,
              })
              .trigger("drop", {
                clientX: targetRect.left + 20,
                clientY: targetRect.top + 20,
                force: true,
              });

            cy.wrap($source).trigger("dragend", { force: true });
          });
        });
      cy.wait(1000);
    });
  });

  // ── Step 3: Upload 2 folders in Coordination ─────────────────────────────

  it("Step 3: Go to Coordination and upload two folders", () => {
    dashboardPage.selectWorkspaceByName("Coordination");
    coordinationFilesPage.uploadFolder(FOLDER_1_FILES);
    cy.wait(2000);
    coordinationFilesPage.uploadFolder(FOLDER_2_FILES);
    cy.wait(2000);
    cy.reload();
    cy.wait(4000);
  });

  // ── Step 4: Document permissions for the new team ────────────────────────

  it("Step 4: Open Permissions and set document permissions for MJ", () => {
    dashboardPage.selectWorkspaceByName("Project");
    cy.wait(1500);
    cy.get(PERMISSIONS_TAB_ID).click();
    cy.wait(2500);

    // Select MJ team in the left panel
    cy.get(PERMISSIONS_TEAMS_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1500);

    // First document → Read Only
    cy.get(DOCUMENT_ROW).eq(0).find(PERMISSION_CELL).click({ force: true });
    cy.wait(800);
    cy.get(PERMISSION_DROPDOWN_ITEM).contains(/read\s*only/i).click();
    cy.wait(1000);

    // Second document → Full Access
    cy.get(DOCUMENT_ROW).eq(1).find(PERMISSION_CELL).click({ force: true });
    cy.wait(800);
    cy.get(PERMISSION_DROPDOWN_ITEM).contains(/full\s*access/i).click();
    cy.wait(1000);
  });

  // ── Step 5: Login as MJ user and verify document access ──────────────────

  it("Step 5: Login as MJ user and verify file permissions", function () {
    logoutCurrentUser();
    loginPage.login(this.users.nonPmUser.email, this.users.nonPmUser.password);
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();
    dashboardPage.openProjectBySearch(PROJECT_NAME);
    dashboardPage.selectWorkspaceByName("Coordination");
    cy.wait(2000);

    // Verify both items are visible
    coordinationFilesPage.verifyFolderExists("perm-folder-1");
    coordinationFilesPage.verifyFolderExists("perm-folder-2");

    // First item — Read Only: rename should be disabled
    coordinationFilesPage.selectFolderByName("perm-folder-1");
    cy.wait(500);
    cy.get("app-document-view-toolbar")
      .find("button")
      .filter(":contains('Rename'), [title*='Rename'], .iconUILarge-Edit")
      .first()
      .should("be.disabled");

    // Second item — Full Access: rename should be enabled
    coordinationFilesPage.selectFolderByName("perm-folder-2");
    cy.wait(500);
    cy.get("app-document-view-toolbar")
      .find("button")
      .filter(":contains('Rename'), [title*='Rename'], .iconUILarge-Edit")
      .first()
      .should("not.be.disabled");
  });

  // ── Step 6: Login back as admin and create a schedule with 2 tasks ───────

  it("Step 6: Login back as admin and create a schedule with 2 tasks", function () {
    logoutCurrentUser();
    loginAsAdmin(this.users);
    dashboardPage.openProjectBySearch(PROJECT_NAME);
    dashboardPage.selectWorkspaceByName("Schedule");
    cy.wait(2000);

    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");

    // Add 2 tasks
    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
    taskCreationPage.addBelowViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 1);
  });

  // ── Step 7: Schedule permissions for the MJ team ─────────────────────────

  it("Step 7: Set schedule task permissions for MJ team", () => {
    // Navigate back to project workspace > Permissions tab
    cy.get(PERMISSIONS_TAB_ID).click();
    cy.wait(2500);

    // Select MJ team in the left panel
    cy.get(PERMISSIONS_TEAMS_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1000);

    // Switch to Schedule tab
    cy.get(PERMISSIONS_SCHEDULE_TAB).click();
    cy.wait(1500);

    // Pick the schedule from the dropdown
    cy.get(SCHEDULE_PERMISSION_DROPDOWN).first().click();
    cy.wait(800);
    cy.get(`${COMMON.overlayContainer} li:visible`)
      .contains(SCHEDULE_NAME)
      .click();
    cy.wait(1500);

    // First task → No Access
    cy.get(SCHEDULE_TASK_ROW)
      .eq(0)
      .find(SCHEDULE_TASK_PERMISSION_CELL)
      .click({ force: true });
    cy.wait(800);
    cy.get(PERMISSION_DROPDOWN_ITEM).contains(/no\s*access/i).click();
    cy.wait(1000);

    // Second task → Limited Access
    cy.get(SCHEDULE_TASK_ROW)
      .eq(1)
      .find(SCHEDULE_TASK_PERMISSION_CELL)
      .click({ force: true });
    cy.wait(800);
    cy.get(PERMISSION_DROPDOWN_ITEM).contains(/limited\s*access/i).click();
    cy.wait(1000);
  });

  // ── Step 8: Login as MJ user and verify schedule access ──────────────────

  it("Step 8: Login as MJ user and verify schedule task permissions", function () {
    logoutCurrentUser();
    loginPage.login(this.users.nonPmUser.email, this.users.nonPmUser.password);
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();
    dashboardPage.openProjectBySearch(PROJECT_NAME);
    dashboardPage.selectWorkspaceByName("Schedule");
    cy.wait(2500);

    // Schedule should be visible
    schedulePage.verifyScheduleExists(SCHEDULE_NAME);
    schedulePage.openScheduleByName(SCHEDULE_NAME);
    cy.wait(2000);

    // First task (No Access) — should NOT be displayed
    taskCreationPage.verifyTaskDoesNotExist("New Task - 1");

    // Second task (Limited Access) — should be visible and editable
    taskCreationPage.verifyTaskExists("New Task - 2");
    taskCreationPage.renameTask("New Task - 2", RENAMED_TASK_2);
    taskCreationPage.verifyTaskExists(RENAMED_TASK_2);
  });

  // ── Step 9: Login back as admin — cleanup ────────────────────────────────

  it("Step 9: Login back as admin and delete the team", function () {
    logoutCurrentUser();
    loginAsAdmin(this.users);
    dashboardPage.openProjectBySearch(PROJECT_NAME);

    cy.get(TEAMS_TAB_ID).click();
    cy.wait(2000);

    // Select the MJ team and open its 3-dots menu
    cy.get(TEAMS_LEFT_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(800);
    cy.get(TEAMS_LEFT_PANEL_ITEM)
      .contains(TEAM_NAME)
      .parent()
      .find("i[class*='Three-Dots'], .iconUILarge-Three-Dots")
      .first()
      .click({ force: true });
    cy.wait(800);

    // Click Delete option in the overlay menu
    cy.get(`${COMMON.overlayContainer} li:visible`)
      .contains(/delete/i)
      .click();
    cy.wait(1000);

    // Confirm deletion in popup
    cy.get(COMMON.modalDangerButton).first().click();
    cy.wait(1500);

    cy.get(TEAMS_LEFT_PANEL_ITEM).should("not.contain.text", TEAM_NAME);
  });

  it("Step 10: Clear all folders in Coordination", () => {
    dashboardPage.selectWorkspaceByName("Coordination");
    cy.wait(2000);
    coordinationFilesPage.deleteAllFolders();
  });

  it("Step 11: Delete the created schedule", () => {
    dashboardPage.selectWorkspaceByName("Schedule");
    cy.wait(2000);
    schedulePage.deleteScheduleByName(SCHEDULE_NAME);
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function loginAsAdmin(users) {
  loginPage.visit();
  loginPage.login(users.testUser.email, users.testUser.password);
  loginPage.closeModalIfPresent();
  loginPage.closeNotificationIfPresent();
}

function logoutCurrentUser() {
  cy.get(COMMON.userMenuTrigger).click();
  cy.wait(500);
  cy.get(COMMON.logoutButton).click();
  cy.wait(2000);
}
