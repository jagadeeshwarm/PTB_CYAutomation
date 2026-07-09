import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import emsModelPage from "../../pages/ems/EmsModelPage";
import coordinationFilesPage from "../../pages/coordination/CoordinationFilesPage";

// Unique titles per run so list assertions are unambiguous.
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

const PROJECT_NAME = "Automation Project 3";
const EMS_NAME = `AUT_EMS_${STAMP}`;
const GROUP_NAME = "AutGrp_01";
const TODO_TITLE = `Aut EMS ToDo ${STAMP}`;
const TICKET_TITLE = `Aut EMS Ticket ${STAMP}`;
const UPLOAD_FILE = "upload-test-files/SingleTestFile.txt";
// Fixed name (not per-run) so the before() hook reuses one folder instead of
// creating a new one every run. Its only job is to give Step 11's "Select
// folders" picker a child folder under Root to attach.
const FOLDER_NAME = "EMS_Attach_Folder";

const COST_QTY = 100;
const COST_PER_UNIT = 10;

// Captured in Step 5 (the element auto-named by the app, e.g. "Element_1");
// later steps re-select it so every tab acts at ELEMENT level, not group.
let elementName;

describe("EMS - Building Models - Model", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      // Step 11 attaches a project folder via the "Select folders" picker,
      // which only lists child folders under Root. If Coordination has no
      // folders (e.g. after Files.cy.js's cleanup wipes them), the picker is
      // empty and Step 11 fails. Ensure at least one folder exists first.
      dashboardPage.selectWorkspaceByName("Coordination");
      coordinationFilesPage.ensureAtLeastOneFolder(FOLDER_NAME);
      // Lands on the Element Management home list (Building Structures).
      dashboardPage.selectWorkspaceByName("Element Management");
    });
  });

  it("Step 1: Create a Building Structure (EMS)", () => {
    emsModelPage.createBuildingStructure(EMS_NAME);
  });

  it("Step 2: Add a Group via the '+' menu", () => {
    emsModelPage.addGroup();
  });

  it("Step 3: Rename the group to AutGrp_01 and verify status", () => {
    // Creation does NOT auto-select the group — click it to open Node
    // Properties > General. It's the newest (last) node in the tree.
    emsModelPage.clickLastTreeNode();
    emsModelPage.renameNode(GROUP_NAME);
    // A freshly created group's Node status is "Unassigned".
    emsModelPage.verifyNodeStatus("Unassigned");
    emsModelPage.verifyDerivedStatusEnabled();
    // Tree reflects the new name.
    emsModelPage.getNodeByName(GROUP_NAME).should("have.length.greaterThan", 0);
  });

  it("Step 4: Add an Element inside the group via right-click", () => {
    emsModelPage.contextMenuAction(GROUP_NAME, "Add Element");
    emsModelPage.verifyNodeHasChild(GROUP_NAME);
  });

  it("Step 5: Open the Element and switch to Status Tracker", () => {
    // Select the element child under the group, then open Status Tracker.
    emsModelPage.getFirstChildNodeName(GROUP_NAME).then((name) => {
      elementName = name;
      emsModelPage.clickNodeByName(name);
    });
    emsModelPage.openTab("Status Tracker");
  });

  it("Step 6: Add two Manual Statuses", () => {
    emsModelPage.clickAddManualStatus();
    emsModelPage.clickAddManualStatus();
    emsModelPage.verifyManualStatusCount(2);
  });

  it("Step 7: Set Manual Status 1 to 'Assigned'", () => {
    emsModelPage.setManualStatus("Manual Status 1", "Assigned");
  });

  it("Step 8: Delete Manual Status 2", () => {
    emsModelPage.deleteManualStatus("Manual Status 2");
    emsModelPage.verifyManualStatusGone("Manual Status 2");
  });

  it("Step 9: Create a To Do from the To Dos tab", () => {
    // Re-select the element — tab actions must run at element level.
    emsModelPage.clickNodeByName(elementName);
    emsModelPage.openTab("To Dos");
    emsModelPage.clickAddToDo();
    emsModelPage.enterTodoTitle(TODO_TITLE);
    emsModelPage.selectTodoUser();
    emsModelPage.selectTodoPlannedToday();
    emsModelPage.clickTodoCreate();
    emsModelPage.verifyTodoInList(TODO_TITLE);
  });

  it("Step 10: Upload a file in the Documents tab", () => {
    emsModelPage.clickNodeByName(elementName);
    emsModelPage.openTab("Documents");
    emsModelPage.uploadDocumentFile(UPLOAD_FILE);
    emsModelPage.verifyDocumentExists("SingleTestFile");
  });

  it("Step 11: Add a Project Files / Folders entry and verify a folder is shown", () => {
    emsModelPage.clickNodeByName(elementName);
    emsModelPage.openTab("Documents");
    emsModelPage.addProjectFilesFolder();
    emsModelPage.verifyProjectFolderDisplayed();
  });

  it("Step 12: Add a Cost and verify Cost(USD) = Quantity * Cost/Unit", () => {
    emsModelPage.clickNodeByName(elementName);
    emsModelPage.openTab("Cost");
    emsModelPage.clickAddCost();
    emsModelPage.setCostQuantity(COST_QTY);
    emsModelPage.setCostPerUnit(COST_PER_UNIT);
    emsModelPage.verifyCostTotal(COST_QTY, COST_PER_UNIT);
  });

  it("Step 13: Create a New Ticket from the Tickets tab", () => {
    emsModelPage.clickNodeByName(elementName);
    emsModelPage.openTab("Tickets");
    // The Tickets tab panel can render a beat after the tab click, so the modal
    // wasn't open yet when clicked (Step 13 flake). Wait, then make sure the
    // panel's "Create New Ticket" link is on screen before opening the modal.
    cy.wait(3000);
    cy.contains("app-defect-property-panel", /create new ticket/i, {
      timeout: 15000,
    }).should("be.visible");
    emsModelPage.clickCreateNewTicket();
    emsModelPage.enterTicketTitle(TICKET_TITLE);
    emsModelPage.selectTicketAssignee();
    emsModelPage.selectTicketCategory();
    emsModelPage.selectTicketType();
    // Step to the Documents (Optional) screen, attach a file, then create.
    emsModelPage.clickTicketFooter("Next");
    emsModelPage.uploadTicketFile(UPLOAD_FILE);
    emsModelPage.clickTicketFooter("Create");
    emsModelPage.verifyTicketInList(TICKET_TITLE);
  });

  it("Step 14: Open the ticket and verify navigation to the Tickets module", () => {
    emsModelPage.openTicket(TICKET_TITLE);
    emsModelPage.verifyOnTicketsModule();
  });

  it("Step 15: Delete the EMS from the home screen", () => {
    emsModelPage.goToEmsHome();
    emsModelPage.deleteEms(EMS_NAME);
  });
});
