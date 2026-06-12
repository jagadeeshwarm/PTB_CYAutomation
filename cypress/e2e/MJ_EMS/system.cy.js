import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import emsModelPage from "../../pages/ems/EmsModelPage";
import emsSystemPage from "../../pages/ems/EmsSystemPage";
import { EMS_SYSTEM } from "../../support/selectors";

const PROJECT_NAME = "Automation Project";

// Schuco-style random data (keyword library lives in the selectors module).
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const STAMP = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// A fresh, disposable EMS for this run (created in before, deleted at the end).
const EMS_NAME = `AUT_EMS_Sys_${STAMP}`;

const SUBTYPE_NAME = `${rand(EMS_SYSTEM.schucoSystems)} ${STAMP}`;
const VENT_TYPE = rand(EMS_SYSTEM.schucoVentTypes);
const ARTICLE_NAME = `Aut Article ${STAMP}`;
const ELEMENT_PREFIX = `${rand(EMS_SYSTEM.schucoSystems).replace(/[^A-Za-z0-9]/g, "")}_${STAMP}`;
const UPLOAD_FILE = "upload-test-files/SingleTestFile.txt";

const DIM = 10;
const COST_QTY = 10;
const COST_PER_UNIT = 100;

// Property fields on Edit Article screen 2 (order per the provided HTML).
const ARTICLE_PROPERTY_FIELDS = [
  "Job", "Item", "Length", "Cut Angles", "Part Number", "Surface Inside",
  "Color Inside", "Surface Outside", "Surface Middle", "Color Outside",
  "Width", "Height", "Price Surface", "Supplier", "Surface Supplier",
  "Associated", "Glass Price", "Energy Charge", "Toll Charge", "Thickness",
  "Discount Code", "Rod Number", "Bar Outside", "Bar Inside",
  "Alternative Article", "Shell Outside", "Shell Inside", "ShellMiddle",
];

// Captured at runtime so later steps act on the right node.
let subSystemName;

describe("EMS - Building Models - System", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch(PROJECT_NAME);
      dashboardPage.selectWorkspaceByName("Element Management");
      // Create a dedicated EMS for the System flow, then switch to System.
      emsModelPage.createBuildingStructure(EMS_NAME);
      emsSystemPage.goToSystemModule();
    });
  });

  it("Step 1: Create a System", () => {
    emsSystemPage.addSystem();
    emsSystemPage.clickLastTreeNode();
  });

  it("Step 2: Add a Sub-System via right-click", () => {
    // Resolve the new system's own name (the last top-level node), then add a
    // sub-system under it and capture the sub-system's name for later steps.
    cy.get(`${EMS_SYSTEM.tree} ${EMS_SYSTEM.treeNodeTitle}`)
      .last()
      .invoke("text")
      .then((t) => {
        const systemName = t.trim();
        emsSystemPage.addSubSystem(systemName);
        emsSystemPage.verifyNodeHasChild(systemName);
        emsSystemPage.getFirstChildNodeName(systemName).then((name) => {
          subSystemName = name;
        });
      });
  });

  it("Step 3: Open the Sub-System (General) and fill fields", () => {
    cy.then(() => emsSystemPage.clickNodeByName(subSystemName));
    emsSystemPage.openTab("General");
    emsSystemPage.fillGeneral({
      subtypeName: SUBTYPE_NAME,
      ventType: VENT_TYPE,
      dim: DIM,
    });
    // Setting the System Subtype Name renames the sub-system node in the tree
    // (e.g. "System_1-1" -> the subtype name), so re-target later steps to it.
    cy.then(() => {
      subSystemName = SUBTYPE_NAME;
    });
  });

  it("Step 4: Add an Article", () => {
    emsSystemPage.openTab("Articles");
    emsSystemPage.clickAddArticle();
    cy.get(EMS_SYSTEM.articleRow, { timeout: 15000 }).should(
      "have.length.greaterThan",
      0
    );
  });

  it("Step 5: Edit the Article (general info + properties)", () => {
    emsSystemPage.openFirstArticle();
    // Screen 1 — general info
    emsSystemPage.enterArticleName(ARTICLE_NAME);
    emsSystemPage.pickRandomFromSelect(EMS_SYSTEM.packagingUnitSelect);
    emsSystemPage.pickRandomFromSelect(EMS_SYSTEM.uomTypeSelect);
    emsSystemPage.typeInModalField("Quantity", 5);
    emsSystemPage.typeInModalField("Price", 25);
    emsSystemPage.typeInModalField("Package Unit Size", 3);
    emsSystemPage.clickArticleFooter("Next");
    // Screen 2 — properties (digits/text decided by field name)
    emsSystemPage.fillArticleProperties(ARTICLE_PROPERTY_FIELDS);
    emsSystemPage.clickArticleFooter("Done");
  });

  it("Step 6: Export the articles to Excel and verify values", () => {
    emsSystemPage.exportExcelAndVerify([ARTICLE_NAME]);
  });

  it("Step 7: Add a Cost and verify Cost(USD) = Quantity * Cost/Unit", () => {
    emsSystemPage.openTab("Cost");
    emsModelPage.clickAddCost(); // identical app-cost-content-panel DOM
    emsModelPage.setCostQuantity(COST_QTY);
    emsModelPage.setCostPerUnit(COST_PER_UNIT);
    emsModelPage.verifyCostTotal(COST_QTY, COST_PER_UNIT);
  });

  it("Step 8: Add a Tracking Template", () => {
    emsSystemPage.openTab("Tracking Templates");
    emsSystemPage.clickAddTrackingTemplate();
    emsSystemPage.selectTrackingTemplateAndSave();
    emsSystemPage.verifyTrackingTemplateInList();
  });

  it("Step 9: Add 10 Elements", () => {
    emsSystemPage.openTab("Elements");
    emsSystemPage.clickAddElements();
    emsSystemPage.createElements({
      prefix: ELEMENT_PREFIX,
      count: 10,
      start: 1,
      length: 1,
    });
    emsSystemPage.verifyElementCount(10);
  });

  it("Step 10: Switch to Model tab and verify the elements are fetched", () => {
    cy.then(() => emsSystemPage.verifyElementsInModel(ELEMENT_PREFIX));
  });

  it("Step 11: Back to System > Document and upload a file", () => {
    emsSystemPage.goToSystemModule();
    cy.then(() => emsSystemPage.clickNodeByName(subSystemName));
    emsSystemPage.openTab("Document");
    emsModelPage.uploadDocumentFile(UPLOAD_FILE); // identical document panel
    emsModelPage.verifyDocumentExists("SingleTestFile");
  });

  it("Step 12: Delete the EMS", () => {
    emsModelPage.goToEmsHome();
    emsModelPage.deleteEms(EMS_NAME);
  });
});
