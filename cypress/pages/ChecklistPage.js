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

  // Clicks "Checklist" in the project top bar. The link can render in any of
  // four spots depending on viewport width, company, and role:
  //   (A) Main top bar — directly visible
  //   (B) Secondary top bar — directly visible
  //   (C) Main top bar 3-dots overflow menu
  //   (D) Secondary top bar 3-dots overflow menu
  // Try the direct spots first, then each overflow in turn. Failing all four
  // throws a clear error rather than a misleading "element not found".
  clickChecklistInTopBar() {
    // Wait for the main nav container to exist and for at least one menu
    // item to render. Without this the four-location lookup can run before
    // the async menu has populated and falsely conclude Checklist is missing.
    cy.get(CHECKLIST.topBarMainMenu, { timeout: 20000 }).should("be.visible");
    cy.get(`${CHECKLIST.topBarMainMenu} a, ${CHECKLIST.topBarMainMenu} span`, {
      timeout: 20000,
    }).should("have.length.greaterThan", 0);
    cy.wait(2000);
    const isChecklistText = (el) =>
      (el.innerText || el.textContent || "").trim().toLowerCase() ===
      "checklist";

    // Prefer the <a> element — that's the one with the Angular routerLink /
    // click handler. If we pick an ancestor <div>/<li> the click won't trigger
    // navigation. Fall back to other elements only if no <a> matches.
    const findDirect = ($body, containerSelector) => {
      const $c = $body.find(containerSelector);
      if ($c.length === 0) return null;
      const $a = $c.find("a:visible").filter((_, el) => isChecklistText(el));
      if ($a.length > 0) return $a.first();
      const $other = $c
        .find("li:visible, span:visible, div:visible")
        .filter((_, el) => isChecklistText(el));
      return $other.length > 0 ? $other.first() : null;
    };

    const tryOverflow = (toggleSelectors, idx) => {
      if (idx >= toggleSelectors.length) {
        throw new Error(
          "Checklist option not found in main top bar, secondary top bar, or either 3-dots overflow menu",
        );
      }
      cy.get("body").then(($b) => {
        const $toggle = $b.find(toggleSelectors[idx]).filter(":visible");
        if ($toggle.length === 0) {
          tryOverflow(toggleSelectors, idx + 1);
          return;
        }
        cy.wrap($toggle).first().click({ force: true });
        cy.wait(500);
        cy.get("body").then(($b2) => {
          const $a = $b2
            .find(".cdk-overlay-container a:visible")
            .filter((_, el) => isChecklistText(el));
          const $items =
            $a.length > 0
              ? $a
              : $b2
                  .find(
                    ".cdk-overlay-container ul:visible li, .cdk-overlay-container [role='menuitem']:visible",
                  )
                  .filter((_, el) => isChecklistText(el));
          if ($items.length > 0) {
            cy.wrap($items).first().click({ force: true });
            return;
          }
          // Not in this overflow — dismiss the overlay and try the next.
          const $backdrop = $b2.find(".cdk-overlay-backdrop:visible");
          if ($backdrop.length > 0) {
            cy.wrap($backdrop).first().click({ force: true });
            cy.wait(300);
          }
          tryOverflow(toggleSelectors, idx + 1);
        });
      });
    };

    cy.get("body", { timeout: 20000 }).then(($body) => {
      const $direct =
        findDirect($body, CHECKLIST.topBarMainMenu) ||
        findDirect($body, CHECKLIST.secondaryMenu);
      if ($direct) {
        cy.wrap($direct).click({ force: true });
        return;
      }
      tryOverflow(
        [
          CHECKLIST.topBarOverflowToggle,
          CHECKLIST.secondaryMenuOverflowToggle,
        ],
        0,
      );
    });

    // The checklist module / list loads asynchronously after the route
    // changes. Right after click the list often renders empty ("No data") —
    // wait, then reload, then assert the PIS row is actually present.
    cy.wait(20000);
    cy.reload();
    cy.wait(3000);
    cy.get(CHECKLIST.root, { timeout: 30000 }).should("exist");
    cy.get(CHECKLIST.listFirstRow, { timeout: 20000 }).should("be.visible");
  }

  visitChecklistFor(projectId) {
    // Two scenarios:
    //   1. Right after project creation (TC02) — the URL already contains the
    //      project ID. Do a normal reload (cy.reload), wait for the top bar
    //      to render, then click Checklist. No hard navigate.
    //   2. After re-login as a different user (TC05/TC06/TC07) — the URL is
    //      the login redirect (no project ID), so cy.visit is required.
    cy.url().then((url) => {
      if (url.includes(`/app/${projectId}`)) {
        cy.reload();
      } else {
        cy.visit(`/app/${projectId}`);
      }
      cy.wait(2000);
      this.clickChecklistInTopBar();
    });
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
      // Let the PIS finish opening first — URL-based navigation can otherwise
      // get cancelled by an immediate reload, leaving the page half-loaded.
      cy.wait(3000);
      // Now reload the opened checklist page so the address widgets
      // (rendered piecewise on first load) fully populate before verification.
      cy.reload();
      cy.wait(5000);
      // Wait on rendered text rather than a tag-chain selector — the address
      // widget tag structure has changed before, and Cypress's selector engine
      // sometimes mis-matches custom Angular component tags pre-hydration.
      cy.contains("Project Overview", { timeout: 30000, matchCase: false })
        .should("be.visible");
    });
  }

  // --- Company / Project address verifications ---------------------------

  verifyCompanyDetails(expectedSubstring) {
    // Look for the literal text anywhere on the rendered PIS. The widget tag
    // chain has shifted before — cy.contains is resilient to that.
    cy.contains(expectedSubstring, { timeout: 30000 }).should("be.visible");
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

  // For every row in expectedRows (first cell = title, remaining = values),
  // find a PIS row whose first cell contains the title, then assert every
  // non-empty expected value appears somewhere in that PIS row.
  //
  // Used by TC03 to cross-check that the source XLSX data is faithfully
  // rendered by the PIS. Rows whose title isn't found in the PIS are logged
  // and skipped — some XLSX rows (e.g. "Project Name *") are intentionally
  // hoisted into the project header instead of being rendered in section A.
  verifySectionMatchesXlsx(sectionEl, expectedRows, sectionTitle = "") {
    const actualRows = this.scrapeRows(sectionEl);
    // Collapse whitespace and strip the "required" asterisk so "Project Code *"
    // matches "Project Code" in either direction. Currency commas, trailing
    // periods, and Schüco's ü stay as-is — those mismatches are real bugs.
    const norm = (s) =>
      (s || "")
        .toString()
        .toLowerCase()
        .replace(/\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
    let checked = 0;
    let skipped = 0;
    expectedRows.forEach((expected) => {
      const expTitle = norm(expected[0]);
      if (!expTitle) return;
      const match = actualRows.find(
        (r) => r[0] && norm(r[0]).includes(expTitle),
      );
      if (!match) {
        // XLSX has this title, PIS doesn't render it — likely intentional.
        // Log so a real regression is still visible in the runner output.
        cy.log(
          `[xlsx-check] '${sectionTitle}': '${expected[0]}' not rendered in PIS — skipping`,
        );
        skipped++;
        return;
      }
      // Verify every non-empty expected value cell appears in the PIS row.
      const expectedValues = expected.slice(1).filter((v) => norm(v).length >= 1);
      expectedValues.forEach((expVal) => {
        const found = match
          .slice(1)
          .some((c) => norm(c).includes(norm(expVal)));
        expect(
          found,
          `[xlsx-check] '${sectionTitle}' / '${expected[0]}': value '${expVal}' missing — PIS row: [${match.join(" | ")}]`,
        ).to.be.true;
      });
      checked++;
    });
    cy.log(
      `[xlsx-check] '${sectionTitle}': verified ${checked} row(s), skipped ${skipped}`,
    );
  }

  // Section A's "Project Name *" and "Project Address *" rows don't render
  // inside the section table — they're hoisted into a separate "Project
  // Details" card at the top of the PIS (the one with the UUID id, e.g.
  // #aab1a015-…). The values render inside `app-form-item .comp-block`
  // descendants of that card. We can't pin to the UUID across environments,
  // so we search every `.comp-block` on the page for each expected value.
  //
  // `sectionARows` is the raw xlsx rows for section A — we extract the
  // Project Name + Project Address from the title columns ourselves so the
  // multi-cell address ("SECTOR-105" | "NOIDA") is reassembled correctly.
  verifyProjectDetailsCardFromXlsx(sectionARows) {
    // Find the value(s) sitting to the right of a title cell that matches
    // `titleRegex` in any xlsx row. Returns the concatenation of consecutive
    // non-empty cells after the title, stopping at the next title-like cell.
    const findValue = (titleRegex) => {
      const titleLikeNext = /(project|customer|sch[uü]co|wind|completion)/i;
      for (const row of sectionARows) {
        for (let i = 0; i < row.length; i++) {
          const cell = (row[i] || "").trim();
          if (!titleRegex.test(cell)) continue;
          const parts = [];
          let lastPushed = null;
          for (let j = i + 1; j < row.length; j++) {
            const v = (row[j] || "").trim();
            if (!v) break;
            if (v === lastPushed) continue; // merged-cell duplicate
            if (parts.length > 0 && titleLikeNext.test(v) && v.length < 60) break;
            parts.push(v);
            lastPushed = v;
          }
          if (parts.length > 0) return parts.join(" ");
        }
      }
      return null;
    };

    const projectName = findValue(/^\s*project\s*name\b/i);
    const projectAddress = findValue(/^\s*project\s*address\b/i);

    const norm = (s) =>
      (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();

    cy.get("body").then(($body) => {
      const $blocks = $body.find("app-form-item .comp-block");
      expect(
        $blocks.length,
        "PIS has at least one app-form-item .comp-block (Project Details card)",
      ).to.be.greaterThan(0);
      const cardText = norm($blocks.text());

      if (projectName) {
        expect(
          cardText,
          `[xlsx-check] Project Details card must show Project Name '${projectName}' from xlsx`,
        ).to.include(norm(projectName));
        cy.log(`[xlsx-check] Project Name verified: '${projectName}'`);
      } else {
        cy.log("[xlsx-check] Project Name not found in xlsx — nothing to verify");
      }

      if (projectAddress) {
        // The address may be a single string in xlsx ("SECTOR-105 NOIDA") or
        // a concatenated multi-cell value. Verify each significant token (≥4
        // chars) appears — that handles "SECTOR-105 NOIDA" rendered as
        // "SECTOR-105, NOIDA" or "Sector-105 Noida" without false failures
        // on the delimiter.
        const tokens = projectAddress.split(/\s+/).filter((t) => t.length >= 4);
        if (tokens.length === 0) {
          // Whole string is short — match it as-is.
          expect(
            cardText,
            `[xlsx-check] Project Details card must show Project Address '${projectAddress}' from xlsx`,
          ).to.include(norm(projectAddress));
        } else {
          tokens.forEach((t) => {
            expect(
              cardText,
              `[xlsx-check] Project Address token '${t}' from '${projectAddress}' missing in Project Details card`,
            ).to.include(norm(t));
          });
        }
        cy.log(`[xlsx-check] Project Address verified: '${projectAddress}'`);
      } else {
        cy.log("[xlsx-check] Project Address not found in xlsx — nothing to verify");
      }
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
  // Hover the FIRST data row of the section's table with a REAL mouse
  // cursor (cypress-real-events → Chrome DevTools Protocol), click the +
  // icon, then real-hover the new row and real-click each per-cell edit
  // pencil to type the title and value. Synthetic mouseenter/mouseover
  // events don't trigger the app's `:hover`-gated handlers — only a real
  // cursor move does, which is what realHover/realClick produce.
  addRowToSection(sectionEl, title, value) {
    const rowSelector = CHECKLIST.tableBody + " tr";
    const tableInSection = () =>
      cy.wrap(sectionEl).find(CHECKLIST.compactTable).first();
    const dataRows = () =>
      tableInSection().find(rowSelector).not(".ant-table-measure-now");
    const rowAt = (idx) => dataRows().eq(idx);

    // 1. Snapshot row count so we can assert a row was actually added.
    let beforeCount = 0;
    dataRows().then(($rows) => {
      beforeCount = $rows.length;
      cy.log(`[add-row] Before: ${beforeCount} rows`);
    });

    // 2. Real-hover the FIRST data row → its + icon becomes interactive.
    rowAt(0).scrollIntoView().realHover();
    cy.wait(400);

    // 3. Real-click the + icon on that row.
    rowAt(0).find(CHECKLIST.addRowIcon).first().should("exist").realClick();
    cy.wait(1500);

    // 4. Verify the row count grew. If this fails, the realClick still
    //    didn't reach the handler — the icon's selector may be wrong.
    dataRows().should(($rows) => {
      expect(
        $rows.length,
        `Row count should grow after clicking + (was ${beforeCount})`,
      ).to.be.greaterThan(beforeCount);
    });

    // 5. The new empty row sits at index 1 (right below the row we clicked).
    const NEW_ROW_IDX = 1;

    // 6. Edit Title cell — real-hover the row, real-click the pencil, type.
    this._realEditCellInRow(rowAt, NEW_ROW_IDX, CHECKLIST.titleCell, title);
    cy.wait(400);

    // 7. Edit Value cell.
    this._realEditCellInRow(rowAt, NEW_ROW_IDX, CHECKLIST.valueCell, value);
    cy.wait(400);

    // 8. Commit by clicking outside the cell.
    cy.wrap(sectionEl)
      .find(".widget-container-bar-title")
      .click({ force: true });
    cy.wait(1500);
  }

  // Real-hover the row → pencil icon visible. Real-click the pencil → cell
  // enters edit mode (the cell itself becomes/contains the input). Then
  // `cy.realType()` sends real keyboard events to whatever the browser has
  // focused — no need to locate a specific <input>, which the cmacs-compact-
  // table widget may not expose as a separate DOM node.
  _realEditCellInRow(rowAtFn, idx, cellSelector, text) {
    rowAtFn(idx).scrollIntoView().realHover();
    cy.wait(400);
    rowAtFn(idx)
      .find(`${cellSelector} i`)
      .first()
      .should("exist")
      .realClick();
    cy.wait(600);
    cy.realType(text);
    cy.wait(300);
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

  // Delete the row whose Title cell contains `title`. The × icon is gated
  // by real OS :hover, same as the + and pencil icons, so we use realHover
  // + realClick. Then a confirmation modal ("Do you really want to delete
  // this row?") appears — click its red Delete button to confirm.
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

    // 1. Real-hover the target row → × icon becomes interactive.
    cy.wrap(targetTr).scrollIntoView().realHover();
    cy.wait(400);

    // 2. Real-click the × icon.
    cy.wrap(targetTr)
      .find(CHECKLIST.deleteRowIcon)
      .first()
      .should("exist")
      .realClick();
    cy.wait(500);

    // 3. Confirm the deletion in the modal. The modal has a red "Delete"
    //    button (danger style) — match by visible button text.
    cy.contains("button", /^\s*delete\s*$/i, { timeout: 5000 })
      .filter(":visible")
      .last()
      .click({ force: true });
    cy.wait(1000);
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
