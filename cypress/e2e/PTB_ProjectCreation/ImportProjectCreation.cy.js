import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import projectCreationPage from "../../pages/ProjectCreationPage";
import checklistPage from "../../pages/ChecklistPage";
import { PROJECT_CREATION } from "../../support/selectors";
import {
  parseXlsxSections,
  flattenSectionAPairs,
  stripIndexCol,
} from "../../support/utils/xlsxSectionParser";

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
// Used for the TC02 sanity check (company/project header text). Project
// substring is intentionally unused for now — the project-address widget
// content varies per import and isn't being verified.
//
// This is the company's own master address, not import data — it renders the
// same for every project. The sample HTML this was copied from ended in the
// German "Indien"; staging now stores the country as "India".
const EXPECTED_COMPANY_SUBSTRING =
  "Schueco India Pvt Ltd. Powai Mumbai Maharashtra 400076 India";

// Title/Value pair we add to every checklist table in TC04 and remove in TC07.
const ADDED_ROW_TITLE = `AutoTest Row ${Date.now()}`;
const ADDED_ROW_VALUE = `auto-value-${Date.now()}`;

// TC06: a value we'll edit in the XLSX and then reupload. Targets the first
// editable data cell on the first sheet (sheet:null → exceljs uses sheet 1).
// sheet/row/col are 1-based in exceljs.
const REUPLOAD_NEW_VALUE = `REUPLOAD_${Date.now()}`;
const REUPLOAD_TARGET = { sheet: null, row: 2, col: 2 };

// Module-scoped store for the project ID captured in TC01. Cypress's `.as()`
// aliases are reset between `it()` blocks even with testIsolation:false, so
// every test after TC01 reads from here instead of `cy.get("@projectId")`.
let CAPTURED_PROJECT_ID = null;

// Module-scoped store for the source XLSX data. Setting `this.xlsxData`
// inside a `cy.task(...).then(...)` callback is unreliable — the `this`
// there isn't the same mocha context that `it()` blocks see. Module scope
// outlives the whole describe and is read directly in TC03.
let XLSX_DATA = null;

describe("Import Project Creation - Full Flow (TC01-TC08)", () => {
  before(function () {
    // Force a wide viewport so the project top bar shows all menu items
    // (Home / Portal / Teams / Dashboards / Permission / Templates /
    // Schedules / Checklist / ...). At 1280-ish widths the Checklist link
    // gets dropped from the bar entirely, which is why it appeared missing
    // in Cypress while showing in the real browser.
    cy.viewport(1920, 1080);
    cy.fixture("users").then((users) => {
      this.users = users;
    });
    // Pre-load the XLSX so TC03 has reference data without re-reading.
    // Store in module scope (XLSX_DATA) — see comment near its declaration.
    cy.task("xlsxRead", { path: IMPORT_FILE_PATH }).then((data) => {
      XLSX_DATA = data;
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
    // Other fields are auto-populated by the import. The Project Number field
    // has an async uniqueness validator, so Next can no-op if it's still
    // pending — clickNextTo asserts we actually landed on the Location step.
    projectCreationPage.clearAndTypeProjectNumber(PROJECT_NUMBER);
    projectCreationPage.clickNextTo(
      PROJECT_CREATION.basicInfoPanel,
      PROJECT_CREATION.locationPanel,
    );

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
    // Teams — select the specific team, then Next.
    projectCreationPage.selectTeam("Team Sidhi Automation");
    projectCreationPage.clickNext();

    // Create
    projectCreationPage.clickCreate();
    cy.wait(10000);
    cy.reload();
    // After create, the app redirects to /app/project/portal/<projectId>.
    // Wait for that URL pattern instead of the dashboard's project-bar.
    cy.url({ timeout: 20000 }).should(
      "match",
      /\/app\/project\/portal\/[0-9a-f-]{8,}/i,
    );
    cy.wait(2000);

    // Capture project ID from URL for downstream test cases. Also persist it
    // to a module-scoped variable so it survives across `it()` blocks.
    projectCreationPage.captureProjectIdFromUrl("projectId");
    cy.get("@projectId").then((id) => {
      CAPTURED_PROJECT_ID = id;
    });

    // Workaround: the "Checklist" entry only appears in the top bar for the
    // Schueco India company AND only after a fresh session. Right after create
    // the link is missing, so wait for the backend to settle, clear the
    // session, log back in, reopen the project by search, and confirm the
    // Checklist link is now in the top bar.
    cy.wait(15000);
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
    dashboardPage.openProjectBySearch(PROJECT_NUMBER);
    checklistPage.clickChecklistInTopBar();
  });

  // ── TC02: Verify Generated PDF (Project Info Sheet UI) ──────────────────
  it("TC02: Open Project Info Sheet and verify Company + Project details", function () {
    // TC01 ended on the Checklist list page (with "Project Info Sheet" row
    // visible). Continue from there — just open the PIS, no re-navigation.
    // openFirstChecklistInSameTab handles the post-open reload internally so
    // the address widgets are fully populated before we verify.
    checklistPage.openFirstChecklistInSameTab();
    checklistPage.verifyCompanyDetails(EXPECTED_COMPANY_SUBSTRING);
    // Project address verification skipped for now — its rendered text varies
    // per import and the widget structure is still in flux.
  });

  // ── TC03: Cross-validate rendered PIS against the source XLSX ──────────
  // Core agenda of this whole test: every (title, value) the user uploaded in
  // the XLSX must appear in the rendered Project Info Sheet.
  //
  // For each section the PIS renders (A, B, C, D, ...):
  //   1. Find the matching XLSX section by letter
  //   2. Normalize XLSX rows into [title, value, value, ...] tuples:
  //      - Section A: 2-pair layout → flattened into single-pair rows
  //      - Sections B/C/D: drop the leading index column ("1", "2", ...)
  //   3. For each expected row, locate the PIS row with a matching title and
  //      assert every non-empty expected value is present in that PIS row.
  it("TC03: Rendered PIS matches the uploaded XLSX data", function () {
    const xlsx = XLSX_DATA;
    expect(xlsx, "xlsx loaded in before() hook").to.exist;
    expect(xlsx.sheets.length, "xlsx has at least one sheet").to.be.greaterThan(
      0,
    );

    const xlsxSections = parseXlsxSections(xlsx);
    expect(
      xlsxSections.length,
      "xlsx parsed into at least one section",
    ).to.be.greaterThan(0);

    checklistPage.getSectionsWithTables().then((pisSections) => {
      expect(
        pisSections.length,
        "PIS has rendered tables",
      ).to.be.greaterThan(0);

      pisSections.forEach(({ el, letter, title }) => {
        // Basic structural sanity — headers + at least one row.
        const headers = checklistPage.scrapeHeaders(el);
        expect(
          headers.length,
          `Section '${title}' has headers`,
        ).to.be.greaterThan(0);
        const rows = checklistPage.scrapeRows(el);
        expect(rows.length, `Section '${title}' has rows`).to.be.greaterThan(0);

        // Locate the corresponding XLSX section by letter (A, B, C, ...).
        const xlsxSection = xlsxSections.find((s) => s.letter === letter);
        if (!xlsxSection) {
          cy.log(
            `[xlsx-check] PIS section '${title}' has no matching xlsx section — skipping`,
          );
          return;
        }

        // Normalize XLSX rows based on section layout.
        const expectedRows =
          letter === "A"
            ? flattenSectionAPairs(xlsxSection.rows)
            : stripIndexCol(xlsxSection.rows.slice(1)); // drop header row

        checklistPage.verifySectionMatchesXlsx(el, expectedRows, title);
      });

      // Project Name + Project Address from xlsx Section A render in a
      // separate "Project Details" card on the PIS, but the card's text
      // (Schueco India / Prestige Bellanza / Mulund West) reflects the
      // creation-time project metadata, not the import file's Project Name *
      // and Project Address * fields. Cross-validating them produces a false
      // negative — skip per user direction.
    });
  });

  /* ── TC04-TC07 commented out per user direction ────────────────────────
   * The add/edit/delete row interactions in cmacs-compact-table are gated
   * by real OS :hover state that Cypress can't reliably simulate even with
   * cypress-real-events — verified manually instead. TC05 (non-PM access)
   * and TC06 (XLSX reupload) are grouped in because they depend on the same
   * project + session flow and were paused alongside TC04/TC07.
   *
   * To re-enable: uncomment the block below.

  it("TC04: PM can add a new row to the first checklist table", function () {
    checklistPage.getSectionsWithTables().then((sections) => {
      expect(sections.length, "PIS has at least one section table").to.be.greaterThan(0);
      const first = sections[0];
      const title = `${ADDED_ROW_TITLE}-${first.letter || "X"}`;
      const value = `${ADDED_ROW_VALUE}-${first.letter || "X"}`;
      checklistPage.addRowToSection(first.el, title, value);
      checklistPage.verifyRowSaved(first.el, title, value);
    });
  });

  // ── TC05: Non-PM User Access Validation ─────────────────────────────────
  it("TC05: Non-PM user has read-only access to the checklist", function () {
    const pid = CAPTURED_PROJECT_ID;
    expect(pid, "Project ID captured from TC01").to.exist;
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

  // ── TC06: PDF Reupload Validation ───────────────────────────────────────
  it("TC06: Reuploading an edited XLSX reflects the new value in the checklist", function () {
    const pid = CAPTURED_PROJECT_ID;
    expect(pid, "Project ID captured from TC01").to.exist;
    // Switch back to PM
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

  // ── TC07: Cleanup the added checklist rows ──────────────────────────────
  it("TC07: PM can delete the previously-added checklist row", function () {
    // TC06 ended on the PIS (it called openFirstChecklistInSameTab after the
    // reupload). Continue from there — no re-navigation needed. TC04 added a
    // row to the FIRST section only, so we only need to delete it there.
    checklistPage.getSectionsWithTables().then((sections) => {
      expect(sections.length, "PIS has at least one section table").to.be.greaterThan(0);
      const first = sections[0];
      const title = `${ADDED_ROW_TITLE}-${first.letter || "X"}`;
      // TC06's reupload may have wiped the row — that's acceptable, just skip.
      const rows = checklistPage.scrapeRows(first.el);
      const exists = rows.some(
        (r) => r[0] && r[0].toLowerCase().includes(title.toLowerCase()),
      );
      if (!exists) {
        cy.log(`Row '${title}' not present — TC06 reupload likely wiped it. Skipping delete.`);
        return;
      }
      checklistPage.deleteRowByTitle(first.el, title);
      const after = checklistPage.scrapeRows(first.el);
      const still = after.some(
        (r) => r[0] && r[0].toLowerCase().includes(title.toLowerCase()),
      );
      expect(still, `Row '${title}' should be removed after delete`).to.be.false;
    });
  });

  ── end TC04-TC07 commented block ──────────────────────────────────── */

  // ── TC08: Project Deletion ──────────────────────────────────────────────
  it("TC08: Delete the project and verify it's removed from the list", function () {
    // Projects list → "All" tab → search the project number, then open the card.
    projectCreationPage.findProjectInAllTab(PROJECT_NUMBER);
    projectCreationPage.clickProjectCardByText(PROJECT_NUMBER);
    projectCreationPage.deleteCurrentProject();
    // Back to "All", search again, and confirm the project is gone.
    projectCreationPage.verifyProjectNotInList(PROJECT_NUMBER);
  });
});
