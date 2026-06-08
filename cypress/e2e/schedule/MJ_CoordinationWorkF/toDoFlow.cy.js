import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import todoWorkflowPage from "../../../pages/coordination/TodoWorkflowPage";

// Unique title per run so the card is unambiguous on the board.
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const TODO_TITLE = `Aut ToDo ${STAMP}`;

const PROJECT_NAME = "Automation Project";

describe("Coordination Workflows - ToDo status flow", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      dashboardPage.selectWorkspaceByName("Coordination");
    });
  });

  it("Step 1: Open Workflows tab and create a new ToDo", () => {
    todoWorkflowPage.openWorkflowsTab();
    todoWorkflowPage.createTodo(TODO_TITLE, { estimate: 16, dueOffset: 2 });
  });

  it("Step 2: ToDo is visible in the Backlog column", () => {
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "Backlog");
  });

  it("Step 3: ToDo card is under the assigned user's row", () => {
    todoWorkflowPage.verifyCardAssigned(TODO_TITLE);
  });

  it("Step 4: Drag the card from Backlog to Ready", () => {
    todoWorkflowPage.dragCardToStatus(TODO_TITLE, "Backlog", "Ready");
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "Ready");
  });

  it("Step 5: Open the card and set status to In Progress via side panel", () => {
    todoWorkflowPage.openCardSidePanel(TODO_TITLE);
    todoWorkflowPage.changeStatus("In Progress");
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "In Progress");
  });

  it("Step 6: Open ToDo detail page, set On Hold, return and verify", () => {
    // Remember where the board lives so we can come back to it.
    cy.url().as("workflowUrl");

    todoWorkflowPage.captureCardHref(TODO_TITLE);
    cy.get("@todoHref").then((href) => {
      cy.visit(href);
    });

    // On the full detail page, change status to On Hold.
    todoWorkflowPage.changeStatus("On Hold");

    // Back to the board + refresh, then verify the move.
    cy.get("@workflowUrl").then((url) => cy.visit(url));
    cy.reload();
    cy.get(".wx-kanban", { timeout: 20000 }).should("be.visible");
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "On Hold");
  });

  it("Step 7: Reassign the ToDo to a different user", () => {
    todoWorkflowPage.openCardSidePanel(TODO_TITLE);
    // Capture the current assignee id, reassign, then assert it changed.
    // (Aliases reset between tests, so capture within this test via a closure.)
    let prevId;
    todoWorkflowPage.getCardAssigneeId(TODO_TITLE).then((id) => {
      prevId = id;
    });
    todoWorkflowPage.reassignTo();
    todoWorkflowPage.getCardAssigneeId(TODO_TITLE).should((newId) => {
      expect(newId, "assignee should change after reassign").to.not.equal(
        prevId
      );
    });
  });

  it("Step 8: Enable the Completed column on the board", () => {
    todoWorkflowPage.enableCompletedColumn();
  });

  it("Step 9: Set status to Completed and verify", () => {
    todoWorkflowPage.openCardSidePanel(TODO_TITLE);
    todoWorkflowPage.changeStatus("Completed");
    todoWorkflowPage.verifyCardInStatus(TODO_TITLE, "Completed");
  });
});
