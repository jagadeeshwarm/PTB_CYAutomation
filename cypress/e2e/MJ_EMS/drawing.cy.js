import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import emsModelPage from "../../pages/ems/EmsModelPage";
import emsDrawingPage from "../../pages/ems/EmsDrawingPage";
import { EMS_DRAWING } from "../../support/selectors";

const PROJECT_NAME = "Automation Project 3";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// A fresh, disposable EMS for this run (created in before, deleted at the end).
const EMS_NAME = `AUT_EMS_Draw_${STAMP}`;
const GROUP_NAME = `DrawGrp_${STAMP}`;
const ELEMENT_NAME = `${rand(EMS_DRAWING.schucoElements)} ${STAMP}`;
// Real architectural drawing (renders in the PDF viewer with taggable objects).
const DRAWING_FIXTURE = "drawings/West-Elevation.pdf";

// Captured at runtime.
let folderName;
let elementName;

describe("EMS - Building Models - Drawing", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      dashboardPage.selectWorkspaceByName("Element Management");
      emsModelPage.createBuildingStructure(EMS_NAME);
    });
  });

  it("Step 1: Open the Drawing module", () => {
    emsDrawingPage.goToDrawingModule();
  });

  it("Step 2: Add a folder", () => {
    emsDrawingPage.addFolder();
    // New folder is the last tree node; capture its name.
    cy.get(`${EMS_DRAWING.tree} ${EMS_DRAWING.treeNodeTitle}`)
      .last()
      .invoke("text")
      .then((t) => {
        folderName = t.trim();
      });
  });

  it("Step 3: Upload a drawing into the folder", () => {
    cy.then(() =>
      emsDrawingPage.uploadDrawingToFolder(folderName, DRAWING_FIXTURE)
    );
  });

  it("Step 4: Open the drawing and verify it renders", () => {
    // Open the folder, then click the drawing inside it; the PDF viewer takes a
    // while to render to the canvas.
    cy.then(() => emsDrawingPage.openFirstDrawingUnderFolder(folderName));
  });

  it("Step 5: Switch to Model and create a Group + Element", () => {
    emsDrawingPage.goToModelModule();
    emsModelPage.addGroup();
    emsModelPage.clickLastTreeNode();
    emsModelPage.renameNode(GROUP_NAME);
    emsModelPage.contextMenuAction(GROUP_NAME, "Add Element");
    emsModelPage.verifyNodeHasChild(GROUP_NAME);
  });

  it("Step 6: Open the Element and set the Node Name (Schuco)", () => {
    emsModelPage.getFirstChildNodeName(GROUP_NAME).then((name) => {
      emsModelPage.clickNodeByName(name);
    });
    emsModelPage.openTab("General");
    emsModelPage.renameNode(ELEMENT_NAME);
    // After rename, the element node title equals ELEMENT_NAME.
    cy.then(() => {
      elementName = ELEMENT_NAME;
    });
  });

  it("Step 7: Add a Tag on the drawing from the Tags tab", () => {
    emsModelPage.openTab("Tags");
    emsDrawingPage.addTagOnDrawing();
    emsDrawingPage.verifyTagCreated();
  });

  it("Step 8: Annotation History reflects the added tag", () => {
    emsDrawingPage.goToDrawingModule();
    emsDrawingPage.openAnnotationHistory();
    emsDrawingPage.verifyAnnotationHistoryHasRows();
    emsDrawingPage.saveAnnotationHistory();
  });

  it("Step 9: Download With Annotations (verify API)", () => {
    cy.intercept("GET", EMS_DRAWING.downloadApiPattern).as("downloadAnno");
    emsDrawingPage.openDownloadsPanel();
    emsDrawingPage.clickDownloadLink(EMS_DRAWING.downloadWithAnnotationsText);
    // Opens a modal (page Start/End) — confirm with Download to fire the API.
    emsDrawingPage.confirmDownloadModal();
    cy.wait("@downloadAnno", { timeout: 30000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201, 206]);
  });

  it("Step 10: PDF Download (verify API)", () => {
    cy.intercept("GET", EMS_DRAWING.pdfApiPattern).as("pdfDownload");
    emsDrawingPage.openDownloadsPanel();
    emsDrawingPage.clickDownloadLink(EMS_DRAWING.pdfDownloadText);
    cy.wait("@pdfDownload", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 200);
  });

  it("Step 11: Delete the EMS", () => {
    emsModelPage.goToEmsHome();
    emsModelPage.deleteEms(EMS_NAME);
  });
});
