import { PLANNED_VS_ACTUAL } from "../../support/selectors";

class PlannedVsActualPage {
  // ── Snapshot selectors ────────────────────────────────────────────

  get snapshotIcon() {
    return cy.get(PLANNED_VS_ACTUAL.snapshotIcon);
  }

  get snapshotNameInput() {
    return cy.get(PLANNED_VS_ACTUAL.snapshotNameInput);
  }

  get snapshotDescriptionTextarea() {
    return cy.get(PLANNED_VS_ACTUAL.snapshotDescriptionTextarea);
  }

  get snapshotSaveButton() {
    return cy.get(PLANNED_VS_ACTUAL.snapshotSaveButton);
  }

  // ── Snapshot actions ──────────────────────────────────────────────

  clickSnapshotIcon() {
    this.snapshotIcon.click();
    cy.wait(1500);
  }

  renameSnapshot(newName) {
    this.snapshotNameInput.clear().type(newName);
  }

  addDescription(description) {
    this.snapshotDescriptionTextarea.clear().type(description);
  }

  clickSave() {
    this.snapshotSaveButton.click();
    cy.wait(2000);
  }

  // Close the confirmation/management modal that remains after saving.
  // Uses the X-icon class (.iconUILarge-Close) so we never accidentally
  // hit a Delete or action button inside the modal.
  // Runs up to two passes to dismiss stacked modals (confirmation +
  // snapshot management). Also cancels any delete-confirmation dialog
  // that may have been triggered by a prior mis-click.
  closeSnapshotPopup() {
    cy.wait(1000);
    // First pass — close the topmost visible modal via its X icon
    cy.get("body").then(($body) => {
      const $icons = $body.find(PLANNED_VS_ACTUAL.snapshotPopupCloseIcon);
      if ($icons.length > 0) {
        cy.wrap($icons.last()).click({ force: true });
        cy.wait(500);
      }
    });
    // Safety — cancel any accidental delete-confirmation dialog
    cy.get("body").then(($body) => {
      const $cancel = $body
        .find(PLANNED_VS_ACTUAL.deleteConfirmCancelButton)
        .filter(":visible");
      if ($cancel.length > 0) {
        cy.wrap($cancel.first()).click({ force: true });
        cy.wait(500);
      }
    });
    // Second pass — close the underlying snapshot-management modal
    cy.get("body").then(($body) => {
      const $icons = $body.find(PLANNED_VS_ACTUAL.snapshotPopupCloseIcon);
      if ($icons.length > 0) {
        cy.wrap($icons.last()).click({ force: true });
        cy.wait(500);
      }
    });
  }

  createSnapshot(name, description) {
    this.clickSnapshotIcon();
    this.renameSnapshot(name);
    this.addDescription(description);
    this.clickSave();
    this.closeSnapshotPopup();
  }

  // ── Planned vs Actual modal (before comparison) ───────────────────

  openPlannedVsActual() {
    cy.get(PLANNED_VS_ACTUAL.plannedVsActualButton).click();
    cy.wait(1500);
  }

  checkShowDifferences() {
    cy.get(PLANNED_VS_ACTUAL.showDifferencesCheckbox).then(($label) => {
      if (!$label.find(".ant-checkbox-checked").length) {
        cy.wrap($label).click();
      }
    });
    cy.wait(300);
  }

  uncheckShowDifferences() {
    cy.get(PLANNED_VS_ACTUAL.showDifferencesCheckbox).then(($label) => {
      if ($label.find(".ant-checkbox-checked").length) {
        cy.wrap($label).click();
      }
    });
    cy.wait(300);
  }

  clickCompare() {
    cy.get(PLANNED_VS_ACTUAL.compareButton).click();
    cy.wait(2000);
  }

  closePvaComparison() {
    cy.get(PLANNED_VS_ACTUAL.pvaCloseButton)
      .filter(":visible")
      .first()
      .click({ force: true });
    cy.wait(1000);
  }

  // ── PvA comparison – row helpers ──────────────────────────────────

  verifyPvaRowCount(expectedCount) {
    cy.get(PLANNED_VS_ACTUAL.pvaGanttRows).should(
      "have.length",
      expectedCount,
    );
  }

  getPvaCellText(rowIndex, columnName) {
    return cy
      .get(PLANNED_VS_ACTUAL.pvaGanttRows)
      .eq(rowIndex)
      .find(`[data-column-name="${columnName}"]`)
      .invoke("text")
      .then((t) => t.trim());
  }

  // ── PvA comparison – verification ─────────────────────────────────

  verifyPlannedVsActualDiffers(rowIndex, columnType) {
    this.getPvaCellText(rowIndex, `planned_${columnType}`).then((planned) => {
      this.getPvaCellText(rowIndex, `actual_${columnType}`).then((actual) => {
        expect(
          actual,
          `Row ${rowIndex} ${columnType} should differ`,
        ).not.to.equal(planned);
      });
    });
  }

  verifyPlannedVsActualSame(rowIndex, columnType) {
    this.getPvaCellText(rowIndex, `planned_${columnType}`).then((planned) => {
      this.getPvaCellText(rowIndex, `actual_${columnType}`).then((actual) => {
        expect(
          actual,
          `Row ${rowIndex} ${columnType} should match`,
        ).to.equal(planned);
      });
    });
  }

  verifyPvaStatus(rowIndex, expectedStatus) {
    this.getPvaCellText(rowIndex, "status").then((status) => {
      if (!expectedStatus || expectedStatus === "BLANK") {
        expect(status).to.equal("");
      } else {
        expect(status.toUpperCase()).to.include(expectedStatus.toUpperCase());
      }
    });
  }

  verifyPvaPercent(rowIndex, expectedPercent) {
    this.getPvaCellText(rowIndex, "percentage").then((text) => {
      if (expectedPercent === "" || expectedPercent === undefined) {
        expect(text).to.equal("");
      } else {
        expect(text).to.include(String(expectedPercent));
      }
    });
  }

  verifyPvaDeltaNotEmpty(rowIndex) {
    this.getPvaCellText(rowIndex, "delta").then((d) => {
      expect(d, `Row ${rowIndex} delta should not be empty`).not.to.equal("");
    });
  }

  verifyPvaTaskName(rowIndex, expectedName) {
    this.getPvaCellText(rowIndex, "text").then((text) => {
      expect(text).to.include(expectedName);
    });
  }

  // ── PvA filter (reuses smart-filter modal pattern) ────────────────

  openPvaFilter() {
    cy.get(PLANNED_VS_ACTUAL.pvaFilterButton).click();
    cy.wait(500);
    cy.get(PLANNED_VS_ACTUAL.filterPopup).should("be.visible");
  }

  selectPvaFilterValue(searchText, optionText = searchText) {
    cy.get(PLANNED_VS_ACTUAL.filterSelectionDropdown).click();
    cy.get(PLANNED_VS_ACTUAL.filterSearchInput)
      .should("be.visible")
      .type(`{selectall}${searchText}`);
    cy.contains(PLANNED_VS_ACTUAL.filterOption, optionText)
      .should("be.visible")
      .click();
  }

  applyPvaFilter() {
    cy.get(PLANNED_VS_ACTUAL.filterApplyButton).click();
    cy.wait(1000);
  }

  closePvaFilterPopup() {
    cy.get(PLANNED_VS_ACTUAL.filterPopup)
      .should("be.visible")
      .parents(".ant-modal-content")
      .find("> .ant-modal-close")
      .click();
    cy.get(PLANNED_VS_ACTUAL.filterPopup).should("not.exist");
  }

  removePvaFilter() {
    cy.get(PLANNED_VS_ACTUAL.pvaFilterRemoveIcon).click();
    cy.wait(1000);
  }

  applyPvaStatusFilter(searchText, optionText = searchText) {
    this.openPvaFilter();
    this.selectPvaFilterValue(searchText, optionText);
    this.applyPvaFilter();
    this.closePvaFilterPopup();
  }
}

export default new PlannedVsActualPage();
