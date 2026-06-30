import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import todoWorkflowPage from "../../pages/coordination/TodoWorkflowPage";

// Unique title per run so the card is unambiguous on the board.
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// Original title at creation, then renamed in the side panel to a construction
// keyword (per the use case).
const TODO_TITLE = `Aut ToDo ${STAMP}`;
const RENAMED_TITLE = `Scaffolding Inspection ${STAMP}`;

const COMMENT_TEXT = "Test from AUT";
const ATTACHMENT_FILE = "upload-test-files/SingleTestFile.txt";

const PROJECT_NAME = "Automation Project";

describe("Coordination - ToDo Side Panel, Smart Filter & Export", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      dashboardPage.selectWorkspaceByName("Coordination");
      todoWorkflowPage.openWorkflowsTab();
    });
  });

  it("Step 1: Create a new ToDo with a title and an assigned user", () => {
    todoWorkflowPage.createTodoMinimal(TODO_TITLE);
  });

  it("Step 2: ToDo is created and visible in the Backlog column", () => {
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "Backlog");
  });

  it("Step 3: Open the Backlog card and rename the Title in the side panel", () => {
    todoWorkflowPage.openCardSidePanel(TODO_TITLE);
    todoWorkflowPage.renameTitleInSidePanel(TODO_TITLE, RENAMED_TITLE);
    todoWorkflowPage.verifyTitleInSidePanel(RENAMED_TITLE);
  });

  it("Step 4: Add a comment and verify it is added", () => {
    todoWorkflowPage.addComment(COMMENT_TEXT);
    todoWorkflowPage.verifyCommentAdded(COMMENT_TEXT);
  });

  it("Step 5: Upload an attachment and verify the file uploads", () => {
    todoWorkflowPage.uploadAttachment(ATTACHMENT_FILE);
    todoWorkflowPage.verifyAttachmentUploaded("SingleTestFile");
  });

  it("Step 6: Apply the 'Created by me' smart filter", () => {
    todoWorkflowPage.filterByCreatedByMe();
  });

  it("Step 7: Open a filtered card and verify Created By is the current user's name", () => {
    todoWorkflowPage.openFirstCard();
    // Verifies a human name (not a user id / email). Pass a name to assert an
    // exact match once the logged-in user's display name is known.
    todoWorkflowPage.verifyCreatedByIsName();
  });

  it("Step 8: Export to Excel and verify the download succeeds", () => {
    todoWorkflowPage.exportExcelAndVerify();
  });

  it("Step 9: Export to PDF and verify the download succeeds", () => {
    todoWorkflowPage.exportPdfAndVerify();
  });
});
