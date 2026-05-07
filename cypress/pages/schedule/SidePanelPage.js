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

  // --- Cash Flow tab ---

  openCashFlowTab() {
    cy.get(SIDEPANEL.cashFlowTabItem).click();
    cy.wait(500);
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
    cy.get(SIDEPANEL.cashFlowReferenceAmount)
      .invoke("text")
      .then((text) => {
        expect(this._parseCurrencyText(text)).to.equal(
          parseFloat(String(expectedAmount)),
        );
      });
  }

  verifyCashFlowActualValue(expectedAmount) {
    cy.get(SIDEPANEL.cashFlowActualValue)
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
    cy.get(SIDEPANEL.cashFlowPopupValueInput)
      .type("{selectall}{backspace}")
      .type(String(amount));
    cy.wait(300);
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
}

export default new SidePanelPage();
