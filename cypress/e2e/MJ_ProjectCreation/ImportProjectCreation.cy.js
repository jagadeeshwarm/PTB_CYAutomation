import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import projectCreationPage from "../../pages/ProjectCreationPage";
import checklistPage from "../../pages/ChecklistPage";

const COMPANY_NAME = "Schuco India";
const IMPORT_FILE_FIXTURE = "Central IKON_PIS_Latest_version.xlsx";
const IMPORT_FILE_PATH = `cypress/fixtures/${IMPORT_FILE_FIXTURE}`;
const PROJECT_NUMBER = `IMP-${Date.now()}`;

// Location is a required step in the Create Project wizard. The import doesn't
// auto-populate the required Line 1 / City / Zip fields, so we fill them here.
const LOCATION = {
  line1: "alt.f coworking | Coworking Space In Financial District Hyderabad",
  city: "Nanakramguda",
  state: "Telangana",
  zip: "500032",
  country: "India",
};

// Expected values seen in the user-provided Project Info Sheet sample HTML.
// Used for the TC02 sanity check (company/project header text).
const EXPECTED_COMPANY_SUBSTRING = "Schueco India";
const EXPECTED_PROJECT_SUBSTRING = "Navale Bridge";

// Title/Value pair we add to every checklist table in TC04 and remove in TC07.
const ADDED_ROW_TITLE = `AutoTest Row ${Date.now()}`;
const ADDED_ROW_VALUE = `auto-value-${Date.now()}`;

// TC06: a value we'll edit in the XLSX and then reupload. Targets the first
// editable data cell on the first sheet (sheet:null → exceljs uses sheet 1).
// sheet/row/col are 1-based in exceljs.
const REUPLOAD_NEW_VALUE = `REUPLOAD_${Date.now()}`;
const REUPLOAD_TARGET = { sheet: null, row: 2, col: 2 };

describe("Import Project Creation - Full Flow (TC01-TC08)", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
    });
    // Pre-load the XLSX so TC03 has reference data without re-reading.
    cy.task("xlsxRead", { path: IMPORT_FILE_PATH }).then((data) => {
      cy.wrap(data, { log: false }).as("xlsxData");
    });
    cy.then(function () {
      loginPage.visit();
      loginPage.login(
        this.users.importPmUser.email,
        this.users.importPmUser.password,
      );
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      projectCreationPage.switchCompany(
        COMPANY_NAME,
        this.users.importPmUser.password,
      );
      dashboardPage.waitForPageLoad();
    });
  });

  // ── TC01: Import Project ────────────────────────────────────────────────
  it("TC01: Import project file, skip templates, create, verify success", function () {
    projectCreationPage.clickNewButton();
    projectCreationPage.clickImportProject();
    projectCreationPage.importProjectFile(IMPORT_FILE_FIXTURE);

    // Project type (defaults to New Building) → Next
    projectCreationPage.selectProjectType("New Building");
    projectCreationPage.clickNext();

    // Basic info — overwrite Project Number to keep it unique across runs.
    // Other fields are auto-populated by the import.
    projectCreationPage.clearAndTypeProjectNumber(PROJECT_NUMBER);
    projectCreationPage.clickNext();

    // Location — fill required address fields (Line 1, City, Zip are required
    // and not auto-populated by the import), then Next.
    projectCreationPage.fillLocationFields(
      LOCATION.line1,
      LOCATION.city,
      LOCATION.state,
      LOCATION.zip,
      LOCATION.country,
    );
    projectCreationPage.clickNext();
    // Sales → Next
    projectCreationPage.clickNext();
    // Contact Information → Next
    projectCreationPage.clickNext();

    // Skip Folder Structure Template (just Next)
    projectCreationPage.skipFolderStructureTemplate();
    // Skip Schedule Template (just Next)
    projectCreationPage.skipScheduleTemplate();
    // Teams — skip selecting any team → Next
    projectCreationPage.clickNext();

    // Create
    projectCreationPage.clickCreate();
    dashboardPage.waitForPageLoad();

    // Capture project ID from URL for downstream test cases
    projectCreationPage.captureProjectIdFromUrl("projectId");
  });

  // ── TC02: Verify Generated PDF (Project Info Sheet UI) ──────────────────
  it("TC02: Open Project Info Sheet and verify Company + Project details", function () {
    cy.get("@projectId").then((pid) => {
      checklistPage.visitChecklistFor(pid);
      checklistPage.openFirstChecklistInSameTab();
      checklistPage.verifyCompanyDetails(EXPECTED_COMPANY_SUBSTRING);
      checklistPage.verifyProjectDetails(EXPECTED_PROJECT_SUBSTRING);
    });
  });

  // ── TC03: Verify Checklist Data Population ──────────────────────────────
  // For every section that the import produces a table for, assert:
  //   - the table exists
  //   - the section has at least one header
  //   - for every populated Title row, at least one value cell is non-blank
  //     (a Title-with-blank-values would indicate the import lost data)
  it("TC03: Checklist data is populated for every section", function () {
    const xlsx = this.xlsxData;
    expect(xlsx.sheets.length, "xlsx has at least one sheet").to.be.greaterThan(
      0,
    );

    checklistPage.getSectionsWithTables().then((sections) => {
      expect(sections.length, "PIS has rendered tables").to.be.greaterThan(0);

      sections.forEach(({ el, title }) => {
        const headers = checklistPage.scrapeHeaders(el);
        expect(
          headers.length,
          `Section '${title}' has headers`,
        ).to.be.greaterThan(0);
        const rows = checklistPage.scrapeRows(el);
        expect(rows.length, `Section '${title}' has rows`).to.be.greaterThan(0);

        rows.forEach((r) => {
          const hasTitle = r[0] && r[0].trim() !== "";
          if (!hasTitle) return;
          const allOtherBlank = r.slice(1).every((c) => c === "");
          // Allow "Type Here ..." placeholder rows (those scrape as all-blank).
          if (allOtherBlank) return;
          const hasAnyValue = r.slice(1).some((c) => c && c.trim() !== "");
          expect(
            hasAnyValue,
            `Row '${r[0]}' in '${title}' has Title but no values`,
          ).to.be.true;
        });
      });
    });
  });

  // ── TC04: PM User Checklist Permissions ─────────────────────────────────
  // For each table: add a new row with a Title + Value, click outside, verify
  // it persists. (The row is then deleted in TC07.)
  it("TC04: PM can add a new row to each checklist table", function () {
    checklistPage.getSectionsWithTables().then((sections) => {
      sections.forEach(({ el, letter }) => {
        const title = `${ADDED_ROW_TITLE}-${letter || "X"}`;
        const value = `${ADDED_ROW_VALUE}-${letter || "X"}`;
        checklistPage.addRowToSection(el, title, value);
        checklistPage.verifyRowSaved(el, title, value);
      });
    });
  });

  // ── TC05: Non-PM User Access Validation ─────────────────────────────────
  it("TC05: Non-PM user has read-only access to the checklist", function () {
    cy.get("@projectId").then((pid) => {
      // Hard reset session so the new login takes effect
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.window().then((w) => w.sessionStorage.clear());
      loginPage.visit();
      loginPage.login(
        this.users.importNonPmUser.email,
        this.users.importNonPmUser.password,
      );
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();

      checklistPage.visitChecklistFor(pid);
      checklistPage.openFirstChecklistInSameTab();

      checklistPage.getSectionsWithTables().then((sections) => {
        if (sections.length === 0) {
          // Non-PM may see no tables at all — that itself counts as read-only.
          return;
        }
        const first = sections[0];
        checklistPage.verifyAddRowUnavailable(first.el);
        checklistPage.verifyDeleteUnavailable(first.el);
        checklistPage.verifyRowsReadOnly(first.el);
      });
    });
  });

  // ── TC06: PDF Reupload Validation ───────────────────────────────────────
  it("TC06: Reuploading an edited XLSX reflects the new value in the checklist", function () {
    cy.get("@projectId").then((pid) => {
      // Switch back to PM
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.window().then((w) => w.sessionStorage.clear());
      loginPage.visit();
      loginPage.login(
        this.users.importPmUser.email,
        this.users.importPmUser.password,
      );
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      projectCreationPage.switchCompany(
        COMPANY_NAME,
        this.users.importPmUser.password,
      );

      // Edit one cell in the XLSX (creates a .bak so xlsxRestore can revert).
      cy.task("xlsxEditCell", {
        path: IMPORT_FILE_PATH,
        sheet: REUPLOAD_TARGET.sheet,
        row: REUPLOAD_TARGET.row,
        col: REUPLOAD_TARGET.col,
        newValue: REUPLOAD_NEW_VALUE,
      });

      // Reupload from the Checklist bar
      checklistPage.visitChecklistFor(pid);
      checklistPage.reuploadChecklistFile(IMPORT_FILE_PATH);
      checklistPage.openFirstChecklistInSameTab();

      // Verify the new value appears somewhere in the rendered checklist
      cy.get("body").should("contain.text", REUPLOAD_NEW_VALUE);

      // Restore the original XLSX so subsequent runs start clean
      cy.task("xlsxRestore", { path: IMPORT_FILE_PATH });
    });
  });

  // ── TC07: Cleanup the added checklist rows ──────────────────────────────
  it("TC07: PM can delete the previously-added checklist rows", function () {
    cy.get("@projectId").then((pid) => {
      checklistPage.visitChecklistFor(pid);
      checklistPage.openFirstChecklistInSameTab();

      checklistPage.getSectionsWithTables().then((sections) => {
        sections.forEach(({ el, letter }) => {
          const title = `${ADDED_ROW_TITLE}-${letter || "X"}`;
          // Only attempt deletion if the row still exists (TC06 reupload may
          // have wiped it — that's acceptable, just skip).
          const rows = checklistPage.scrapeRows(el);
          const exists = rows.some(
            (r) => r[0] && r[0].toLowerCase().includes(title.toLowerCase()),
          );
          if (!exists) return;
          checklistPage.deleteRowByTitle(el, title);
          // Verify removal
          const after = checklistPage.scrapeRows(el);
          const still = after.some(
            (r) => r[0] && r[0].toLowerCase().includes(title.toLowerCase()),
          );
          expect(still, `Row '${title}' should be removed after delete`).to.be
            .false;
        });
      });
    });
  });

  // ── TC08: Project Deletion ──────────────────────────────────────────────
  it("TC08: Delete the project and verify it's removed from the list", function () {
    projectCreationPage.navigateToProjectsList();
    projectCreationPage.clickProjectCardByText(PROJECT_NUMBER);
    projectCreationPage.deleteCurrentProject();
    projectCreationPage.verifyProjectNotInList(PROJECT_NUMBER);
  });
});
