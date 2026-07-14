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
const TEAM_NAME_INPUT =
  'input[placeholder="New Team"], app-teams-root input:focus';
const TEAMS_LEFT_PANEL_ITEM = ".board-column .column-title";
const CONTACTS_LIST_ITEM = ".board-column.fixed-line .cdk-drag.task";

// ── Permissions module ─────────────────────────────────────────────────────
const PERMISSIONS_TEAMS_PANEL_ITEM =
  ".menu-container ul.company-menu li.tree-item";
const DOCUMENT_ROW = "app-document-permission tbody tr.ant-table-row";
// The td itself — its inner DOM swaps shape on first click (resting → ant-
// select), so we click by coordinates (realClick) on the stable td and let
// real OS events hit whatever element is rendered there.
const DOCUMENT_PERMISSION_CELL =
  "td.cmacs-editable-column.cmacs-compact-table-cell-groupPermissionCode";
const PERMISSION_DROPDOWN_ITEM = `${COMMON.overlayContainer} li:visible`;

// Schedule tab in permissions
const PERMISSIONS_SCHEDULE_TAB =
  "app-permission-root cmacs-tabs-nav div.ant-tabs-tab:nth-child(2)";
const SCHEDULE_PERMISSION_DROPDOWN =
  "app-permission-root cmacs-tabset div.ant-tabs-tabpane-active cmacs-select > div";
const SCHEDULE_TASK_ROW =
  "app-permission-root cmacs-compact-table.permsch tbody tr.ant-table-row";
const SCHEDULE_TASK_PERMISSION_CELL =
  "td.cmacs-editable-column.cmacs-compact-table-cell-permission";

// Rename button in the Coordination Files toolbar — the 6th button in
// the floatright action row. There's no text/title we can match on, so
// nth-child is the only stable hook.
const COORDINATION_RENAME_BUTTON =
  "app-document-view-toolbar div.ant-row.actionbuttons.floatright > button:nth-child(6)";
// Rename modal — `cmacs-modal` wraps the cdk-overlay; the input and the
// primary "Save" button live in the modal body/footer respectively.
const COORDINATION_RENAME_MODAL_INPUT =
  "cmacs-modal div.ant-modal-body.trans-model-body input";
const COORDINATION_RENAME_MODAL_SAVE =
  "cmacs-modal div.ant-modal-footer.trans-model-footer button.ant-btn-primary";

// ── Test data ──────────────────────────────────────────────────────────────
const TEAM_NAME = "MJ";
const TEAM_MEMBERS = ["User MJ", "Michael J"];
const PROJECT_NAME = "Automation Project 3";

const SCHEDULE_NAME = `Permission_Schedule_${Date.now()}`;
const TASK_2_PERCENT = 55;
const RENAMED_FOLDER_2 = `perm-folder-2-renamed-${Date.now()}`;

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

// Open the permission dropdown for a given row by clicking the cell
// until the overlay menu appears. The cell needs 1 click when it's
// already "armed" (inline ant-select from a previous interaction) or 2
// clicks when it's in resting display state — blindly clicking twice
// is what made the flow flaky, because the second click TOGGLES the
// dropdown closed when the first click already opened it. Polling for
// the overlay between clicks converges in either state.
function openPermissionDropdown(rowSelector, rowIndex, cellSelector, attempt = 1) {
  const MAX_ATTEMPTS = 4;
  cy.get(rowSelector)
    .eq(rowIndex)
    .find(cellSelector)
    .scrollIntoView()
    .realClick({ position: "center" });
  cy.wait(700);
  cy.get("body").then(($body) => {
    const dropdownOpen =
      $body.find(`${COMMON.overlayContainer} li:visible`).length > 0;
    if (dropdownOpen) return;
    if (attempt >= MAX_ATTEMPTS) {
      throw new Error(
        `Permission dropdown failed to open after ${MAX_ATTEMPTS} clicks on row ${rowIndex}`,
      );
    }
    openPermissionDropdown(rowSelector, rowIndex, cellSelector, attempt + 1);
  });
}

// Pick the row's access type. Block on the inline save spinner clearing
// so the caller doesn't move to the next row while the save is in flight.
function setRowPermission(rowSelector, rowIndex, cellSelector, accessLabelRegex) {
  openPermissionDropdown(rowSelector, rowIndex, cellSelector);
  cy.get(PERMISSION_DROPDOWN_ITEM)
    .contains(accessLabelRegex)
    .click({ force: true });
  cy.get(COMMON.loadingSpinner, { timeout: 60000 }).should("not.exist");
}

describe("Project-Level Teams & Permissions (MJ)", () => {
  // Closure cache so every `it` can read the fixture without relying on
  // Mocha's `this` context (which is unreliable in Cypress and was the
  // cause of the previous `Cannot read properties of undefined` failure).
  let users;

  before(() => {
    cy.fixture("users").then((fixture) => {
      users = fixture;
      loginAsAdmin(users);
      dashboardPage.openProjectBySearch(PROJECT_NAME);
    });
  });

  // ── Step 1: Create new team "MJ" ─────────────────────────────────────────

  it("Step 1: Navigate to Teams and create a new team named MJ", () => {
    cy.get(TEAMS_TAB_ID).click();
    cy.wait(5000);
    cy.get(NEW_TEAM_BUTTON).click();
    cy.wait(1500);
    cy.get(TEAM_NAME_INPUT).last().clear().type(`${TEAM_NAME}{enter}`);
    cy.wait(1500);
    cy.get(TEAMS_LEFT_PANEL_ITEM).should("contain.text", TEAM_NAME);
  });

  // ── Step 2: Drag/drop members from Contacts into the new team ────────────

  it("Step 2: Search and add User MJ and Michael J to the team", () => {
    cy.get(TEAMS_LEFT_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1000);

    TEAM_MEMBERS.forEach((memberName) => {
      cy.contains(".board-column .column-title", TEAM_NAME)
        .closest(".board-column")
        .find("#tasks-container")
        .then(($target) => {
          const tgtRect = $target[0].getBoundingClientRect();
          const tgtX = Math.floor(tgtRect.left + tgtRect.width / 2);
          const tgtY = Math.floor(tgtRect.top + tgtRect.height / 2);

          // Angular CDK drag-and-drop ignores synthetic events; real OS
          // mouse events via cypress-real-events behave like a real user.
          cy.contains(CONTACTS_LIST_ITEM, memberName, { matchCase: false })
            .first()
            .scrollIntoView()
            .realMouseDown({ position: "center", button: "left" });

          cy.get("body").realMouseMove(tgtX - 100, tgtY - 100);
          cy.get("body").realMouseMove(tgtX, tgtY);
          cy.get("body").realMouseUp({ x: tgtX, y: tgtY });
        });
      cy.wait(1500);
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

    cy.get(PERMISSIONS_TEAMS_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1500);

    // First document → Read Only
    setRowPermission(DOCUMENT_ROW, 0, DOCUMENT_PERMISSION_CELL, /read\s*only/i);
    // Second document → Full Access
    setRowPermission(DOCUMENT_ROW, 1, DOCUMENT_PERMISSION_CELL, /full\s*access/i);
  });

  // ── Step 5: Create a schedule with 2 tasks (still logged in as admin) ────

  it("Step 5: Navigate to Schedule and create a schedule with 2 tasks", () => {
    dashboardPage.selectWorkspaceByName("Schedule");
    cy.wait(2000);

    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");

    taskCreationPage.createTask();
    taskCreationPage.verifyTaskExists("New Task");
    taskCreationPage.addBelowViaContextMenu("New Task");
    taskCreationPage.getTaskCount().should("have.length.greaterThan", 1);
  });

  // ── Step 6: Set schedule task permissions for the MJ team ────────────────

  it("Step 6: Set schedule task permissions for MJ team", () => {
    dashboardPage.selectWorkspaceByName("Project");
    cy.wait(1500);
    cy.get(PERMISSIONS_TAB_ID).click();
    cy.wait(2500);

    cy.get(PERMISSIONS_TEAMS_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(1000);

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
    setRowPermission(SCHEDULE_TASK_ROW, 0, SCHEDULE_TASK_PERMISSION_CELL, /no\s*access/i);
    // Second task → Limited Access
    setRowPermission(SCHEDULE_TASK_ROW, 1, SCHEDULE_TASK_PERMISSION_CELL, /limited\s*access/i);
  });

  // ── Step 7: Login as User MJ and verify BOTH document + schedule access ──

  it("Step 7: Login as User MJ and verify document + schedule permissions", () => {
    logoutCurrentUser();
    loginPage.login(users.nonPmUser.email, users.nonPmUser.password);
    loginPage.closeModalIfPresent();
    loginPage.closeNotificationIfPresent();
    dashboardPage.openProjectBySearch(PROJECT_NAME);

    // ── Coordination verification ────────────────────────────────────────
    dashboardPage.selectWorkspaceByName("Coordination");
    cy.wait(2000);

    coordinationFilesPage.verifyFolderExists("perm-folder-1");
    coordinationFilesPage.verifyFolderExists("perm-folder-2");

    // perm-folder-1 → Read Only: rename disabled
    coordinationFilesPage.selectFolderByName("perm-folder-1");
    cy.wait(500);
    cy.get(COORDINATION_RENAME_BUTTON).should("be.disabled");

    // perm-folder-2 → Full Access: rename enabled, and actually performs
    // the rename to prove edit truly works (not just that the button is
    // clickable). Modal-based flow: click rename → type new name in the
    // dialog input → click Save → folder list shows the new name.
    coordinationFilesPage.selectFolderByName("perm-folder-2");
    cy.wait(500);
    cy.get(COORDINATION_RENAME_BUTTON).should("not.be.disabled").click();
    cy.wait(1000);
    cy.get(COORDINATION_RENAME_MODAL_INPUT)
      .clear()
      .type(RENAMED_FOLDER_2);
    cy.get(COORDINATION_RENAME_MODAL_SAVE).click();
    cy.wait(2000);
    coordinationFilesPage.verifyFolderExists(RENAMED_FOLDER_2);

    // ── Schedule verification (same session, no re-login) ────────────────
    dashboardPage.selectWorkspaceByName("Schedule");
    cy.wait(2500);

    schedulePage.verifyScheduleExists(SCHEDULE_NAME);
    schedulePage.openScheduleByName(SCHEDULE_NAME);
    cy.wait(2000);

    // Task 1 (No Access) → should NOT be displayed
    taskCreationPage.verifyTaskDoesNotExist("New Task - 1");

    // Task 2 (Limited Access) → visible and editable. Limited Access
    // doesn't grant rename, but does permit field edits like % completed.
    // Setting % to 55 and re-reading the cell confirms the edit persisted.
    // Row 0 is the only row User MJ can see (task 1 hidden by No Access).
    taskCreationPage.verifyTaskExists("New Task - 2");
    taskCreationPage.setPercentForRow(0, TASK_2_PERCENT);
    taskCreationPage.verifyTaskPercentByRow(0, TASK_2_PERCENT);
  });

  // ── Step 8: Login back as admin and delete the team ──────────────────────

  it("Step 8: Login back as admin and delete the team", () => {
    logoutCurrentUser();
    loginAsAdmin(users);
    dashboardPage.openProjectBySearch(PROJECT_NAME);

    cy.get(TEAMS_TAB_ID).click();
    cy.wait(2000);

    cy.get(TEAMS_LEFT_PANEL_ITEM).contains(TEAM_NAME).click();
    cy.wait(800);

    // The 3-dots button sits in the MJ team's board-column header — a
    // standard Ant dropdown trigger button. Scope by column title so we
    // don't pick another team's button (column nth-child order isn't
    // stable).
    cy.contains(".board-column .column-title", TEAM_NAME)
      .closest(".board-column")
      .find("button.ant-btn.ant-dropdown-trigger.ant-btn-icon-only")
      .first()
      .click({ force: true });
    cy.wait(800);

    // Delete option in the dropdown overlay (cdk-overlay id is dynamic,
    // so match on text inside any visible overlay menu item).
    cy.get(`${COMMON.overlayContainer} li:visible`)
      .contains(/delete/i)
      .click();
    cy.wait(1000);

    // Confirm in the modal — the danger (red) button in the modal footer.
    cy.get("cmacs-modal button.ant-btn-danger:visible").first().click();
    cy.wait(1500);

    cy.get(TEAMS_LEFT_PANEL_ITEM).should("not.contain.text", TEAM_NAME);
  });

  it("Step 9: Clear all folders in Coordination", () => {
    dashboardPage.selectWorkspaceByName("Coordination");
    cy.wait(2000);
    coordinationFilesPage.deleteAllFolders();
  });

  it("Step 10: Delete the created schedule", () => {
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
