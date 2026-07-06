import { SIDEPANEL, SIDEPANEL_TREE_COLUMNS } from "../../support/selectors";

class SidePanelPage {
  // --- Selectors ---

  get toggleButton() {
    return cy.get(SIDEPANEL.toggleButton);
  }

  get taskNameInput() {
    return cy.get(SIDEPANEL.taskNameInput);
  }

  get taskTreeCells() {
    return cy.get(SIDEPANEL.taskTreeCell);
  }

  get durationInput() {
    return cy.get(SIDEPANEL.durationInput);
  }

  get modeDropdownTrigger() {
    return cy.get(SIDEPANEL.modeDropdownTrigger);
  }

  get percentInput() {
    return cy.get(SIDEPANEL.percentInput);
  }

  get startDateInput() {
    return cy.get(SIDEPANEL.startDateInput);
  }

  get endDateInput() {
    return cy.get(SIDEPANEL.endDateInput);
  }

  get constraintTypeDropdownTrigger() {
    return cy.get(SIDEPANEL.constraintTypeSelect);
  }

  selectedRowCell(colIdx) {
    return cy.get(SIDEPANEL.selectedRowCell(colIdx));
  }

  treeCell(rowIdx, colIdx) {
    return cy.get(SIDEPANEL.treeRowCell(rowIdx, colIdx));
  }

  // --- Actions ---

  // Idempotent: only clicks the toggle if the panel isn't already open
  open() {
    cy.get("body").then(($body) => {
      if ($body.find("app-pss-prop-side-panel:visible").length === 0) {
        this.toggleButton.click();
        cy.wait(1000);
      }
    });
  }

  close() {
    cy.get("body").then(($body) => {
      if ($body.find("app-pss-prop-side-panel:visible").length > 0) {
        this.toggleButton.click();
        cy.wait(500);
      }
    });
  }

  renameTask(newName) {
    // Don't use cy.clear() — it sends {del}, which this app captures as a
    // global "Delete Task" shortcut and pops up the confirmation. Use
    // selectall + backspace to clear the field without firing Delete.
    this.taskNameInput.type("{selectall}{backspace}");
    this.taskNameInput.type(newName);
    this.taskNameInput.blur();
    cy.wait(500);
  }

  setDuration(days) {
    // Same Delete-key concern as renameTask — clear via selectall+backspace
    this.durationInput.click();
    this.durationInput.type("{selectall}{backspace}");
    this.durationInput.type(String(days));
    this.durationInput.blur();
    cy.wait(500);
  }

  // --- Mode (Automatic / Manual) ---

  openModeDropdown() {
    this.modeDropdownTrigger.click();
    cy.wait(500);
  }

  // Select the dropdown option by visible text — overlay ID is dynamic, and
  // text-matching is more robust than relying on selected/active classes.
  selectModeOption(modeText) {
    cy.contains(SIDEPANEL.modeDropdownOption, modeText).click();
    cy.wait(500);
  }

  setMode(modeText) {
    this.openModeDropdown();
    this.selectModeOption(modeText);
  }

  // --- % Completed ---

  setPercent(value) {
    // Avoid clear() — Delete-key triggers task delete shortcut
    this.percentInput.click();
    this.percentInput.type("{selectall}{backspace}");
    this.percentInput.type(String(value));
    this.percentInput.blur();
    cy.wait(500);
  }

  // --- Start / End dates ---

  // Generic helper — clicks the picker to open the calendar popup, types
  // the datetime into the focused input, then commits via the OK button.
  // Note: time component must be < 17:00:00 (calendar may reject after work hours).
  setDateInDatePicker(pickerSelector, dateValue) {
    cy.get(pickerSelector).click();
    cy.wait(500);
    cy.focused().type("{selectall}{backspace}", { force: true });
    cy.focused().type(dateValue, { force: true });
    // Click OK in the calendar footer to commit the datetime
    cy.get(SIDEPANEL.datePickerOkButton, { timeout: 5000 }).click();
    cy.wait(800);
  }

  setStartDateFromPanel(dateValue) {
    this.setDateInDatePicker(SIDEPANEL.startDatePicker, dateValue);
  }

  setEndDateFromPanel(dateValue) {
    this.setDateInDatePicker(SIDEPANEL.endDatePicker, dateValue);
  }

  // --- Constraint type / date ---

  openConstraintTypeDropdown() {
    this.constraintTypeDropdownTrigger.click();
    cy.wait(500);
  }

  verifyConstraintTypeOptions(expectedOptions) {
    expectedOptions.forEach((option) => {
      cy.contains(SIDEPANEL.constraintTypeOption, option).should("be.visible");
    });
  }

  selectConstraintType(optionText) {
    cy.contains(SIDEPANEL.constraintTypeOption, optionText).click();
    cy.wait(500);
  }

  setConstraintType(optionText) {
    this.openConstraintTypeDropdown();
    this.selectConstraintType(optionText);
  }

  setConstraintDateFromPanel(dateValue) {
    cy.get(SIDEPANEL.constraintDatePicker).click();
    cy.wait(500);
    cy.focused().type("{selectall}{backspace}", { force: true });
    cy.focused().type(dateValue, { force: true });
    cy.get(".gantt_grid_data").click();
    cy.get("body").then(($body) => {
      const $okButton = $body.find(".ant-btn-primary:visible");
      if ($okButton.length > 0) {
        cy.wrap($okButton.first()).click();
      }
    });
    cy.wait(800);
  }

  // --- Validations ---

  verifyTaskNameInTree(taskName) {
    this.taskTreeCells.should("contain.text", taskName);
  }

  verifyDurationInTree(expectedDays, rowIdx = 1) {
    // Tree column 7 holds Duration when the side panel is open
    this.treeCell(rowIdx, SIDEPANEL_TREE_COLUMNS.DURATION).should(
      "contain.text",
      String(expectedDays),
    );
  }

  // Mode column shows 'A' for Automatic or 'M' for Manual
  verifyModeInTree(expectedChar, rowIdx = 1) {
    this.treeCell(rowIdx, SIDEPANEL_TREE_COLUMNS.MODE).should(
      "contain.text",
      expectedChar,
    );
  }

  // Verifications scoped to the currently-selected task row
  // (more reliable when we don't know the row index after re-rendering)
  // Look for the value anywhere in the row — the exact column position of %
  // shifts depending on the visible/hidden column configuration.
  verifyPercentInSelectedRow(expectedValue) {
    cy.get(".gantt_grid_data .gantt_row.gantt_selected.gantt_row_task").should(
      "contain.text",
      String(expectedValue),
    );
  }

  verifyStatusInSelectedRow(expectedStatus) {
    // Case-insensitive — UI may render "WIP", "wip", or "Wip"
    this.selectedRowCell(SIDEPANEL_TREE_COLUMNS.STATUS)
      .invoke("text")
      .then((text) => {
        expect(text.trim().toUpperCase()).to.include(
          expectedStatus.toUpperCase(),
        );
      });
  }

  verifyStartDateInSelectedRow(expectedDate) {
    this.selectedRowCell(SIDEPANEL_TREE_COLUMNS.START_DATE).should(
      "contain.text",
      expectedDate,
    );
  }

  verifyEndDateInSelectedRow(expectedDate) {
    this.selectedRowCell(SIDEPANEL_TREE_COLUMNS.END_DATE).should(
      "contain.text",
      expectedDate,
    );
  }

  verifyConstraintTypeInSelectedRow(expectedValue) {
    this.selectedRowCell(SIDEPANEL_TREE_COLUMNS.CONSTRAINT_TYPE).should(
      "contain.text",
      expectedValue,
    );
  }

  verifyConstraintDateInSelectedRow(expectedDate) {
    this.selectedRowCell(SIDEPANEL_TREE_COLUMNS.CONSTRAINT_DATE).should(
      "contain.text",
      expectedDate,
    );
  }

  // --- Finances tab (was Cash Flow) ---

  openFinancesTab() {
    cy.get(SIDEPANEL.financesTabItem).click();
    cy.wait(500);
  }

  // Backward-compat alias — old name still used in a few places.
  openCashFlowTab() {
    this.openFinancesTab();
  }

  /**
   * Resolve the section container for a given header title (Booking / Invoice
   * / Balance to Receive). The redesigned Finances panel groups each section
   * inside a wrapper that contains both the header text and its action button,
   * so we walk up from the title to the closest ancestor that also has a
   * button descendant — that's the section root.
   */
  _finSection(titleAnchor) {
    return cy
      .get(SIDEPANEL.finPanel)
      .contains(titleAnchor)
      .parents()
      .filter(":has(button)")
      .first();
  }

  // ── Finances – Booking CRUD (was Forecast) ─────────────────────────────

  clickAddBooking() {
    this._finSection(SIDEPANEL.finBookingTitle)
      .find("button")
      .first()
      .click({ force: true });
    cy.wait(800);
  }

  /** Pick month in the add/edit popup (e.g. "Jun 2026").
   *  The month input is readonly — click it to open the picker,
   *  navigate to the correct year via arrows, then click the month
   *  inside the month-table. */
  selectPopupMonth(monthText) {
    const [month, year] = monthText.split(" ");
    const targetYear = parseInt(year, 10);

    // Click the input to open the month picker panel
    cy.get(SIDEPANEL.cashFlowPopupMonthInput).click({ force: true });
    cy.wait(500);

    // The picker renders inside: date-range-popup > ... > month-table > table
    const monthTable = "date-range-popup month-table table";

    // The year header and nav arrows live under: inner-popup > div > div > month-header > div
    const yearHeader = "date-range-popup inner-popup month-header > div > div";
    const prevArrow = "date-range-popup inner-popup month-header > div > button:first-child";
    const nextArrow = "date-range-popup inner-popup month-header > div > button:last-child";

    // Navigate to the correct year using the < > arrows
    const navigateToYear = () => {
      cy.get(yearHeader)
        .invoke("text")
        .then((displayedYear) => {
          const current = parseInt(displayedYear.trim(), 10);
          if (current < targetYear) {
            cy.get(nextArrow).click();
            cy.wait(300);
            navigateToYear();
          } else if (current > targetYear) {
            cy.get(prevArrow).click();
            cy.wait(300);
            navigateToYear();
          }
        });
    };
    navigateToYear();

    // Click the matching month cell inside the month-table
    cy.get(`${monthTable} td`)
      .filter((_i, td) => td.textContent.trim().toLowerCase() === month.toLowerCase())
      .first()
      .click();
    cy.wait(300);
  }

  enterPopupAmount(amount) {
    cy.get(SIDEPANEL.cashFlowPopupValueInput)
      .click()
      .type("{selectall}{backspace}")
      .type(String(amount));
    cy.wait(300);
  }

  confirmPopup() {
    cy.get(SIDEPANEL.cashFlowPopupConfirmButton).click();
    cy.wait(1000);
  }

  /** Add a Booking entry: click +, pick month, enter amount, save. */
  addBookingEntry(monthText, amount) {
    this.clickAddBooking();
    this.selectPopupMonth(monthText);
    this.enterPopupAmount(amount);
    this.confirmPopup();
  }

  /** Edit the Nth (0-based) booking entry's amount. */
  editBookingEntry(entryIndex, newAmount) {
    this._finSection(SIDEPANEL.finBookingTitle)
      .find(SIDEPANEL.finEntryEditIcon)
      .eq(entryIndex)
      .click();
    cy.wait(800);
    this.enterPopupAmount(newAmount);
    this.confirmPopup();
  }

  /** Delete the Nth (0-based) booking entry. */
  deleteBookingEntry(entryIndex) {
    this._finSection(SIDEPANEL.finBookingTitle)
      .find(SIDEPANEL.finEntryDeleteIcon)
      .eq(entryIndex)
      .click();
    cy.wait(1000);
  }

  // ── Finances – Invoice CRUD (was Actual) ───────────────────────────────

  clickAddInvoice() {
    this._finSection(SIDEPANEL.finInvoiceTitle)
      .find("button")
      .first()
      .click({ force: true });
    cy.wait(800);
  }

  /** Add an Invoice entry: click +, pick month, enter amount, save. */
  addInvoiceEntry(monthText, amount) {
    this.clickAddInvoice();
    this.selectPopupMonth(monthText);
    this.enterPopupAmount(amount);
    this.confirmPopup();
  }

  /** Edit the Nth (0-based) invoice entry's amount. */
  editInvoiceEntry(entryIndex, newAmount) {
    this._finSection(SIDEPANEL.finInvoiceTitle)
      .find(SIDEPANEL.finEntryEditIcon)
      .eq(entryIndex)
      .click();
    cy.wait(800);
    this.enterPopupAmount(newAmount);
    this.confirmPopup();
  }

  /** Delete the Nth (0-based) invoice entry. */
  deleteInvoiceEntry(entryIndex) {
    this._finSection(SIDEPANEL.finInvoiceTitle)
      .find(SIDEPANEL.finEntryDeleteIcon)
      .eq(entryIndex)
      .click();
    cy.wait(1000);
  }

  // ── Finances – Verification ────────────────────────────────────────────

  /** Parse a currency string like "€1,000.00" or "€600" into a number. */
  _parseCurrency(text) {
    const trimmed = text.trim();
    const isNegative = trimmed.includes("-");
    const numeric = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
    return isNegative ? -numeric : numeric;
  }

  /**
   * Best-effort total verification for a section. The redesigned panel may
   * render a single currency value per section header — we extract every
   * currency-shaped substring inside the section and assert at least one
   * matches the expected value. If the section shows multiple amounts
   * (entries + total), the test still passes as long as the expected total
   * is among them.
   */
  _verifySectionTotal(titleAnchor, expected) {
    this._finSection(titleAnchor)
      .invoke("text")
      .then((text) => {
        const matches = [...text.matchAll(/-?[€$₹]?\s*-?[\d,]+(?:\.\d{2})?/g)]
          .map((m) => this._parseCurrency(m[0]))
          .filter((n) => !Number.isNaN(n));
        expect(matches, `section "${titleAnchor}" should contain ${expected}`).to.include(expected);
      });
  }

  verifyBookingTotal(expected) {
    this._verifySectionTotal(SIDEPANEL.finBookingTitle, expected);
  }

  verifyInvoiceTotal(expected) {
    this._verifySectionTotal(SIDEPANEL.finInvoiceTitle, expected);
  }

  verifyBalanceToReceive(expected) {
    this._finSection(SIDEPANEL.finBalanceTitle)
      .invoke("text")
      .then((text) => {
        // Strip the "Balance to Receive" label so the parser sees only the
        // amount (avoids the digit '2' in "to" from confusing the regex).
        const amountOnly = text.replace(/Balance\s*to\s*Receive/i, "");
        expect(this._parseCurrency(amountOnly)).to.equal(expected);
      });
  }

  verifyBookingEntryCount(count) {
    this._finSection(SIDEPANEL.finBookingTitle)
      .find(SIDEPANEL.finEntryEditIcon)
      .should("have.length", count);
  }

  verifyInvoiceEntryCount(count) {
    this._finSection(SIDEPANEL.finInvoiceTitle)
      .find(SIDEPANEL.finEntryEditIcon)
      .should("have.length", count);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  Finances tab — live app (Booking/Invoicing + Nalco sub-tabs, INR)
  //  Matches the current `app-cash-flow-side-panel` DOM: a date-picker + PI
  //  number popup for Booking/Invoice, and a PI-ID + value popup for Nalco.
  //  (Distinct from the legacy Booking/Invoice month-picker helpers above.)
  // ═══════════════════════════════════════════════════════════════════════

  // The Finances body scrolls as entries are added — reset it to the top before
  // each action so the target section and its "+" button are in view.
  scrollFinancesTop() {
    cy.get(SIDEPANEL.finScrollContainer)
      .first()
      .scrollTo("top", { ensureScrollable: false });
    cy.wait(300);
  }

  openBookingInvoicingSubTab() {
    cy.get(SIDEPANEL.finInnerTab)
      .contains(SIDEPANEL.finBookingInvoicingTabText)
      .click({ force: true });
    cy.wait(600);
  }

  openNalcoSubTab() {
    cy.get(SIDEPANEL.finInnerTab)
      .contains(SIDEPANEL.finNalcoTabText)
      .click({ force: true });
    cy.wait(600);
  }

  // Resolve a Finances section (Booking / Invoice / Nalco Invoice / Nalco
  // Collection) by header text, scoped to the active sub-tab pane. Walks up from
  // the header to the nearest ancestor that owns a button — that wrapper is the
  // section root, isolating its "+" button and entry rows from sibling sections.
  _finSectionV2(headerAnchor) {
    return cy
      .get(SIDEPANEL.finActivePane)
      .contains(headerAnchor)
      .parents()
      .filter(":has(button)")
      .first();
  }

  _clickSectionAdd(headerAnchor) {
    this.scrollFinancesTop();
    this._finSectionV2(headerAnchor)
      .find("button")
      .first()
      .click({ force: true });
    cy.wait(800);
  }

  // ── Booking/Invoice popup fields ───────────────────────────────────────

  // Booking/Invoice popup date picker (ng-zorro calendar). Opens the calendar,
  // navigates to the target month/year via the header arrows, then clicks the
  // in-view day cell. Input is mm/dd/yyyy.
  pickFinancePopupDate(mmddyyyy) {
    const [mm, dd, yyyy] = mmddyyyy.split("/").map((s) => parseInt(s, 10));
    cy.get(SIDEPANEL.finPopupDatePicker).click();
    cy.wait(500);
    this._navigateDatePanel(yyyy, mm);
    cy.get(SIDEPANEL.finDateTableCell)
      .filter((_i, td) => td.textContent.trim() === String(dd))
      .first()
      .click();
    cy.wait(400);
  }

  // Recursively click the prev/next-month arrow until the calendar header shows
  // the target month & year. Month label reads e.g. "Jul"; year label "2026".
  _navigateDatePanel(targetYear, targetMonth) {
    const MONTHS = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const targetIdx = targetYear * 12 + (targetMonth - 1);
    cy.get(SIDEPANEL.finDateMonthLabel)
      .invoke("text")
      .then((monthText) => {
        cy.get(SIDEPANEL.finDateYearLabel)
          .invoke("text")
          .then((yearText) => {
            const curMonth = MONTHS.indexOf(monthText.trim().slice(0, 3)) + 1;
            const curYear = parseInt(yearText.trim(), 10);
            const curIdx = curYear * 12 + (curMonth - 1);
            if (curIdx < targetIdx) {
              cy.get(SIDEPANEL.finDateNextMonth).click();
              cy.wait(250);
              this._navigateDatePanel(targetYear, targetMonth);
            } else if (curIdx > targetIdx) {
              cy.get(SIDEPANEL.finDatePrevMonth).click();
              cy.wait(250);
              this._navigateDatePanel(targetYear, targetMonth);
            }
          });
      });
  }

  enterFinancePopupValue(amount) {
    cy.get(SIDEPANEL.finPopupValueInput)
      .click()
      .type("{selectall}{backspace}")
      .type(String(amount));
    cy.wait(300);
  }

  enterFinancePopupPi(piNumber) {
    cy.get(SIDEPANEL.finPopupPiInput)
      .click()
      .type("{selectall}{backspace}")
      .type(String(piNumber));
    cy.wait(300);
  }

  confirmFinancePopup() {
    cy.get(SIDEPANEL.finPopupConfirm).click();
    cy.wait(1200);
  }

  // ── Booking / Invoice entries ──────────────────────────────────────────

  addBooking({ date, value, pi }) {
    this._clickSectionAdd(SIDEPANEL.finBookingHeader);
    this.pickFinancePopupDate(date);
    this.enterFinancePopupValue(value);
    this.enterFinancePopupPi(pi);
    this.confirmFinancePopup();
  }

  addInvoice({ date, value, pi }) {
    this._clickSectionAdd(SIDEPANEL.finInvoiceHeader);
    this.pickFinancePopupDate(date);
    this.enterFinancePopupValue(value);
    this.enterFinancePopupPi(pi);
    this.confirmFinancePopup();
  }

  // ── Nalco entries (PI-ID + value only, no date) ────────────────────────

  enterNalcoPopupPi(piId) {
    cy.get(SIDEPANEL.finNalcoPopupPiInput)
      .click()
      .type("{selectall}{backspace}")
      .type(String(piId));
    cy.wait(300);
  }

  enterNalcoPopupValue(amount) {
    cy.get(SIDEPANEL.finNalcoPopupValueInput)
      .click()
      .type("{selectall}{backspace}")
      .type(String(amount));
    cy.wait(300);
  }

  addNalcoInvoice({ pi, value }) {
    this._clickSectionAdd(SIDEPANEL.finNalcoInvoiceHeader);
    this.enterNalcoPopupPi(pi);
    this.enterNalcoPopupValue(value);
    this.confirmFinancePopup();
  }

  addNalcoCollection({ pi, value }) {
    this._clickSectionAdd(SIDEPANEL.finNalcoCollectionHeader);
    this.enterNalcoPopupPi(pi);
    this.enterNalcoPopupValue(value);
    this.confirmFinancePopup();
  }

  // ── Finances verification (INR) ────────────────────────────────────────

  // Assert a section's total includes the numeric amount, ignoring the currency
  // symbol and Indian-style grouping (e.g. "₹10,00,000" ⇒ 1000000). The total
  // value is rendered in the sibling div immediately AFTER the header/"+" div
  // (Booking header = div:nth-child(3), its value = div:nth-child(4)).
  _verifyFinSectionContains(headerAnchor, amount) {
    const digits = String(amount).replace(/[^0-9]/g, "");
    this._finSectionV2(headerAnchor)
      .next()
      .invoke("text")
      .then((text) => {
        const normalized = text.replace(/[^0-9]/g, "");
        expect(
          normalized,
          `section "${headerAnchor}" value should contain ${amount}`,
        ).to.include(digits);
      });
  }

  verifyBookingSectionTotal(amount) {
    this.scrollFinancesTop();
    this._verifyFinSectionContains(SIDEPANEL.finBookingHeader, amount);
  }

  verifyInvoiceSectionTotal(amount) {
    this.scrollFinancesTop();
    this._verifyFinSectionContains(SIDEPANEL.finInvoiceHeader, amount);
  }

  verifyNalcoInvoiceTotal(amount) {
    this.scrollFinancesTop();
    this._verifyFinSectionContains(SIDEPANEL.finNalcoInvoiceHeader, amount);
  }

  verifyNalcoCollectionTotal(amount) {
    this.scrollFinancesTop();
    this._verifyFinSectionContains(SIDEPANEL.finNalcoCollectionHeader, amount);
  }

  // Balance to Receive = Booking − Invoice. Pass 0 to assert "₹0".
  verifyBalanceRow(amount) {
    this.scrollFinancesTop();
    cy.get(SIDEPANEL.finBalanceRow)
      .invoke("text")
      .then((text) => {
        const numeric = this._parseCurrency(
          text.replace(/Balance\s*to\s*Receive/i, ""),
        );
        expect(numeric, "Balance to Receive").to.equal(amount);
      });
  }

  setCashFlowForecast(amount) {
    cy.get(SIDEPANEL.cashFlowForecastInput)
      .type("{selectall}{backspace}")
      .type(String(amount));
    cy.wait(300);
  }

  clickCashFlowAddValue() {
    cy.get(SIDEPANEL.cashFlowAddValueButton).click();
    cy.wait(800);
  }

  // Parses a formatted currency string like "₹-1,000.00" or "₹600.00"
  // into a plain float, preserving the sign.
  _parseCurrencyText(text) {
    const trimmed = text.trim();
    const isNegative = trimmed.includes("-");
    const numeric = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
    return isNegative ? -numeric : numeric;
  }

  verifyCashFlowReferenceAmount(expectedAmount) {
    // .first() prevents multiple-span concatenation (e.g. "₹900.001" from two spans)
    cy.get(SIDEPANEL.cashFlowReferenceAmount)
      .first()
      .invoke("text")
      .then((text) => {
        expect(this._parseCurrencyText(text)).to.equal(
          parseFloat(String(expectedAmount)),
        );
      });
  }

  verifyCashFlowActualValue(expectedAmount) {
    cy.get(SIDEPANEL.cashFlowActualValue)
      .first()
      .invoke("text")
      .then((text) => {
        expect(this._parseCurrencyText(text)).to.equal(
          parseFloat(String(expectedAmount)),
        );
      });
  }

  // Clicks the month/year input inside the Add Value popup, then selects
  // the first non-disabled month cell in the picker dropdown.
  selectCashFlowPopupMonth() {
    cy.get(SIDEPANEL.cashFlowPopupMonthInput).click({ force: true });
    cy.wait(500);
    cy.get(".ant-picker-cell:not(.ant-picker-cell-disabled)").first().click();
    cy.wait(300);
  }

  setCashFlowPopupValue(amount) {
    cy.get(SIDEPANEL.cashFlowPopupValueInput).type(String(amount));
    cy.wait(300);
  }

  setCashFlowPopupNote(note) {
    cy.get(SIDEPANEL.cashFlowPopupNoteInput)
      .type("{selectall}{backspace}")
      .type(note);
    cy.wait(300);
  }

  confirmCashFlowPopup() {
    cy.get(SIDEPANEL.cashFlowPopupConfirmButton).click();
    cy.wait(800);
  }

  verifyCashFlowListEntryVisible() {
    cy.get(SIDEPANEL.cashFlowListFirstEntry).should("be.visible");
  }

  clickCashFlowDeleteIcon() {
    cy.get(SIDEPANEL.cashFlowDeleteIcon).click();
    cy.wait(800);
  }

  clickCashFlowEditIcon() {
    cy.get(SIDEPANEL.cashFlowEditIcon).click();
    cy.wait(800);
  }

  // In the edit popup the month field is read-only — check disabled or readonly state
  verifyCashFlowPopupMonthNotEditable() {
    cy.get(SIDEPANEL.cashFlowPopupMonthInput).then(($el) => {
      const isReadOnly =
        $el.is("[disabled]") ||
        $el.attr("readonly") !== undefined ||
        $el.closest(".ant-picker-disabled").length > 0;
      expect(isReadOnly, "Month field should not be editable").to.be.true;
    });
  }

  // Clear the existing value in the edit popup and enter a new amount.
  // Must use {selectall}{backspace} — .clear() sends {del} which fires the
  // gantt's global "Delete Task" shortcut even while the modal is open.
  editCashFlowPopupValue(amount) {
    // Triple-click selects all existing text reliably, then backspace clears it
    cy.get(SIDEPANEL.cashFlowPopupValueInput)
      .click()
      .type("{selectall}")
      .type("{backspace}")
      .type(String(amount));
    cy.wait(500);
  }

  // --- Predecessor (Link) tab ---

  openPredecessorTab() {
    cy.get(SIDEPANEL.predecessorTabItem).click();
    cy.wait(500);
  }

  clickAddPredecessorButton() {
    cy.get(SIDEPANEL.predecessorAddButton).click();
    cy.wait(800);
  }

  // Opens the task-select dropdown in the predecessor modal, types the task ID
  // into the search field, and clicks the first matching item in the list.
  searchAndSelectPredecessorTask(taskId) {
    cy.get(SIDEPANEL.predecessorModalTaskSelect).click();
    cy.wait(300);
    cy.get(SIDEPANEL.predecessorModalSearchInput).type(String(taskId), {
      force: true,
    });
    cy.wait(500);
    cy.get(SIDEPANEL.predecessorModalDropdownItem).first().click();
    cy.wait(500);
  }

  setLagDays(days) {
    cy.get(SIDEPANEL.predecessorModalLagInput)
      .type("{selectall}{backspace}")
      .type(String(days));
    cy.wait(300);
  }

  // Clicks the predecessor-type card matching the given text (e.g. "Finish-Start").
  // The UI renders "Finish - Start" (spaces around dash), so we use a loose regex.
  // Click targets .ant-card-cover (the icon area) which is the reliable hit zone.
  selectPredecessorType(typeText) {
    const pattern = new RegExp(typeText.replace(/-/g, "[\\s\\-]+"), "i");
    cy.contains(SIDEPANEL.predecessorModalTypeCard, pattern)
      .find(".ant-card-cover")
      .click();
    cy.wait(300);
  }

  savePredecessorModal() {
    cy.get(SIDEPANEL.predecessorModalSaveButton).click();
    cy.wait(1000);
  }

  // Verifies the status cell at the given column index on the currently-selected row.
  // Column 9 in the ganttWidthWithSide layout corresponds to STATUS when the
  // Predecessor tab is active (fewer columns shown than in General Settings view).
  verifyStatusInGanttRow(colIdx) {
    cy.get(SIDEPANEL.selectedAnyRowCell(colIdx)).should("be.visible");
  }

  // --- Disabled-state verification ---

  // Generic: assert any descendant has a disabled indicator
  // (ant-select-disabled / ant-picker-disabled / [disabled] / aria-disabled)
  verifyElementDisabled(selector, label) {
    cy.get(selector).should(($el) => {
      const html = $el[0].outerHTML.toLowerCase();
      const isDisabled =
        /\bant-(select|picker|input|btn)-disabled\b/.test(html) ||
        / disabled\b/.test(html) ||
        /aria-disabled="true"/.test(html);
      expect(isDisabled, `${label} should not be editable`).to.equal(true);
    });
  }

  verifyConstraintTypeNotEditable() {
    this.verifyElementDisabled(
      SIDEPANEL.constraintTypeSelect,
      "Constraint Type",
    );
  }

  verifyConstraintDateNotEditable() {
    this.verifyElementDisabled(
      SIDEPANEL.constraintDatePicker,
      "Constraint Date",
    );
  }

  verifyConstraintsNotEditable() {
    this.verifyConstraintTypeNotEditable();
    this.verifyConstraintDateNotEditable();
  }

  // --- Cash Flow editable state ---

  verifyCashFlowForecastEditable() {
    cy.get(SIDEPANEL.cashFlowForecastInput).then(($el) => {
      expect(
        $el.is("[disabled]") || $el.attr("readonly") !== undefined,
        "Cashflow forecast input should be editable",
      ).to.be.false;
    });
  }

  verifyCashFlowForecastNotEditable() {
    cy.get(SIDEPANEL.cashFlowForecastInput).then(($el) => {
      const isReadOnly =
        $el.is("[disabled]") ||
        $el.attr("readonly") !== undefined ||
        $el.closest(".ant-input-number-disabled, .ant-input-disabled").length > 0;
      expect(isReadOnly, "Cashflow forecast input should not be editable").to.be.true;
    });
  }

  verifyCashFlowReferenceVisible() {
    cy.get(SIDEPANEL.cashFlowReferenceAmount).should("be.visible");
  }

  // --- Resources tab ---

  openResourcesTab() {
    cy.get(SIDEPANEL.resourcesTabItem).click();
    cy.wait(500);
  }

  clickResourcesAddButton() {
    cy.get(SIDEPANEL.resourcesAddButton).click();
    cy.wait(800);
  }

  selectResource(resourceName) {
    cy.get(SIDEPANEL.resourcesPopupDropdown).click();
    cy.wait(500);
    cy.get(SIDEPANEL.resourcesDropdownList)
      .contains("li", resourceName)
      .click();
    cy.wait(500);
  }

  setResourceAllocation(percent) {
    cy.get(SIDEPANEL.resourcesPopupAllocationInput)
      .type("{selectall}{backspace}")
      .type(String(percent));
    cy.wait(300);
  }

  saveResourceAllocation() {
    cy.get(SIDEPANEL.resourcesPopupSaveButton).click();
    cy.wait(1000);
  }

  // Verify the Finances tab icon is NOT present in the side panel tab nav
  // (Non-PM users should not see this tab).
  verifyNoFinancesTab() {
    cy.get(SIDEPANEL.sidePanelTabsNav).within(() => {
      cy.get(SIDEPANEL.financesTabItem).should("not.exist");
    });
  }

  // Backward-compat alias for the old method name.
  verifyNoCashFlowTab() {
    this.verifyNoFinancesTab();
  }

  verifyResourceInList() {
    // Click the section title to expand / reveal the resource list
    cy.get(SIDEPANEL.resourcesSectionTitle).click();
    cy.wait(500);

    // Verify the first item in the list is visible and contains a name
    cy.get(SIDEPANEL.resourcesListFirstItem)
      .should("be.visible")
      .and("not.be.empty");
  }
}

export default new SidePanelPage();
