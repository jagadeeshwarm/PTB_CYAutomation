import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import formTemplatePage from "../../pages/fieldlogs/FormTemplatePage";
import fieldLogsPage from "../../pages/fieldlogs/FieldLogsPage";
import { FIELD_LOGS } from "../../support/selectors";

// Unique template name per run so the dropdown verification is unambiguous.
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const TEMPLATE_NAME = `Automation Log ${STAMP}`;

const PROJECT_NAME = "Automation Project";

describe("Field Logs - Form Template create, send, reopen, export & delete", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
    });
  });

  // ── Form Template creation (reusable precondition) ────────────────────────

  it("Step 1: Create a Form Template (Layout + Checklist + Image) tagged 'Logs'", () => {
    formTemplatePage.createLogTemplate(TEMPLATE_NAME);
    // Name field should hold exactly the value we typed.
    formTemplatePage.verifyTemplateName(TEMPLATE_NAME);
  });

  // ── Field Operations > Logs ───────────────────────────────────────────────

  it("Step 2: Switch to Field Operations workspace and open Logs tab", () => {
    dashboardPage.selectWorkspaceByName(FIELD_LOGS.workspaceName);
    fieldLogsPage.openLogsTab();
  });

  it("Step 3: New log → pick the created template from 'Use Template' → OK", () => {
    fieldLogsPage.createLogFromTemplate(TEMPLATE_NAME);
  });

  it("Step 4: Add a user to the Distribution List", () => {
    fieldLogsPage.addRandomUser();
  });

  it("Step 5: Send → Submit → wait for 'The email was successfully sent.'", () => {
    fieldLogsPage.send();
  });

  it("Step 6: Reopen the log and verify Send is enabled again", () => {
    fieldLogsPage.reopen();
    fieldLogsPage.verifySendEnabled();
  });

  it("Step 7: Export PDF and verify the download succeeded", () => {
    // exportPdf() asserts the /logforms/.../pdf endpoint returns 200.
    fieldLogsPage.exportPdf();
  });

  it("Step 8: Delete the log", () => {
    fieldLogsPage.deleteLog();
  });
});
