import { PLANNED_VS_ACTUAL } from "../../support/selectors";

class PlannedVsActualPage {
  // --- Selectors ---

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

  // --- Actions ---

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

  // Close the confirmation/success popup that appears after saving.
  // Uses case-insensitive match against the popup close icon since the
  // overlay ID is dynamic (e.g. #cdk-overlay-13).
  closeSnapshotPopup() {
    cy.get("body").then(($body) => {
      const $closeIcon = $body
        .find(PLANNED_VS_ACTUAL.snapshotPopupCloseIcon)
        .filter(":visible");
      if ($closeIcon.length > 0) {
        cy.wrap($closeIcon.first()).click({ force: true });
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
}

export default new PlannedVsActualPage();
