import { CHECKLIST } from "../support/selectors";

// Page object for the Checklist module and the Project Info Sheet (PIS).
// The PIS is rendered as a sequence of `cmacs-section` widgets, one per
// lettered section (A | PROJECT OVERVIEW, B | PROJECT SCOPE, ...).
// Each section embeds a `cmacs-compact-table` (header row + editable body rows).
//
// IMPORTANT: opening the PIS row "opens in another tab" per the spec, but Cypress
// can't drive a second tab. We stub `window.open` and follow the URL inline.
class ChecklistPage {
  // --- Navigation ----------------------------------------------------------

  visitChecklistFor(projectId) {
    // The checklist route is /app/<projectId>/checklist (matches the sidebar
    // link pattern). If the route differs, override via cy.visit before calling.
    cy.visit(`/app/${projectId}/checklist`);
    cy.get(CHECKLIST.root, { timeout: 30000 }).should("exist");
  }

  // Double-click the first row in the Checklist list table. The app opens
  // the PIS in a new tab — we intercept window.open so the URL is captured
  // and we navigate in-place instead.
  openFirstChecklistInSameTab() {
    cy.window().then((win) => {
      cy.stub(win, "open").as("pisOpen");
    });
    cy.get(CHECKLIST.listFirstRow, { timeout: 20000 }).first().dblclick();
    cy.get("@pisOpen", { timeout: 10000 }).should("have.been.called");
    cy.get("@pisOpen").then((stub) => {
      const url = stub.firstCall.args[0];
      cy.visit(url);
      cy.get(CHECKLIST.companyAddressText, { timeout: 30000 }).should("be.visible");
    });
  }

  // --- Company / Project address verifications ---------------------------

  verifyCompanyDetails(expectedSubstring) {
    cy.get(CHECKLIST.companyAddressText)
      .first()
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.include(expectedSubstring);
      });
  }

  verifyProjectDetails(expectedSubstring) {
    cy.get(CHECKLIST.projectAddressText)
      .first()
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.include(expectedSubstring);
      });
  }

  // --- Section discovery -------------------------------------------------

  // Returns a Cypress chain that yields an array of { letter, title, $section }
  // for every section that has a table rendered. Sections without a table
  // (collapsed I/J/K) are excluded.
  getSectionsWithTables() {
    return cy.get(CHECKLIST.sectionContainer).then(($all) => {
      const sections = [];
      $all.each((_i, el) => {
        const $section = Cypress.$(el);
        const titleEl = $section.find(".widget-container-bar-title span").first();
        const title = titleEl.text().trim();
        const hasTable = $section.find(CHECKLIST.compactTable).length > 0;
        if (title && hasTable) {
          // Title format "A  |  PROJECT OVERVIEW" — extract the letter
          const m = title.match(/^([A-Z])\s*\|/);
          const letter = m ? m[1] : null;
          sections.push({ letter, title, el });
        }
      });
      return sections;
    });
  }

  // Get the compact table element inside a given section element.
  _tableIn(sectionEl) {
    return Cypress.$(sectionEl).find(CHECKLIST.compactTable).first();
  }

  // Scrape headers from the section's table → array of trimmed strings.
  scrapeHeaders(sectionEl) {
    const $table = this._tableIn(sectionEl);
    const headers = [];
    $table.find(CHECKLIST.tableHeadCellText).each((_i, h) => {
      headers.push(Cypress.$(h).text().trim());
    });
    return headers;
  }

  // Scrape rows from the section's table → array of arrays of trimmed strings.
  // Skips header rows, measure rows, and pure action cells. Each row keeps the
  // same number of columns as headers.
  scrapeRows(sectionEl) {
    const $table = this._tableIn(sectionEl);
    const headerCount = $table.find(CHECKLIST.tableHeadCellText).length;
    const rows = [];
    $table.find(CHECKLIST.tableBody + " tr").each((_i, tr) => {
      const $tr = Cypress.$(tr);
      if ($tr.hasClass("ant-table-measure-now")) return;
      const cells = [];
      $tr.find("td.cmacs-editable-column").each((_j, td) => {
        const $td = Cypress.$(td);
        // Cell text lives in .cmacs-compact-table-inline-cell. We also strip
        // the placeholder "Type Here ..." which the UI inserts for empty cells.
        const $inline = $td.find(CHECKLIST.inlineCell).first();
        let text = $inline.text().trim();
        if ($inline.hasClass("cmacs-compact-table-field-valid-placeholder")) {
          text = "";
        }
        cells.push(text);
      });
      if (cells.length === headerCount) rows.push(cells);
    });
    return rows;
  }

  // --- TC03 verification: tables match expected XLSX data ----------------

  // Asserts the table inside `sectionEl` has the expected headers (case-
  // insensitive substring match — UI headers sometimes have leading space).
  verifySectionHeaders(sectionEl, expectedHeaders) {
    const actual = this.scrapeHeaders(sectionEl);
    expectedHeaders.forEach((expected) => {
      const norm = expected.toLowerCase().trim();
      const found = actual.some((a) => a.toLowerCase().includes(norm));
      expect(
        found,
        `Section header '${expected}' not found in [${actual.join("|")}]`,
      ).to.be.true;
    });
  }

  // For every (Title, Value) pair in expectedRows where Value is non-empty,
  // assert the rendered table has a row whose first cell contains the Title
  // and whose value cell contains the Value. Also assert no value cell is
  // blank for a Title that has data in the source.
  verifySectionValues(sectionEl, expectedRows) {
    const actualRows = this.scrapeRows(sectionEl);
    expectedRows.forEach((expected) => {
      const [expTitle, expValue] = expected;
      if (!expTitle || !expValue) return; // skip empty source rows
      const norm = (s) => s.toLowerCase().trim();
      const match = actualRows.find((r) => r[0] && norm(r[0]).includes(norm(expTitle)));
      expect(
        match,
        `Row with title '${expTitle}' not found (expected value '${expValue}')`,
      ).to.exist;
      expect(
        match.slice(1).some((c) => c && norm(c).includes(norm(expValue))),
        `Value '${expValue}' for '${expTitle}' missing — actual cells: [${match.join("|")}]`,
      ).to.be.true;
    });
  }

  // --- TC04 / TC07: PM permissions — add and delete rows ---------------

  // Adds a new row at the end of the section's table by clicking the
  // add-row icon on the last existing row. Then fills Title + Value in
  // the new row and clicks outside (the section title) to commit.
  addRowToSection(sectionEl, title, value) {
    const $table = this._tableIn(sectionEl);
    // Click the add icon on the last row → a new row appears below
    cy.wrap($table)
      .find(CHECKLIST.tableBody + " tr")
      .not(".ant-table-measure-now")
      .last()
      .find(CHECKLIST.addRowIcon)
      .click({ force: true });
    cy.wait(800);

    // New row is now the last one — fill the Title cell (first editable col)
    cy.wrap($table)
      .find(CHECKLIST.tableBody + " tr")
      .not(".ant-table-measure-now")
      .last()
      .within(() => {
        cy.get("td.cmacs-editable-column").eq(0).click({ force: true });
        cy.focused().type(title, { force: true });
      });
    cy.wait(300);
    cy.wrap($table)
      .find(CHECKLIST.tableBody + " tr")
      .not(".ant-table-measure-now")
      .last()
      .within(() => {
        cy.get("td.cmacs-editable-column").eq(1).click({ force: true });
        cy.focused().type(value, { force: true });
      });
    cy.wait(300);

    // Click outside the table to commit — use the section title span
    cy.wrap(sectionEl).find(".widget-container-bar-title").click({ force: true });
    cy.wait(800);
  }

  // Verifies the most-recently-added row in the section contains the title/value.
  verifyRowSaved(sectionEl, title, value) {
    const rows = this.scrapeRows(sectionEl);
    const match = rows.find((r) =>
      r[0] && r[0].toLowerCase().includes(title.toLowerCase()),
    );
    expect(match, `Added row with title '${title}' not found`).to.exist;
    expect(
      match.slice(1).some((c) => c && c.toLowerCase().includes(value.toLowerCase())),
      `Saved value '${value}' not found in row [${match.join("|")}]`,
    ).to.be.true;
  }

  // Deletes the most-recently-added row (the last row containing the given title).
  deleteRowByTitle(sectionEl, title) {
    const $table = this._tableIn(sectionEl);
    let targetTr = null;
    $table.find(CHECKLIST.tableBody + " tr").each((_i, tr) => {
      const $tr = Cypress.$(tr);
      if ($tr.hasClass("ant-table-measure-now")) return;
      const firstCellText = $tr.find("td.cmacs-editable-column").eq(0).text().trim();
      if (firstCellText.toLowerCase().includes(title.toLowerCase())) {
        targetTr = tr;
      }
    });
    expect(targetTr, `Row with title '${title}' not found for deletion`).to.exist;
    cy.wrap(targetTr).find(CHECKLIST.deleteRowIcon).click({ force: true });
    cy.wait(800);
  }

  // --- TC05: Non-PM permission checks -----------------------------------

  // Non-PM users shouldn't see add/delete icons OR shouldn't be able to use them.
  verifyAddRowUnavailable(sectionEl) {
    const $table = this._tableIn(sectionEl);
    const addIcons = $table.find(CHECKLIST.addRowIcon);
    // Either no icons exist, or they are hidden/disabled
    if (addIcons.length === 0) return;
    addIcons.each((_i, el) => {
      const $el = Cypress.$(el);
      expect(
        $el.is(":visible") === false || $el.css("pointer-events") === "none",
        `Add-row icon should be hidden/disabled for non-PM`,
      ).to.be.true;
    });
  }

  verifyDeleteUnavailable(sectionEl) {
    const $table = this._tableIn(sectionEl);
    const delIcons = $table.find(CHECKLIST.deleteRowIcon);
    if (delIcons.length === 0) return;
    delIcons.each((_i, el) => {
      const $el = Cypress.$(el);
      expect(
        $el.is(":visible") === false || $el.css("pointer-events") === "none",
        `Delete-row icon should be hidden/disabled for non-PM`,
      ).to.be.true;
    });
  }

  verifyRowsReadOnly(sectionEl) {
    const $table = this._tableIn(sectionEl);
    const editIcons = $table.find(CHECKLIST.cellEditIcon);
    if (editIcons.length === 0) return;
    editIcons.each((_i, el) => {
      expect(Cypress.$(el).is(":visible")).to.equal(false);
    });
  }

  // --- TC06: Reupload ----------------------------------------------------

  reuploadChecklistFile(fixtureFilePath) {
    cy.get(CHECKLIST.reuploadButton).click();
    cy.wait(500);
    cy.get(CHECKLIST.reuploadFileInput, { timeout: 10000 })
      .last()
      .selectFile(fixtureFilePath, { force: true });
    cy.wait(8000);
    cy.get(CHECKLIST.root, { timeout: 30000 }).should("exist");
  }
}

export default new ChecklistPage();
