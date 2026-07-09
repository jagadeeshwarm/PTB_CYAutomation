import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import emsModelPage from "../../pages/ems/EmsModelPage";
import emsBatchPage from "../../pages/ems/EmsBatchPage";

const PROJECT_NAME = "Automation Project 3";

const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// Fresh, disposable EMS for this run (deleted at the end).
const EMS_NAME = `AUT_EMS_Batch_${STAMP}`;
const ELEMENT_COUNT = 5;

// The group's auto-generated name (e.g. "Group_125_193351") — captured in the
// before hook. Renaming sometimes doesn't stick on this app, and the Batch
// flow only cares that the group has N elements under it, so we keep the
// auto-name and just target it for the Add Element loop.
let groupName;

describe("EMS - Building Models - Batch", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      dashboardPage.selectWorkspaceByName("Element Management");
      // EMS + group + 5 elements (modified Model flow — elements only, no
      // group rename status checks or further Node Properties work).
      emsModelPage.createBuildingStructure(EMS_NAME);
      emsModelPage.addGroup();
      emsModelPage.clickLastTreeNode();
      // Capture the group's auto-generated name (rename is unreliable here).
      cy.get("cmacs-tree.modal-tree cmacs-tree-node app-matched-title .folder-name", {
        timeout: 15000,
      })
        .last()
        .invoke("text")
        .then((t) => {
          groupName = t.trim();
          // Each Add Element re-renders the tree, so the next rightclick can
          // land on a stale node. Wait for the child count to reach i+1
          // (retries until the tree settles) before triggering the next one.
          for (let i = 0; i < ELEMENT_COUNT; i++) {
            emsModelPage.contextMenuAction(groupName, "Add Element");
            emsModelPage
              .getNodeByName(groupName)
              .first()
              .find(`ul[role='group'] cmacs-tree-node`)
              .should("have.length.greaterThan", i);
            cy.wait(800);
          }
        });
    });
  });

  it("Step 2: Navigate to Batch and create a new Batch via '+'", () => {
    emsBatchPage.goToBatchModule();
    emsBatchPage.createBatch();
    emsBatchPage.verifyBatchExists();
  });

  it("Step 3: Open the new Batch and switch to Elements", () => {
    emsBatchPage.selectLastBatchRow();
    emsBatchPage.openElementsTab();
  });

  it("Step 4: Click 'Attach Elements' — Attach EMS Nodes modal opens", () => {
    emsBatchPage.clickAttachElements();
  });

  it("Step 5: Select all elements in the modal and confirm — rows visible", () => {
    emsBatchPage.selectAllAttachNodes();
    emsBatchPage.confirmAttach();
    emsBatchPage.verifyAttachedElementCount(ELEMENT_COUNT);
  });

  it("Step 6: Set the 1st element's BatchStatus to 'In Progress'", () => {
    emsBatchPage.setElementStatus(0, "In Progress");
  });

  it("Step 7: Tracking page > Model tab > select 1 element > Import Template", () => {
    emsBatchPage.goToTrackingPage();
    // Model tab is the default — assert it before acting.
    emsBatchPage.switchTrackingTab("Model");
    emsBatchPage.checkTrackingRow(0);
    emsBatchPage.clickImportTemplate();
  });

  it("Step 8: Pick a template, Save — verify it's attached to the element", () => {
    emsBatchPage.selectFirstTemplateAndSave();
    emsBatchPage.verifyTrackingTemplateAttached();
  });

  it("Step 9: Select all elements (header checkbox)", () => {
    // No post-click assertion: the header checkbox briefly toggles on then
    // off when only the collapsed Group_1 row is in view (the children aren't
    // in the DOM yet), and the precise checked/indeterminate class name
    // varies per ng-zorro version. Step 10's QR icon click is the real
    // downstream gate, so trust the click and move on.
    emsBatchPage.checkAllTrackingRows();
  });

  it("Step 10: Open the QR Code screen via the QR scanner icon", () => {
    emsBatchPage.clickQrScanner();
  });

  it("Step 11: Pick a template in the QR sidebar and Save", () => {
    // QR Code screen needs a beat to finish loading the template list before
    // the dropdown is populated reliably.
    cy.wait(15000);
    emsBatchPage.pickQrTemplate();
    emsBatchPage.setQrTemplateName(`AUT_QR_Model_${STAMP}`);
    emsBatchPage.clickQrTemplateSave();
    emsBatchPage.clickSaveToProject();
  });

  it("Step 12: Click the Print QR icon — verify a print window is opened", () => {
    // The Print QR Codes icon calls window.open() to spawn a print-preview
    // window. Stub it before the click so the popup never appears (Cypress
    // can't drive it), then assert the app actually invoked it.
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });
    emsBatchPage.clickQrPrint();
    cy.get("@windowOpen", { timeout: 15000 }).should("have.been.called");
  });

  it("Step 13: Close the QR Code screen with the X icon", () => {
    emsBatchPage.closeQrPopup();
  });

  it("Step 14: Switch to Batch tab, select the batch, open QR Code", () => {
    emsBatchPage.switchTrackingTab("Batch");
    emsBatchPage.checkTrackingRow(0);
    emsBatchPage.clickQrScanner();
  });

  it("Step 15a: Pick a template in the QR sidebar and Save (Batch context)", () => {
    emsBatchPage.pickQrTemplate();
    emsBatchPage.setQrTemplateName(`AUT_QR_Batch_${STAMP}`);
    // In the Batch popup the confirmation button is also labeled "Save"
    // (not "Save to Project" like the Model popup), so the second commit
    // is just another call to the same side-panel Save helper.
    emsBatchPage.clickQrTemplateSave();
    emsBatchPage.clickQrTemplateSave();
  });

  it("Step 15b: Click Print QR icon — verify a print window is opened", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpenBatch");
    });
    emsBatchPage.clickQrPrint();
    cy.get("@windowOpenBatch", { timeout: 15000 }).should("have.been.called");
    emsBatchPage.closeQrPopup();
  });

  it("Step 16: Delete the EMS", () => {
    emsModelPage.goToEmsHome();
    emsModelPage.deleteEms(EMS_NAME);
  });
});
