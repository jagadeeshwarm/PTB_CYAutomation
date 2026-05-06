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
